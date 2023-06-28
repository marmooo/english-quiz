const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3");const tegakiPanel=document.getElementById("tegakiPanel"),gameTime=180;let gameTimer,canvases=[...tegakiPanel.getElementsByTagName("canvas")],pads=[],problems=[],answered=!1,answerEn="Gopher",answerJa="ゴファー",firstRun=!0;const canvasCache=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});let englishVoices=[],correctCount=0;loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(b,c){const d=await loadAudio(b,audioBufferCache[b]),a=audioContext.createBufferSource();if(a.buffer=d,c){const b=audioContext.createGain();b.gain.value=c,b.connect(audioContext.destination),a.connect(b),a.start()}else a.connect(audioContext.destination),a.start()}async function loadAudio(a,c){if(audioBufferCache[a])return audioBufferCache[a];const d=await fetch(c),e=await d.arrayBuffer(),b=await audioContext.decodeAudioData(e);return audioBufferCache[a]=b,b}function unlockAudio(){audioContext.resume()}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),b=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US").filter(a=>!b.includes(a.voiceURI))})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US";for(let b=0;b<c;b++)speechSynthesis.speak(a)}function respeak(){loopVoice(answerEn,1)}function setTegakiPanel(){while(tegakiPanel.firstChild)tegakiPanel.removeChild(tegakiPanel.lastChild);pads=[];for(let a=0;a<answerEn.length;a++){const b=createTegakiBox();tegakiPanel.appendChild(b)}const a=tegakiPanel.children;canvases=[...a].map(a=>a.querySelector("canvas"))}function showPredictResult(b,c){const f=canvases.indexOf(b),d=answerEn[f];let e=!1;for(let a=0;a<c.length;a++)if(c[a]==d){e=!0;break}e?b.setAttribute("data-predict",d):b.setAttribute("data-predict",c[0]);let a="";for(let b=0;b<canvases.length;b++){const c=canvases[b].getAttribute("data-predict");c?a+=c:a+=" "}return document.getElementById("reply").textContent=a,a}function initSignaturePad(b){const a=new SignaturePad(b,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return a.addEventListener("endStroke",()=>{predict(a.canvas)}),a}function getImageData(d){const b=inputHeight=28;canvasCache.drawImage(d,0,0,b,inputHeight);const c=canvasCache.getImageData(0,0,b,inputHeight),a=c.data;for(let b=0;b<a.length;b+=4)a[b]=255-a[b],a[b+1]=255-a[b+1],a[b+2]=255-a[b+2];return c}function predict(a){const b=getImageData(a),c=canvases.indexOf(a);worker.postMessage({imageData:b,pos:c})}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function hideAnswer(){document.getElementById("answer").classList.add("d-none")}function showAnswer(){document.getElementById("answer").classList.remove("d-none"),document.getElementById("answerEn").textContent=answerEn,document.getElementById("answerJa").textContent=answerJa}function nextProblem(){answered=!1;const a=document.getElementById("searchButton");a.disabled=!0,setTimeout(()=>{a.disabled=!1},2e3);const[c,b]=problems[getRandomInt(0,problems.length-1)];answerEn=c,answerJa=b,document.getElementById("reply").textContent="",document.getElementById("cse-search-input-box-id").value=b,hideAnswer(),document.getElementById("mode").textContent=="EASY"&&showAnswer(),document.getElementById("wordLength").textContent=answerEn.length,loopVoice(answerEn,3)}function initProblems(){const a=document.getElementById("grade").selectedIndex;fetch("data/"+a+".tsv").then(a=>a.text()).then(a=>{problems=[],a.trimEnd().split("\n").forEach(a=>{const[b,c]=a.split("	");problems.push([b,c])})})}function searchByGoogle(c){c.preventDefault();const a=document.getElementById("cse-search-input-box-id"),b=google.search.cse.element.getElement("searchresults-only0");return nextProblem(),a.value==""?b.clearAllResults():b.execute(a.value),setTegakiPanel(),firstRun&&(document.getElementById("gophers").replaceChildren(),document.getElementById("searchResults").classList.remove("d-none"),firstRun=!1),!1}document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle;function countdown(){correctCount=0,countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),infoPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3;const b=setInterval(()=>{const c=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const b=parseInt(a.textContent)-1;a.style.backgroundColor=c[b],a.textContent=b}else clearTimeout(b),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),document.getElementById("searchButton").classList.add("animate__heartBeat"),startGameTimer()},1e3)}function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=correctCount}function changeMode(a){a.target.textContent=="EASY"?a.target.textContent="HARD":a.target.textContent="EASY"}class TegakiBox extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[globalCSS];const a=document.getElementById("tegaki-box").content.cloneNode(!0),b=a.querySelector("use"),d=b.getAttribute("href").slice(1),e=document.getElementById(d).firstElementChild.cloneNode(!0);b.replaceWith(e),this.shadowRoot.appendChild(a);const f=this.shadowRoot.querySelector("canvas"),c=initSignaturePad(f);this.shadowRoot.querySelector(".eraser").onclick=()=>{c.clear()},pads.push(c),document.documentElement.getAttribute("data-bs-theme")=="dark"&&this.shadowRoot.querySelector("canvas").setAttribute("style","filter: invert(1) hue-rotate(180deg);")}}customElements.define("tegaki-box",TegakiBox);function createTegakiBox(){const a=document.createElement("div"),c=document.getElementById("tegaki-box").content.cloneNode(!0);a.appendChild(c);const d=a.querySelector("canvas"),b=initSignaturePad(d);return a.querySelector(".eraser").onclick=()=>{b.clear()},pads.push(b),a}function getGlobalCSS(){let a="";for(const b of document.styleSheets)try{for(const c of b.cssRules)a+=c.cssText}catch{}const b=new CSSStyleSheet;return b.replaceSync(a),b}const globalCSS=getGlobalCSS();canvases.forEach(a=>{const b=initSignaturePad(a);pads.push(b),a.parentNode.querySelector(".eraser").onclick=()=>{b.clear(),showPredictResult(a," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",a=>{if(answered)return;const b=showPredictResult(canvases[a.data.pos],a.data.result);if(b==answerEn){if(answered=!0,document.getElementById("mode").textContent=="EASY")correctCount+=1;else{const a=document.getElementById("answer"),b=a.classList.contains("d-none");b&&(correctCount+=1)}playAudio("correct"),document.getElementById("reply").textContent="⭕ "+answerEn,document.getElementById("searchButton").classList.add("animate__heartBeat")}}),initProblems(),document.getElementById("mode").onclick=changeMode,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("respeak").onclick=respeak,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("grade").onchange=initProblems,document.getElementById("searchButton").addEventListener("animationend",a=>{a.target.classList.remove("animate__heartBeat")}),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})