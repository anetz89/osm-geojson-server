(function() {
    'use strict';

    const
        merge = require('merge');

    let conf;


    module.exports = {
        setConfig : function(newConfig) {

            conf = merge(true, conf || {}, newConfig);

            // conf = parser(newConfig, conf);
        },
        getConfig : function(zoom, feature) {
            if (!zoom) {
                return conf || null;
            }
            if (!conf || !conf.hasOwnProperty(zoom)) {
                return null;
            }
            if (!feature) {
                return conf[zoom];
            }
            if (!feature.properties || !feature.properties.typeLabel) {
                return null;
            }
            if (!conf[zoom].hasOwnProperty(feature.properties.typeLabel)) {
                return null;
            }

            return conf[zoom][feature.properties.typeLabel];
        }
    };
}());
