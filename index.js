(function() {
    'use strict';

    const
        log = require('npmlog'),
        osmImport = require('./osmImport/importer.js'),
        server = require('./server/server.js'),
        config = require('./config.js'),
        logLevel = require('./config.js').base.logLevel,
        cache = require('./cache/fileCache.js');

    log.level = logLevel;

    osmImport.run(config.base.initialBoundingBox)
        .then(function(data) {
            cache.store(data);

            server.start(data);
        })
        .catch(function(e) {
            log.error('error during osm import');
            log.error(e);
        });
}());
