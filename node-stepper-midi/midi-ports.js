'use strict';

var midi = require('midi');


// List available MIDI ports

var input = new midi.input();
console.log('\nAvailable MIDI input ports:');
for (var i = 0; i < input.getPortCount(); i++) {
    console.log('%d: %s', i, input.getPortName(i));
}
input.closePort();

var output = new midi.output();
console.log('\nAvailable MIDI output ports:');
for (var i = 0; i < output.getPortCount(); i++) {
    console.log('%d: %s', i, output.getPortName(i));
}
output.closePort();

console.log('');
