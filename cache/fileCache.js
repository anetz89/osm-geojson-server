(function() {
    'use strict';

    const
        log = require('npmlog'),
        config = require('./../config.js').cache.file;

    function store(data) {
        log.verbose(data.length);
    }

    module.exports = {
        store : store
    };
}());

