import "index.css"

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}"

// Yarn
import abcjs from "abcjs"
import 'abcjs/abcjs-audio.css'

// Render Music
Array.from(document.getElementsByClassName('tune')).forEach(function (tune) {
    console.log(tune)
    let paperId = tune.id + "-paper"
    let audioSelector = "#" + tune.id + "-audio"

    let abcString = tune.getElementsByClassName("paper")[0].innerText
    let visualOptions = { responsive: 'resize' }
    let visualObj = abcjs.renderAbc(paperId, abcString, visualOptions)

    if (abcjs.synth.supportsAudio()) {
        let controlOptions = {
            displayRestart: true,
            displayPlay: true,
            displayProgress: true,
            displayClock: true
        }
        let synthControl = new abcjs.synth.SynthController();
        synthControl.load(audioSelector, null, controlOptions);
        synthControl.disable(true);

        let midiBuffer = new abcjs.synth.CreateSynth();
        midiBuffer.init({
            visualObj: visualObj[0],
            options: {

            }
        }).then(function () {
            synthControl.setTune(visualObj[0], true).then(function (response) {
                tune.querySelector(".abcjs-inline-audio").classList.remove("disabled");
            })
        })
    }
})

console.info("Bridgetown is loaded!")
