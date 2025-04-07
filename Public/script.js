// Initializing some Elements
const menu = document.getElementById("menu");
const menupage = document.getElementById("menupage");
const home = document.getElementById("home-button");
const playlistContainer = document.getElementById("playlist-container");
const songsContainer = document.getElementById("songs-container-main");
const logo = document.getElementById("logo");
const searchButton = document.getElementById("search-button");
const loginButton = document.getElementById("login-button");
const playlist = document.querySelector("#playlist-container main");
const volumeInput = document.querySelector("#volume-input");
let currentSong;
let playing = false;
let playlistStarted = false;
let playlistStopped = false;
let muted = false;
let volume;
let songs;
let songNum;
let halfPath;

// Menu Click Funcitonality
menu.addEventListener("click", () => {
  // Force reflow to ensure transition works
  void menupage.offsetWidth;
  // Toggle translate position
  menupage.classList.toggle("translate-x-full");
  menupage.classList.toggle("translate-x-0");
});

home.addEventListener("click", () => {
  playlistContainer.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  songsContainer.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

logo.addEventListener("click", () => {
  window.location.reload();
});

searchButton.onfocus = () => {
  if (window.innerWidth < 768) {
    searchButton.classList.remove("rounded-[50%]");
    searchButton.classList.add("rounded-full");
    document.querySelector("#search-button input").classList.remove("hidden");
    loginButton.classList.add("hidden");
    void searchButton.offsetWidth;
  }
};

searchButton.addEventListener("focusout", (e) => {
  if (!searchButton.contains(e.relatedTarget)) {
    if (window.innerWidth < 768) {
      searchButton.classList.add("rounded-[50%]");
      searchButton.classList.remove("rounded-full");
      document.querySelector("#search-button input").classList.add("hidden");
      loginButton.classList.remove("hidden");
    }
  }
});

// ! The Main Functionality
let songData;

let folders = [];
async function getSongs() {
  const response = await fetch("http://192.168.1.9:3000/get-songs");
  const data = await response.json();
  return data;
}

function genPlaylist(data) {
  for (const key1 in data) {
    let key = JSON.parse(key1);
    let element = document.createElement("div");

    element.innerHTML = `<div
                      class="w-[90%]  hover:border-[1px]   cursor-pointer md:w-auto m-auto rounded-sm bg-[#222222] py-5 px-4 mb-5"
                    >
                      <div class="relative">
                        <div> 
                          <img
                            src=${key.img}
                            alt="Playlist photo"
                            class="w-full h-full rounded-md"
                          />
                          <div
                            class="absolute bg-black bottom-[30px] right-[30px] scale-150 lg:scale-125 xl:scale-110"
                          > 
                            <i
                              class="fa-solid fa-circle-play fa-2xl"
                              style="color: #24a34e"
                            ></i>  
                          </div>
                        </div>
                      </div>
                      <div class="mt-4">
                        <h2 class="text-2xl font-semibold">${key.name}</h2>
                        <h3 class="text-[#9a9797] lg:text-sm">${key.title}</h3>
                      </div>
                    </div>`;
    playlist.append(element);

    function begin() {
      if (playlistStarted) {
        stopPlaylist();
        setTimeout(begin, 100);
      } else {
        startPlaylist(data, key1);
        playlistStarted = true;
      }
    }

    element.addEventListener("click", begin);
  }
}

async function playSong(song, songPath) {
  if (song === undefined) return;
  setDuration = undefined;
  slider.value = 0;

  return new Promise((resolve) => {
    if (playlistStopped) return;

    const audio = new Audio(songPath);
    currentSong = audio;
    currentSong.play();
    playing = true;

    currentSong.addEventListener("loadedmetadata", () => {
      interval.start();
    });

    let id = setInterval(() => {
      if (playlistStopped) {
        audio.pause();
        audio.currentTime = 0;
        clearInterval(id);
        resolve("Stopped");
      }
    }, 100);

    if (muted) {
      audio.volume = 0;
    } else {
      audio.volume = Number(volumeInput.value) / 100;
    }

    let songName;

    song.includes(".")
      ? (songName = song.slice(0, song.indexOf(".")))
      : (songName = song);

    document.getElementById("song-name").innerText = songName;

    audio.addEventListener("ended", () => {
      clearInterval(id);
      interval.stop();
      removeStamp();
      resolve("Song Ended");
    });
  });
}

getSongs().then((data) => {
  genPlaylist(data);
  genLibrary(data);
});

async function startLibrary(allSongs, songName, data) {
  playlistStopped = false;
  let ind = allSongs.indexOf(songName);
  songs = allSongs;

  for (let index = ind; index < allSongs.length; index++) {
    let path;
    if (playlistStopped) return;

    backward.addEventListener("click", () => {
      if (songNum !== 0) {
        index = index - 2;
        prevSong();
      }
    });

    for (const key in data) {
      for (const element of data[key]) {
        let eleName;
        element.includes(".")
          ? (eleName = element.slice(0, element.indexOf(".")))
          : (eleName = element);

        if (allSongs[index] === eleName) {
          path = `./Songs/${JSON.parse(key).name}/${element}`;
        }
      }
    }

    songNum = index;
    await playSong(allSongs[index], path);
  }

  playlistStarted = false;
  playing = false;
}

async function startPlaylist(data, info) {
  playlistStopped = false;

  songs = data[info].filter((item) => item !== "info.json");

  for (let index = 0; index < songs.length; index++) {
    backward.addEventListener("click", () => {
      if (songNum !== 0) {
        index = index - 2;
        prevSong();
      }
    });
    const song = songs[index];
    songNum = index;
    const songPath = `./Songs/${JSON.parse(info).name}/${song}`;
    halfPath = `./Songs/${JSON.parse(info).name}/`;
    await playSong(song, songPath);
  }
  playlistStarted = false;
  playing = false;
}

function stopPlaylist() {
  interval.stop();
  removeStamp();
  playlistStopped = true;
  playlistStarted = false;
  currentSong = null;
  playing = false;
}

const playPauseButton = document.getElementById("play-pause-button");
const volumeButton = document.getElementById("volume-button");
let setDuration;

playPauseButton.addEventListener("click", () => {
  if (playing) {
    playing = false;
    currentSong.pause();
    interval.pause();
    playPauseButton.classList.toggle("fa-circle-play");
    playPauseButton.classList.toggle("fa-circle-pause");
  } else if (!playing && playlistStarted) {
    if (setDuration !== undefined) {
      currentSong.currentTime = setDuration;
    }
    playing = true;
    currentSong.play();
    interval.resume();

    if (volume != undefined) {
      currentSong.volume = volume;
    }
    playPauseButton.classList.toggle("fa-circle-play");
    playPauseButton.classList.toggle("fa-circle-pause");
  }
});

volumeInput.addEventListener("input", () => {
  if (!muted) {
    if (playing) {
      currentSong.volume = Number(volumeInput.value) / 100;
    }
    if (!playing) {
      volume = Number(volumeInput.value) / 100;
    }
  }

  if (!muted && volumeInput.value == 0) {
    volumeButton.classList.remove("fa-volume-high");
    volumeButton.classList.add("fa-volume-off");
  } else if (!muted && volumeInput.value != 0) {
    volumeButton.classList.add("fa-volume-high");
    volumeButton.classList.remove("fa-volume-off");
  }
});

volumeButton.addEventListener("click", () => {
  if (playing && !muted) {
    currentSong.volume = 0;
    muted = true;
    volumeButton.classList.add("fa-volume-xmark");
    volumeButton.classList.remove("fa-volume-high");
    volumeButton.classList.remove("fa-volume-off");
  } else if (!playing && !muted) {
    volume = 0;
    muted = true;
    volumeButton.classList.add("fa-volume-xmark");
    volumeButton.classList.remove("fa-volume-high");
    volumeButton.classList.remove("fa-volume-off");
  } else if (playing && muted) {
    currentSong.volume = Number(volumeInput.value) / 100;
    muted = false;
    if (volumeInput.value == 0) {
      volumeButton.classList.remove("fa-volume-xmark");
      volumeButton.classList.add("fa-volume-off");
    }
    if (volumeInput.value != 0) {
      volumeButton.classList.remove("fa-volume-xmark");
      volumeButton.classList.add("fa-volume-high");
    }
  } else if (!playing && muted) {
    volume = Number(volumeInput.value) / 100;
    muted = false;
    if (volumeInput.value == 0) {
      volumeButton.classList.remove("fa-volume-xmark");
      volumeButton.classList.add("fa-volume-off");
    }
    if (volumeInput.value != 0) {
      volumeButton.classList.remove("fa-volume-xmark");
      volumeButton.classList.add("fa-volume-high");
    }
  }
});

const timestamp1 = document.getElementById("time-stamp-1");
const timestamp2 = document.getElementById("time-stamp-2");
const timestampBoth = document.getElementById("time-stamp");

const interval = {
  value: 0,
  intervalId: null,
  isPaused: false,

  start: function () {
    const totalDuration = `0${Math.floor(
      currentSong.duration / 60
    )}:${Math.floor(currentSong.duration % 60)}`;

    timestamp2.innerText = totalDuration;

    const update = () => {
      if (!this.isPaused) {
        const currentTime = currentSong.currentTime;

        const currentDuration = `0${Math.floor(currentTime / 60)}:${Math.floor(
          currentTime % 60
        )
          .toString()
          .padStart(2, "0")}`;

        timestamp1.innerText = currentDuration;
        timestampBoth.innerText = `${currentDuration}/${totalDuration}`;
        
        slider.value = (currentTime / currentSong.duration) * 100;

        this.rafId = requestAnimationFrame(update);
      }
    };

    this.isPaused = false;
    this.rafId = requestAnimationFrame(update);
  },

  pause: function () {
    this.isPaused = true;
  },

  resume: function () {
    this.isPaused = false;
  },

  stop: function () {
    cancelAnimationFrame(this.rafId);
    this.isPaused = false;
  },
};

function removeStamp() {
  timestamp2.innerText = "00:00";
  timestamp1.innerText = "00:00";
  timestampBoth.innerText = "00:00/00:00";
}

function nextSong() {
  if (playlistStarted && songNum !== songs.length - 1) {
    if (!playing && playlistStarted) {
      playing = true;
      currentSong.play();
      interval.resume();

      if (volume != undefined) {
        currentSong.volume = volume;
      }
      playPauseButton.classList.toggle("fa-circle-play");
      playPauseButton.classList.toggle("fa-circle-pause");
    }
    currentSong.currentTime = currentSong.duration;
    songNum++;
  }
}
async function prevSong() {
  if (playlistStarted && songNum !== 0) {
    if (!playing && playlistStarted) {
      playing = true;
      currentSong.play();
      interval.resume();

      if (volume != undefined) {
        currentSong.volume = volume;
      }
      playPauseButton.classList.toggle("fa-circle-play");
      playPauseButton.classList.toggle("fa-circle-pause");
    }
    currentSong.currentTime = currentSong.duration;
  }
}

const forward = document.getElementById("forward");
const backward = document.getElementById("backward");

forward.addEventListener("click", nextSong);

function genLibrary(data) {
  const menuLibrary = document.getElementById("songs-container-menu");
  const mainLibrary = document.getElementById("songs-container-main");
  let allSongs = [];
  for (const key in data) {
    songs = data[key].filter((item) => item !== "info.json");
    for (const song of songs) {
      let songName;
      song.includes(".")
        ? (songName = song.slice(0, song.indexOf(".")))
        : (songName = song);
      allSongs.push(songName);
    }
  }
  allSongs.sort();
  allSongs = [...new Set(allSongs)];
  for (const song of allSongs) {
    let songName;
    song.includes(".")
      ? (songName = song.slice(0, song.indexOf(".")))
      : (songName = song);

    let element = document.createElement("div");
    let element2 = document.createElement("div");
    element.innerHTML = `<li
      class="cursor-pointer hover:shadow-[0_0_0.8rem_#B2B3B2]  flex justify-between w-[85%] m-auto mt-5 items-center p-3 px-5 border-[1px] border-[#575555] rounded-md gap-3 text-[#B3B2B2]"
      >
      <i class="fa-solid fa-music" style="color: #b3b2b2"></i>
      <div class="text-[#cdcccc] flex gap-2">
      <div>${songName}</div>
      </div>
      <button>
      <i class="fa-solid fa-play" style="color: #b3b2b2"></i>
      </button>
      </li>`;

    element2.innerHTML = `<li
                class="cursor-pointer hover:shadow-[0_0_0.8rem_#B2B3B2]  flex justify-between w-[85%] m-auto mt-5 items-center p-3 px-5 border-[1px] border-[#575555] rounded-md gap-3 text-[#B3B2B2]"
              >
                <i class="fa-solid fa-music" style="color: #b3b2b2"></i>
                <div class="text-[#cdcccc] truncate w-[70%]">
                  ${songName}
                </div>
                <button>
                  <i class="fa-solid fa-play" style="color: #b3b2b2"></i>
                </button>
              </li>`;

    menuLibrary.append(element);
    mainLibrary.append(element2);

    async function begin(songName) {
      if (playlistStarted) {
        stopPlaylist();
        setTimeout(() => begin(songName), 100);
      } else {
        playlistStarted = true;
        startLibrary(allSongs, songName, data);
      }
    }

    element2.addEventListener("click", () => begin(songName));
  }
}

// ! Slider things

const slider = document.getElementById("slider");

slider.addEventListener("input", () => {
  if (playing) {
    currentSong.currentTime = (slider.value / 100) * currentSong.duration;
  } else if (!playing && playlistStarted){
    setDuration = (slider.value / 100) * currentSong.duration;
  }
});
