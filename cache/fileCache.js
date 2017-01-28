(function() {
    'use strict';

    const
        log = require('npmlog'),
        config = require('./../config.js').cache.file;

    log.level = require('./../config.js').base.logLevel;

    function store(data) {
        log.verbose(data.length);
    }

    module.exports = {
        store : store
    };
}());

