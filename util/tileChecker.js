(function() {
    'use strict';

    let log = require('npmlog'),
        zoomLevel,
        availableTiles = {};

    function normalizeTile(tile) {
        return {
            x : parseInt(tile.x, 10),
            y : parseInt(tile.y, 10),
            z : parseInt(tile.z, 10),
            valid : tile.valid
        };
    }

    function addTile(tile, data) {
        tile = normalizeTile(tile);

        if (!zoomLevel) {
            zoomLevel = tile.z;
        }
        if (zoomLevel !== tile.z) {
            log.error('tile to add does not fit to internal zoom (tile, zoom).', tile.z, zoomLevel);

            return false;
        }
        if (!availableTiles[tile.x]) {
            availableTiles[tile.x] = {};
        }
        availableTiles[tile.x][tile.y] = data;

        return true;
    }

    function getCoverTiles(origTile) {
        let tiles = getNecessaryTiles(origTile),
            allAvailable = true;

        tiles.forEach(function(tile) {
            if (availableTiles[tile.x] && availableTiles[tile.x][tile.y]) {
                return;
            }
            allAvailable = false;
        });

        if (allAvailable) {
            return tiles;
        }

        return [];
    }

    function getPartialTile(tile, xOffset, yOffset) {
        return {
            valid : true,
            x : (tile.x * 2) + xOffset,
            y : (tile.y * 2) + yOffset,
            z : tile.z + 1
        };
    }

    function splitTile(tile) {
        let sTiles = [],
            partialTile;

        if (tile.z === zoomLevel) {
            return [];
        }
        // create all 4 lower tiles
        partialTile = getPartialTile(tile, 0, 0);

        sTiles.push(partialTile);
        sTiles = sTiles.concat(splitTile(partialTile));

        partialTile = getPartialTile(tile, 0, 1);

        sTiles.push(partialTile);
        sTiles = sTiles.concat(splitTile(partialTile));

        partialTile = getPartialTile(tile, 1, 0);

        sTiles.push(partialTile);
        sTiles = sTiles.concat(splitTile(partialTile));

        partialTile = getPartialTile(tile, 1, 1);

        sTiles.push(partialTile);
        sTiles = sTiles.concat(splitTile(partialTile));

        return sTiles;
    }

    function getCoveringTile(tile) {
        let cTile = {
            valid : true,
            x : Math.floor(tile.x / 2),
            y : Math.floor(tile.y / 2),
            z : tile.z - 1
        };

        if (cTile.z <= zoomLevel) {
            return cTile;
        }

        return getCoveringTile(cTile);
    }

    function getNecessaryTiles(tile) {
        if (!zoomLevel) {
            log.error('no internal zoomLevel available');
            return [];
        }
        if (tile.z === zoomLevel) {
            return [tile];
        }
        if (tile.z < zoomLevel) {
            // tile is bigger than the requested ones. need to split tile up
            return splitTile(tile);
        }

        // tile is smaller than the tile needed
        return [getCoveringTile(tile)];
    }

    function get(tile) {
        let necessary = this.getCoverTiles(tile),
            result = [];

        necessary.forEach(function(necTile) {
            result = result.concat(availableTiles[necTile.x][necTile.y].features);
        });

        return result;
    }

    module.exports = {
        get : get,
        addTile : addTile,
        getCoverTiles : getCoverTiles,
        getNecessaryTiles : getNecessaryTiles
    };

    // console.log('{ valid: true, x: 139484, y: 90959, z: 18 }');
    // console.log(module.exports.addTile({ valid: true, x: 17435, y: 11372, z: 15 }));
    // console.log(module.exports.getNecessaryTiles({ valid: true, x: 139484, y: 90959, z: 18 }));
    // console.log(module.exports.isTileCovered({ valid: true, x: 17435, y: 11372, z: 15 }));
    // console.log(module.exports.isTileCovered({ valid: true, x: 139484, y: 90959, z: 18 }));
}());
