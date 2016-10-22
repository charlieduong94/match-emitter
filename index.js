'use strict';

function _convertWildcardStringToRegex(str) {
    var matchTokens = str.split('*');
    var regex = matchTokens.join('(.*)');
    return new RegExp(regex);
}

function _validateMatchExpression(expression) {
    var regex;
    if (typeof expression === 'string') {
        regex = new RegExp(_convertWildcardStringToRegex(expression));
    } else if (expression instanceof RegExp) {
        regex = expression;
    } else {
        throw new Error('Event to listen to needs to be either a string or a regular expression');
    }
    return regex;
}

function _addListener(self, event, callback, once) {
    var regex = _validateMatchExpression(event).source;
    var listeners = self._listeners[regex];
    var listener = {
        once: once,
        fn: callback
    };
    if (!listeners) {
        self._listeners[regex] = listener;
    } else if (!Array.isArray(listeners)) {
        // listener is just an object, convert into array
        // with new listener
        self._listeners[regex] = [listeners, listener];
    } else {
        listeners[regex].push(listener);
    }

    self._hits[event] = regex.source;
}

/**
 * This is an event emitter implementation that allows for pattern matching and wild cards
 */
function MatchEmitter() {
    this._listeners = {};
    this._hits = {};
}

MatchEmitter.prototype.on = function(event, callback) {
    _addListener(this, event, callback, false);
};

MatchEmitter.prototype.once = function(event, callback) {
    _addListener(this, event, callback, true);
};

MatchEmitter.prototype.emit = function(event, arg1, arg2, arg3) {
    var self = this;
    var cachedHit = self._hits[event];
    var matchedKey;

    var matches;
    if (cachedHit) {
        matches = self._listeners[cachedHit];
        matchedKey = cachedHit;
    } else {
        matches = self._listeners[event];
        matchedKey = event;
    }

    if (!matches) {
        var keys = Object.keys(self._listeners);
        for (var i = 0; i < keys.length; i++) {
            var expr = new RegExp(keys[i]);
            if (expr.test(event)) {
                matches = self._listeners[keys[i]];
                self._hits[event] = expr.source;
                matchedKey = keys[i];
                break;
            }
        }
        if (!matches) {
            return false;
        }
    }

    var removals = [];
    var args;
    var argsLength = arguments.length;

    if (!Array.isArray(matches)) {
        switch (argsLength) {
            case 1:
                matches.fn.call(self);
                break;
            case 2:
                matches.fn.call(self, arg1);
                break;
            case 3:
                matches.fn.call(self, arg1, arg2);
                break;
            case 4:
                matches.fn.call(self, arg1, arg2, arg3);
                break;
            default:
                if (!args) {
                    args = [];
                    for (var j = 1; j < argsLength; j++) {
                        args.push(arguments[j]);
                    }
                }
                matches.fn.apply(self, args);
        }
        if (matches.once) {
            delete self._listeners[matchedKey];
            if (cachedHit) {
                delete self._hits[cachedHit];
            }
        }
    } else {
        for (var i = 0; i < matches.length; i++) {
            switch (argsLength) {
                case 1:
                    matches[i].fn.call(self);
                    break;
                case 2:
                    matches[i].fn.call(self, arg1);
                    break;
                case 3:
                    matches[i].fn.call(self, arg1, arg2);
                    break;
                case 4:
                    matches[i].fn.call(self, arg1, arg2, arg3);
                    break;
                default:
                    if (!args) {
                        args = [];
                        for (var j = 1; j < argsLength; j++) {
                            args.push(arguments[j]);
                        }
                    }
                    matches[i].fn.apply(self, args);
            }
            if (matches[i].once) {
                removals.push(i);
            }
        }

        for (var i = removals.length - 1; i >= 0; i--) {
            matches.splice(removals[i], 1);
        }
    }
    return true;
};

MatchEmitter.prototype.removeListener = function(event, callback) {
    var regex = _validateMatchExpression(event);
    var match = this._listeners[regex.source];
    if (match) {
        var listeners = match.listeners;
        var cbIndex = listeners.indexOf(callback);
        if (cbIndex !== -1) {
            listeners.splice(cbIndex, 1);
        }
    }
};

MatchEmitter.prototype.removeListener = function(event, callback) {
    var self = this;
    var regex = _validateMatchExpression(event).source;
    var matches = self._listeners[regex];
    if (matches && Array.isArray(matches)) {
        var removeIndex;
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].callback === callback) {
                break;
            }
        }
        if (removeIndex !== -1) {
            matches.splice(removeIndex, 1);
        }
    } else if (matches === callback) {
        delete self._listeners[regex];
    }

    var hits = Object.keys(self._hits);
    for (var i = 0; i < hits.length; i++) {
        if (hits[i] === regex) {
            delete self._hits[hits[i]];
        }
    }
};

MatchEmitter.prototype.removeAllListeners = function(event, callback) {
    var self = this;
    var keys = Object.keys(self._listeners);
    for (var i = 0; i < keys.length; i++) {
        delete self._listeners[keys[i]];
    }
    
    var hits = Object.keys(self._hits);
    for (var i = 0; i < hits.length; i++) {
        delete self._hits[hits[i]];
    }
};

module.exports = MatchEmitter;
