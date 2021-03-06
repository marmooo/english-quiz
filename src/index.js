const tegakiPanel = document.getElementById('tegakiPanel');
let canvases = [...tegakiPanel.getElementsByTagName('canvas')];
const correctAudio = new Audio('/english-quiz/mp3/correct3.mp3');
let pads = [];
let problems = [];
let answer = 'Gopher';
let firstRun = true;
let canvasCache = document.createElement('canvas').getContext('2d');
let model;
let englishVoices = [];

function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
  if (localStorage.getItem('voice') != 1) {
    document.getElementById('voiceOn').classList.add('d-none');
    document.getElementById('voiceOff').classList.remove('d-none');
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
  }
}

function toggleVoice(obj) {
  if (localStorage.getItem('voice') == 1) {
    speechSynthesis.cancel();
    localStorage.setItem('voice', 0);
    document.getElementById('voiceOn').classList.add('d-none');
    document.getElementById('voiceOff').classList.remove('d-none');
  } else {
    localStorage.setItem('voice', 1);
    document.getElementById('voiceOn').classList.remove('d-none');
    document.getElementById('voiceOff').classList.add('d-none');
    unlockAudio();
    loopVoice();
  }
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function(resolve, reject) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function() {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then(voices => {
    englishVoices = voices.filter(voice => voice.lang == 'en-US' );
  });
}
loadVoices();

function loopVoice() {
  speechSynthesis.cancel();
  var msg = new SpeechSynthesisUtterance(answer);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = 'en-US';
  for (var i=0; i<5; i++) {
    speechSynthesis.speak(msg);
  }
}

function setTegakiPanel() {
  while (tegakiPanel.firstChild) {
    tegakiPanel.removeChild(tegakiPanel.lastChild);
  }
  pads = [];
  for (var i=0; i<answer.length; i++) {
    var box = document.createElement('tegaki-box');
    tegakiPanel.appendChild(box);
  }
}

function showPredictResult(canvas, result) {
  if (!firstRun) {
    const boxes = tegakiPanel.getElementsByTagName('tegaki-box');
    canvases = [...boxes].map(box => box.shadowRoot.querySelector('canvas'));
  }
  var pos = canvases.indexOf(canvas);
  var answerWord = answer[pos];
  var matched = false;
  for (var i=0; i<result.length; i++) {
    if (result[i] == answerWord) {
      matched = true;
      break;
    }
  }
  if (matched) {
    canvas.setAttribute('data-predict', answerWord);
  } else {
    canvas.setAttribute('data-predict', result[0]);
  }
  var reply = '';
  for (var i=0; i<canvases.length; i++) {
    const alphabet = canvases[i].getAttribute('data-predict');
    if (alphabet) {
      reply += alphabet;
    } else {
      reply += ' ';
    }
  }
  document.getElementById('reply').innerText = reply;
  return reply;
}

function initSignaturePad(canvas) {
  const pad = new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: 'black',
    backgroundColor: 'white',
    throttle: 0,
    minDistance: 0,
  });
  pad.onEnd = function() {
    predict(this.canvas);
  }
  return pad;
}

function getAccuracyScores(imageData) {
  const score = tf.tidy(() => {
    const channels = 1;
    let input = tf.browser.fromPixels(imageData, channels);
    input = tf.cast(input, 'float32').div(tf.scalar(255));
    // input = input.flatten();  // mlp
    input = input.expandDims();
    return model.predict(input).dataSync();
  });
  return score;
}

function getImageData(drawElement) {
  const inputWidth = inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  var imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    data[i] = 255 - data[i];
    data[i+1] = 255 - data[i+1];
    data[i+2] = 255 - data[i+2];
  }
  return imageData;
}

function predict(canvas) {
  const imageData = getImageData(canvas);
  const pos = canvases.indexOf(canvas);
  worker.postMessage({ imageData:imageData, pos:pos });
}

function unlockAudio() {
  correctAudio.volume = 0;
  correctAudio.play();
  correctAudio.pause();
  correctAudio.currentTime = 0;
  correctAudio.volume = 1;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  var node = document.getElementById('answer');
  node.classList.add('d-none');
}

function showAnswer() {
  var node = document.getElementById('answer');
  node.classList.remove('d-none');
  node.innerText = answer;
}

function changeProblem() {
  var [en, ja] = problems[getRandomInt(0, problems.length - 1)];
  var input = document.getElementById('cse-search-input-box-id');
  input.value = ja;
  answer = en;
  hideAnswer();
  document.getElementById('wordLength').innerText = answer.length;
  if (localStorage.getItem('voice') == 1) {
    loopVoice();
  } else {
    speechSynthesis.cancel();
  }
}

function initProblems() {
  const grade = document.getElementById('grade').selectedIndex + 2;
  fetch(grade + '.lst').then(response => response.text()).then(tsv => {
    problems = [];
    tsv.split('\n').forEach(line => {
      const [en, ja] = line.split("\t");
      problems.push([en, ja]);
    });
  });
}
initProblems();

function searchByGoogle(event) {
  event.preventDefault();
  var input = document.getElementById('cse-search-input-box-id');
  var element = google.search.cse.element.getElement('searchresults-only0');
  changeProblem();
  if (input.value == '') {
    element.clearAllResults();
  } else {
    element.execute(input.value);
  }
  setTegakiPanel();
  if (firstRun) {
    const gophers = document.getElementById('gophers');
    while (gophers.firstChild) {
      gophers.removeChild(gophers.lastChild);
    }
    unlockAudio();
    firstRun = false;
  }
  return false;
}
document.getElementById('cse-search-box-form-id').onsubmit = searchByGoogle;

customElements.define('tegaki-box', class extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('tegaki-box').content.cloneNode(true);
    const canvas = template.querySelector('canvas');
    const pad = initSignaturePad(canvas);
    template.querySelector('.eraser').onclick = function() {
      pad.clear();
    };
    pads.push(pad);
    this.attachShadow({ mode:'open' }).appendChild(template);
  }
});

canvases.forEach(canvas => {
  const pad = initSignaturePad(canvas);
  pads.push(pad);
  canvas.parentNode.querySelector('.eraser').onclick = function() {
    pad.clear();
    showPredictResult(canvas, ' ');
  };
});
document.getElementById('grade').onchange = initProblems;

const worker = new Worker('worker.js');
worker.addEventListener('message', function(e) {
  var reply = showPredictResult(canvases[e.data.pos], e.data.result);
  if (reply == answer) {
    correctAudio.play();
  }
});

