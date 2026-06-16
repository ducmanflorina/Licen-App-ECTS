let selectedSubject="Toate", pool=[], current=0, score=0, answeredCurrent=false;
let mistakes=JSON.parse(localStorage.getItem("mistakes")||"[]");
let stats=JSON.parse(localStorage.getItem("stats")||'{"answered":0,"correct":0}');
const screen=document.getElementById("screen");

function subjects(){
 const m={}; QUESTIONS.forEach(q=>m[q.subject]=(m[q.subject]||0)+1); return m;
}
function filtered(){return selectedSubject==="Toate"?QUESTIONS:QUESTIONS.filter(q=>q.subject===selectedSubject)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

function showSubjects(){
 let html='<div class="card"><h2>Materii</h2><p class="meta">Total întrebări încărcate: '+QUESTIONS.length+'</p>';
 html+='<input class="search" id="searchBox" placeholder="Caută în întrebări..." oninput="searchQuestions(this.value)">';
 html+='<div class="subject"><span>Toate materiile</span><span class="badge">'+QUESTIONS.length+' întrebări</span><button onclick="selectSubject(\'Toate\')">Alege</button></div>';
 Object.entries(subjects()).forEach(([s,n])=>{
   html+='<div class="subject"><span>'+esc(s)+'</span><span class="badge">'+n+' întrebări</span><button onclick="selectSubject(\''+esc(s).replaceAll("&#39;","\\&#39;")+'\')">Alege</button></div>';
 });
 html+='<div id="searchResults"></div></div>';
 screen.innerHTML=html;
}
function searchQuestions(term){
 term=term.toLowerCase().trim();
 const box=document.getElementById("searchResults");
 if(!term){box.innerHTML="";return}
 const res=QUESTIONS.filter(q=>q.question.toLowerCase().includes(term)).slice(0,30);
 box.innerHTML='<h3>Rezultate căutare</h3>'+res.map(q=>'<div class="subject"><span>'+esc(q.question)+'</span><span class="badge">'+esc(q.subject)+'</span><button onclick="openQuestion('+q.id+')">Deschide</button></div>').join('');
}
function openQuestion(id){
 const q=QUESTIONS.find(x=>x.id===id);
 selectedSubject=q.subject; pool=[q]; current=0; score=0; showQuestion();
}
function selectSubject(s){selectedSubject=s;startLearning()}
function startLearning(){pool=filtered();current=0;score=0;answeredCurrent=false;showQuestion()}
function startTest(n){pool=shuffle(filtered()).slice(0,Math.min(n,filtered().length));current=0;score=0;answeredCurrent=false;showQuestion()}

function showQuestion(){
 if(!pool.length){screen.innerHTML='<div class="card"><h2>Nu există întrebări.</h2></div>';return}
 if(current>=pool.length){finish();return}
 answeredCurrent=false;
 const q=pool[current], p=Math.round(current/pool.length*100);
 let html='<div class="card"><div class="meta">'+esc(q.subject)+' · Întrebarea '+(current+1)+'/'+pool.length+'</div><div class="progress"><div style="width:'+p+'%"></div></div><h2>'+esc(q.question)+'</h2>';
 q.answers.forEach(a=>html+='<button class="answer" onclick="answer(\''+a.letter+'\',this)">'+a.letter+') '+esc(a.text)+'</button>');
 html+='<div id="feedback"></div><div class="footer"><button onclick="nextQuestion()">Sari peste</button><button onclick="showSubjects()">Înapoi la materii</button></div></div>';
 screen.innerHTML=html;
}
function answer(letter,btn){
 if(answeredCurrent)return;
 answeredCurrent=true;
 const q=pool[current]; document.querySelectorAll(".answer").forEach(b=>b.disabled=true);
 if(!q.correct){
   document.getElementById("feedback").innerHTML='<p class="notice">Nu există răspuns corect completat pentru această întrebare.</p><button onclick="nextQuestion()">Următoarea</button>';
   return;
 }
 const ok=letter===q.correct;
 stats.answered++;
 if(ok){score++;stats.correct++;btn.classList.add("correct")}
 else{
   btn.classList.add("wrong"); mistakes.push(q.id);
   document.querySelectorAll(".answer").forEach(b=>{if(b.textContent.trim().toLowerCase().startsWith(q.correct+')'))b.classList.add("correct")})
 }
 localStorage.setItem("mistakes",JSON.stringify([...new Set(mistakes)]));
 localStorage.setItem("stats",JSON.stringify(stats));
 document.getElementById("feedback").innerHTML='<h3>'+(ok?'✅ Corect':'❌ Greșit')+'</h3><p class="small">Răspuns corect: '+q.correct+')</p><button onclick="nextQuestion()">Următoarea</button>';
}
function nextQuestion(){current++;showQuestion()}
function finish(){
 const pct=pool.length?Math.round(score/pool.length*100):0;
 const nota=pool.length?Math.round((1+score/pool.length*9)*100)/100:1;
 screen.innerHTML='<div class="card"><h2>Rezultat final</h2><p>Scor: '+score+'/'+pool.length+'</p><p>Procent: '+pct+'%</p><p>Notă estimată: '+nota+'</p><button onclick="startTest('+pool.length+')">Repetă</button><button onclick="showSubjects()">Materii</button></div>';
}
function showMistakes(){
 const ids=[...new Set(mistakes)];
 const qs=QUESTIONS.filter(q=>ids.includes(q.id));
 let html='<div class="card"><h2>Greșeli</h2><p>'+qs.length+' întrebări salvate.</p>';
 if(qs.length){html+='<button onclick="pool=shuffle(QUESTIONS.filter(q=>['+ids.join(",")+'].includes(q.id)));current=0;score=0;showQuestion()">Repetă greșelile</button>'}
 qs.slice(0,200).forEach(q=>html+='<div class="subject"><span>'+esc(q.question)+'</span><span class="badge">corect: '+q.correct+'</span><button onclick="openQuestion('+q.id+')">Deschide</button></div>');
 html+='<button onclick="mistakes=[];localStorage.removeItem(\'mistakes\');showMistakes()">Șterge greșelile</button></div>';
 screen.innerHTML=html;
}
function showStats(){
 const pct=stats.answered?Math.round(stats.correct/stats.answered*100):0;
 screen.innerHTML='<div class="card"><h2>Statistici</h2><p>Răspunsuri totale: '+stats.answered+'</p><p>Corecte: '+stats.correct+'</p><p>Procent corectitudine: '+pct+'%</p><button onclick="stats={answered:0,correct:0};localStorage.removeItem(\'stats\');showStats()">Resetează</button></div>';
}
showSubjects();