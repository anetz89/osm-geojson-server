(function() {
    'use strict';

    const
        log = require('npmlog'),
        osmImport = require('./osmImport/importer.js'),
        server = require('./server/server.js'),
        cache = require('./cache/fileCache.js');

    osmImport.run()
        .then(function(data) {
            cache.store(data);

            server.start(data);
        })
        .catch(function(e) {
            log.error('error during osm import');
            log.error(e);
        });
}());
