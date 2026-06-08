import "index.css";

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}";

// Yarn
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";

// Render Music
function transposeFromKey(abcString) {
  let key = abcString.match(/K: ?(\w+)/)[1];
  console.log(key);
  // "bbbbbb Gb / D#m": -6,
  // "bbbbb Db / C#m": -1,
  // "bbbb Ab / Fm": 4,
  // "bbb Eb / Cm": -3,
  // "bb Bb / Gm": 2,
  // "b F / Dm": -5,
  // "-- C / Am": 0,
  // "# G / Em": 5,
  // "## D / Bm": -2,
  // "### A / F#m": 3,
  // "#### E / C#m": -4,
  // "##### B / G#m": 1,
  // "###### F# / D#m": -6,
  const cKeyFrom = {
    // https://en.wikipedia.org/wiki/Circle_of_fifths
    // Each step cw is +5, ccw is -5.
    // TODO: Automatically mark transposed score with the
    //       major key, so Aerophone can transpose to correct notes.
    C: 0,
    Am: 0,
    G: 5,
    Em: 5,
    D: -2,
    Bm: -2,
    A: 3,
    "F#m": 3,
    E: -4,
    "C#m": -4,
    B: 1,
    "G#m": 1,
    F: -5,
    Dm: -5,
    Bb: 2,
    Gm: 2,
    Eb: -3,
    Cm: -3,
    Ab: 4,
    Fm: 4,
    Db: -1,
    "C#": -1,
    Bbm: -1,
    "A#m": -1,
    "F#": -6,
    Gb: -6,
    "D#m": -6,
    Ebm: -6,
  };
  return cKeyFrom[key] || 0;
}

Array.from(document.getElementsByClassName("tune")).forEach(function (tune) {
  console.log(tune);
  let paperId = tune.id + "-paper";
  let audioSelector = "#" + tune.id + "-audio";

  let abcString = tune.getElementsByClassName("paper")[0].innerText;
  let visualOptions = {
    responsive: "resize",
    tablature: [{ instrument: "guitar", label: "Guitar (%T)" }],
  };
  let visualObj = abcjs.renderAbc(paperId, abcString, visualOptions);
  // visualTranspose: visualTranspose,

  if (abcjs.synth.supportsAudio()) {
    let synthVisualOptions = {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayClock: true,
    };
    let synthControl = new abcjs.synth.SynthController();
    synthControl.load(audioSelector, null, synthVisualOptions);
    synthControl.disable(true);

    let synth = new abcjs.synth.CreateSynth();
    let synthOptions = {
      visualObj: visualObj[0],
    };
    synth.init(synthOptions).then(function () {
      let userAction = false;
      let audioParams = {
        chordsOff: true,
      };
      synthControl
        .setTune(visualObj[0], userAction, audioParams)
        .then(function (response) {
          tune
            .querySelector(".abcjs-inline-audio")
            .classList.remove("disabled");
        });
    });
  }
});

console.info("Bridgetown is loaded!");
