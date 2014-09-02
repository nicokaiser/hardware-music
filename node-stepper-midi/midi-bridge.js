'use strict';

var midi = require('midi');
var rtpmidi = require('rtpmidi');
var MIDIUtils = require('midiutils');
var StepperPlayer = require('./lib/stepper-player').StepperPlayer;


// Configuration

var midiPort = 1; // real MIDI port (or false)
var midiName = 'Hardware Music'; // "Hardware Music"
var rtpMidiPort = 5008; // 5008
var device = '/dev/ttyACM0'; // /dev/ttyACM0


var stepperPlayer;
var currentNote = false;


// Handle MIDI events

function onMessage(deltaTime, message) {
    if (message[0] === 0x80 || message[0] === 0x90 && message[2] === 0) {
        console.log('Note Off: %d', message[1]);
        if (currentNote === message[1]) {
            stepperPlayer.off();
            currentNote = false;
        }
        stepperPlayer.off();
    } else if (message[0] === 0x90) {
        var freq = MIDIUtils.noteNumberToFrequency(message[1]);
        var noteName = MIDIUtils.noteNumberToName(message[1]);
        console.log('Note On:  %d (%s, %d Hz)', message[1], noteName, freq);
        stepperPlayer.play(freq);
        currentNote = message[1];
    }
}


// MIDI port

var input;
if (typeof midiPort === "number") {
    input = new midi.input();
    if (input.getPortCount() < midiPort + 1) {
        console.error('Invalid MIDI port: %d', midiPort);
        process.exit(1);
    }
    input.openPort(midiPort);
    input.ignoreTypes(false, false, false);
    input.on('message', onMessage);
    console.log('Listening on MIDI port %d (%s)', midiPort, input.getPortName(midiPort));
}


// RTP-MIDI

console.log('Listening on RTP-MIDI port %d (%s)', rtpMidiPort, midiName);
var rtpMidiSession = rtpmidi.manager.createSession({
    localName: midiName,
    bonjourName: midiName,
    port: rtpMidiPort
});
rtpMidiSession.on('message', function (deltaTime, message) {
    //var commands = Array.prototype.slice.call(message, 0);
    // ...
    // TODO: onMessage(deltaTime, message);
    console.log(message);
});


// Output to StepperPlayer

console.log('Connecting to StepperPlayer on %s', device);
stepperPlayer = new StepperPlayer(device);
stepperPlayer.on('connect', function () {
    console.log('Connected to StepperPlayer');
});
stepperPlayer.on('error', function (err) {
    console.error('StepperPlayer: ' + err.message);
});


// Handle process signals

process.on('SIGTERM', function () {
    if (input) input.closePort();
    rtpMidiSession.close();

    stepperPlayer.off();
    stepperPlayer.close();
    // TODO: stepperPlayer.reset()
});
