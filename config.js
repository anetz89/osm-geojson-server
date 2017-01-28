(function() {
    'use strict';

    // common configuration file that is used throughout the module
    module.exports = {
        base : {
            // [48.1, 11.5, 48.2, 11.6]
            initialBoundingBox : [48.13, 11.54, 48.16, 11.56],
            logLevel : 'verbose'
        },
        osmImport : {
            // overpass url
            url : 'http://www.overpass-api.de/api/interpreter',
            query : '[out:json];(way[building]($$$bb$$$);' +
                'way[highway]($$$bb$$$););(._;>;);out;',
            bbPlaceholder : /\$\$\$bb\$\$\$/g
        },
        cache : {
            // file cache. stores/reads data to/from files
            file : {
                // path where the files are stored
                path : './.tmp/'
            }
        },
        server : {
            port : 8765
        },
        geojsonSlicer : {
            cutFeatures : false
        }
    };

}());
