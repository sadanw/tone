/* eslint-disable prefer-destructuring */
/* eslint-disable no-useless-concat */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable camelcase */
import * as Tone from 'tone';
import $ from 'jquery';
import 'jspsych';
import 'jspsych/plugins/jspsych-audio-button-response';
import 'jspsych/plugins/jspsych-audio-keyboard-response';
import 'jspsych/plugins/jspsych-call-function';
import 'jspsych/plugins/jspsych-survey-likert';
import 'jspsych/plugins/jspsych-survey-multi-choice';
import 'jspsych/plugins/jspsych-instructions';
import 'jspsych/plugins/jspsych-html-keyboard-response';
import 'jspsych/plugins/jspsych-html-slider-response';
import 'jspsych/plugins/jspsych-fullscreen';
import '../../../tone_ex/tone-attribution/js/jspsych-detect-held-down-keys';
import bowser from 'bowser';

const jsPsych = window.jsPsych;

// allows audio context to start - not sure if should be here or when initializing jspsych (will test)
Tone.start();

// experimental variables from sada
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

// given experimental variables
const id = 'random'; // use one of these three options: 'participant', 'url', 'random'
const fullscreen = true; // Fullscreen mode or not?
const minWidth = 800; // minimum width of the experiment window
const minHeight = 600; // minimum height of the experiment window
const redirect_onCompletion = false;
const redirect_link = 'https://osf.io';

// text variables
const page1 = [
  '<p>For this task, you will use the index finger of your dominant hand to perform a series of irregular, Morse code-like taps while listening to a sequence of tones. The tones you hear could either result from <strong>your own actions/taps </strong>, the recorded <strong>actions/taps of another individual</strong>, or <strong>varying mixtures of both</strong>. </p>' + '<br>'
  + '<p>After each 10 second trial, you will be asked to assess the proportion of control that you felt belonged to <strong>yourself</strong> versus to the <strong>other </strong>. </p>'
  + '<p>Please play the audio file below to listen to an example of a tapping sequence:</p>'
  + '<p> <i> [ play button for audio file here ] </i></p>'
  + '<p>Then, hit the <strong>Next</strong> button to begin the practice trials:</p>',
];

// instructions page 2
// Do not forget to adjust the number of blocks
// page2 = [
//  '<p> Nevertheless, it is really important that you do not wait for the stop signal to occur and that you respond as quickly and as accurately as possible to the arrows. </p>'+
//  '<p> After all, if you start waiting for stop signals, then the program will delay their presentation. This will result in long reaction times. </p>'+
//  '<p> We will start with a short practice block in which you will receive immediate feedback. You will no longer receive immediate feedback in the experimental phase. </p>'+
//  '<p> However, at the end of each experimental block, there will be a 15 second break. During this break, we will show you some information about your mean performance in the previous block.</p>' +
// '<p> The experiment consists of 1 practice block and 4 experimental blocks</p>'
// ];

// informed consent text
// const informed_consent_text = [
//  '<p> Type your informed consent text in the text_variables.js file... </p>',
// ];

// other
const label_previous_button = 'Previous';
const label_next_button = 'Next';
// const label_consent_button = 'I agree';
const full_screen_message = '<p>The experiment will switch to fullscreen mode when you push the button below. </p>';
const welcome_message = ['<p>Welcome to the experiment.</p>' + '<p>Press "Next" to begin.</p>'];
const not_supported_message = ['<p>This experiment requires the Chrome or Firefox webbrowser.</p>'];
const subjID_instructions = 'Enter your participant ID.';
// const age_instructions = 'Enter your age.';
// const gender_instructions = 'Choose your gender.';
// const gender_options = ['Female', 'Male', 'Other', 'Prefer not to say'];
const text_at_start_block = '<p>Press space to begin.</p>';
const get_ready_message = '<p>Get ready...</p>';
// const fixation_text = '<div style="font-size:60px;">TEST</div>';
const end_message = '<p>Thank you for your participation.</p>'
  + '<p>Press space to finalize the experiment (redirect to XXX).</p>';

// initialize variables
const timeline = []; // this array stores the events we want to run in the experiment

// const trial_ind = 1; // trial indexing variable starts at 1 for convenience

// const block_ind = 0; // block indexing variables: block 0 is considered to be the practice block

let focus = 'focus'; // tracks if the current tab/window is the active tab/window, initially the current tab should be focused
let fullscr_ON = 'no'; // tracks fullscreen activity, initially not activated
const redirect_timeout = 1500; // set this so that data is saved before redirect!

// is the experiment running from a server or not? (this determines if data is saved on server or offline)
let online = false;
if (document.location.host) { // returns your host or null
  online = true;
}

// detect visitor variables with the bowser js library (/js/bowser.js)
jsPsych.data.addProperties({ // add these variables to all rows of the datafile

  browser_name: bowser.name,
  browser_version: bowser.version,

  os_name: bowser.osname,
  os_version: bowser.osversion,

  tablet: String(bowser.tablet),
  mobile: String(bowser.mobile),
  // convert explicitly to string so that "undefined" (no response) does not lead to empty cells in the datafile
  screen_resolution: `${jsPsych.width} x ${jsPsych.height}`,

  window_resolution: `${window.innerWidth} x ${window.innerHeight}`, // this will be updated throughout the experiment

});

const welcome = {

  type: 'instructions',

  pages: welcome_message,

  show_clickable_nav: true,

  allow_backward: false,
  button_label_next: label_next_button,

  on_start(trial) {
    console.log(bowser.name);
    if (bowser.name === 'Firefox' || bowser.name === 'Chrome' || bowser.name === 'e') {
      trial.pages = welcome_message;
    } else {
      trial.pages = not_supported_message;

      // eslint-disable-next-line no-restricted-globals
      setTimeout(() => { location.href = 'html/not_supported.html'; }, 2000);
    }
  },

};

// these events turn fullscreen mode on in the beginning and off at the end, if enabled (see experiment_variables.js)

const fullscr = {

  type: 'fullscreen',

  fullscreen_mode: true,

  message: full_screen_message,
  button_label: label_next_button,
};

const fullscr_off = {

  type: 'fullscreen',

  fullscreen_mode: false,

  button_label: label_next_button,
};

// if enabled below, get participant's id from participant and add it to the datafile.

// the prompt is declared in the configuration/text_variables.js file

const participant_id = {

  type: 'survey-text',

  questions: [{

    prompt: subjID_instructions,

    required: true,

  }],

  button_label: label_next_button,
  on_finish(data) {
    const responses = JSON.parse(data.responses);

    const code = responses.Q0;

    jsPsych.data.addProperties({

      participantID: code,

    });
  },

};

// instruction trial
// the instructions are declared in the configuration/text_variables.js file
const instructions = {

  type: 'instructions',

  pages: [page1],

  show_clickable_nav: true,
  button_label_previous: label_previous_button,
  button_label_next: label_next_button,
};

// start block
const block_start = {
  type: 'html-keyboard-response',

  stimulus: text_at_start_block,

  choices: ['space'],

};

// get ready block
const block_get_ready = {
  type: 'html-keyboard-response',

  stimulus: get_ready_message,

  choices: jsPsych.NO_KEYS,

  trial_duration: 2000,
};

const intro_trial = {
  stimulus: 'Click this button to get started. Please press spacebar 50 times, and listen to the tone play.',
  type: 'jspsych-detect-held-down-keys',
  choices: ['space'],
  on_start() {
  },
  loop_function(data) {
    Tone.start();
    // eslint-disable-next-line no-loop-func
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
        console.log('first array of 50 keypress intervals: ');
        console.log(playback);
      }
    });
  },
};

// trial block
const single_trial = {
  type: 'html-keyboard-response',
  trial_duration: 10000,
  response_ends_trial: false,
  stimulus: 'Please press spacebar to generate tones for this 10s trial',
  choices: ['space'],
  // eslint-disable-next-line func-names
  loop_function() {
    console.log('in loop');
    let started = false;
    let i = 0;
    if (jsPsych.time_elapsed >= 10000) {
      i += 1;
    }
    Tone.start();
    let index = 0;
    $('#experiment').on('keydown', (e) => {
      console.log('clicked');
      if (started === false) {
        started = true;
        Tone.start();
      }
      // will use jsPsych to put these into 10s blocks and switch agency level threshold
      if (e.keyCode === 32) {
        // const rec = Tone.now();
        const mod = randInt(0, 90);
        console.log(`randomly generated number on press: ${mod}`);
        console.log(`agency threshold: ${agencyPerTrial[i]}`);

        if (mod < agencyPerTrial[i]) {
          synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015);
          // playback.push(rec);
          // tonePlay.push(0.015);
        } else {
          const pick = randInt(index, index + 49);
          console.log(`interval selected from random array: ${playback[pick]}`);
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
      return true;
    });
  },
};

// feedback block
const response_trial = {
  type: 'html-slider-response',
  stimulus: '<p>Assess the proportion of control you felt belonged to self versus other. </p>',
  labels: ['<strong>Self</strong>', '<strong>Other</strong>'],
  prompt: '',
  button_label: 'Submit',
};

// goodbye block
const goodbye = {

  type: 'html-keyboard-response',

  stimulus: end_message,

  on_start(data) {
    const subjID = jsPsych.data.get().last(1).values()[0].participantID;
    // const full_data = jsPsych.data.get();
    const ignore_columns = ['raw_rt', 'trial_type', 'first_stimulus', 'second_stimulus', 'onset_of_first_stimulus',
      'onset_of_second_stimulus', 'key_press', 'correct_response', 'trial_index', 'internal_node_id'];
    const rows = { trial_type: 'custom-stop-signal-plugin' }; // we are only interested in our main stimulus, not fixation, feedback etc.
    const selected_data = jsPsych.data.get().filter(rows).ignore(ignore_columns);
    // the next piece of codes orders the columns of the data file
    const d = selected_data.values(); // get the data values
    // make an array that specifies the order of the object properties
    const arr = ['participantID', 'block_i', 'trial_i', 'stim', 'signal', 'SSD', 'response', 'rt', 'correct', 'focus', 'Fullscreen',
      'time_elapsed', 'browser_name', 'browser_version', 'os_name', 'os_version', 'tablet', 'mobile', 'screen_resolution', 'window_resolution'];
    // const new_arr = []; // we will fill this array with the ordered data

    // do it for the whole data array
    for (let i = 0; i < d.length; i += 1) {
      const obj = d[i]; // get one row of data
      const new_obj = {};
      arr.forEach((item) => {
        new_obj[item] = obj[item];
        return new_obj;
      }); // for each element in the array run my function
      selected_data.values()[i] = new_obj; // insert the ordered values back in the jsPsych.data object
    }
    if (!online) {
      selected_data.localSave('csv', `SST_data_${subjID}.csv`);
    }
  },

};

// only ask for participant id if 'id' = 'particpant' (experiment_variables.js)

// if 'id' = 'url', get it from url; otherwise, generate random value

// only go into fullscreen mode if 'fullscreen' is true
const start_timeline = [];

if (id === 'participant') {
  if (fullscreen) {
    start_timeline.push(welcome, participant_id, fullscr, instructions, intro_trial);
  } else {
    start_timeline.push(welcome, participant_id, instructions, intro_trial);
  }
} else {
  if (id === 'url') {
    const urlvar = jsPsych.urlVariables();

    const code = urlvar.subject; jsPsych.data.addProperties({ participantID: code });
  } else {
    const code = jsPsych.randomization.randomID(); jsPsych.data.addProperties({ participantID: code });
  }

  if (fullscreen) {
    start_timeline.push(welcome, fullscr, instructions, intro_trial);
  } else {
    start_timeline.push(welcome, instructions, intro_trial);
  }
}

// start the experiment with the previously defined start_timeline trials

const start_procedure = {

  timeline: start_timeline,

};

const trial_procedure = {
  timeline: [single_trial, response_trial],
  // timeline_variables: indexes,
};

const block_procedure = {

  timeline: [block_start, block_get_ready, trial_procedure],

  randomize_order: false,

  repetitions: 10, // add one because the first block is the practice block

};

// end of the experiment
const end_timeline = [];
if (fullscreen) {
  end_timeline.push(fullscr_off, goodbye);
} else {
  end_timeline.push(goodbye);
}

const end_procedure = {

  timeline: end_timeline, // here, you could add questionnaire trials etc...

};

// finally, push all the procedures to the overall timeline

timeline.push(start_procedure, block_procedure, end_procedure);

/* #########################################################################

the functions that save the data and initiates the experiment

######################################################################### */

// function that pushs data to an existing file (or creates the file if it does not exist)

function appendData(filename, filedata) {
  $.ajax({ // make sure jquery-1.7.1.min.js is loaded in the html header for this to work

    type: 'post',

    cache: false,

    url: 'https://rcweb.dartmouth.edu/RoskiesA/processing_append.php', // IMPORTANT: change the php script to link to the directory of your server where you want to store the data!

    data: {

      filename,
      data: filedata,
      task: 'stop_signal',
      pid: '<?php echo $userID ?>',

    },

  });
}

// run the experiment!

jsPsych.init({
  timeline,
  display_element: 'experiment',

  on_data_update(data) { // each time the data is updated:
    // write the current window resolution to the data

    data.window_resolution = `${window.innerWidth} x ${window.innerHeight}`;

    // is the experiment window the active window? (focus = yes, blur = no)

    data.focus = focus; data.Fullscreen = fullscr_ON;

    // append a subset of the data each time a go or stop stimulus is shown (the custom-stop-signal-plugin)

    const id_index = 2;
    // point in experiment when particpant id is manually entered. see 'start_timeline'
    if (online) {
      const subjID = jsPsych.data.get().last(1).values()[0].participantID;
      let data_row = '';
      if (data.trial_index === id_index) { // write header
        data_row = 'participantID,block_i,trial_i,stim,signal,SSD,response,rt,correct,'
                      + 'focus,Fullscreen,time_elapsed,browser_name,browser_version,os_name,os_version,'
                      + 'tablet,mobile,screen_resolution,window_resolution\n';
        appendData(`SST_data_${subjID}.csv`, data_row);
      } else if (data.trial_type === 'custom-stop-signal-plugin') { // append data each stimulus
        data_row = `${data.participantID},${data.block_i},${data.trial_i},${
          data.stim},${data.signal},${data.SSD},${data.response},${data.rt},${data.correct},${
          data.focus},${data.Fullscreen},${data.time_elapsed},${data.browser_name},${
          data.browser_version},${data.os_name},${data.os_version},${data.tablet},${data.mobile},${
          data.screen_resolution},${data.window_resolution}\n`;
        appendData(`SST_data_${subjID}.csv`, data_row);
      }
    }
  },

  // eslint-disable-next-line consistent-return
  on_interaction_data_update(data) { // interaction data logs if participants leaves the browser window or exits full screen mode
    const interaction = data.event;

    if (interaction.includes('fullscreen')) {
      // some unhandy coding to circumvent a bug in jsPsych that logs fullscreenexit when actually entering
      if (fullscr_ON === 'no') { fullscr_ON = 'yes'; return fullscr_ON; } else if (fullscr_ON === 'yes') { fullscr_ON = 'no'; return fullscr_ON; }
    } else if (interaction === 'blur' || interaction === 'focus') {
      focus = interaction;

      return focus;
    }
  },

  exclusions: { // browser window needs to have these dimensions, if not, participants get the chance to maximize their window, if they don't support this resolution when maximized they can't particiate.

    min_width: minWidth,

    min_height: minHeight,

  },

  on_finish(data) {
    // Serialize the data
    const promise = new Promise(((resolve, reject) => {
      const data = jsPsych.dataAsCSV();
      resolve(data);
    }));

    promise.then((data) => {
      $.ajax({
        type: 'POST',
        url: 'https://rcweb.dartmouth.edu/RoskiesA/processing.php',
        data: {
          data,
          task: 'stopsignal',
          pid: '<?php echo $userID ?>',
        },
        success(result) {
          console.log(`good${result}`);
          document.location = 'next.html';
        },
        dataType: 'application/json',

        // Endpoint not running, local save
        error(err) {
          if (err.status === 200) {
            document.location = '/next.html';
          } else {
            // If error, assue local save
            jsPsych.localSave('stopsignal_results.csv', 'csv');
          }
        },
      });
    });

    if (redirect_onCompletion) {
      // eslint-disable-next-line no-implied-eval
      setTimeout(`location.href = '${redirect_link}';`, redirect_timeout); // redirect to another URL with a certain delay, only when redirect_onCompletion is set to 'true'
    }
  },

});

console.log('all done');

/** my original file (jic)
// intro = example audio file
// each trial 10s
// practice/intro (no time duration, 50 clicks)
// --> want each trial to be 10s followed by agency assessment using bar

// start / allow audio context
Tone.start();

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
    console.log('first array of 50 keypress intervals: ');
    console.log(playback);
  }
});

// let now = Tone.now();

// this is changing the agency threshold after 10s, and would not be needed in jsPsych because will use
// that to create trial length
/** let i = 0;
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
  // will use jsPsych to put these into 10s blocks and switch agency level threshold
  if (e.keyCode === 32) {
    // const rec = Tone.now();
    const mod = randInt(0, 90);
    console.log(`randomly generated number on press: ${mod}`);
    console.log(`agency threshold: ${agencyPerTrial[i]}`);

    if (mod < agencyPerTrial[i]) {
      synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015);
      // playback.push(rec);
      // tonePlay.push(0.015);
    } else {
      const pick = randInt(index, index + 49);
      console.log(`interval selected from random array: ${playback[pick]}`);
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
*/
