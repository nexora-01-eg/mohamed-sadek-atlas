/* محمد صادق — عقل بيتحرك | صفر اعتماديات. المحتوى من /data، العربي من /data/ar.json */
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const D={}; let AR={};
const FILES=["profile","projects","skills","ideas","journey","operating-system","tensions","future","graveyard","learning","tools","lessons","learning-priority","anti-goals","open-questions","patterns","attention-traps","decisions","open-loops","assets","monthly-snapshots","ar"];
const SKEY="msa:v1";
let S={votes:{},vault:[],snapshots:[],ranking:[],skillStates:{},rules:{},loops:[],decisionsLog:[],demo:false,priv:false,motion:true};
try{Object.assign(S,JSON.parse(localStorage.getItem(SKEY)||"{}"));}catch(e){}
const save=()=>{try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}};
let kindFilter="all";
const KA=()=>AR.kindAr||{confirmed:"مؤكّد",interpretation:"قراءة",aspiration:"اتجاه"};
const kindTag=k=>k?`<span class="kind ${k}">${KA()[k]||k}</span>`:"";
const passKind=k=>kindFilter==="all"||k===kindFilter;
const NAV=[["me","me"],["mind","mind"],["journey","journey"],["builder","builder"],["work","work"],["system","system"],["patterns","patterns"],["tensions","tensions"],["future","future"],["day","day"],["reflection","reflection"],["archive","archive"]];
const navName=id=>(AR.nav&&AR.nav[id])||id;
const P=id=>(AR.projectsAr&&AR.projectsAr[id])||{};
const T=(id,fb)=>{const m=(AR.tensionsAr&&AR.tensionsAr[id]);return m?m:[fb,fb];};
const JL=id=>(D.journeyLines||{})[id]||{};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.remove("hidden");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add("hidden"),2600);};

window.addEventListener("DOMContentLoaded",async()=>{
  if(location.protocol==="file:"){$("#view").innerHTML=`<h1 class="title">شغّل السيرفر المحلي</h1><p class="lead">افتح <span class="lat">node server.js</span> ثم <span class="lat">http://localhost:8080</span></p>`;return;}
  try{await Promise.all(FILES.map(async f=>{const r=await fetch("data/"+f+".json");D[f]=await r.json();}));}
  catch(e){$("#view").innerHTML="<p>ملفات /data مش متاحة — شغّل node server.js.</p>";return;}
  AR=D.ar||{};
  try{const r=await fetch("data-private/overrides.json");if(r.ok)D.priv=await r.json();}catch(e){}
  buildNav();bindChrome();route();
  window.addEventListener("hashchange",route);
  window.addEventListener("scroll",()=>{const h=document.documentElement;$("#progress span").style.width=(h.scrollTop/((h.scrollHeight-h.clientHeight)||1)*100)+"%";},{passive:true});
  if(!S.motion||matchMedia("(prefers-reduced-motion: reduce)").matches){document.body.classList.add("no-motion");$("#motionBtn").textContent="الحركة: واقفة";}
  if(S.priv)$("#privateBadge").classList.remove("hidden");
});
function buildNav(){
  const items=NAV.map(([id],i)=>`<button data-nav="${id}"><span class="n">${String(i+1).padStart(2,"0")}</span>${navName(id)}</button>`).join("");
  $("#sideNav").innerHTML=items;
  $("#bottomNav").innerHTML=NAV.map(([id])=>`<button data-nav="${id}">${navName(id)}</button>`).join("");
  $$("[data-nav]").forEach(b=>b.onclick=()=>location.hash="#/"+b.dataset.nav);
  $$(".kind-filter .chip").forEach(c=>c.onclick=()=>{kindFilter=c.dataset.kind;$$(".kind-filter .chip").forEach(x=>x.classList.toggle("on",x===c));route();});
}
let eggBuf="";
function bindChrome(){
  $("#cmdkBtn").onclick=openCmdk;$("#motionBtn").onclick=()=>{S.motion=!S.motion;save();document.body.classList.toggle("no-motion",!S.motion);$("#motionBtn").textContent="الحركة: "+(S.motion?"شغالة":"واقفة");if(S.motion)route();};
  $("#privBtn").onclick=()=>{if(!S.priv){$("#lock").classList.remove("hidden");}else{S.priv=false;save();$("#privateBadge").classList.add("hidden");route();}};
  $("#lockGo").onclick=()=>{S.priv=true;save();$("#lock").classList.add("hidden");$("#privateBadge").classList.remove("hidden");route();};
  $("#hideBtn").onclick=()=>document.body.classList.toggle("hide-sensitive");
  $("#drawerClose").onclick=()=>$("#drawer").classList.add("hidden");
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCmdk();}
    if(e.key==="Escape"){$("#cmdk").classList.add("hidden");$("#drawer").classList.add("hidden");}
    if(e.target.matches("input,textarea"))return;
    eggBuf=(eggBuf+e.key).slice(-8);
    if(eggBuf.endsWith("why?")){const eggs=AR.eggs||[];toast(eggs[Math.floor(Math.random()*eggs.length)]||"ليه؟");eggBuf="";}
    if(eggBuf.endsWith("idea")){location.hash="#/work";toast("الخزنة اتفتحت");eggBuf="";}
    if(eggBuf.endsWith("future")){location.hash="#/future";eggBuf="";}
    if((e.key==="d"||e.key==="D")&&!e.ctrlKey&&!e.metaKey){location.hash="#/day";}
  });
  $("#cmdk").addEventListener("click",e=>{if(e.target.id==="cmdk")$("#cmdk").classList.add("hidden");});
  $("#cmdkInput").addEventListener("input",renderCmdk);
  document.addEventListener("click",e=>{ /* day chips (delegated once) */
    const m=e.target.closest("#mMood .mood");if(m){m.parentElement.querySelectorAll(".mood").forEach(x=>x.classList.remove("on"));m.classList.add("on");return;}
    const en=e.target.closest("#mEnergy .mood");if(en){en.parentElement.querySelectorAll(".mood").forEach(x=>x.classList.remove("on"));en.classList.add("on");return;}
    const tg=e.target.closest("#mTags .tag");if(tg)tg.classList.toggle("on");
  });
}
function route(){
  const id=(location.hash||"#/me").replace("#/","")||"me";
  $$("#sideNav button,#bottomNav button").forEach(b=>b.classList.toggle("on",b.dataset.nav===id));
  window.scrollTo(0,0);
  ({me:vMe,mind:vMind,journey:vJourney,builder:vBuilder,work:vWork,system:vSystem,patterns:vPatterns,tensions:vTensions,future:vFuture,day:vDay,reflection:vReflection,archive:vArchive}[id]||vMe)($("#view"));
  observeRv();
}
function observeRv(){
  if(document.body.classList.contains("no-motion"))return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("on");io.unobserve(e.target);}}),{threshold:.12});
  $$(".rv").forEach(el=>io.observe(el));
}
const rv=(h,cls)=>`<div class="rv ${cls||""}">${h}</div>`;
const head=(tag,title,sub)=>rv(`<p class="chapter-tag">${tag}</p><h1 class="title">${title}</h1>${sub?`<p class="lead">${sub}</p>`:""}`);
function drawer(title,html){$("#drawerBody").innerHTML=`<h2>${title}</h2>${html}`;$("#drawer").classList.remove("hidden");}
/* ---------- living constellation (canvas, خفيف) ---------- */
function field(canvas,labels){
  if(!canvas)return;
  const ctx=canvas.getContext("2d");let W,H,pts=[],mx=-999,my=-999,run=true;
  const N=innerWidth<640?45:80;
  const resize=()=>{W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;};
  resize();window.addEventListener("resize",resize);
  const types=["فكرة","مشروع","مهارة","سؤال","نظام"];
  for(let i=0;i<N;i++)pts.push({x:Math.random()*2000,y:Math.random()*1200,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.8,t:types[i%5],pulse:Math.random()*6.28,lab:labels&&i%16===0?labels[(i/16|0)%labels.length]:null});
  canvas.parentElement.addEventListener("pointermove",e=>{const b=canvas.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;});
  new IntersectionObserver(es=>run=es[0].isIntersecting).observe(canvas);
  (function tick(){
    requestAnimationFrame(tick);
    if(!run||document.body.classList.contains("no-motion"))return;
    ctx.clearRect(0,0,W,H);const sx=W/2000,sy=H/1200;
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.pulse+=.02;
      const px=p.x*sx,py=p.y*sy,dx=px-mx,dy=py-my,d=Math.hypot(dx,dy);
      if(d<130&&d>1){p.x+=dx/d*1.4/sx;p.y+=dy/d*1.4/sy;}
      if(p.x<0||p.x>2000)p.vx*=-1;if(p.y<0||p.y>1200)p.vy*=-1;});
    ctx.strokeStyle="rgba(214,195,165,.13)";ctx.lineWidth=1;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=(a.x-b.x)*sx,dy=(a.y-b.y)*sy;
      if(Math.abs(dx)<130&&Math.abs(dy)<130&&Math.hypot(dx,dy)<130){ctx.beginPath();ctx.moveTo(a.x*sx,a.y*sy);ctx.lineTo(b.x*sx,b.y*sy);ctx.stroke();}}
    pts.forEach(p=>{const r=p.r+Math.sin(p.pulse)*.7;
      ctx.fillStyle=p.lab?"#D6C3A5":"rgba(242,236,227,.55)";
      ctx.beginPath();ctx.arc(p.x*sx,p.y*sy,Math.max(r,.6),0,6.28);ctx.fill();
      if(p.lab){ctx.fillStyle="rgba(214,195,165,.8)";ctx.font="13px Tajawal";ctx.fillText(p.lab,p.x*sx+10,p.y*sy+4);}});
  })();
}
/* ---------- command layer ---------- */
function indexAll(){
  const ix=(AR.cmds||[]).map(c=>({t:c.t,cmd:c.run,cls:"cmd"}));
  (D.projects||[]).forEach(p=>ix.push({t:"اللي عملته: "+(P(p.id).tag||p.name),go:()=>openProject(p.id)}));
  (D.tools||[]).forEach(t=>ix.push({t:"أداة: "+t.name,go:()=>location.hash="#/work"}));
  (D.lessons||[]).forEach(l=>ix.push({t:"درس: "+l.text.slice(0,50),go:()=>location.hash="#/patterns"}));
  NAV.forEach(([id])=>ix.push({t:"روح: "+navName(id),go:()=>location.hash="#/"+id}));
  return ix;
}
function openCmdk(){$("#cmdk").classList.remove("hidden");$("#cmdkInput").value="";renderCmdk();setTimeout(()=>$("#cmdkInput").focus(),30);}
function renderCmdk(){
  const q=($("#cmdkInput").value||"").trim();
  const list=indexAll().filter(i=>!q||i.t.includes(q)).slice(0,20);
  $("#cmdkList").innerHTML=list.map((_,n)=>`<button data-i="${n}" class="${list[n].cls||""}">${esc(list[n].t)}</button>`).join("")||`<p class="micro" style="padding:16px">مفيش نتايج.</p>`;
  $$("#cmdkList button").forEach((b,n)=>b.onclick=()=>{$("#cmdk").classList.add("hidden");runCmd(list[n]);});
}
function runCmd(i){
  if(i.go)return i.go();
  if(i.cmd==="vault"){location.hash="#/work";setTimeout(()=>{const v=$("#vaultIn");if(v)v.focus();},300);}
  if(i.cmd==="day"){location.hash="#/day";}
  if(i.cmd==="decide"){location.hash="#/patterns";setTimeout(()=>{const v=$("#decIn");if(v)v.focus();},300);}
  if(i.cmd==="questions"){location.hash="#/reflection";}
  if(i.cmd==="nexora"){location.hash="#/work";setTimeout(()=>openProject("nexora"),300);}
  if(i.cmd==="north"){location.hash="#/future";}
}
/* ================= VIEWS ================= */
function vMe(v){
  const p=D.profile;
  v.innerHTML=`
  <div class="hero-wrap"><canvas id="mindfield"></canvas>
    <div class="hero-inner">
      <p class="hero-big rv">أنا مش بدوّر على فكرة جديدة.<br><em>أنا بدوّر على طريقة أخلّي الفكرة تشتغل.</em></p>
      <p class="hero-name rv">${AR.hero.name} <span class="micro">· ٢٤ — مصر</span></p>
      <p class="hero-roles lat rv">${esc(AR.hero.roles)}</p>
      <p class="scroll-cue">${AR.hero.scroll} ↓</p>
    </div>
  </div>
  ${rv(`<p class="big">${AR.me.question}<br>${AR.me.questionBig}</p>`)}
  ${rv(`<div class="words">${AR.me.words.map(w=>`<button class="word lat">${w}</button>`).join("")}</div>`)}
  ${rv(`<h2 class="title" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">${AR.me.truthTitle}</h2>`)}
  ${AR.me.truth.map(t=>rv(`<p class="truth">${t}</p>`)).join("")}
  ${rv(`<details class="blk"><summary>حقايق صغيرة — من غير تجميل ${kindTag("confirmed")}</summary>${p.facts.filter(f=>passKind(f.kind)).map(f=>`<p>· ${esc(f.text)}</p>`).join("")}</details>`)}
  ${rv(`<p class="micro">كمّل من هنا: <button class="linklike" data-go="work">${navName("work")}</button> · <button class="linklike" data-go="mind">${navName("mind")}</button> · <button class="linklike" data-go="future">${navName("future")}</button></p>`)}`;
  $$("#view [data-go]").forEach(b=>b.onclick=()=>location.hash="#/"+b.dataset.go);
  field($("#mindfield"),["فكرة","مشروع","مهارة","سؤال","نظام"]);
}
function vMind(v){
  const stories=AR.mind.nodeStories||{};
  const loop=AR.mind.loop||[];
  v.innerHTML=head("٠٢ · دماغي","أنا بفكر كده.","دوس على أي خطوة — كل واحدة وراها حكاية.")
  +rv(`<div class="loop">${loop.map((s,i)=>`${i?'<div class="arr">↓</div>':""}<button class="st" data-step="${i}">${s}</button>`).join("")}</div>`)
  +rv(`<h2 class="title" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">${AR.mind.trapsTitle}</h2><p class="micro">${AR.mind.trapsSub}</p>`)
  +rv(`<div class="mags">${(D["attention-traps"]||[]).map(t=>`<button class="mag" data-trap="${t.id}">${AR.trapsAr[t.id]||t.name}</button>`).join("")}</div>`)
  +rv(`<details class="blk"><summary>الدايرتين: الموجبة والسالبة</summary><p><b style="color:var(--building)">الموجبة:</b> فكرة ← طب لو؟ ← بحث ← أدوات ← بناء ← تحسين ← بتكسب؟ ← أتمتة ← توسع</p><p><b style="color:var(--warning)">السالبة:</b> فكرة ← فكرة جديدة ← أداة جديدة ← مشروع جديد ← احتمال جديد ← تشتيت ← فكرة تانية</p><p class="big">المشكلة مش قلة الأفكار.<br>المشكلة: الانتباه بيروح فين.</p></details>`);
  const keys=Object.keys(stories);
  $$("#view [data-step]").forEach(b=>b.onclick=()=>{const k=keys[+b.dataset.step%keys.length];drawer(loop[+b.dataset.step],`<p>${stories[k]}</p>${kindTag("interpretation")}`);});
  $$("#view [data-trap]").forEach(b=>b.onclick=()=>{
    const t=D["attention-traps"].find(x=>x.id===b.dataset.trap),vote=S.votes[t.id];
    drawer(AR.trapsAr[t.id]||t.name,`<p><b>هي إيه؟</b> ${esc(t.behavior)}</p><p><b>ليه بتحصل؟</b> ${esc(t.trigger)} — وفيها متعة لحظية: ${esc(t.benefit)}</p><p><b>التكلفة:</b> ${esc(t.cost)}</p><p><b>بعمل إيه دلوقتي؟</b> ${esc(t.counter)}</p>${kindTag("interpretation")}<p class="micro">لسه صح؟ (بتتسجل محليًا بتاريخ النهاردة)</p><div class="row">${["أيوه","إلى حد ما","لأ","مش متأكد"].map(o=>`<button class="chip" data-v="${o}">${o}</button>`).join("")}</div>${vote?`<p class="micro">آخر إجابة: ${vote.v} · ${vote.d}</p>`:""}`);
    $$("#drawerBody [data-v]").forEach(c=>c.onclick=()=>{S.votes[t.id]={v:c.dataset.v,d:new Date().toISOString().slice(0,10)};save();$("#drawer").classList.add("hidden");toast("اتسجلت. مع الوقت هتبان الصورة.");});
  });
}
function vJourney(v){
  const j=D.journey;
  v.innerHTML=head("٠٣ · الرحلة","من التدوير… للبنا.","كل محطة: جملة واحدة + درس واحد.")
  +`<div class="tl">${j.phases.map(p=>{const L=JL(p.id);return rv(`<div class="ev ${p.id==="now"?"now":""}"><p class="pline">${L.line||p.name}</p><p class="lesson">← ${L.lesson||""}</p>${L.human?`<p class="human">${L.human}</p>`:""}${kindTag(p.kind||"confirmed")}</div>`);}).join("")}</div>`
  +rv(`<h2 class="title" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">علاقتي بالـ AI اتغيرت إزاي؟</h2>`)
  +`<div class="tl">${(AR.aiStages||[]).map(a=>rv(`<div class="ev ${a.done?"":"now"}"><p class="pline">${a.s}</p><p class="${a.done?"lesson":"human"}">← ${a.e}</p></div>`)).join("")}</div>`;
}
function vBuilder(v){
  const sk=D.skills,HS=AR.humanStates||{};
  v.innerHTML=head("٠٤ · ببني إيه","أنا ببني نفسي في ٥ اتجاهات.","افتح أي اتجاه — جواه المهارة + حالتها بكلام بني آدمين + الدليل.")
  +(AR.worlds||[]).map(w=>{const items=w.skills.map(id=>sk.fields.find(f=>f.id===id)).filter(Boolean);return rv(`<details class="world" ${w.id==="think"?"open":""}><summary><span><span class="wn lat">${w.id.toUpperCase()}</span><br><b>${w.name}</b><br><span class="micro">${w.desc}</span></span><span>＋</span></summary><div class="wbody">${items.map(f=>{const st=S.skillStates[f.id]||f.state||"";return`<div class="skillrow"><span><b>${f.name}</b><br><span class="micro">${f.evidence?("الدليل: "+esc(f.evidence)):"الدليل: "+AR.micro.unknown}</span></span><button class="st8" data-skill="${f.id}">${HS[st]||AR.micro.unset} ✎</button></div>`;}).join("")}</div></details>`);}).join("")
  +rv(`<div class="nexora-chapter"><p class="chapter-tag">الطبقة اللي بتفتح كل حاجة</p><p class="big">الإنجليزي مش مهارة زيادة.<br>الإنجليزي طبقة وصول للعالم.</p><p class="micro">بيفتح: التعلم · البحث · فهم الأدوات · التواصل · الشغل مع عملاء. المستوى: بتاع محمد يكتبه.</p></div>`)
  +rv(`<details class="blk"><summary>${AR.micro.learning}: الأساسيات العشرة</summary><p class="micro">${D.learning.fields.join(" · ")}</p><p class="micro">الطريقة: ${D.learning.cycle.join(" ← ")}</p></details>`);
  $$("#view [data-skill]").forEach(b=>b.onclick=()=>{
    const f=sk.fields.find(x=>x.id===b.dataset.skill);
    drawer(f.name,`<p class="micro">الحالة (بتتسجل محليًا):</p><div class="row">${Object.keys(HS).filter(k=>k).map(s=>`<button class="chip" data-set="${s}">${HS[s]}</button>`).join("")}</div><label>الدليل — مشروع/نتيجة حقيقية (مفيش دليل إجابة شريفة)</label><input type="text" id="evIn" value="${esc(f.evidence||"")}"><button class="btn primary" id="evSave">احفظ</button>`);
    $$("#drawerBody [data-set]").forEach(c=>c.onclick=()=>{S.skillStates[f.id]=c.dataset.set;save();$("#drawer").classList.add("hidden");vBuilder(v);observeRv();});
    $("#evSave").onclick=()=>{f.evidence=$("#evIn").value;S.skillStates[f.id]=S.skillStates[f.id]||"PRACTICING";save();$("#drawer").classList.add("hidden");vBuilder(v);observeRv();};
  });
}
function openProject(id){
  const p=(D.projects||[]).find(x=>x.id===id);if(!p)return;
  const A=P(id);
  const rows=[["إيه؟",A.tag||p.tagline],["ليه موجود؟",p.why],["اتبنى إيه؟",p.what],["اتعلمت إيه؟",p.learned],["بيقول إيه عني؟",p.reveals]];
  drawer(p.name,`<p class="micro"><span class="lat">${esc(p.tagline||"")}</span></p><p><span class="status ${p.lifecycle}">${p.lifecycle} · ${p.classification}</span> ${kindTag(p.kind)}</p>`
  +(p.philosophy?`<p class="big" style="font-size:1.4rem">“${esc(p.philosophy)}”</p>`:"")
  +(p.mirror?`<p><i>“${esc(p.mirror.en)}”</i> ${kindTag("interpretation")}</p>`:"")
  +rows.map(([k,val])=>val?`<p><b>${k}</b><br>${esc(val)}</p>`:`<div class="empty">${k}: ${AR.micro.unknown}</div>`).join("")
  +(A.human?`<p class="human" style="color:var(--champagne)">← ${A.human}</p>`:"")
  +(p.evolution?`<p class="micro">التطور: ${p.evolution.join(" ← ")}</p>`:"")
  +`<div class="empty">الصورة الحقيقية لسه متضافتش — مفيش صور مزيفة هنا.</div>`);
}
function vWork(v){
  const projs=(D.projects||[]).filter(p=>passKind(p.kind));
  const nex=projs.find(p=>p.id==="nexora"),rest=projs.filter(p=>p.id!=="nexora");
  const vault=(D.ideas[0]?.items||[]).concat(S.vault);
  v.innerHTML=head("٠٥ · اللي عملته","كل مشروع بشخصيته.","NEXORA هي الفصل الأكبر — والباقي تجارب وعملا وأنظمة.")
  +(nex?rv(`<button class="nexora-chapter prow" data-proj="nexora" style="width:100%;text-align:right"><span><span class="chapter-tag">${P("nexora").ptype||""}</span><span class="bgs lat">BUILD.<br>GROW.<br><span>SCALE.</span></span><br><span>${P("nexora").tag||""}</span></span></button>`):"")
  +rest.map(p=>rv(`<button class="prow" data-proj="${p.id}"><span><span class="ptype">${P(p.id).ptype||p.type}</span><br><b style="font-size:1.25rem">${esc(p.name)}</b><br><span class="micro">${P(p.id).tag||p.tagline||""}</span></span><span class="status ${p.lifecycle}">${p.lifecycle}</span></button>`)).join("")
  +rv(`<h2 class="title" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">${AR.vaultTitle}</h2><p class="micro">${AR.vaultSub}</p>`)
  +rv(`<div class="row"><input type="text" id="vaultIn" placeholder="فكرة جديدة… اركنها هنا" style="flex:1;min-width:200px"><button class="btn primary" id="vaultAdd">اركنها</button></div>`)
  +`<div class="vault-grid">${vault.map(i=>`<div class="vcard s-${i.status||"IDEA"}"><h4>${esc(i.name||i.title)}</h4><span class="status">${i.status||"IDEA"}</span><div class="acts">${["PARK","TEST","COMMIT","ARCHIVE"].map(a=>`<button data-vst="${i.id}" data-s="${a==="PARK"?"IDEA":a}">${a==="PARK"?"اركن":a==="TEST"?"اختبر":a==="COMMIT"?"نفّذ":"أرشف"}</button>`).join("")}${i.mine?`<button data-vdel="${i.id}">امسح</button>`:""}</div></div>`).join("")}</div>`;
  $$("#view [data-proj]").forEach(b=>b.onclick=()=>openProject(b.dataset.proj));
  $("#vaultAdd").onclick=()=>{const n=$("#vaultIn").value.trim();if(!n)return;S.vault.push({id:"v"+Date.now(),name:n,title:n,status:"IDEA",mine:true});save();vWork(v);observeRv();toast("اتركّنت. كمّل شغلك.");};
  $$("#view [data-vdel]").forEach(b=>b.onclick=()=>{S.vault=S.vault.filter(x=>x.id!==b.dataset.vdel);save();vWork(v);observeRv();});
  $$("#view [data-vst]").forEach(b=>b.onclick=()=>{const it=S.vault.find(x=>x.id===b.dataset.vst);if(it){it.status=b.dataset.s;save();vWork(v);observeRv();}else toast("الأفكار الأصلية بتتعدل من /data/ideas.json");});
}
function vSystem(v){
  const o=D["operating-system"];
  v.innerHTML=head("٠٦ · نظامي",AR.systemIntro,"فكرة ← فلتر ← قرار ← بناء ← إنهاء ← مراجعة.")
  +rv(`<div class="loop">${["فكرة","فلتر","قرار","بناء","إنهاء","مراجعة"].map((s,i)=>`${i?'<div class="arr">↓</div>':""}<div class="st">${s}</div>`).join("")}</div>`)
  +rv(`<details class="blk"><summary>فلتر الفرص (١٠ أسئلة) — افتحه لما تحتاجه بس</summary><div id="opp">${o.opportunityFilter.map((q,i)=>`<p><label><input type="checkbox" data-oq="${i}"> ${esc(q)}</label></p>`).join("")}</div><button class="btn primary" id="oqGo">احسب</button> <span id="oqOut"></span> <button class="btn small" id="oqPark">ابعتها للخزنة</button><p class="micro">مساعد تفكير — مش حكم موضوعي.</p></details>`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">${AR.micro.decisions} — اركن / جرّب / نفّذ</h2><div class="row"><input type="text" id="decIn" placeholder="قرار + سياقه + توقعك…" style="flex:1;min-width:220px"><button class="btn primary" id="decAdd">سجّل</button></div><div id="decList">${(S.decisionsLog||[]).map(d=>`<p>· ${esc(d)}</p>`).join("")||`<div class="empty">لسه مفيش قرارات متسجلة.</div>`}</div>`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">${AR.micro.loops}</h2><div class="row"><input type="text" id="loopIn" placeholder="إيه اللي لسه مفتوح؟" style="flex:1;min-width:200px"><button class="btn primary" id="loopAdd">ضيف</button></div>${(S.loops||[]).map(l=>`<p>· ${esc(l.t)} <span class="micro">${esc(l.d)}</span> <button class="linklike" data-loopdel="${l.id}">قفل</button></p>`).join("")||`<div class="empty">دماغك فاضية — حافظ عليها.</div>`}`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">${AR.micro.dashboard}</h2><p class="micro">التركيز · المشاريع النشطة (${D.projects.filter(p=>p.classification==="ACTIVE").length}) · المفتوح (${(S.loops||[]).length}) · الخزنة (${S.vault.length}) · اللقطات (${S.snapshots.length})</p>`)
  +rv(`<div class="row"><button class="btn" id="expBtn">تصدير نسخة</button><button class="btn" id="impBtn">استيراد</button><button class="btn" id="resetBtn">تصفير</button><input type="file" id="impFile" accept=".json" class="hidden"></div>`);
  $("#oqGo").onclick=()=>{const c=$$("#view [data-oq]").filter(x=>x.checked).length;$("#oqOut").innerHTML=` — <b>${c>=9?"نفّذ":c>=5?"اختبر صغير":"اركن"}</b> (${c}/10)`;};
  $("#oqPark").onclick=()=>{S.vault.push({id:"v"+Date.now(),name:"فكرة من الفلتر — "+new Date().toISOString().slice(0,10),title:"فكرة من الفلتر",status:"IDEA",mine:true});save();toast("اتركّنت في الخزنة.");};
  $("#decAdd").onclick=()=>{const t=$("#decIn").value.trim();if(!t)return;S.decisionsLog=[...(S.decisionsLog||[]),new Date().toISOString().slice(0,10)+" — "+t];save();vSystem(v);observeRv();};
  $("#loopAdd").onclick=()=>{const t=$("#loopIn").value.trim();if(!t)return;S.loops.push({id:"l"+Date.now(),t,d:new Date().toISOString().slice(0,10)});save();vSystem(v);observeRv();};
  $$("#view [data-loopdel]").forEach(b=>b.onclick=()=>{S.loops=S.loops.filter(x=>x.id!==b.dataset.loopdel);save();vSystem(v);observeRv();});
  $("#expBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download="mohamed-os-backup.json";a.click();};
  $("#impBtn").onclick=()=>$("#impFile").click();
  $("#impFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();route();}catch(_){toast("ملف مش سليم.")}};r.readAsText(f);};
  $("#resetBtn").onclick=()=>{if(confirm("تصفّر كل البيانات المحلية؟")){localStorage.removeItem(SKEY);location.reload();}};
}
function vPatterns(v){
  const st={ideas:(D.ideas[0]?.items||[]).length+S.vault.length,shipped:D.projects.filter(p=>p.lifecycle==="live").length,stopped:(D.graveyard.items||[]).length};
  v.innerHTML=head("٠٧ · اللي اتعلمته","أنا بدأت ألاحظ حاجات عن نفسي.","مش تحليلات — حكايات بدليل.")
  +(AR.patternsStory||[]).map(s=>rv(`<p class="truth">${s.t}</p><p>${s.d}</p>${s.q?`<p class="micro">← ${s.q}</p>`:""}`)).join("")
  +rv(`<div class="hgrid-funnel funnel"><div><b>${st.ideas}</b>أفكار</div><div><b>${D.projects.length}</b>مشاريع</div><div><b>${st.shipped}</b>شغال فعلًا</div><div><b>${st.stopped}</b>وقف (دليل)</div></div>${st.stopped===0?`<div class="empty">المقبرة فاضية بالتصميم — مفيش أرقام مخترعة.</div>`:""}`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">دروس بصوتي</h2>${(D.lessons||[]).map(l=>`<p>· ${esc(l.text)} ${kindTag(l.kind)}</p>`).join("")}`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">${AR.micro.antigoals}</h2>${(D["anti-goals"]||[]).map(a=>`<p>· ${esc(a.text)}</p>`).join("")}`);
}
function vTensions(v){
  v.innerHTML=head("٠٨ · التناقضات","التناقض مش عيب.<br>التناقض خريطة.")
  +(D.tensions||[]).filter(t=>passKind(t.kind)).map(t=>{const pair=(AR.tensionsAr&&AR.tensionsAr[t.id])||[t.a,t.b];
    return rv(`<div class="ten"><p class="a">${pair[0]}…</p><p class="bs">بس</p><p class="b">…${pair[1]}</p>${kindTag(t.kind)}${t.positive?`<details class="blk" style="text-align:right"><summary>الحتة الحلوة / الخطر / القاعدة</summary><p><b>${AR.tensionMeta.good}:</b> ${esc(t.positive)}</p><p><b>${AR.tensionMeta.danger}:</b> ${esc(t.danger)}</p><p><b>${AR.tensionMeta.rule}:</b> ${esc(t.rule)}</p></details>`:""}</div>`);}).join("");
}
function vFuture(v){
  const f=D.future;
  v.innerHTML=head("٠٩ · رايح فين",AR.futureIntro,"مش خطة شركة — دي اتجاهات بتتطور.")
  +rv(`<p class="big">نجمة الشمال:<br>“${esc(f.northStar.stated)}”</p>`)
  +rv(`<div id="rank">${rankList()}</div><p class="micro">رتّب اللي بيشدّك (بتتحفظ محليًا):</p>`)
  +rv(`<h2 class="title" style="font-size:clamp(1.3rem,3vw,2rem)">المستويات — تطوّر مش تشيك ليست</h2><div class="loop">${f.levels2026.map((l,i)=>`${i?'<div class="arr">↓</div>':""}<div class="st">${esc(l)}</div>`).join("")}</div>`)
  +rv(`<p class="big">لو كمّلت بنا…</p><div class="funnel">${f.ifKeepBuilding.map(x=>`<div>${esc(x)}</div>`).join("")}</div><p class="micro">مش وعد. اتجاه.</p>`)
  +rv(`<p class="micro">بيتبني: ${(f.fourColumns.building||[]).join(" · ")} | بيستكشف: ${(f.fourColumns.exploring||[]).join(" · ")}</p>`);
}
function rankList(){
  const opts=D.future.northStar.options,r=S.ranking&&S.ranking.length?S.ranking:opts;
  return r.map((o,i)=>`<p><button class="chip" data-up="${i}">▲</button> <button class="chip" data-dn="${i}">▼</button> ${i+1}. ${esc(o)}</p>`).join("");
}
document.addEventListener("click",e=>{
  const u=e.target.closest("[data-up]"),d=e.target.closest("[data-dn]");if(!u&&!d)return;
  const opts=D.future.northStar.options;let r=S.ranking&&S.ranking.length?[...S.ranking]:[...opts];
  const i=+(u||d).dataset[u?"up":"dn"],j=u?i-1:i+1;if(j<0||j>=r.length)return;
  [r[i],r[j]]=[r[j],r[i]];S.ranking=r;save();const R=$("#rank");if(R)R.innerHTML=rankList();
});
function vReflection(v){
  v.innerHTML=head("١٠ · مرآتي",AR.reflectionTitle,"اهدى حتة في الموقع — دفتر خاص.")
  +(!S.priv?rv(`<div class="empty">الوضع الخاص مقفول — اللقطات واليوميات مستخبية. دوس <b>خاص</b> فوق عشان تفتح الدفتر.</div>`):"")
  +rv(`<div class="notebook ${S.priv?"":"sens"}"><h3>لقطة الشهر</h3><div class="row"><input type="text" id="snFocus" placeholder="تركيزك دلوقتي" style="flex:1;min-width:160px"><input type="text" id="snLesson" placeholder="أهم درس" style="flex:1;min-width:160px"><button class="btn primary" id="snAdd">سجّل</button></div><div class="row"><button class="chip" id="demoBtn">${S.demo?"اخرج من وضع التجربة":"جرّب ببيانات تجريبية"}</button></div><div id="snList">${snapList()}</div>
  <h3>الأسئلة المفتوحة</h3>${(D["open-questions"]||[]).map(q=>`<p>· <b>${esc(q.q)}</b><br><span class="micro">الوضع الحالي: ${esc(q.default)}</span></p>`).join("")}</div>`)
  +rv(`<p class="big">أنا مش بحاول أبقى كل حاجة.<br>أنا بحاول أبقى قادر أبني الحياة اللي عايزها.</p><p class="micro">محمد صادق · ٢٤ — مصر · بيبني في العلن. بيتعلم في الخفا. لسه بيفهم.</p><p class="micro">أداة ملاحظة ذاتية — مش تشخيص ولا علاج. لو حاجة تقيلة، كلام مع حد تثق فيه أو مختص خطوة كويسة.</p>`);
  if($("#snAdd"))$("#snAdd").onclick=()=>{const f=$("#snFocus").value.trim(),l=$("#snLesson").value.trim();if(!f&&!l)return;S.snapshots.push({d:new Date().toISOString().slice(0,7),focus:f,lesson:l});save();$("#snList").innerHTML=snapList();$("#snFocus").value="";$("#snLesson").value="";};
  if($("#demoBtn"))$("#demoBtn").onclick=()=>{S.demo=!S.demo;
    if(S.demo&&!S.snapshots.some(s=>s.demo))S.snapshots.push({d:"2026-08",focus:"تجربة — تمركز NEXORA",lesson:"تجربة — التأكد قبل التوسع",demo:true},{d:"2026-09",focus:"تجربة — مصنع الفيديو",lesson:"تجربة — التسليم قبل الكمال",demo:true});
    if(!S.demo)S.snapshots=S.snapshots.filter(s=>!s.demo);
    save();vReflection(v);observeRv();};
}
function snapList(){
  if(!S.snapshots.length)return`<div class="empty">لسه مفيش لقطات — بعد شهرين هتبدأ الصورة تبان.</div>`;
  return S.snapshots.map(s=>`<p>· <b class="lat">${esc(s.d)}</b> — ${esc(s.focus||"—")} · ${esc(s.lesson||"—")} ${s.demo?'<span class="kind aspiration">تجربة</span>':""}</p>`).join("");
}
/* ================= DAY — private daily review (localStorage only) ================= */
function dayKey(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function arDate(ds,full){const[y,m,dd]=ds.split("-").map(Number);try{return new Intl.DateTimeFormat("ar-EG",full?{weekday:"long",day:"numeric",month:"long",year:"numeric"}:{day:"numeric",month:"short"}).format(new Date(y,m-1,dd));}catch(e){return ds;}}
function dayEntries(){return Object.entries(S.days||{}).sort((a,b)=>b[0].localeCompare(a[0]));}
function entryMD(k,e){return `## ${k}\n- مزاج: ${e.mood||"—"} | طاقة: ${e.energy||"—"} | تاجات: ${(e.tags||[]).join(", ")||"—"}\n- عملت إيه؟ ${e.did||"—"}\n- اتعلمت إيه؟ ${e.learned||"—"}\n- اللي عطّلني: ${e.blocked||"—"}\n- اللي فرّحني: ${e.joy||"—"}\n- بكرة: ${e.tomorrow||"—"}\n`;}
function dl(name,text){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.download=name;a.click();}
function vDay(v){
  const T=AR.day||{},today=dayKey(),ex=(S.days||{})[today];
  const doy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
  const prompt=(T.prompts||[])[doy%(T.prompts||[1]).length]||"";
  let draft=S.dayDraft;
  v.innerHTML=`<div class="day-page ${S.priv?"":"sens"}">
  ${rv(`<p class="chapter-tag">١١ · ${navName("day")} · خاص ومحلي فقط</p><h1 class="title">${T.greet||"إيه أخبار يومك؟"}</h1><p class="micro">${arDate(today,true)}</p><p class="lead">${T.sub||""}</p><p class="micro">← ${esc(prompt)}</p>`)}
  ${(!S.priv)?rv(`<div class="empty">الوضع الخاص مقفول — اليوميات مستخبية. دوس <b>خاص</b> فوق.</div>`):""}
  ${draft?rv(`<div class="draftbar">${T.draft||"عندك مسودة."} <span class="micro">${esc(draft.date||"")}</span><div class="row"><button class="btn small" id="drResume">${T.resume||"كمّل"}</button><button class="btn small ghost" id="drDel">${T.discard||"امسحها"}</button></div></div>`):""}
  <div id="dayForm">${dayFormHTML(T,ex||draft&&draft.fields||null,today)}</div>
  <div id="dayDone"></div>
  ${rv(`<h2 class="title" style="font-size:1.4rem">الأيام اللي فاتت</h2><input type="text" id="daySearch" placeholder="${T.search||"دوّر في أيامك…"}"><div id="dayList">${dayListHTML(T,"")}</div>`)}
  ${rv(`<h2 class="title" style="font-size:1.4rem">${T.month||"نظرة الشهر"}</h2><div id="dayMonth">${dayMonthHTML(T)}</div>`)}
  ${rv(`<h2 class="title" style="font-size:1.4rem">${T.whisperT||"همسات"}</h2><div id="dayWh">${dayWhispersHTML(T)}</div>`)}
  ${rv(`<div class="row"><button class="btn small" id="exD">${T.expDay||"اليوم"}</button><button class="btn small" id="exM">${T.expMonth||"الشهر"}</button><button class="btn small" id="exA">${T.expAll||"الكل"}</button></div>`)}
  </div>`;
  bindDay(T,today);
  $$("#view [data-go]").forEach(b=>b.onclick=()=>location.hash="#/"+b.dataset.go);
}
function dayFormHTML(T,f,today){
  f=f||{};
  return `<p class="day-q">${T.quick||"+ يوم جديد"}</p><p class="micro">${T.quickSub||""}</p>
  <label>${T.f_did}</label><textarea class="ta" data-f="did" placeholder="${T.ph_did||""}">${esc(f.did||"")}</textarea>
  <label>${T.f_learned}</label><textarea class="ta" data-f="learned" placeholder="${T.ph_learned||""}">${esc(f.learned||"")}</textarea>
  <label>${T.f_tomorrow}</label><textarea class="ta" data-f="tomorrow" placeholder="${T.ph_tomorrow||""}">${esc(f.tomorrow||"")}</textarea>
  <details class="blk"><summary>${T.full||"المراجعة الكاملة"}</summary>
  <label>${T.f_blocked}</label><textarea class="ta" data-f="blocked" placeholder="${T.ph_blocked||""}">${esc(f.blocked||"")}</textarea>
  <label>${T.f_joy}</label><textarea class="ta" data-f="joy" placeholder="${T.ph_joy||""}">${esc(f.joy||"")}</textarea>
  <label>المزاج (اختياري)</label><div class="moodrow" id="mMood">${(T.moods||[]).map((m,i)=>`<button class="mood ${(f.mood||"")===m?"on":""}" data-m="${m}">${(T.moodIcons||[])[i]||""} ${m}</button>`).join("")}</div>
  <label>الطاقة (اختياري)</label><div class="moodrow" id="mEnergy">${(T.energy||[]).map(m=>`<button class="mood ${(f.energy||"")===m?"on":""}" data-e="${m}">${m}</button>`).join("")}</div>
  <label>تاجات (اختياري)</label><div class="tagrow" id="mTags">${(T.tags||[]).map(t=>`<button class="tag ${((f.tags||[]).includes(t))?"on":""}" data-t="${t}">${t}</button>`).join("")}</div>
  </details>
  <button class="btn primary" id="daySave" style="width:100%;margin-top:8px">${T.save||"احفظ اليوم"}</button>`;
}
function collectDay(){
  const g={};$$("#dayForm .ta").forEach(t=>g[t.dataset.f]=t.value.trim());
  const m=$("#mMood .mood.on"),e=$("#mEnergy .mood.on");
  g.mood=m?m.dataset.m:"";g.energy=e?e.dataset.e:"";
  g.tags=$$("#mTags .tag.on").map(t=>t.dataset.t);
  return g;
}
function bindDay(T,today){
  const auto=el=>{el.style.height="auto";el.style.height=(el.scrollHeight)+"px";};
  $$("#dayForm .ta").forEach(t=>{auto(t);t.addEventListener("input",()=>{auto(t);S.dayDraft={date:today,fields:collectDay(),at:Date.now()};save();});});
  if($("#drResume"))$("#drResume").onclick=()=>{vDay($("#view"));observeRv();};
  if($("#drDel"))$("#drDel").onclick=()=>{S.dayDraft=null;save();vDay($("#view"));observeRv();};
  $("#daySave").onclick=()=>{
    const g=collectDay();
    if(!g.did&&!g.learned&&!g.tomorrow){toast("اكتب حاجة واحدة على الأقل.");return;}
    S.days=S.days||{};S.days[today]=Object.assign({},g,{at:Date.now()});S.dayDraft=null;save();
    $("#dayDone").innerHTML=`<div class="draftbar" style="text-align:center"><b>${T.saved||"اتحفظ."}</b><br><br>${T.done||"اليوم خلص. خليه وراك."}<br><span class="micro">${T.tomorrowIs||"بكرة ← حاجة واحدة."}</span><br><b>${esc(g.tomorrow||"—")}</b></div>`;
    $("#dayList").innerHTML=dayListHTML(T,$("#daySearch").value||"");
    $("#dayMonth").innerHTML=dayMonthHTML(T);$("#dayWh").innerHTML=dayWhispersHTML(T);
    window.scrollTo(0,0);toast(T.saved||"اتحفظ.");
  };
  $("#daySearch").oninput=e=>{$("#dayList").innerHTML=dayListHTML(T,e.target.value);};
  $$("#dayList .daycard").forEach(c=>c.onclick=()=>openDay(c.dataset.k));
  $("#exD").onclick=()=>{const e=(S.days||{})[today];if(!e){toast("لسه مفيش مراجعة للنهاردة.");return;}dl("day-"+today+".md","# "+today+"\n\n"+entryMD(today,e));};
  $("#exM").onclick=()=>{const pre=today.slice(0,7);const es=dayEntries().filter(([k])=>k.startsWith(pre));if(!es.length){toast("مفيش أيام الشهر ده.");return;}dl("days-"+pre+".md","# "+pre+"\n\n"+es.map(([k,e])=>entryMD(k,e)).join("\n"));};
  $("#exA").onclick=()=>{dl("days-all.json",JSON.stringify(S.days||{},null,2));};
}
function dayListHTML(T,q){
  const es=dayEntries().filter(([k,e])=>!q||JSON.stringify(e).includes(q));
  if(!es.length)return`<div class="empty">مفيش أيام هنا لسه.</div>`;
  return es.map(([k,e])=>{const txt=(e.did||"").slice(0,90);
    return`<button class="daycard ${k===dayKey()?"today":""}" data-k="${k}"><span class="dk lat">${k===dayKey()?"TODAY · ":""}${k}</span><br>${esc(txt)}${txt.length>=90?"…":""}<span class="dtags">${(e.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}${e.mood?`<span>${esc(e.mood)}</span>`:""}</span></button>`;}).join("");
}
function openDay(k){
  const T=AR.day||{},e=(S.days||{})[k];if(!e)return;
  drawer(arDate(k,true),`<p><span class="micro">مزاج: ${esc(e.mood||"—")} · طاقة: ${esc(e.energy||"—")}</span></p>
  <p><b>${T.f_did}</b><br>${esc(e.did||"—")}</p><p><b>${T.f_learned}</b><br>${esc(e.learned||"—")}</p>
  <p><b>${T.f_blocked}</b><br>${esc(e.blocked||"—")}</p><p><b>${T.f_joy}</b><br>${esc(e.joy||"—")}</p>
  <p><b>${T.f_tomorrow}</b><br>${esc(e.tomorrow||"—")}</p>
  <p class="micro lat">${(e.tags||[]).join(" · ")}</p>
  <div class="row"><button class="btn small" id="dEdit">${T.edit||"عدّل"}</button><button class="btn small ghost" id="dDel">${T.del||"مسح"}</button></div><div id="dAsk"></div>`);
  $("#dEdit").onclick=()=>{S.dayDraft={date:k,fields:e,at:Date.now()};save();$("#drawer").classList.add("hidden");vDay($("#view"));observeRv();window.scrollTo(0,0);};
  $("#dDel").onclick=()=>{$("#dAsk").innerHTML=`<p>${T.delAsk}</p><div class="row"><button class="btn small" id="dYes">${T.del}</button><button class="btn small ghost" id="dNo">${T.cancel}</button></div>`;
    $("#dYes").onclick=()=>{delete S.days[k];save();$("#drawer").classList.add("hidden");vDay($("#view"));observeRv();};
    $("#dNo").onclick=()=>$("#dAsk").innerHTML="";};
}
function dayMonthHTML(T){
  const pre=dayKey().slice(0,7),es=dayEntries().filter(([k])=>k.startsWith(pre));
  const elapsed=new Date().getDate(),tags={},moods={};
  es.forEach(([,e])=>{(e.tags||[]).forEach(t=>tags[t]=(tags[t]||0)+1);if(e.mood)moods[e.mood]=(moods[e.mood]||0)+1;});
  const top=Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t).join(" · ")||"—";
  return`<p><b class="lat">${es.length}</b> أيام متسجلة · <b class="lat">${elapsed-es.length}</b> أيام فاتت من غير تسجيل</p><p class="micro">الأكتر: <span class="lat">${top}</span></p><p class="micro">المزاج: ${Object.entries(moods).map(([m,c])=>`${m} (${c})`).join(" · ")||"—"}</p><p class="micro">للتأمل — مش سكور إنتاجية.</p>`;
}
function dayWhispersHTML(T){
  const es=dayEntries();if(es.length<5)return`<div class="empty">${T.whisperNeed||""}</div>`;
  const out=[],KW={"الأدوات الجديدة":["أداة","ادوات","أدوات","tool"],"الاستكشاف":["استكشاف","بتشتت","ضيعت"],"العملا":["عميل","client"]};
  for(const[label,words]of Object.entries(KW)){const c=es.filter(([,e])=>words.some(w=>JSON.stringify(e).includes(w))).length;if(c>=3)out.push(`كتبت عن ${label} في ${c} أيام — ${T.maybe||""}.`);}
  const bn=es.filter(([,e])=>(e.tags||[]).includes("BUILD")&&(e.tags||[]).includes("NEXORA")).length;
  if(bn>=2)out.push(`أغلب الأيام اللي فيها BUILD مرتبطة بـ NEXORA (${bn}) — ${T.maybe||""}.`);
  if(!out.length)return`<div class="empty">لسه مفيش إشارات كافية — كمّل كتابة.</div>`;
  return out.map(o=>`<p>· ${o}</p>`).join("");
}
function vArchive(v){
  v.innerHTML=head("الأرشيف","مش كل حاجة لازم تكمل.",AR.archiveMsg)
  +`<table class="plain"><tr><th>العقدة</th><th>النوع</th><th>الحالة</th><th></th></tr>`
  +(D.projects||[]).map(p=>`<tr><th>${esc(p.name)}</th><td>مشروع</td><td>${esc(p.lifecycle)}</td><td><button class="linklike" data-ap="${p.id}">افتح</button></td></tr>`).join("")
  +(D.tools||[]).map(t=>`<tr><th>${esc(t.name)}</th><td>أداة</td><td>${esc(S["tool_"+t.id]||t.status)}</td><td></td></tr>`).join("")+`</table>`;
  $$("#view [data-ap]").forEach(b=>b.onclick=()=>openProject(b.dataset.ap));
}
