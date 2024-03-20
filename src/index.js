import signaturePad from "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/+esm";

const playPanel = document.getElementById("playPanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const audioContext = new globalThis.AudioContext();
const audioBufferCache = {};
loadAudio("end", "mp3/end.mp3");
loadAudio("correct", "mp3/correct3.mp3");
const tegakiPanel = document.getElementById("tegakiPanel");
const gameTime = 180;
let gameTimer;
let canvases = [...tegakiPanel.getElementsByTagName("canvas")];
let pads = [];
let problems = [];
let answered = false;
let answerEn = "Gopher";
let answerJa = "ゴファー";
let firstRun = true;
const canvasCache = document.createElement("canvas")
  .getContext("2d", { willReadFrequently: true });
let englishVoices = [];
let correctCount = 0;
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

// TODO: :host-context() is not supportted by Safari/Firefox now
function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
    // pads.forEach((pad) => {
    //   pad.canvas.removeAttribute("style");
    // });
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
    // pads.forEach((pad) => {
    //   pad.canvas.setAttribute("style", "filter: invert(1) hue-rotate(180deg);");
    // });
  }
}

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new globalThis.SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function respeak() {
  loopVoice(answerEn, 1);
}

function setTegakiPanel() {
  while (tegakiPanel.firstChild) {
    tegakiPanel.removeChild(tegakiPanel.lastChild);
  }
  pads = [];
  for (let i = 0; i < answerEn.length; i++) {
    // const box = new TegakiBox();
    const box = createTegakiBox();
    tegakiPanel.appendChild(box);
  }
  // const boxes = tegakiPanel.getElementsByTagName("tegaki-box");
  // canvases = [...boxes].map((box) => box.shadowRoot.querySelector("canvas"));
  const boxes = tegakiPanel.children;
  canvases = [...boxes].map((box) => box.querySelector("canvas"));
}

function showPredictResult(canvas, result) {
  const pos = canvases.indexOf(canvas);
  const answerWord = answerEn[pos];
  let matched = false;
  for (let i = 0; i < result.length; i++) {
    if (result[i] == answerWord) {
      matched = true;
      break;
    }
  }
  if (matched) {
    canvas.setAttribute("data-predict", answerWord);
  } else {
    canvas.setAttribute("data-predict", result[0]);
  }
  let reply = "";
  for (let i = 0; i < canvases.length; i++) {
    const alphabet = canvases[i].getAttribute("data-predict");
    if (alphabet) {
      reply += alphabet;
    } else {
      reply += " ";
    }
  }
  document.getElementById("reply").textContent = reply;
  return reply;
}

function initSignaturePad(canvas) {
  const pad = new signaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: "black",
    backgroundColor: "white",
    throttle: 0,
    minDistance: 0,
  });
  pad.addEventListener("endStroke", () => {
    predict(pad.canvas);
  });
  return pad;
}

function getImageData(drawElement) {
  const inputWidth = 28;
  const inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  const imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

function predict(canvas) {
  const imageData = getImageData(canvas);
  const pos = canvases.indexOf(canvas);
  worker.postMessage({ imageData: imageData, pos: pos });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  document.getElementById("answer").classList.add("d-none");
}

function showAnswer() {
  document.getElementById("answer").classList.remove("d-none");
  document.getElementById("answerEn").textContent = answerEn;
  document.getElementById("answerJa").textContent = answerJa;
}

function nextProblem() {
  answered = false;
  const searchButton = document.getElementById("searchButton");
  searchButton.disabled = true;
  setTimeout(() => {
    searchButton.disabled = false;
  }, 2000);
  const [en, ja] = problems[getRandomInt(0, problems.length - 1)];
  answerEn = en;
  answerJa = ja;
  document.getElementById("reply").textContent = "";
  document.getElementById("cse-search-input-box-id").value = ja;
  hideAnswer();
  if (document.getElementById("mode").textContent == "EASY") {
    showAnswer();
  }
  document.getElementById("wordLength").textContent = answerEn.length;
  loopVoice(answerEn, 3);
}

function initProblems() {
  const grade = document.getElementById("grade").selectedIndex;
  fetch("data/" + grade + ".tsv")
    .then((response) => response.text())
    .then((tsv) => {
      problems = [];
      tsv.trimEnd().split("\n").forEach((line) => {
        const [en, ja] = line.split("\t");
        problems.push([en, ja]);
      });
    });
}

function searchByGoogle(event) {
  event.preventDefault();
  const input = document.getElementById("cse-search-input-box-id");
  const element = google.search.cse.element.getElement("searchresults-only0");
  nextProblem();
  if (input.value == "") {
    element.clearAllResults();
  } else {
    element.execute(input.value);
  }
  setTegakiPanel();
  if (firstRun) {
    document.getElementById("gophers").replaceChildren();
    document.getElementById("searchResults").classList.remove("d-none");
    firstRun = false;
  }
  return false;
}
document.getElementById("cse-search-box-form-id").onsubmit = searchByGoogle;

function countdown() {
  correctCount = 0;
  countPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  infoPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(timer);
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      document.getElementById("searchButton")
        .classList.add("animate__heartBeat");
      startGameTimer();
    }
  }, 1000);
}

function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  initTime();
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      playAudio("end");
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function scoring() {
  document.getElementById("score").textContent = correctCount;
}

function changeMode(event) {
  if (event.target.textContent == "EASY") {
    event.target.textContent = "HARD";
  } else {
    event.target.textContent = "EASY";
  }
}

class TegakiBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [globalCSS];

    const template = document.getElementById("tegaki-box")
      .content.cloneNode(true);
    const use = template.querySelector("use");
    const svgId = use.getAttribute("href").slice(1);
    const data = document.getElementById(svgId)
      .firstElementChild.cloneNode(true);
    use.replaceWith(data);
    this.shadowRoot.appendChild(template);

    const canvas = this.shadowRoot.querySelector("canvas");
    const pad = initSignaturePad(canvas);
    this.shadowRoot.querySelector(".eraser").onclick = () => {
      pad.clear();
    };
    pads.push(pad);

    if (document.documentElement.getAttribute("data-bs-theme") == "dark") {
      this.shadowRoot.querySelector("canvas")
        .setAttribute("style", "filter: invert(1) hue-rotate(180deg);");
    }
  }
}
customElements.define("tegaki-box", TegakiBox);

function createTegakiBox() {
  const div = document.createElement("div");
  const template = document.getElementById("tegaki-box")
    .content.cloneNode(true);
  div.appendChild(template);
  const canvas = div.querySelector("canvas");
  const pad = initSignaturePad(canvas);
  div.querySelector(".eraser").onclick = () => {
    pad.clear();
  };
  pads.push(pad);
  return div;
}

function getGlobalCSS() {
  let cssText = "";
  for (const stylesheet of document.styleSheets) {
    try {
      for (const rule of stylesheet.cssRules) {
        cssText += rule.cssText;
      }
    } catch {
      // skip cross-domain issue (Google Fonts)
    }
  }
  const css = new CSSStyleSheet();
  css.replaceSync(cssText);
  return css;
}

const globalCSS = getGlobalCSS();

canvases.forEach((canvas) => {
  const pad = initSignaturePad(canvas);
  pads.push(pad);
  canvas.parentNode.querySelector(".eraser").onclick = () => {
    pad.clear();
    showPredictResult(canvas, " ");
  };
});

const worker = new Worker("worker.js");
worker.addEventListener("message", (e) => {
  if (answered) return;
  const reply = showPredictResult(canvases[e.data.pos], e.data.result);
  if (reply == answerEn) {
    answered = true;
    if (document.getElementById("mode").textContent == "EASY") {
      correctCount += 1;
    } else {
      const node = document.getElementById("answer");
      const noHint = node.classList.contains("d-none");
      if (noHint) {
        correctCount += 1;
      }
    }
    playAudio("correct", 0.3);
    document.getElementById("reply").textContent = "⭕ " + answerEn;
    document.getElementById("searchButton").classList.add("animate__heartBeat");
  }
});

initProblems();

document.getElementById("mode").onclick = changeMode;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("respeak").onclick = respeak;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("grade").onchange = initProblems;
document.getElementById("searchButton")
  .addEventListener("animationend", (event) => {
    event.target.classList.remove("animate__heartBeat");
  });
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
