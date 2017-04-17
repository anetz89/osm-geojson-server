(function() {
    'use strict';

    const
        log = require('npmlog'),
        config = require('./../config.js'),
        osmImport = require('./osmImport/importer.js'),
        logLevel = config.base.logLevel;

    log.level = logLevel;

    function runImport(tile, callback) {
        if (config.osmImport.active) {
            log.verbose('osmImport.active');
            return osmImport.run(tile, callback);
        }
    }

    module.exports = {
        run : runImport
    };
}());

