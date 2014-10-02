'use strict';

var midi = require('midi');
var MIDIUtils = require('midiutils');
var StepperPlayer = require('./lib/stepper-player').StepperPlayer;


// Configuration

var midiPort = 1; // real MIDI port (or false)
var device = '/dev/ttyACM0'; // /dev/ttyACM0
var pitchBendCent = 200;


var stepperPlayer;
var currentNote = false;
var currentBend = 0;


// Calculate frequency from MIDI note and pitch bend

function noteToFrequency(note, bend) {
    var freq = MIDIUtils.noteNumberToFrequency(note);
    if (! bend) return freq;
    return freq * Math.pow((Math.pow(2, 1 / 1200)), bend);
}


// Handle MIDI events

function onMessage(deltaTime, message) {
    var freq, noteName;

    // Volume = 0: reset stepperPlayer
    if (message[0] === 0xb0 && message[1] === 7 && message[2] === 0) {
        console.log('Reset stepperPlayer');
        stepperPlayer.reset();
    }

    // Pitch Bend
    else if (message[0] === 0xe0) {
        var amount = (message[2] * 128 + message[1] - 8192) / 8192;
        currentBend = amount * pitchBendCent;
        console.log('Pitch Bend: %d', amount);
        if (currentNote) {
            freq = noteToFrequency(currentNote, currentBend);
            noteName = MIDIUtils.noteNumberToName(currentNote);
            console.log('Bend:   %d (%s, %d Hz)', currentNote, noteName, freq);
            stepperPlayer.play(freq);
        }
    }

    // Note Off
    else if (message[0] === 0x80 || message[0] === 0x90 && message[2] === 0) {
        console.log('Note Off: %d', message[1]);
        if (currentNote === message[1]) {
            stepperPlayer.off();
            currentNote = false;
        }
    }

    // Note On
    else if (message[0] === 0x90) {
        freq = noteToFrequency(message[1], currentBend);
        noteName = MIDIUtils.noteNumberToName(message[1]);
        console.log('Note On:  %d (%s, %d Hz)', message[1], noteName, freq);
        stepperPlayer.play(freq);
        currentNote = message[1];
    }
}


// Shutdown handler

function shutdown() {
    if (input) input.closePort();
    stepperPlayer.off();
    stepperPlayer.close();
    process.exit(0);
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

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
