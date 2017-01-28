(function() {
    'use strict';

    const OverpassFrontend = require('overpass-frontend');

    // common configuration file that is used throughout the module
    module.exports = {
        osmImport : {
            // overpass url
            url : 'http://www.overpass-api.de/api/interpreter',
            query : 'node[amenity=restaurant]',
            boundingBox : {
                getSouthWest : function() {
                    return {
                        lat : 48.1,
                        lng : 11.5
                    };
                },
                getNorthEast : function() {
                    return {
                        lat : 48.2,
                        lng : 11.6
                    };
                }
            },
            apiOptions : {
                properties: OverpassFrontend.ALL
            }
        },
        cache : {
            // file cache. stores/reads data to/from files
            file : {
                // path where the files are stored
                path : './.tmp/'
            }
        },
        server : {

        }
    };

}());
