(function() {
    'use strict';

    const
        q = require('q'),
        log = require('npmlog'),
        config = require('./../config.js').osmImport,
        logLevel = require('./../config.js').base.logLevel,
        overpass = require('query-overpass');

    log.level = logLevel;

    function getQuery(bounds) {
        var bbstring = bounds.join(',');

        return config.query.replace(config.bbPlaceholder, bbstring);
    }

    function runImport(bounds) {
        let deferred = q.defer(),
            query = getQuery(bounds);

        log.info('OVERPASS REQUEST: ' + query);

        overpass(query, function(err, data) {
            if (err) {
                log.verbose(err.message);

                return deferred.reject(err);
            }
            deferred.resolve(data.features);
        });

        return deferred.promise;
    }

    module.exports = {
        run : runImport
    };
}());

