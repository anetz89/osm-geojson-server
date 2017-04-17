(function() {
    'use strict';

    const
        async = require('async'),
        log = require('npmlog'),
        tile2bound = require('osmtile2bound'),
        config = require('./../../config.js').osmImport,
        adjustBound = require('./../../util/adjustBound.js'),
        logLevel = require('./../../config.js').base.logLevel,
        overpass = require('query-overpass');

    log.level = logLevel;

    // set up queue
    let runningRequests = {},
        queryQueue = async.queue(function(query, done) {
            log.info('OVERPASS REQUEST: ' + query);

            overpass(query, function(err, data) {
                if (err) {
                    log.verbose(err.message);


                    // notify all callbacks
                    runningRequests[query].forEach(function(cb) {
                        cb(err);
                    });

                    return done(err.message);
                }

                // notify all callbacks
                runningRequests[query].forEach(function(cb) {
                    cb(null, data);
                });

                setTimeout(function() {
                    delete runningRequests[query];
                }, 1000)

                done();
            });
        // only two in parallel as Overpass API does not allow more parallel connections
        }, 2);

    function getQuery(bounds) {
        var bbstring = bounds.join(',');

        return config.query.replace(config.bbPlaceholder, bbstring);
    }

    function runImport(tile, callback) {
        let query = getQuery(adjustBound(tile2bound(tile)));

        if (runningRequests.hasOwnProperty(query)) {
            runningRequests[query].push(callback);

            return runningRequests[query];
        }
        runningRequests[query] = [callback];
        queryQueue.push(query);

        return runningRequests[query];
    }

    module.exports = {
        run : runImport
    };
}());

