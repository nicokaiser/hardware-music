<?php

require_once 'MidiFile.php';
require_once 'MidiEditor.php';
require_once 'ScannerRenderer.php';

$midiEditorSample = new MidiEditorSample();
$midiEditorSample->main();

class MidiEditorSample {
    public function main() {
        $midiEditor = new MidiEditor();
        $scannerRenderer = new ScannerRenderer();

        $midiFile = new MidiFile();
        $midiFile->load('Ungarischer Tanz.mid');

        $midiEditor->analyzeTracks($midiFile);
        $this->printTrackInfo($midiFile);
        $midiEditor->modifyTracks($midiFile);

        $scannerRenderer->save($midiFile, 'Ungarischer Tanz (scanner output).bin');
        $midiFile->save('Ungarischer Tanz (output).mid');

        foreach ($midiFile->logMessages as $logMessage) {
            echo $logMessage . PHP_EOL;
        }
    }

    public function printTrackInfo($midiFile) {
        foreach ($midiFile->tracks as $trackId => $track) {
            echo PHP_EOL;
            echo 'Track ' . $trackId . ($track->trackName !== null ? ' (' . $track->trackName . ')' : '') . ':' . PHP_EOL;

            if ($track->instrumentName !== null) {
                echo '  Instrument name: ' . $track->instrumentName . PHP_EOL;
            }
            if ($track->copyrightNotice !== null) {
                echo '  Copyright: ' . $track->copyrightNotice . PHP_EOL;
            }

            if ($track->programTypes !== null) {
                echo '  Used instruments: ' . implode(', ', $track->programTypes) . PHP_EOL;
            }

            if (count($track->noteCountPerChannel) > 0) {
                echo '  Note counts:' . PHP_EOL;
                foreach ($track->noteCountPerChannel as $channel => $noteCount) {
                    echo '    Channel ' . $channel . ': ' . $noteCount . ' notes' . PHP_EOL;
                }
            }
        }
    }
}
