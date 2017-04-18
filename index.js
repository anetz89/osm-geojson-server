(function() {
    'use strict';

    const
        log = require('npmlog'),
        bound2tile = require('bound2osmtile'),
        importer = require('./import/importer.js'),
        server = require('./server/server.js'),
        config = require('./config.js'),
        featureConfig = require('./featureConfig.js'),
        logLevel = require('./config.js').base.logLevel,
        cache = require('./cache/fileCache.js'),
        configUtil = require('./util/config.js'),
        tileChecker = require('./util/tileChecker.js');

    log.level = logLevel;

    let tile = bound2tile(config.base.initialBoundingBox, {
        zoom : 13
    });

    function throwError(error) {
        log.error(error);

        return;
    }
    configUtil.setConfig(featureConfig);

    if (cache.has(tile)) {
        cache.loadCompleteZoom(tile.z, function(error) {
            if (error) {
                return throwError(error);
            }
            server.start();
        });
    } else {
        importer.run(tile, function(e, data) {
            if (e) {
                throwError('error during osm import');
                throwError(e);
                return;
            }
            cache.store(data, tile, function(error, success) {
                if (error) {
                    return throwError(error);
                }
                if (!success) {
                    return throwError('storing the data did not work');
                }
                tileChecker.addTile(tile, data);

                server.start();
            });

        });
    }
}());
