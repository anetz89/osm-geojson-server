(function() {
    'use strict';

    const
        log = require('./../util/logger.js'),
        config = require('./../config.js').cache.file;

    function store(data) {
        log(data.length);
    }

    module.exports = {
        store : store
    };
}());

