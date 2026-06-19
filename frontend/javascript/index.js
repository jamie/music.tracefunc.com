import "index.css";

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}";

// Yarn
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";

// Form/Settings
const TRANSPOSE_OPTIONS = [
  { value: 6, label: "G♭ / D♯m ♭♭♭♭♭♭" },
  { value: 1, label: "D♭ / C♯m ♭♭♭♭♭" },
  { value: -4, label: "A♭ / Fm ♭♭♭♭" },
  { value: 3, label: "E♭ / Cm ♭♭♭" },
  { value: -2, label: "B♭ / Gm ♭♭" },
  { value: 5, label: "F / Dm ♭" },
  { value: 0, label: "C / Am" },
  { value: -5, label: "G / Em ♯" },
  { value: 2, label: "D / Bm ♯♯" },
  { value: -3, label: "A / F♯m ♯♯♯" },
  { value: 4, label: "E / C♯m ♯♯♯♯" },
  { value: -1, label: "B / G♯m ♯♯♯♯♯" },
  { value: -6, label: "F♯ / D♯m ♯♯♯♯♯♯" },
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
if (tablatureToggle) {
  tablatureToggle.checked = document.cookie
    .split("; ")
    .some((c) => c === "tablature=1");
  tablatureToggle.addEventListener("change", () => {
    document.cookie = `tablature=${tablatureToggle.checked ? 1 : 0}; path=/; max-age=${60 * 60 * 24 * 365}`;
  });
}
function getTablature() {
  if (tablatureToggle?.checked) {
    return { tablature: [{ instrument: "guitar", label: "Guitar (%T)" }] };
  } else {
    return {};
  }
}

// Render Music

function renderTune(tune) {
  console.log(tune);
  const paperId = tune.id + "-paper";
  const sourceId = tune.id + "-source";

  const abcString = document.getElementById(sourceId).innerText;

  // startChar (from abcelem on click) → milliseconds.
  // Pre-built synchronously from TimingCallbacks.noteTimings — no playback needed.
  const charTimeMap = new Map();
  let totalDurationMs = 0;
  let synthControl = null;
  let highlightedElements = [];

  const visualOptions = {
    responsive: "resize",
    ...getTransposition(),
    ...getTablature(),
    clickListener(abcelem) {
      if (!synthControl || totalDurationMs === 0) return;
      const ms = charTimeMap.get(abcelem.startChar);
      if (ms != null) synthControl.seek(ms / totalDurationMs);
    },
  };
  const visualObj = abcjs.renderAbc(paperId, abcString, visualOptions);

  // TimingCallbacks builds noteTimings synchronously at construction.
  // Each entry has startCharArray (ABC string positions) and milliseconds.
  const tc = new abcjs.TimingCallbacks(visualObj[0], {});
  totalDurationMs = tc.lastMoment;
  tc.noteTimings.forEach((event) => {
    if (event.type === "event" && event.startCharArray) {
      event.startCharArray.forEach((char) =>
        charTimeMap.set(char, event.milliseconds),
      );
    }
  });

  const cursorControl = {
    onStart() {
      highlightedElements = [];
    },
    onFinished() {
      highlightedElements.forEach((el) =>
        el.classList.remove("abcjs-note_selected"),
      );
      highlightedElements = [];
    },
    onEvent(event) {
      highlightedElements.forEach((el) =>
        el.classList.remove("abcjs-note_selected"),
      );
      highlightedElements = [];
      if (!event.elements) return;
      event.elements.forEach((noteEls) =>
        noteEls.forEach((el) => {
          el.classList.add("abcjs-note_selected");
          highlightedElements.push(el);
        }),
      );
    },
  };

  if (abcjs.synth.supportsAudio()) {
    synthControl = new abcjs.synth.SynthController();
    synthControl.load("#page-audio", cursorControl, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayClock: true,
    });
    synthControl.disable(true);

    const synth = new abcjs.synth.CreateSynth();
    synth.init({ visualObj: visualObj[0] }).then(function () {
      const isTab = document.getElementById("tablature-toggle")?.checked;
      synthControl
        .setTune(visualObj[0], false, {
          chordsOff: true,
          ...(isTab && { program: 24 }),
        })
        .then(function () {
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

// Render ABC reference examples (no audio, no transpose)
Array.from(document.querySelectorAll("tr.abc-example")).forEach(function (row) {
  const source = row.querySelector(".abc-example-source");
  const paper = row.querySelector(".abc-example-paper");
  if (!source || !paper) return;
  var abc = source.value.trim();
  if (!abc[0] == "X") {
    abc = `X:1\nT:\nL:1/8\nK:C\n${abc}`;
  }
  abcjs.renderAbc(paper, abc, { responsive: "resize" });
});

console.info("Bridgetown is loaded!");
