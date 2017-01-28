(function() {
    'use strict';

    // Load the http module to create an http server.
    const
        log = require('npmlog'),
        slicer = require('geojson-slicer'),
        http = require('http'),
        url = require('url'),
        tile2bound = require('./../util/tile2bound.js'),
        escapeRegex = /['"]/g;

    log.level = 'verbose';
    let dataSource;

    function escape(stringToEscape) {
        return stringToEscape.replace(escapeRegex, '\\$&')
    }

    function buildResponse(response, bound, jsonp) {
        let featureGroup = {
            "type": "FeatureCollection",
            "features": slicer.slice(dataSource, bound)
        };

        if (jsonp) {
            response.writeHead(200, {"Content-Type": "application/js"});
            response.end(jsonp + "('" + escape(JSON.stringify(featureGroup)) + "')");
        } else {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(JSON.stringify(featureGroup));
        }
    }

    function startServer(data) {
        dataSource = data;
        // Configure our HTTP server to respond with Hello World to all requests.
        let server = http.createServer(function (request, response) {

            let parts = request.url.split('/'),
                req = url.parse(request.url, true);

            if (parts.length === 4) {
                buildResponse(response, tile2bound(parts[2], parts[3].split('.')[0], parts[1]),
                    req.query.callback);
                return;
            }
            response.writeHead(404);
        });

        // Listen on port 8000, IP defaults to 127.0.0.1
        server.listen(8765);

        log.info("Server running at http://127.0.0.1:8765/");
    }

    module.exports = {
        start : startServer
    }
}());
