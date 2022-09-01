import "index.css"

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}"

// Yarn
import abcjs from "abcjs"
import 'abcjs/abcjs-audio.css'

// Render Music
if (document.getElementById('paper')) {
    var abcString = document.getElementById("paper").innerText
    var visualOptions = { responsive: 'resize' }
    var visualObj = abcjs.renderAbc("paper", abcString, visualOptions)

    if (abcjs.synth.supportsAudio()) {
        var controlOptions = {
            displayRestart: true,
            displayPlay: true,
            displayProgress: true,
            displayClock: true
        };
        var synthControl = new abcjs.synth.SynthController();
        synthControl.load("#audio", null, controlOptions);
        synthControl.disable(true);
        var midiBuffer = new abcjs.synth.CreateSynth();
        midiBuffer.init({
            visualObj: visualObj[0],
            options: {

            }
        }).then(function () {
            synthControl.setTune(visualObj[0], true).then(function (response) {
            document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
            })
        });
    } else {
        console.log("audio is not supported on this browser");
    };
}

console.info("Bridgetown is loaded!")
