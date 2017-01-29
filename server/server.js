(function() {
    'use strict';

    // Load the http module to create an http server.
    const
        http = require('http'),
        url = require('url'),
        log = require('npmlog'),
        config = require('./../config.js'),
        serverConfig = config.server,
        logLevel = require('./../config.js').base.logLevel,
        tileChecker = require('./../util/tileChecker.js'),
        osmImport = require('./../osmImport/importer.js'),
        cache = require('./../cache/fileCache.js'),
        slicer = require('geojson-slicer')(config.geojsonSlicer),
        tile2bound = require('osmtile2bound'),
        escapeRegex = /['"]/g;

    log.level = logLevel;

    function stringify(featureGroup, jsonp) {
        let featureString = JSON.stringify(featureGroup);


        if (jsonp) {
            featureString = featureString.replace(escapeRegex, '\\$&');

            return jsonp + "('" + featureString + "')";
        }

        return featureString;
    }

    function buildResponse(response, tile, jsonp) {
        // log.verbose('buildResponse', tileChecker.get(tile), tile2bound(tile));
        let featureGroup = {
                type : 'FeatureCollection',
                features : slicer.slice(tileChecker.get(tile), tile2bound(tile))
            },
            headerInfo = {
                'Content-Type' : 'application/json'
            };

        if (jsonp) {
            headerInfo['Content-Type'] = 'application/js';
        }

        response.writeHead(200, headerInfo);
        response.end(stringify(featureGroup, jsonp));
    }

    function url2tileData(urlString) {
        let parts = urlString.split('/'),
            lastIdx = parts.length - 1;

        if (lastIdx < 3) {
            // invalid url passed
            return {
                valid : false
            };
        }

        return {
            valid : true,
            x : parts[lastIdx - 1],
            y : parts[lastIdx].split('.')[0],
            z : parts[lastIdx - 2]
        };
    }

    function loadAdditionalTiles(tileData, req, response) {
        let necessaryTiles = tileChecker.getNecessaryTiles(tileData),
            deferred;

        if (necessaryTiles.length > 1) {
            log.error('unable to load multiple tiles (for now)');

            return rejectRequest(response, 'too many tiles need to be fetched');
        }

        deferred = osmImport.run(necessaryTiles[0]);

        tileChecker.addOnHold(necessaryTiles[0], deferred);

        deferred
            .then(function(data) {
                cache.store(data, necessaryTiles[0], function(error, success) {
                    if (error) {
                        return rejectRequest(response, error);
                    }
                    if (!success) {
                        return rejectRequest(response, 'storing the data did not work');
                    }

                    return buildResponse(response, tileData, req.query.callback);
                });

            })
            .catch(function(e) {
                log.error('error during osm import');
                log.error(e);

                return rejectRequest(response, 'storing the data did not work');
            });

    }

    function rejectRequest(response, reason) {
        response.writeHead(404);
        response.end(reason);
    }

    function startServer() {
        let server = http.createServer(function(request, response) {

            let tileData = url2tileData(request.url),
                req = url.parse(request.url, true);

            if (tileData.valid) {
                if (tileChecker.getCoverTiles(tileData).length) {
                    // all available, just return response
                    return buildResponse(response, tileData, req.query.callback);
                }
                log.verbose('not covered');
                if (tileChecker.isTileOnHold(tileData)) {
                    // another tile already requested the necessary tile wait for it to be loaded
                    log.verbose('on hold');
                    tileChecker.isTileOnHold(tileData).then(function(requ, resp, tdata) {
                        return function() {
                            buildResponse(resp, tdata, requ.query.callback);
                        };
                    }(request, response, tileData));

                    return;
                }
                log.verbose('not on hold');
                // tile needs to be loaded
                loadAdditionalTiles(tileData, req, response);

                return;
            }

            return rejectRequest(response, 'tile data not valid');
        });

        // IP defaults to 127.0.0.1
        server.listen(serverConfig.port);

        log.info('Server running at http://127.0.0.1:' + serverConfig.port + '/');
    }

    module.exports = {
        start : startServer
    };
}());
