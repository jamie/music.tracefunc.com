import "index.css";

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}";

// Yarn
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";

// Form/Settings
const TRANSPOSE_OPTIONS = [
  { value: 6, label: "Gb / D#m bbbbbb" },
  { value: 1, label: "Db / C#m bbbbb" },
  { value: -4, label: "Ab / Fm bbbb" },
  { value: 3, label: "Eb / Cm bbb" },
  { value: -2, label: "Bb / Gm bb" },
  { value: 5, label: "F / Dm b" },
  { value: 0, label: "C / Am" },
  { value: -5, label: "G / Em #" },
  { value: 2, label: "D / Bm ##" },
  { value: -3, label: "A / F#m ###" },
  { value: 4, label: "E / C#m ####" },
  { value: -1, label: "B / G#m #####" },
  { value: -6, label: "F# / D#m ######" },
];

const transposeSelect = document.getElementById("transpose-select");
if (transposeSelect) {
  function transposeFromKey(abcString) {
    let key = abcString.match(/K: ?(\w+)/)[1];
    console.log(key);
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

  let abcSource = document.getElementById("tune1-source").innerText;
  let defaultTransposition = transposeFromKey(abcSource);

  TRANSPOSE_OPTIONS.forEach(function ({ value, label }) {
    const option = document.createElement("option");
    option.value = String(value + defaultTransposition);
    option.textContent = label;
    transposeSelect.appendChild(option);
  });

  document.getElementById("transpose-select").value = "0";
}

function getTransposition() {
  const select = document.getElementById("transpose-select");
  let value = parseInt(select?.value || "0");
  let transposition = value;
  return { visualTranspose: transposition };
}

const tablatureToggle = document.getElementById("tablature-toggle");
function getTablature() {
  if (document.getElementById("tablature-toggle")?.checked) {
    return { tablature: [{ instrument: "guitar", label: "Guitar (%T)" }] };
  } else {
    return {};
  }
}

// Render Music

function renderTune(tune) {
  console.log(tune);
  let paperId = tune.id + "-paper";
  let sourceId = tune.id + "-source";
  let audioSelector = "#page-audio";

  let abcString = document.getElementById(sourceId).innerText;

  let visualOptions = {
    responsive: "resize",
    ...getTransposition(),
    ...getTablature(),
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
          document
            .getElementById("page-audio")
            .querySelector(".abcjs-inline-audio")
            .classList.remove("disabled");
        });
    });
  }
}

Array.from(document.getElementsByClassName("tune")).forEach(function (tune) {
  renderTune(tune);
});

function rerender() {
  Array.from(document.getElementsByClassName("tune")).forEach(function (tune) {
    renderTune(tune);
  });
}
transposeSelect?.addEventListener("change", rerender);
tablatureToggle?.addEventListener("change", rerender);

console.info("Bridgetown is loaded!");
