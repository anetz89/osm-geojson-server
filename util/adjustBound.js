(function() {
    'use strict';

    module.exports = function(bounds) {
        // clip bounds format [xmin, ymin, xmax, ymax]
        // bounds format
        // [ [ 11.583709716796875, 48.16150547016801 ],
        //   [ 11.5850830078125, 48.16150547016801 ],
        //   [ 11.5850830078125, 48.1605894313262 ],
        //   [ 11.583709716796875, 48.1605894313262 ] ]
        return [bounds[2][1], bounds[0][0], bounds[0][1], bounds[2][0]];
    };
}());

