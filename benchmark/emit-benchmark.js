'use strict';

var EventEmitter = require('events');
var EventEmitter3 = require('eventemitter3');
var PatternEmitter = require('pattern-emitter');
var RegexEmitter = require('regexemitter');
var MatchEmitter = require('../index.js');

var Benchmark = require('benchmark');

var suite = new Benchmark.Suite();

var emitters = {
    'eventemitter': new EventEmitter(),
    'eventemitter3': new EventEmitter3(),
    'pattern-emitter': new PatternEmitter(),
    'regex-emitter': new RegexEmitter(),
    'match-emitter': new MatchEmitter()
};

var matches = [
    /thi(.*)s/,
    'is',
    'a',
    'test',
    'for',
    'multiple',
    /reg|e|xe|s/
];

function emitSingleArg(key) {
    for (var i = 0; i < 5; i++) {
        emitters[key].emit('event: ' + i);
    }
}

function emitMultipleArgs(key) {
    for (var i = 0; i < 5; i++) {
        emitters[key].emit('event: ' + i, 0, 1, 2);
    }
}

function emitLotsOfArgs(key) {
    for (var i = 0; i < 5; i++) {
        emitters[key].emit('event: ' + i, 0, 1, 2, 3, 4, 5, 6, 7, 8);
    }
}

for (var key in emitters) {
    for (var i = 0; i < 5; i++) {
        for (var j = 0; i < 5; i++) {
            emitters[key].on('event: ' + i, function() {});
        }
    }
}

function addSuite(name, testFn) {
    suite.add('eventemitter ' + name, function() {
        testFn('eventemitter');
    });

    suite.add('eventemitter3 ' + name, function() {
        testFn('eventemitter3');
    });

    suite.add('pattern-emitter ' + name, function() {
        testFn('pattern-emitter');
    });

    suite.add('regex-emitter ' + name, function() {
        testFn('regex-emitter');
    });

    suite.add('match-emitter ' + name, function() {
        testFn('match-emitter');
    });
}

addSuite('single args', emitSingleArg);
addSuite('multiple args', emitMultipleArgs);
addSuite('lots of args', emitLotsOfArgs);

suite.run({async: true})
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function(err) {
        console.log(err);
    })
    .on('complete', function(complete) {
        console.log('complete');
    });
