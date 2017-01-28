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
        slicer = require('geojson-slicer')(config.geojsonSlicer),
        tile2bound = require('osmtile2bound'),
        escapeRegex = /['"]/g;

    let dataSource;

    log.level = logLevel;

    function stringify(featureGroup, jsonp) {
        let featureString = JSON.stringify(featureGroup);


        if (jsonp) {
            featureString = featureString.replace(escapeRegex, '\\$&');

            return jsonp + "('" + featureString + "')";
        }

        return featureString;
    }

    function buildResponse(response, bound, jsonp) {
        let featureGroup = {
                type : 'FeatureCollection',
                features : slicer.slice(dataSource, bound)
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
            return [];
        }

        return [parts[lastIdx - 1], parts[lastIdx].split('.')[0], parts[lastIdx - 2]];
    }

    function startServer(data) {
        dataSource = data;

        let server = http.createServer(function(request, response) {

            let tileData = url2tileData(request.url),
                req = url.parse(request.url, true);

            if (tileData.length) {
                buildResponse(response, tile2bound(tileData[0], tileData[1], tileData[2]),
                    req.query.callback);

                return;
            }
            response.writeHead(404);
        });

        // IP defaults to 127.0.0.1
        server.listen(serverConfig.port);

        log.info('Server running at http://127.0.0.1:' + serverConfig.port + '/');
    }

    module.exports = {
        start : startServer
    };
}());
