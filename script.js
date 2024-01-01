const songs = [];
let currentSong = new Audio();
let previous = document.getElementById("previousButton");
let play = document.getElementById("playButton");
let next = document.getElementById("nextButton");
let songInfo = document.getElementById("songInfo");
let songTime = document.getElementById("songTime");
let seekBar = document.querySelector(".seekBar");
let circle = document.querySelector(".circle");
let range = document.querySelector(".range");


function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function toggleNavbar() {
  let leftSection = document.querySelector(".left");
  let hamburger = document.querySelector(".hamburger");
  let close = document.querySelector(".close");
  hamburger.addEventListener("click", () => {
    leftSection.style.left = "0";
  });
  close.addEventListener("click", () => (leftSection.style.left = "-100%"));
}

function playSongs(track, pause = false) {
  let songString = `/songs/${track}`;
  if (!songString.endsWith(".mp3")) {
    songString = `/songs/${track}(PagalWorld.com.pe).mp3`;
  }
  currentSong.src = songString;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  songInfo.innerHTML = track
    .replaceAll("%20", " ")
    .replaceAll("(PagalWorld.com.pe).mp3", "");
}

async function getSongs() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchorTag = div.getElementsByTagName("a");
  const songs = [];
  Array.from(anchorTag).forEach((element) => {
    if (element.href.endsWith(".mp3"))
      songs.push(element.href.split("/songs/")[1]);
  });

  return songs;
}

async function main() {
  songs.push(...(await getSongs()));
  playSongs(songs[0], true);

  //Show all song in the playlist
  let songUl = document.querySelector(".songList");
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
        <img class="invert" src="svg/music.svg" alt="music">
        <div class="songName">${song
          .replaceAll("%20", " ")
          .replaceAll("(PagalWorld.com.pe).mp3", "")}</div>
         <div class="play"><span>Play Now</span> <img class="invert" src="svg/playNow.svg" alt="playNow"></div>
    </li>`;
  }

  //Attach an event listener to each song
  let listItems = songUl.getElementsByTagName("li");
  playSongs(listItems[0].querySelector(".songName").innerHTML, true);
  Array.from(listItems).forEach((e) => {
    e.addEventListener("click", () => {
      let songStr =
        e.querySelector(".songName").innerHTML + "(PagalWorld.com.pe).mp3";
      playSongs(songStr);
    });
  });

  //Attach an event Listener to play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  // Add event listener to previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/songs/").slice(1)[0]);
    if (index - 1 >= 0) {
      playSongs(songs[index - 1]);
    } else {
      playSongs(songs[index]);
    }
  });

  //Add event listener to next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/songs/").slice(1)[0]);
    if (index + 1 < songs.length) {
      playSongs(songs[index + 1]);
    } else {
      playSongs(songs[index]);
    }
  });

  //Listen to timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    songTime.innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )} / ${convertSecondsToMinutes(currentSong.duration)}`;
    let currentPosition =
      (currentSong.currentTime / currentSong.duration) * 100;
    circle.style.left = currentPosition + "%";
  });

  //Add event listener to seekBar
  seekBar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Adding event listener to volume
  range.getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  //To make a hamburger menu
  toggleNavbar();
}

main();

