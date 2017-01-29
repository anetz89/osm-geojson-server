(function() {
    'use strict';

    const
        log = require('npmlog'),
        bound2tile = require('bound2osmtile'),
        osmImport = require('./osmImport/importer.js'),
        server = require('./server/server.js'),
        config = require('./config.js'),
        logLevel = require('./config.js').base.logLevel,
        cache = require('./cache/fileCache.js');

    log.level = logLevel;

    let tile = bound2tile(config.base.initialBoundingBox, {
        zoom : 13
    });

    function throwError(error) {
        log.error(error);

        return;
    }

    if (cache.has(tile)) {
        cache.load(tile, function(error, data) {
            if (error) {
                return throwError(error);
            }
            server.start(data.features);
        });
    } else {
        osmImport.run(tile)
            .then(function(data) {
                cache.store(data, tile, function(error, success) {
                    if (error) {
                        return throwError(error);
                    }
                    if (!success) {
                        return throwError('storing the data did not work');
                    }
                    server.start(data.features);
                });

            })
            .catch(function(e) {
                throwError('error during osm import');
                throwError(e);
            });
    }
}());
