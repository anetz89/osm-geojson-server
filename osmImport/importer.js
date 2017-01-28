(function() {
    'use strict';

    const
        q = require('q'),
        log = require('npmlog'),
        config = require('./../config.js').osmImport,
        logLevel = require('./../config.js').base.logLevel,
        OverpassFrontend = require('overpass-frontend'),
        overpass = new OverpassFrontend(config.url);

    let result = [];

    log.level = logLevel;

    function runImport() {
        let deferred = q.defer();

        // eslint-disable-next-line new-cap
        overpass.BBoxQuery(config.query, config.boundingBox, config.apiOptions, featureCallback,
            function(err) {
                if (err) {
                    log.verbose(err);
                }
                deferred.resolve(result);
            });

        return deferred.promise;
    }

    function featureCallback(error, feature) {
        if (error) {
            return log(error);
        }
        if (!feature) {
            return log('feature callback without feature');
        }
        // eslint-disable-next-line new-cap
        result.push(feature.GeoJSON());
    }

    module.exports = {
        run : runImport
    };
}());

