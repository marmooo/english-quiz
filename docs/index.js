import signaturePad from"https://cdn.jsdelivr.net/npm/signature_pad@5.0.1/+esm";const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel");let audioContext;const audioBufferCache={},tegakiPanel=document.getElementById("tegakiPanel"),gameTime=180;let gameTimer,canvases=[...tegakiPanel.getElementsByTagName("canvas")],pads=[],problems=[],answered=!1,answerEn="Gopher",answerJa="ゴファー",firstRun=!0;const canvasCache=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});let englishVoices=[],correctCount=0;loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}function createAudioContext(){return globalThis.AudioContext?new globalThis.AudioContext:(console.error("Web Audio API is not supported in this browser"),null)}function unlockAudio(){audioContext?audioContext.resume():(audioContext=createAudioContext(),loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3")),document.removeEventListener("pointerdown",unlockAudio),document.removeEventListener("keydown",unlockAudio)}async function loadAudio(e,t){if(!audioContext)return;if(audioBufferCache[e])return audioBufferCache[e];try{const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}catch(t){throw console.error(`Loading audio ${e} error:`,t),t}}function playAudio(e,t){if(!audioContext)return;const o=audioBufferCache[e];if(!o){console.error(`Audio ${e} is not found in cache`);return}const n=audioContext.createBufferSource();n.buffer=o;const s=audioContext.createGain();t&&(s.gain.value=t),s.connect(audioContext.destination),n.connect(s),n.start()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),t=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];e.then(e=>{englishVoices=e.filter(e=>e.lang=="en-US").filter(e=>!t.includes(e.voiceURI))})}loadVoices();function loopVoice(e,t){speechSynthesis.cancel();const n=new globalThis.SpeechSynthesisUtterance(e);n.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],n.lang="en-US";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function respeak(){loopVoice(answerEn,1)}function setTegakiPanel(){for(;tegakiPanel.firstChild;)tegakiPanel.removeChild(tegakiPanel.lastChild);pads=[];for(let e=0;e<answerEn.length;e++){const t=createTegakiBox();tegakiPanel.appendChild(t)}const e=tegakiPanel.children;canvases=[...e].map(e=>e.querySelector("canvas"))}function showPredictResult(e,t){const i=canvases.indexOf(e),s=answerEn[i];let o=!1;for(let e=0;e<t.length;e++)if(t[e]==s){o=!0;break}o?e.setAttribute("data-predict",s):e.setAttribute("data-predict",t[0]);let n="";for(let e=0;e<canvases.length;e++){const t=canvases[e].getAttribute("data-predict");t?n+=t:n+=" "}return document.getElementById("reply").textContent=n,n}function initSignaturePad(e){const t=new signaturePad(e,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return t.addEventListener("endStroke",()=>{predict(t.canvas)}),t}function getImageData(e){const n=28,s=28;canvasCache.drawImage(e,0,0,n,s);const o=canvasCache.getImageData(0,0,n,s),t=o.data;for(let e=0;e<t.length;e+=4)t[e]=255-t[e],t[e+1]=255-t[e+1],t[e+2]=255-t[e+2];return o}function predict(e){const t=getImageData(e),n=canvases.indexOf(e);worker.postMessage({imageData:t,pos:n})}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e)+e)}function hideAnswer(){document.getElementById("answer").classList.add("d-none")}function showAnswer(){document.getElementById("answer").classList.remove("d-none"),document.getElementById("answerEn").textContent=answerEn,document.getElementById("answerJa").textContent=answerJa}function nextProblem(){answered=!1;const e=document.getElementById("searchButton");e.disabled=!0,setTimeout(()=>{e.disabled=!1},2e3);const[n,t]=problems[getRandomInt(0,problems.length-1)];answerEn=n,answerJa=t,document.getElementById("reply").textContent="",document.getElementById("cse-search-input-box-id").value=t,hideAnswer(),document.getElementById("mode").textContent=="EASY"&&showAnswer(),document.getElementById("wordLength").textContent=answerEn.length,loopVoice(answerEn,3)}function initProblems(){const e=document.getElementById("grade").selectedIndex;fetch("data/"+e+".tsv").then(e=>e.text()).then(e=>{problems=[],e.trimEnd().split(`
`).forEach(e=>{const[t,n]=e.split("	");problems.push([t,n])})})}function searchByGoogle(e){e.preventDefault();const t=document.getElementById("cse-search-input-box-id"),n=google.search.cse.element.getElement("searchresults-only0");return nextProblem(),t.value==""?n.clearAllResults():n.execute(t.value),setTegakiPanel(),firstRun&&(document.getElementById("gophers").replaceChildren(),document.getElementById("searchResults").classList.remove("d-none"),firstRun=!1),!1}document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle;function countdown(){correctCount=0,countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),infoPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3;const t=setInterval(()=>{const n=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const t=parseInt(e.textContent)-1;e.style.backgroundColor=n[t],e.textContent=t}else clearTimeout(t),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),document.getElementById("searchButton").classList.add("animate__heartBeat"),startGameTimer()},1e3)}function startGameTimer(){clearInterval(gameTimer);const e=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=correctCount}function changeMode(e){e.target.textContent=="EASY"?e.target.textContent="HARD":e.target.textContent="EASY"}class TegakiBox extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[globalCSS];const e=document.getElementById("tegaki-box").content.cloneNode(!0),t=e.querySelector("use"),s=t.getAttribute("href").slice(1),o=document.getElementById(s).firstElementChild.cloneNode(!0);t.replaceWith(o),this.shadowRoot.appendChild(e);const i=this.shadowRoot.querySelector("canvas"),n=initSignaturePad(i);this.shadowRoot.querySelector(".eraser").onclick=()=>{n.clear()},pads.push(n),document.documentElement.getAttribute("data-bs-theme")=="dark"&&this.shadowRoot.querySelector("canvas").setAttribute("style","filter: invert(1) hue-rotate(180deg);")}}customElements.define("tegaki-box",TegakiBox);function createTegakiBox(){const e=document.createElement("div"),n=document.getElementById("tegaki-box").content.cloneNode(!0);e.appendChild(n);const s=e.querySelector("canvas"),t=initSignaturePad(s);return e.querySelector(".eraser").onclick=()=>{t.clear()},pads.push(t),e}function getGlobalCSS(){let e="";for(const t of document.styleSheets)try{for(const n of t.cssRules)e+=n.cssText}catch{}const t=new CSSStyleSheet;return t.replaceSync(e),t}const globalCSS=getGlobalCSS();canvases.forEach(e=>{const t=initSignaturePad(e);pads.push(t),e.parentNode.querySelector(".eraser").onclick=()=>{t.clear(),showPredictResult(e," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",e=>{const t=e.data;if(pads[t.pos].toData().length==0)return;if(answered)return;const n=showPredictResult(canvases[t.pos],t.result);if(n==answerEn){if(answered=!0,document.getElementById("mode").textContent=="EASY")correctCount+=1;else{const e=document.getElementById("answer"),t=e.classList.contains("d-none");t&&(correctCount+=1)}playAudio("correct",.3),document.getElementById("reply").textContent="⭕ "+answerEn,document.getElementById("searchButton").classList.add("animate__heartBeat")}}),initProblems(),document.getElementById("mode").onclick=changeMode,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("respeak").onclick=respeak,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("grade").onchange=initProblems,document.getElementById("searchButton").addEventListener("animationend",e=>{e.target.classList.remove("animate__heartBeat")}),document.addEventListener("pointerdown",()=>{predict(canvases[0])},{once:!0}),document.addEventListener("pointerdown",unlockAudio,{once:!0}),document.addEventListener("keydown",unlockAudio,{once:!0})