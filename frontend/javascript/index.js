import "index.css";

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}";

// Yarn
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";

// Form/Settings
const TRANSPOSE_OPTIONS = [
  { value: -6, label: "Gb / D#m bbbbbb" },
  { value: -1, label: "Db / C#m bbbbb" },
  { value: 4, label: "Ab / Fm bbbb" },
  { value: -3, label: "Eb / Cm bbb" },
  { value: 2, label: "Bb / Gm bb" },
  { value: -5, label: "F / Dm b" },
  { value: 0, label: "C / Am" },
  { value: 5, label: "G / Em #" },
  { value: -2, label: "D / Bm ##" },
  { value: 3, label: "A / F#m ###" },
  { value: -4, label: "E / C#m ####" },
  { value: 1, label: "B / G#m #####" },
  { value: 6, label: "F# / D#m ######" },
];

const transposeSelect = document.getElementById("transpose-select");
if (transposeSelect) {
  TRANSPOSE_OPTIONS.forEach(function ({ value, label }) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = label;
    transposeSelect.appendChild(option);
  });
}

function getTransposition() {
  const select = document.getElementById("transpose-select");
  return parseInt(select?.value || "0", 10);
}

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

function renderTune(tune) {
  console.log(tune);
  let paperId = tune.id + "-paper";
  let sourceId = tune.id + "-source";
  let audioSelector = "#page-audio";

  let transposition = transposeFromKey(abcString);
  // Set default value, can we do this in HTML to not override on pageload?
  document.getElementById("transpose-select").value = transposition;
  let abcString = document.getElementById(sourceId).innerText;

  let visualOptions = {
    responsive: "resize",
    tablature: [{ instrument: "guitar", label: "Guitar (%T)" }],
    ...getTransposition(),
  };
  let visualObj = abcjs.renderAbc(paperId, abcString, visualOptions);

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
}

Array.from(document.getElementsByClassName("tune")).forEach(function (tune) {
  renderTune(tune);
});

console.info("Bridgetown is loaded!");
