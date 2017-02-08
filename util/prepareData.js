(function() {
    'use strict';

    const
        typeMap = require('./../featureTypeConfig.js');

    function getTypeLabel(feature) {
        if (!typeMap.hasOwnProperty(feature.properties.type)) {
            return null;
        }
        let type;

        typeMap[feature.properties.type].forEach(function(criteria) {
            if (type || !criteria.label) {
                return false;
            }
            let key,
                hit = false;

            if (criteria.tags) {
                criteria.tags.forEach(function(tagOption) {
                    if (hit) {
                        return;
                    }
                    for (key in tagOption) {
                        if (!feature.properties.tags ||
                                !feature.properties.tags.hasOwnProperty(key)) {
                            return false;
                        }
                        if (tagOption[key] !== "*" &&
                                feature.properties.tags[key] !== tagOption[key]) {
                            return false;
                        }
                    }
                    hit = true;
                });
            }
            // success
            if (hit) {
                type = criteria.label;
            }
        });

        if (!type) {
            console.log(feature.properties.tags);
        }

        return type || null;
    }

    module.exports = function(data) {
        if (!data || !data.features) {
            return data;
        }

        let featureList = [];

        data.features.forEach(function(feature) {
            if (!feature.properties) {
                return;
            }
            let label = getTypeLabel(feature);

            if (label && label !== 'undefined') {
                feature.properties.typeLabel = label;
                featureList.push(feature);
            }
        });

        return data;
    };
}());
