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
        configUtil = require('./../util/config.js'),
        prepareData = require('./../util/prepareData.js'),
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
                features : slicer.slice(tileChecker.get(tile), tile2bound(tile), function(feature) {
                    return configUtil.getConfig(tile.z, feature) !== null;
                })
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

    function buildConfigResponse(response, jsonp) {
        let headerInfo = {
            'Content-Type' : 'application/json'
        };

        response.writeHead(200, headerInfo);
        response.end(stringify(configUtil.getConfig(), jsonp));
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


    function getImportCallback(response, req, tileData, requestTile) {
        return function(error, data) {
            if (error) {
                log.error('error during osm import');
                log.error(JSON.stringify(error));

                return rejectRequest(response, 'error during osm import');
            }
            if (!cache.has(requestTile)) {
                data = prepareData(data);
                cache.store(data, requestTile, function(err, success) {
                    if (error) {
                        return rejectRequest(response, err);
                    }
                    if (!success) {
                        return rejectRequest(response, 'storing the data did not work');
                    }

                    return buildResponse(response, tileData, req.query.callback);
                });
            }
        };
    }

    function loadAdditionalTiles(tileData, req, response) {
        let necessaryTiles = tileChecker.getNecessaryTiles(tileData);

        if (necessaryTiles.length > 1) {
            log.error('unable to load multiple tiles (for now)');

            return rejectRequest(response, 'too many tiles need to be fetched');
        }
        necessaryTiles.forEach(function(necTile) {
            osmImport.run(necTile, getImportCallback(response, req, tileData, necTile));
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
                // tile needs to be loaded
                loadAdditionalTiles(tileData, req, response);

                return;
            } else {
                return buildConfigResponse(response, req.query.callback);
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
