(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MPC = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],2:[function(require,module,exports){
function TextEncoderLite() {
}
function TextDecoderLite() {
}

// Taken from https://github.com/feross/buffer/blob/master/index.js
// Thanks Feross et al! :-)

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end || Infinity)
  start = start || 0;

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

TextEncoderLite.prototype.encode = function (str) {
  var result;

  if ('undefined' === typeof Uint8Array) {
    result = utf8ToBytes(str);
  } else {
    result = new Uint8Array(utf8ToBytes(str));
  }

  return result;
};

TextDecoderLite.prototype.decode = function (bytes) {
  return utf8Slice(bytes, 0, bytes.length);
}

exports.TextEncoderLite = TextEncoderLite;
exports.TextDecoderLite = TextDecoderLite;

},{}],3:[function(require,module,exports){
/// <reference path="../typings/base64-js.d.ts" />
/// <reference path="../typings/text-encoder-lite.d.ts" />
var base64 = require('base64-js');
var text_encoder_lite_module_1 = require('text-encoder-lite-module');
var mpc_1 = require('./mpc');
/**
 * Connect to MPD via a WebSocket.
 */
function viaWebSocket(uri) {
    return new mpc_1.MPC(new WebSocketConnection(uri));
}
exports.viaWebSocket = viaWebSocket;
var WebSocketConnection = (function () {
    function WebSocketConnection(uri) {
        this.uri = uri;
        this.textEncoder = new text_encoder_lite_module_1.TextEncoderLite();
        this.textDecoder = new text_encoder_lite_module_1.TextDecoderLite();
    }
    WebSocketConnection.prototype.connect = function (receive) {
        var _this = this;
        this.wsClient = new WebSocket(this.uri, ['base64']);
        this.wsClient.onmessage = function (e) { return receive(_this.textDecoder.decode(base64.toByteArray(e.data))); };
    };
    WebSocketConnection.prototype.send = function (msg) {
        this.wsClient.send(base64.fromByteArray(this.textEncoder.encode(msg)));
    };
    return WebSocketConnection;
})();
exports.WebSocketConnection = WebSocketConnection;

},{"./mpc":5,"base64-js":1,"text-encoder-lite-module":2}],4:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SimpleObservable = (function () {
    function SimpleObservable() {
        this.observers = [];
    }
    SimpleObservable.prototype.registerObserver = function (observer) {
        this.observers.push(observer);
    };
    SimpleObservable.prototype.unregisterObserver = function (observer) {
        this.observers = this.observers.filter(function (o) { return (o !== observer); });
    };
    SimpleObservable.prototype.notifyObservers = function () {
        this.observers.forEach(function (o) { return o(); });
    };
    return SimpleObservable;
})();
exports.SimpleObservable = SimpleObservable;
var LiveStatus = (function (_super) {
    __extends(LiveStatus, _super);
    function LiveStatus(mpc) {
        _super.call(this);
        this.mpc = mpc;
        mpc.registerObserver(this);
        this.fetchStatus();
    }
    LiveStatus.prototype.subsystemsChanged = function (subsystems) {
        var statusChanged = subsystems.some(function (subsystem) {
            return ((subsystem == 'player') || (subsystem == 'options') || (subsystem == 'mixer') || (subsystem == 'playlist'));
        });
        if (statusChanged) {
            this.fetchStatus();
        }
    };
    LiveStatus.prototype.fetchStatus = function () {
        var _this = this;
        this.mpc.getStatus().then(function (mpdStatus) {
            _this.mpdStatus = mpdStatus;
            _this.notifyObservers();
        });
    };
    return LiveStatus;
})(SimpleObservable);
exports.LiveStatus = LiveStatus;
var LiveCurrentPlaylist = (function (_super) {
    __extends(LiveCurrentPlaylist, _super);
    function LiveCurrentPlaylist(mpc) {
        _super.call(this);
        this.mpc = mpc;
        mpc.registerObserver(this);
        this.fetchPlaylist();
    }
    LiveCurrentPlaylist.prototype.subsystemsChanged = function (subsystems) {
        var statusChanged = subsystems.some(function (subsystem) { return (subsystem == 'playlist'); });
        if (statusChanged) {
            this.fetchPlaylist();
        }
    };
    LiveCurrentPlaylist.prototype.fetchPlaylist = function () {
        var _this = this;
        this.mpc.getCurrentPlaylist().then(function (playlist) {
            _this.playlist = playlist;
            _this.notifyObservers();
        });
    };
    return LiveCurrentPlaylist;
})(SimpleObservable);
exports.LiveCurrentPlaylist = LiveCurrentPlaylist;
var LiveStoredPlaylists = (function (_super) {
    __extends(LiveStoredPlaylists, _super);
    function LiveStoredPlaylists(mpc) {
        _super.call(this);
        this.mpc = mpc;
        mpc.registerObserver(this);
        this.fetchStoredPlaylists();
    }
    LiveStoredPlaylists.prototype.subsystemsChanged = function (subsystems) {
        var statusChanged = subsystems.some(function (subsystem) { return (subsystem == 'stored_playlist'); });
        if (statusChanged) {
            this.fetchStoredPlaylists();
        }
    };
    LiveStoredPlaylists.prototype.fetchStoredPlaylists = function () {
        var _this = this;
        this.mpc.getStoredPlaylists().then(function (storedPlaylists) {
            _this.storedPlaylists = storedPlaylists;
            _this.notifyObservers();
        });
    };
    return LiveStoredPlaylists;
})(SimpleObservable);
exports.LiveStoredPlaylists = LiveStoredPlaylists;
var LiveDirectories = (function () {
    function LiveDirectories(mpc) {
        this.observers = [];
        this.mpc = mpc;
        this.directories = new Map();
        mpc.registerObserver(this);
    }
    LiveDirectories.prototype.registerObserver = function (observer) {
        this.observers.push(observer);
    };
    LiveDirectories.prototype.unregisterObserver = function (observer) {
        this.observers = this.observers.filter(function (o) { return (o !== observer); });
    };
    LiveDirectories.prototype.notifyObservers = function (cause) {
        this.observers.forEach(function (o) { return o(cause); });
    };
    LiveDirectories.prototype.subsystemsChanged = function (subsystems) {
        var statusChanged = subsystems.some(function (subsystem) { return (subsystem == 'database'); });
        if (statusChanged) {
            this.refetchDirectories();
        }
    };
    LiveDirectories.prototype.isWatching = function (path) {
        return this.directories.has(path);
    };
    LiveDirectories.prototype.watch = function (path) {
        var _this = this;
        if (this.isWatching(path)) {
            return Promise.resolve(this.directories.get(path));
        }
        else {
            var promise = this.mpc.getDirectory(path);
            promise.then(function (directory) {
                _this.directories.set(path, directory);
                _this.notifyObservers('watch');
            });
            return promise;
        }
    };
    LiveDirectories.prototype.unwatch = function (path) {
        if (this.isWatching(path)) {
            this.directories.delete(path);
            this.notifyObservers('unwatch');
        }
    };
    LiveDirectories.prototype.toggleWatch = function (path) {
        if (this.isWatching(path)) {
            this.unwatch(path);
        }
        else {
            this.watch(path);
        }
    };
    LiveDirectories.prototype.getWatchedDirectory = function (path) {
        return this.directories.get(path);
    };
    LiveDirectories.prototype.refetchDirectories = function () {
        var _this = this;
        var paths = [];
        this.directories.forEach(function (content, path) {
            paths.push(path);
        });
        var promises = paths.map(function (path) { return _this.getDirectoryIfExists(path); });
        Promise.all(promises).then(function (newDirectories) {
            _this.directories.clear();
            for (var i = 0; i < paths.length; i++) {
                if (newDirectories[i] !== undefined) {
                    _this.directories.set(paths[i], newDirectories[i]);
                }
            }
            _this.notifyObservers('update');
        });
    };
    LiveDirectories.prototype.getDirectoryIfExists = function (path) {
        var promise = this.mpc.getDirectory(path);
        return new Promise(function (resolve, reject) {
            promise.then(resolve, function (reason) { return resolve(undefined); });
        });
    };
    return LiveDirectories;
})();
exports.LiveDirectories = LiveDirectories;

},{}],5:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/es6-promise.d.ts" />
/// <reference path="../typings/es6-map.d.ts" />
var mpd_protocol_1 = require('./mpd-protocol');
var mpd_objects_1 = require('./mpd-objects');
/**
 * Implements the [commands](http://www.musicpd.org/doc/protocol/command_reference.html)
 * of the [Music Player Daemon protocol](http://www.musicpd.org/doc/protocol/index.html)
 */
var MPC = (function (_super) {
    __extends(MPC, _super);
    /**
     * Create an instance that connects to the daemon via the given connection.
     */
    function MPC(connection) {
        _super.call(this, connection);
    }
    MPC.prototype.getStatus = function () {
        var _this = this;
        return this.sendCommand('status').then(function (msg) { return _this.parse(msg, [], function (valueMap) { return new mpd_objects_1.MPDStatus(valueMap); })[0]; });
    };
    MPC.prototype.getCurrentPlaylist = function () {
        var _this = this;
        return this.sendCommand('playlistinfo').then(function (msg) { return _this.parse(msg, ['file'], function (valueMap) { return new mpd_objects_1.MPDPlaylistItem(valueMap); }); });
    };
    /**
     * Add a song to the current playlist.
     * @param path	The path of the song to add.
     * @param index	The position within the current playlist where the song should be added.
     * 				If no index (or a negative index) is given, the song will be added to the end
     * 				of the playlist.
     */
    MPC.prototype.addToCurrentPlaylist = function (path, index) {
        if (index === void 0) { index = -1; }
        var cmdString = 'addid "' + path + '"';
        if (index >= 0) {
            cmdString += ' ' + index;
        }
        this.sendCommand(cmdString);
    };
    MPC.prototype.removeFromCurrentPlaylist = function (index) {
        this.sendCommand('delete ' + index);
    };
    /**
     * Move a bunch of songs within the current playlist. The songs will be moved to the
     * given target index in the order in which they currently appear in the playlist.
     */
    MPC.prototype.moveInCurrentPlaylist = function (sourceIndices, targetIndex) {
        sourceIndices.sort(function (a, b) { return (a - b); });
        for (var i = 0; i < sourceIndices.length; i++) {
            var sourceIndex = sourceIndices[i];
            if (sourceIndex < targetIndex) {
                sourceIndex -= i;
                targetIndex--;
            }
            this.sendCommand('move ' + sourceIndex + " " + targetIndex);
            targetIndex++;
        }
    };
    MPC.prototype.clearCurrentPlaylist = function () {
        this.sendCommand('clear');
    };
    MPC.prototype.play = function () {
        this.sendCommand('play');
    };
    MPC.prototype.pause = function () {
        this.sendCommand('pause');
    };
    MPC.prototype.stop = function () {
        this.sendCommand('stop');
    };
    MPC.prototype.previous = function () {
        this.sendCommand('previous');
    };
    MPC.prototype.next = function () {
        this.sendCommand('next');
    };
    /**
     * Jump to the song with the given index and start playing.
     */
    MPC.prototype.jump = function (index) {
        this.sendCommand('play ' + index);
    };
    /**
     * Seek within the currently playing song.
     * @param time	The position (in seconds, fractions allowed) to seek to.
     */
    MPC.prototype.seek = function (time) {
        this.sendCommand('seekcur ' + time);
    };
    /**
     * Search the music database for songs that have a tag containing the given string.
     * The search is case-insensitive.
     */
    MPC.prototype.search = function (what) {
        var _this = this;
        return this.sendCommand('search any ' + what).then(function (msg) {
            return _this.parse(msg, ['file'], function (valueMap) { return new mpd_objects_1.MPDMusicFile(valueMap); });
        });
    };
    MPC.prototype.getDirectory = function (path) {
        var _this = this;
        return this.sendCommand('lsinfo "' + path + '"').then(function (msg) {
            return _this.parse(msg, ['file', 'directory', 'playlist'], function (valueMap) { return mpd_objects_1.MPDDirectoryEntry.fromValueMap(valueMap); });
        });
    };
    /**
     * Get the music files from the directory with the given path and its subdirectories.
     * @param recurseLevels	The number of directory levels to recurse into. If no number (or 0) is given,
     * 						only music files from the top directory are returned, if 1 is given, music
     * 						files from the top directory and its immediate subdirectories are returned,
     * 						and so on. If a negative number is given, the recursion is unlimited.
     */
    MPC.prototype.getFilesInDirectory = function (directoryPath, recurseLevels) {
        var _this = this;
        if (recurseLevels === void 0) { recurseLevels = 0; }
        return this.getDirectory(directoryPath).then(function (entries) {
            var files = [];
            var directoryPromises = [];
            entries.forEach(function (entry) {
                if (entry.entryType == mpd_objects_1.MPDDirectoryEntryType.MusicFile) {
                    files.push(entry);
                }
                else if (entry.entryType == mpd_objects_1.MPDDirectoryEntryType.Directory) {
                    if (recurseLevels != 0) {
                        directoryPromises.push(_this.getFilesInDirectory(entry.path, recurseLevels - 1));
                    }
                }
            });
            return Promise.all(directoryPromises).then(function (filesFromSubDirectories) {
                filesFromSubDirectories.forEach(function (moreFiles) {
                    files = files.concat(moreFiles);
                });
                return files;
            });
        });
    };
    /**
     * Get the music files in a playlist
     * @param nameOrPath	This is either the name of a playlist stored using [[storeCurrentPlaylist]]
     * 						or the path of a playlist file in the music database.
     */
    MPC.prototype.getPlaylist = function (nameOrPath) {
        var _this = this;
        return this.sendCommand('listplaylistinfo "' + nameOrPath + '"').then(function (msg) {
            return _this.parse(msg, ['file'], function (valueMap) { return new mpd_objects_1.MPDMusicFile(valueMap); });
        });
    };
    /**
     * Get the metadata for all playlists stored using [[storeCurrentPlaylist]].
     */
    MPC.prototype.getStoredPlaylists = function () {
        var _this = this;
        return this.sendCommand('listplaylists').then(function (msg) {
            return _this.parse(msg, ['playlist'], function (valueMap) { return new mpd_objects_1.MPDStoredPlaylist(valueMap); });
        });
    };
    /**
     * Remove a playlist stored using [[storeCurrentPlaylist]]
     */
    MPC.prototype.removeStoredPlaylist = function (name) {
        this.sendCommand('rm "' + name + '"');
    };
    /**
     * Append a playlist stored using [[storeCurrentPlaylist]] to the current playlist.
     */
    MPC.prototype.loadStoredPlaylist = function (name) {
        this.sendCommand('load "' + name + '"');
    };
    /**
     * Store the current playlist.
     */
    MPC.prototype.storeCurrentPlaylist = function (name) {
        this.sendCommand('save "' + name + '"');
    };
    /**
     * Start updating the music database: find new files, remove deleted files, update modified files.
     * @param directoryPath	Update only this directory and its subdirectories.
     */
    MPC.prototype.update = function (directoryPath) {
        var cmdString = 'update';
        if (directoryPath) {
            cmdString += ' "' + directoryPath + '"';
        }
        this.sendCommand(cmdString);
    };
    /**
     * Start rescanning the music database. Same as [[update]], but also rescans unmodified files.
     * @param directoryPath	Rescan only this directory and its subdirectories.
     */
    MPC.prototype.rescan = function (directoryPath) {
        var cmdString = 'rescan';
        if (directoryPath) {
            cmdString += ' "' + directoryPath + '"';
        }
        this.sendCommand(cmdString);
    };
    return MPC;
})(mpd_protocol_1.MPDProtocol);
exports.MPC = MPC;

},{"./mpd-objects":6,"./mpd-protocol":7}],6:[function(require,module,exports){
/// <reference path="../typings/es6-map.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * The current status of the player.
 */
var MPDStatus = (function () {
    function MPDStatus(valueMap) {
        this.state = valueMap.get('state');
        this.song = Number(valueMap.get('song'));
        this.songId = Number(valueMap.get('songid'));
        this.elapsed = Number(valueMap.get('elapsed'));
        this.volume = Number(valueMap.get('volume'));
        this.playlistVersion = Number(valueMap.get('playlist'));
        this.playlistLength = Number(valueMap.get('playlistlength'));
        this.repeat = Boolean(Number(valueMap.get('repeat')));
        this.random = Boolean(Number(valueMap.get('random')));
        this.single = Boolean(Number(valueMap.get('single')));
        this.consume = Boolean(Number(valueMap.get('consume')));
        this.bitrate = Number(valueMap.get('bitrate'));
        this.audio = valueMap.get('audio');
    }
    return MPDStatus;
})();
exports.MPDStatus = MPDStatus;
/**
 * The types of objects in the music database
 */
(function (MPDDirectoryEntryType) {
    MPDDirectoryEntryType[MPDDirectoryEntryType["Directory"] = 0] = "Directory";
    MPDDirectoryEntryType[MPDDirectoryEntryType["MusicFile"] = 1] = "MusicFile";
    MPDDirectoryEntryType[MPDDirectoryEntryType["Playlist"] = 2] = "Playlist";
})(exports.MPDDirectoryEntryType || (exports.MPDDirectoryEntryType = {}));
var MPDDirectoryEntryType = exports.MPDDirectoryEntryType;
/**
 * Base class for objects in the music database.
 */
var MPDDirectoryEntry = (function () {
    function MPDDirectoryEntry() {
    }
    MPDDirectoryEntry.fromValueMap = function (valueMap) {
        if (valueMap.get('file')) {
            return new MPDMusicFile(valueMap);
        }
        else if (valueMap.get('directory')) {
            return new MPDDirectory(valueMap);
        }
        else if (valueMap.get('playlist')) {
            return new MPDPlaylist(valueMap);
        }
    };
    /**
     * Get the file/directory name from the path of this object
     */
    MPDDirectoryEntry.prototype.getName = function () {
        var separatorIndex = this.path.lastIndexOf('/');
        if (separatorIndex >= 0) {
            return this.path.substring(separatorIndex + 1);
        }
        else {
            return this.path;
        }
    };
    /**
     * Get the BasePath of this object
     */
    MPDDirectoryEntry.prototype.getBasePath = function () {
        var separatorIndex = this.path.lastIndexOf('/');
        if (separatorIndex >= 0) {
            return this.path.substring(0, separatorIndex);
        }
        else {
            return '';
        }
    };
    return MPDDirectoryEntry;
})();
exports.MPDDirectoryEntry = MPDDirectoryEntry;
/**
 * Metadata for a music file.
 */
var MPDMusicFile = (function (_super) {
    __extends(MPDMusicFile, _super);
    function MPDMusicFile(valueMap) {
        _super.call(this);
        this.path = valueMap.get('file');
        this.lastModified = new Date(valueMap.get('Last-Modified'));
        this.title = valueMap.get('Title');
        this.artist = valueMap.get('Artist');
        this.album = valueMap.get('Album');
        this.albumArtist = valueMap.get('AlbumArtist');
        this.date = valueMap.get('Date');
        this.genre = valueMap.get('Genre');
        this.duration = Number(valueMap.get('Time'));
        this.entryType = MPDDirectoryEntryType.MusicFile;
        if (!this.title && this.path) {
            var filename = this.getName();
            var suffixIndex = filename.lastIndexOf('.');
            if (suffixIndex > 0) {
                this.title = filename.substring(0, suffixIndex);
            }
            else {
                this.title = filename;
            }
        }
    }
    return MPDMusicFile;
})(MPDDirectoryEntry);
exports.MPDMusicFile = MPDMusicFile;
/**
 * Metadata for a directory.
 */
var MPDDirectory = (function (_super) {
    __extends(MPDDirectory, _super);
    function MPDDirectory(valueMap) {
        _super.call(this);
        this.path = valueMap.get('directory');
        this.lastModified = new Date(valueMap.get('Last-Modified'));
        this.entryType = MPDDirectoryEntryType.Directory;
    }
    return MPDDirectory;
})(MPDDirectoryEntry);
exports.MPDDirectory = MPDDirectory;
/**
 * Metadata for a playlist file.
 */
var MPDPlaylist = (function (_super) {
    __extends(MPDPlaylist, _super);
    function MPDPlaylist(valueMap) {
        _super.call(this);
        this.path = valueMap.get('playlist');
        this.lastModified = new Date(valueMap.get('Last-Modified'));
        this.entryType = MPDDirectoryEntryType.Playlist;
    }
    return MPDPlaylist;
})(MPDDirectoryEntry);
exports.MPDPlaylist = MPDPlaylist;
/**
 * An entry in a playlist.
 */
var MPDPlaylistItem = (function () {
    function MPDPlaylistItem(valueMap) {
        this.id = Number(valueMap.get('Id'));
        this.position = Number(valueMap.get('Pos'));
        this.title = valueMap.get('Title');
        this.artist = valueMap.get('Artist');
        this.album = valueMap.get('Album');
        this.albumArtist = valueMap.get('AlbumArtist');
        this.date = valueMap.get('Date');
        this.genre = valueMap.get('Genre');
        this.duration = Number(valueMap.get('Time'));
        this.path = valueMap.get('file');
        this.lastModified = new Date(valueMap.get('Last-Modified'));
        if (!this.title && this.path) {
            var filename = this.path;
            var separatorIndex = this.path.lastIndexOf('/');
            if (separatorIndex >= 0) {
                filename = filename.substring(separatorIndex + 1);
            }
            var suffixIndex = filename.lastIndexOf('.');
            if (suffixIndex > 0) {
                this.title = filename.substring(0, suffixIndex);
            }
            else {
                this.title = filename;
            }
        }
    }
    return MPDPlaylistItem;
})();
exports.MPDPlaylistItem = MPDPlaylistItem;
/**
 * Metadata for a stored playlist.
 */
var MPDStoredPlaylist = (function () {
    function MPDStoredPlaylist(valueMap) {
        this.name = valueMap.get('playlist');
        this.lastModified = new Date(valueMap.get('Last-Modified'));
    }
    return MPDStoredPlaylist;
})();
exports.MPDStoredPlaylist = MPDStoredPlaylist;

},{}],7:[function(require,module,exports){
/// <reference path="../typings/es6-promise.d.ts" />
/**
 * Implements the [general syntax](http://www.musicpd.org/doc/protocol/syntax.html)
 * of the [Music Player Daemon protocol](http://www.musicpd.org/doc/protocol/index.html)
 */
var MPDProtocol = (function () {
    /**
     * Create an instance that connects to the daemon via the given connection.
     */
    function MPDProtocol(connection) {
        var _this = this;
        this.connection = connection;
        this.connection.connect(function (msg) { return _this.processReceivedMessage(msg); });
        this.initialising = true;
        this.idle = false;
        this.queuedRequests = [];
        this.observers = [];
        this.receivedLines = [];
    }
    /**
     * Register an observer that will get notified when there is a change in one of the daemon's subsystems.
     */
    MPDProtocol.prototype.registerObserver = function (observer) {
        this.observers.push(observer);
    };
    MPDProtocol.prototype.unregisterObserver = function (observer) {
        var index = this.observers.indexOf(observer);
        if (index >= 0) {
            this.observers.splice(index, 1);
        }
    };
    /**
     * Send a command to the daemon. The returned promise will be resolved with an array
     * containing the lines of the daemon's response.
     */
    MPDProtocol.prototype.sendCommand = function (cmd) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var mpdRequest = new MPDRequest(cmd, function (lines) { return resolve(lines); }, function (mpdError) { return reject(mpdError); });
            _this.enqueueRequest(mpdRequest);
        });
    };
    /**
     * Parse the daemon response for a command.
     * @param lines		The daemon response.
     * @param markers	Markers are keys denoting the start of a new object within the response.
     * @param convert	Converts a key-value Map from the response into the desired target object.
     */
    MPDProtocol.prototype.parse = function (lines, markers, convert) {
        var result = new Array();
        var currentValueMap = new Map();
        var lineCount = 0;
        lines.forEach(function (line) {
            var colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                var key = line.substring(0, colonIndex);
                var value = line.substring(colonIndex + 2);
                if ((lineCount > 0) && markers.some(function (marker) { return (marker == key); })) {
                    result.push(convert(currentValueMap));
                    currentValueMap = new Map();
                }
                currentValueMap.set(key, value);
                lineCount++;
            }
            else {
                console.log('Huh? "' + line + '" at line ' + lineCount);
            }
        });
        if (lineCount > 0) {
            result.push(convert(currentValueMap));
        }
        return result;
    };
    MPDProtocol.prototype.enqueueRequest = function (mpdRequest) {
        this.queuedRequests.push(mpdRequest);
        if (this.idle) {
            this.connection.send('noidle\n');
            this.idle = false;
        }
    };
    MPDProtocol.prototype.processReceivedMessage = function (msg) {
        if (this.initialising) {
            this.initialCallback(msg.substring(0, msg.length - 1));
            this.initialising = false;
            this.dequeueRequests();
            return;
        }
        if (this.receivedLines.length > 0) {
            var lastPreviousLine = this.receivedLines.pop();
            msg = lastPreviousLine + msg;
        }
        var lines = msg.split('\n');
        for (var i = 0; i < (lines.length - 1); i++) {
            var line = lines[i];
            if ((line == 'list_OK') || (line == 'OK')) {
                if (this.runningRequests.length > 0) {
                    var req = this.runningRequests.shift();
                    req.onFulfilled(this.receivedLines);
                    this.receivedLines = [];
                }
            }
            else if (stringStartsWith(line, 'ACK [')) {
                if (this.runningRequests.length > 0) {
                    var req = this.runningRequests.shift();
                    var match = MPDProtocol.failureRegExp.exec(line);
                    if (match != null) {
                        var mpdError = { errorCode: Number(match[1]), errorMessage: match[2] };
                        req.onRejected(mpdError);
                        this.queuedRequests = this.runningRequests.concat(this.queuedRequests);
                        this.runningRequests = [];
                    }
                    else {
                        console.log('WTF? "' + line + '"');
                    }
                    this.receivedLines = [];
                }
            }
            else {
                this.receivedLines.push(line);
            }
        }
        this.receivedLines.push(lines[lines.length - 1]);
        if ((lines.length >= 2) && (lines[lines.length - 1] == '') &&
            ((lines[lines.length - 2] == 'OK') || stringStartsWith(lines[lines.length - 2], 'ACK ['))) {
            this.dequeueRequests();
        }
    };
    MPDProtocol.prototype.dequeueRequests = function () {
        var _this = this;
        if (this.queuedRequests.length > 0) {
            this.runningRequests = this.queuedRequests;
            this.queuedRequests = [];
            this.idle = false;
        }
        else {
            this.runningRequests = [new MPDRequest('idle', function (lines) { return _this.idleCallback(lines); })];
            this.idle = true;
        }
        var commandString;
        if (this.runningRequests.length == 1) {
            commandString = this.runningRequests[0].commandString + '\n';
        }
        else {
            commandString = 'command_list_ok_begin\n';
            this.runningRequests.forEach(function (command) {
                commandString += command.commandString + '\n';
            });
            commandString += 'command_list_end\n';
        }
        this.connection.send(commandString);
    };
    MPDProtocol.prototype.initialCallback = function (msg) {
        var match = /^OK MPD ([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(msg);
        this.mpdMajorVersion = Number(match[1]);
        this.mpdMinorVersion = Number(match[2]);
        this.mpdPatchVersion = Number(match[3]);
    };
    MPDProtocol.prototype.idleCallback = function (lines) {
        this.idle = false;
        var subsystems = lines.map(function (changed) { return changed.substring(9); });
        if (subsystems.length > 0) {
            this.observers.forEach(function (observer) { return observer.subsystemsChanged(subsystems); });
        }
    };
    MPDProtocol.failureRegExp = /ACK \[([0-9]+)@[0-9]+\] \{[^\}]*\} (.*)/;
    return MPDProtocol;
})();
exports.MPDProtocol = MPDProtocol;
/**
 * A failure response from the daemon.
 */
var MPDError = (function () {
    function MPDError() {
    }
    return MPDError;
})();
exports.MPDError = MPDError;
var MPDRequest = (function () {
    function MPDRequest(commandString, onFulfilled, onRejected) {
        this.commandString = commandString;
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
    }
    return MPDRequest;
})();
function stringStartsWith(str, prefix) {
    return ((str.length >= prefix.length) && (str.substring(0, prefix.length) == prefix));
}

},{}]},{},[3,4])(4)
});
//# sourceMappingURL=mpc.js.map
