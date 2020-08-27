import * as Tone from 'tone';
import $ from 'jquery';

// intro = example audio file
// each trial 10s
// practice/intro (no time duration, 50 clicks)
// --> want each trial to be 10s followed by agency assessment using bar

// start / allow audio context
Tone.start();

// track key presses + offset of when tone plays for each
const timePress = [];
// const tonePlay = [];
const playback = [];
// currently only using 50!
const agencyPerTrial = [50, 90, 20, 70, 10, 80, 0, 30, 40, 60];

// returning random integer determining level of agency, on given scale (used on each tap and compared to threshold)
function randInt(min, max) {
  const nmin = Math.ceil(min);
  const nmax = Math.floor(max);
  return Math.floor(Math.random() * (nmax - nmin + 1)) + nmin;
}

// main synth to play tone
const synth = new Tone.Synth().toDestination();
const delsynth = new Tone.Synth().toDestination();

// distorted tone for possible use
const eff = new Tone.Synth().toDestination();
const distortion = new Tone.Distortion(0.4).toDestination();
eff.connect(distortion);

let presses = 0;

// this would be the PRACTICE at the beginning to get some recorded intervals
$('#0').on('keydown', (e) => {
  if (e.keyCode === 32 && presses < 50) {
    timePress.push(Tone.now());
    if (presses === 0) {
      playback.push(0);
    } else {
      playback.push(Tone.now() - timePress[presses - 1]);
    }
    synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015);
    presses += 1;
  } else {
    console.log(playback);
  }
});

// let now = Tone.now();

// this is changing the agency threshold after 10s, and would not be needed in JSPsych because will use
// that to create trial length
let i = 0;
let now = Tone.now();
$('#1').on('click', (a) => {
  setInterval(() => {
    if (Tone.now() > now + 10 && i < 10) {
      i += 1;
      now = Tone.now();
    }
  }, 10000);
});

// each trial can run like this
// choosing to store data for all taps instead of replacing, in case that data is wanted (can always change)
let index = 0;
$('#1').on('keydown', (e) => {
  // will use JSpsych to put these into 10s blocks and switch agency level threshold
  if (e.keyCode === 32) {
    // const rec = Tone.now();
    const mod = randInt(0, 90);
    console.log(mod);
    console.log(agencyPerTrial[i]);

    if (mod < agencyPerTrial[i]) {
      synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015);
      // playback.push(rec);
      // tonePlay.push(0.015);
    } else {
      const pick = randInt(index, index + 49);
      console.log(playback[pick]);
      delsynth.triggerAttackRelease('C4', '8n', Tone.now() + playback[pick]);
    }
    timePress.push(Tone.now());
    if (index === 0) {
      playback.push(0);
    } else {
      playback.push(Tone.now() - timePress[presses - 1]);
    }
    index += 1;
    presses += 1;
  }
});
