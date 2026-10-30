export class AudioCoach {
 constructor(settings,onStatus){this.settings=settings;this.onStatus=onStatus;this.voices=[];this.current=null;this.refresh();if('speechSynthesis'in window)window.speechSynthesis.addEventListener('voiceschanged',()=>{this.refresh();document.dispatchEvent(new Event('dimelo-voices'));});}
 refresh(){this.voices=('speechSynthesis'in window?window.speechSynthesis.getVoices():[]).filter(v=>/^es[-_]?/i.test(v.lang));return this.voices;}
 get supported(){return 'speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;}
 stop(){clearTimeout(this.watchdog);if(this.supported)window.speechSynthesis.cancel();this.current=null;}
 say(text,{slow=false,onEnd=()=>{}}={}){
  if(!this.supported){this.onStatus('Audio is not available in this browser. Reading and recall practice still work.');return false;}
  this.stop();const u=new SpeechSynthesisUtterance(text);this.current=u;
  const selected=this.voices.find(v=>v.voiceURI===this.settings.voiceURI)||this.voices.find(v=>v.lang.toLowerCase()==='es-mx')||this.voices.find(v=>v.lang.toLowerCase()==='es-us')||this.voices[0];
  if(selected)u.voice=selected;u.lang=selected?.lang||this.settings.locale||'es-MX';u.rate=slow?Math.max(.5,this.settings.rate*.75):this.settings.rate;
  u.onstart=()=>clearTimeout(this.watchdog);
  u.onend=()=>{clearTimeout(this.watchdog);this.current=null;onEnd();};u.onerror=e=>{clearTimeout(this.watchdog);if(!['interrupted','canceled'].includes(e.error))this.onStatus('The Spanish voice could not play. Choose another voice in Sound & settings, or try again.');this.current=null;};
  this.watchdog=setTimeout(()=>{if(this.current===u){this.onStatus('This browser has not started its Spanish voice. Choose another voice in Sound & settings, or use reading practice.');}},4000);
  window.speechSynthesis.speak(u);return true;
 }
 get canRecognize(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);}
 listen(onText,onEnd=()=>{}){
  const API=window.SpeechRecognition||window.webkitSpeechRecognition;if(!API){this.onStatus('Speech input is unavailable here. You can type your answer.');return;}
  this.stop();if(this.recognition){this.recognition.abort();this.recognition=null;}
  const rec=new API();this.recognition=rec;rec.lang=this.settings.locale||'es-MX';rec.interimResults=false;rec.maxAlternatives=3;
  rec.onresult=e=>onText(e.results[0][0].transcript);
  rec.onerror=e=>{const messages={'not-allowed':'Microphone access was not allowed. You can type your answer.','no-speech':'No speech was detected. Try again or type your answer.','network':'Speech input could not connect. Try again or type your answer.'};this.onStatus(messages[e.error]||'Speech input stopped. You can type your answer.');};
  rec.onend=()=>{this.recognition=null;onEnd();};
  try{rec.start();return rec;}catch{this.onStatus('Speech input could not start. You can type your answer.');onEnd();}
 }
}
