import * as Tone from 'tone';
import $ from 'jquery';

Tone.start();

const synth = new Tone.Synth().toDestination();
const wait = new Tone.Synth().toDestination();
const eff = new Tone.Synth().toDestination();
const distortion = new Tone.Distortion(0.4).toDestination();
eff.connect(distortion);

$('#1').on('click', (e) => {
  synth.triggerAttackRelease('C4', '8n');
});

$('#2').on('click', (e) => {
  const now = Tone.now();
  wait.triggerAttackRelease('C4', '8n', now + 1);
});

$('#3').on('click', (e) => {
  eff.triggerAttackRelease('C4', '8n');
});
