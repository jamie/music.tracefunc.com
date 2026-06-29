import "alphatab.css";

const wrapper = document.querySelector(".at-wrap");
if (wrapper) {
  const main = wrapper.querySelector(".at-main");

  const settings = {
    player: {
      enablePlayer: true,
      soundFont:
        "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2",
      scrollElement: wrapper.querySelector(".at-viewport"),
    },
  };
  const api = new alphaTab.AlphaTabApi(main, settings);

  // overlay
  const overlay = wrapper.querySelector(".at-overlay");
  api.renderStarted.on(() => {
    overlay.style.display = "flex";
  });
  api.renderFinished.on(() => {
    overlay.style.display = "none";
  });

  // track selector
  function createTrackItem(track) {
    const trackItem = document
      .querySelector("#at-track-template")
      .content.cloneNode(true).firstElementChild;
    trackItem.querySelector(".at-track-name").innerText = track.name;
    trackItem.track = track;
    trackItem.onclick = (e) => {
      e.stopPropagation();
      api.renderTracks([track]);
    };
    return trackItem;
  }
  const trackList = wrapper.querySelector(".at-track-list");
  api.scoreLoaded.on((score) => {
    trackList.innerHTML = "";
    score.tracks.forEach((track) => {
      trackList.appendChild(createTrackItem(track));
    });
  });
  api.renderStarted.on(() => {
    const tracks = new Map();
    api.tracks.forEach((t) => tracks.set(t.index, t));
    trackList.querySelectorAll(".at-track").forEach((trackItem) => {
      trackItem.classList.toggle("active", tracks.has(trackItem.track.index));
    });
  });

  api.scoreLoaded.on((score) => {
    wrapper.querySelector(".at-song-title").innerText = score.title;
    wrapper.querySelector(".at-song-artist").innerText = score.artist;
  });

  const countIn = wrapper.querySelector(".at-controls .at-count-in");
  countIn.onclick = () => {
    countIn.classList.toggle("active");
    api.countInVolume = countIn.classList.contains("active") ? 1 : 0;
  };

  const metronome = wrapper.querySelector(".at-controls .at-metronome");
  metronome.onclick = () => {
    metronome.classList.toggle("active");
    api.metronomeVolume = metronome.classList.contains("active") ? 1 : 0;
  };

  const loop = wrapper.querySelector(".at-controls .at-loop");
  loop.onclick = () => {
    loop.classList.toggle("active");
    api.isLooping = loop.classList.contains("active");
  };

  wrapper.querySelector(".at-controls .at-print").onclick = () => api.print();

  const zoom = wrapper.querySelector(".at-controls .at-zoom select");
  zoom.onchange = () => {
    api.settings.display.scale = parseInt(zoom.value) / 100;
    api.updateSettings();
    api.render();
  };

  const layout = wrapper.querySelector(".at-controls .at-layout select");
  layout.onchange = () => {
    api.settings.display.layoutMode =
      layout.value === "horizontal"
        ? alphaTab.LayoutMode.Horizontal
        : alphaTab.LayoutMode.Page;
    api.updateSettings();
    api.render();
  };

  const playerIndicator = wrapper.querySelector(
    ".at-controls .at-player-progress",
  );
  api.soundFontLoad.on((e) => {
    playerIndicator.innerText = Math.floor((e.loaded / e.total) * 100) + "%";
  });
  api.playerReady.on(() => {
    playerIndicator.style.display = "none";
  });

  const playPause = wrapper.querySelector(".at-controls .at-player-play-pause");
  const stop = wrapper.querySelector(".at-controls .at-player-stop");
  playPause.onclick = (e) => {
    if (!e.target.classList.contains("disabled")) api.playPause();
  };
  stop.onclick = (e) => {
    if (!e.target.classList.contains("disabled")) api.stop();
  };
  api.playerReady.on(() => {
    playPause.classList.remove("disabled");
    stop.classList.remove("disabled");
  });
  api.playerStateChanged.on((e) => {
    const icon = playPause.querySelector("i.fas");
    if (e.state === alphaTab.synth.PlayerState.Playing) {
      icon.classList.replace("fa-play", "fa-pause");
    } else {
      icon.classList.replace("fa-pause", "fa-play");
    }
  });

  function formatDuration(milliseconds) {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return (
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
    );
  }

  const songPosition = wrapper.querySelector(".at-song-position");
  let previousTime = -1;
  api.playerPositionChanged.on((e) => {
    const currentSeconds = (e.currentTime / 1000) | 0;
    if (currentSeconds === previousTime) return;
    previousTime = currentSeconds;
    songPosition.innerText =
      formatDuration(e.currentTime) + " / " + formatDuration(e.endTime);
  });

  const atexSource = document.getElementById("atex-source");
  if (atexSource) {
    api.tex(atexSource.textContent.trim());
  }
}
