'use strict';

const {expect} = require('chai');
var MatchEmitter = require('../index.js');

describe('MatchEmitter', function() {
    let argA = 10;
    let argB = 20;
    it('should be able to match regular expressions', function() {
        let emitter = new MatchEmitter();
        return new Promise((resolve, reject) => {
            emitter.on(/cool/, function(a, b) {
                resolve();
            });

            emitter.emit('cool', argA, argB);
        });
    });

    it('first expression defined should have precedence when matched', function() {
        let emitter = new MatchEmitter();
        return new Promise((resolve, reject) => {
            emitter.on(/cool|awesome/, function(a, b) {
                resolve();
            });
            emitter.on('awe*', function() {
                reject();
            });

            emitter.emit('awesome', argA, argB);
        });
    });

    it('should be able to match wildcards', function() {
        let emitter = new MatchEmitter();
        return new Promise((resolve, reject) => {
            emitter.on('coo*', function(a, b) {
                resolve();
            });

            emitter.emit('cool', argA, argB);
        });
    });

    it('should be able to match complex wildcards', function() {
        let emitter = new MatchEmitter();
        return new Promise((resolve, reject) => {
            emitter.on('c*lo*', function(a, b) {
                resolve();
            });

            emitter.emit('colors', argA, argB);
        });
    });

    it('should be able to remove listeners', function() {
        let emitter = new MatchEmitter();
        function cb() {}
        function cb2() {}
        emitter.on('c*lo*', cb);
        emitter.on(/removethis/, cb);
        emitter.on(/removethis/, cb2);

        expect(emitter._listeners[/removethis/.source].length).to.equal(2);

        emitter.removeListener(/removethis/, cb);

        expect(emitter._listeners[/removethis/.source].length).to.equal(1);
    });

    it('should be able to remove listeners after a single call with "once"', function() {
        let emitter = new MatchEmitter();
        let cb = function() {};
        let regexp = /c(.*)lo(.*)/.source;
        emitter.once('c*lo*', cb);
        expect(emitter._listeners[regexp].fn).to.equal(cb);
        emitter.removeListener('c*lo*', cb);
        for (let keys in emitter._matches) {
            expect(emitter._matches[keys]).to.equal(0);
        }
    });
});
