import "index.css";

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}";

// Yarn
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";

// Render Music
function transposeFromKey(abcString) {
  let key = abcString.match(/K:(\w+)/)[1];
  console.log(key);
  const cKeyFrom = {
    B: 1,
    Ebm: -6,
  };
  return cKeyFrom[key] || 0;
}

Array.from(document.getElementsByClassName("tune")).forEach(function (tune) {
  console.log(tune);
  let paperId = tune.id + "-paper";
  let paperTransposeId = tune.id + "-paper-transpose";
  let audioSelector = "#" + tune.id + "-audio";

  let abcString = tune.getElementsByClassName("paper")[0].innerText;
  let visualOptions = { responsive: "resize" };
  let visualObj = abcjs.renderAbc(paperId, abcString, visualOptions);

  let visualTranspose = transposeFromKey(abcString);
  if (visualTranspose != 0) {
    abcjs.renderAbc(paperTransposeId, abcString, {
      ...visualOptions,
      visualTranspose: visualTranspose,
    });
  }

  if (abcjs.synth.supportsAudio()) {
    let visualOptions = {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayClock: true,
    };
    let synthControl = new abcjs.synth.SynthController();
    synthControl.load(audioSelector, null, visualOptions);
    synthControl.disable(true);

    let synth = new abcjs.synth.CreateSynth();
    let synthOptions = {
      visualObj: visualObj[0],
      options: {},
    };
    synth.init(synthOptions).then(function () {
      synthControl.setTune(visualObj[0], true).then(function (response) {
        tune.querySelector(".abcjs-inline-audio").classList.remove("disabled");
      });
    });
  }
});

console.info("Bridgetown is loaded!");
