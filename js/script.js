console.log("Let's learn javascript");
// Most Important Global varibles
let songs = [];
let currentSong = new Audio();
let currentFolder;

// Some non-important variables
let previous = document.getElementById("previousButton");
let play = document.getElementById("playButton");
let next = document.getElementById("nextButton");
let songInfo = document.getElementById("songInfo");
let songTime = document.getElementById("songTime");
let seekBar = document.querySelector(".seekBar");
let circle = document.querySelector(".circle");
let range = document.querySelector("#volume");

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
  let songString = `/${currentFolder}/${track}`;
  if (!songString.endsWith(".mp3")) {
    songString = `/${currentFolder}/${track}(PagalWorld.com.pe).mp3`;
  }
  currentSong.src = songString;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  songInfo.innerHTML = track
    .replaceAll("%20", " ")
    .replaceAll("_PagalWorld.com.pe_.mp3", "")
    .replaceAll("/", "");
}

async function getSongs(folder) {
    currentFolder = folder;
    // Remember the Url, make it correct to prevents from errors
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchorTag = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < anchorTag.length; index++) {
      const element = anchorTag[index];
      if (element.href.endsWith(".mp3")) {
          songs.push(element.href.split(`/${folder}/`)[1])
      }
  }
  console.log(songs);

  // Show all song in the playlist
  let songUl = document.querySelector(".songList");
  songUl.innerHTML = "";
  for (const song of songs) {
    let strsong = song.replaceAll("%20", " ").replaceAll("(PagalWorld.com.pe).mp3", "")
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
          <img class="invert" src="svg/music.svg" alt="music">
          <div class="songName">${strsong}</div>
           <div class="play"><span>Play Now</span> <img class="invert" src="svg/playNow.svg" alt="playNow"></div>
      </li>`;
  }

  // Attach an event listener to each song
  let listItems = songUl.getElementsByTagName("li"); 
  let firstItem = listItems[0].querySelector(".songName").innerHTML;
  playSongs(firstItem, true);
  Array.from(listItems).forEach((e) => {
    e.addEventListener("click", () => {
      let songStr =
        e.querySelector(".songName").innerHTML + "(PagalWorld.com.pe).mp3"
      playSongs(songStr);
    });
  });

}

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchorTag = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchorTag);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Getting meta data for the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <img src="/songs/${folder}/cover.jpg" alt="">
      <h2>${response.Title}</h2>
      <p>${response.Description}</p>
      <div class="play-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="42" height="42" fill="#4CAF50">
          <circle cx="12" cy="12" r="12" />
          <path fill="#000" d="M9.5 7.5v9l6-4.5z" />
        </svg>
      </div>
    </div>`;
    }
  }

   // Load the playlist whenever card is clicked
   let card = document.getElementsByClassName("card");
   Array.from(card).forEach((e) => {
     e.addEventListener("click", async (item) => {
       await getSongs(`songs/${item.currentTarget.dataset.folder}`);
       playSongs(songs[0]);
     });
   });
}

async function main() {
  // get the list of all the songs
  await getSongs("songs/ncs");
  playSongs(songs[0], true);

  // Making the dynamic albums
  await displayAlbums();

  // Attach an event Listener to play button
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
    let index = songs.indexOf(
      currentSong.src.split(`/${currentFolder}/`).slice(1)[0]
    );
    if (index - 1 >= 0) {
      playSongs(songs[index - 1]);
    } else {
      playSongs(songs[index]);
    }
  });

  //Add event listener to next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`/${currentFolder}/`).slice(1)[0]
    );
    if (index + 1 < songs.length) {
      playSongs(songs[index + 1]);
    } else {
      playSongs(songs[index]);
    }
  });

  // Listen to timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    songTime.innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )} / ${convertSecondsToMinutes(currentSong.duration)}`;
    let currentPosition =
      (currentSong.currentTime / currentSong.duration) * 100;
    circle.style.left = currentPosition + "%";
  });

  //cAdd event listener to seekBar
  seekBar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Adding event listener to volume
  range.addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // To off the volume whenever it's clicked
  document.querySelector(".range>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "svg/volumeOff.svg";
      currentSong.volume = 0;
      range.value = 0;
    } else {
      e.target.src = "svg/volume.svg";
      currentSong.volume = 0.1;
      range.value = 0;
    }
  });

  // To make a hamburger menu
  toggleNavbar();

}

main();
