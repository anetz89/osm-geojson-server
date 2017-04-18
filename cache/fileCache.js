(function() {
    'use strict';

    const
        log = require('npmlog'),
        writeJson = require('write-json'),
        readJSON = require('read-json'),
        fs = require('fs-extra'),
        readDir = require('recursive-readdir-sync'),
        tileChecker = require('./../util/tileChecker.js'),
        prepareData = require('./../util/prepareData.js'),
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
            readJSON(getFileName(tile), 'utf8', (function(t, cb) {
                return function(error, data) {
                    if (error) {
                        return log.error(error);
                    }

                    data = prepareData(data);

                    tileChecker.addTile(t, data);
                    log.verbose('read ' + getFileName(t));

                    if (cb) {
                        cb(null, data);
                    }
                };
            }({
                x : tile.x,
                y : tile.y,
                z : tile.z,
                valid : tile.valid
            }, callback)));
        } else {
            log.error('do not find file ' + getFileName(tile));
        }
        if (callback) {
            callback('no such file found');
        }
    }


    function url2tileData(urlString) {
        let parts = urlString.split(/(\/|\\)/),
            lastIdx;

        parts = [parts[0], parts[2], parts[4], parts[6]];
        lastIdx = parts.length - 1;

        if (lastIdx < 3) {
            // invalid url passed
            return {
                valid : false
            };
        }

        return {
            valid : true,
            x : parts[lastIdx - 1],
            y : parts[lastIdx].split('.')[0],
            z : parts[lastIdx - 2]
        };
    }

    function loadCompleteZoom(zoom, callback) {
        let that = this;

        readDir(config.path + zoom).forEach(function(file) {
            log.verbose('load ' + file);
            that.load(url2tileData(file));
        });
        callback();
    }

    module.exports = {
        store : store,
        has : has,
        load : load,
        loadCompleteZoom : loadCompleteZoom
    };
}());

