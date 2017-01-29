(function() {
    'use strict';

    const
        log = require('npmlog'),
        writeJson = require('write-json'),
        readJSON = require('read-json'),
        fs = require('fs-extra'),
        config = require('./../config.js').cache.file;

    log.level = require('./../config.js').base.logLevel;

    function getFolderName(tile) {
        return config.path + tile.z + '/' + tile.x;
    }
    function getFileName(tile) {
        return getFolderName(tile) + '/' + tile.y + '.geojson';
    }

    function store(data, tile, callback) {
        let folderName = getFolderName(tile);

        fs.ensureDir(folderName, (function(name) {
            return function(err) {
                if (err) {
                    if (callback) {
                        callback(err);
                    }

                    return;
                }

                log.verbose('store file ' + name);

                writeJson(name, data, function(err2) {
                    if (callback) {
                        callback(err2, true);
                    }
                });
            };
        }(getFileName(tile))));
    }

    function has(tile) {
        return fs.existsSync(getFileName(tile));
    }

    function load(tile, callback) {
        if (this.has(tile)) {
            return readJSON(getFileName(tile), 'utf8', callback);
        }
        callback('no such file found');
        // let deferred = q.defer();

        // deferred.reject('no such file found');

        // return deferred.promise;
    }

    module.exports = {
        store : store,
        has : has,
        load : load
    };
}());

