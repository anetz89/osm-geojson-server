(function() {
    'use strict';

    const
        q = require('q'),
        log = require('npmlog'),
        tile2bound = require('osmtile2bound'),
        config = require('./../config.js').osmImport,
        adjustBound = require('./../util/adjustBound.js'),
        logLevel = require('./../config.js').base.logLevel,
        overpass = require('query-overpass');

    log.level = logLevel;

    function getQuery(bounds) {
        var bbstring = bounds.join(',');

        return config.query.replace(config.bbPlaceholder, bbstring);
    }

    function runImport(tile) {
        let deferred = q.defer(),
            query = getQuery(adjustBound(tile2bound(tile)));

        log.info('OVERPASS REQUEST: ' + query);

        overpass(query, function(err, data) {
            if (err) {
                log.verbose(err.message);

                return deferred.reject(err);
            }
            deferred.resolve(data);
        });

        return deferred.promise;
    }

    module.exports = {
        run : runImport
    };
}());

