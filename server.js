const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const FILES={'/':['index.html','text/html; charset=utf-8'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/sw.js':['sw.js','text/javascript'],'/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png'],'/icon-maskable.png':['icon-maskable.png','image/png']};
const server=http.createServer((q,r)=>{const f=FILES[q.url.split('?')[0]]||FILES['/'];r.writeHead(200,{'Content-Type':f[1],'Cache-Control':'no-cache'});r.end(fs.readFileSync(path.join(__dirname,f[0])));});
const wss=new WebSocketServer({server});
const rooms={};
// نقاط: [صح بدون مساعدة, صح مع مساعدة, خطأ بدون مساعدة, خطأ مع مساعدة]
const PTS={'سهل':[1,0,-1,-2],'متوسط':[1,0,-1,-2],'صعب':[3,1,-1,-2]};
const norm=s=>(s||'').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim().toLowerCase();
const rid=()=>Math.random().toString(36).slice(2,10);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function parse(text){let cat='';const out=[];
  for(let line of(text||'').split('\n')){line=line.trim();if(!line)continue;
    if(line[0]==='#'){cat=line.replace(/^#+\s*/,'');continue;}
    const p=line.split('|').map(s=>s.trim()).filter(Boolean);
    const o={q:p[0],cat,hint:'',opts:[],ans:'',diff:'متوسط'};
    p.slice(1).forEach(x=>{const m=x.match(/^(تلميح|تلميحة|خيارات|الخيارات|إجابة|الإجابة|اجابة|الاجابة|جواب|الجواب|صعوبة)\s*[:：]\s*(.*)$/);if(!m)return;
      const k=m[1],v=m[2];
      if(/جواب|جابة/.test(k))o.ans=v;else if(/خيارات/.test(k))o.opts=v.split(/[،,؛;]/).map(s=>s.trim()).filter(Boolean);
      else if(k==='صعوبة'){if(PTS[v])o.diff=v;}else o.hint=v;});
    out.push(o);}
  return out;}
const send=(ws,o)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));};
function view(R,pid){const c=R.cur,b=R.buzzer,live=R.phase!=='lobby'&&R.phase!=='ended';
  return{type:'state',code:R.code,me:pid,host:R.host,phase:R.phase,msg:R.msg,n:R.n,nq:R.qs.length,
    players:R.order.map(i=>{const p=R.players[i];return{id:i,name:p.name,score:p.score,helps:p.helps,ready:p.ready,on:!!p.ws,spec:p.spec,tried:R.tried.has(i)};}),
    q:c&&live?{text:c.q,cat:c.cat,diff:c.diff,hasHint:!!c.hint,hasOpts:c.opts.length>0}:null,
    buzzer:b,left:R.deadline?Math.max(0,R.deadline-Date.now()):0,help:R.help,said:R.said,
    hint:pid===b&&R.help==='hint'?c.hint:null,opts:pid===b&&R.help==='opts'?c.opts:null,
    reveal:R.reveal,voted:!!(R.votes&&pid in R.votes),qtext:pid===R.host?R.qtext:undefined};}
const bc=R=>R.order.forEach(i=>send(R.players[i].ws,view(R,i)));
function addPlayer(R,name,ws){const id=rid();R.players[id]={name:name.slice(0,14)||'لاعب',score:0,helps:3,ready:false,ws,spec:R.phase!=='lobby'&&R.phase!=='ended'};R.order.push(id);return id;}
function end(R,why){clearTimeout(R.timer);R.deadline=0;R.phase='ended';R.buzzer=null;
  const top=R.order.filter(i=>!R.players[i].left).sort((a,b)=>R.players[b].score-R.players[a].score)[0];
  R.msg=why||('🏆 الفائز: '+(top?R.players[top].name:''));bc(R);}
function nextQ(R){if(!R.pool.length)return end(R,'انتهت الأسئلة');
  R.cur=R.pool.pop();R.n++;R.phase='question';R.tried=new Set();R.buzzer=null;R.help=null;R.reveal='';R.said='';R.msg='';R.votes=null;R.deadline=0;bc(R);}
const eligible=R=>R.order.filter(i=>{const p=R.players[i];return!p.spec&&!p.left;});
function finish(R,ok,why){clearTimeout(R.timer);R.deadline=0;
  const p=R.players[R.buzzer],d=PTS[R.cur.diff],h=!!R.help,delta=ok?(h?d[1]:d[0]):(h?d[3]:d[2]);p.score+=delta;
  R.msg=p.name+(ok?' ✅ إجابة صحيحة ':' ❌ '+(why||'إجابة خاطئة')+' ')+'('+(delta>0?'+':'')+delta+')';
  R.tried.add(R.buzzer);R.buzzer=null;R.help=null;R.votes=null;
  if(ok&&R.order.some(i=>R.players[i].score>=10))return end(R);
  const open=eligible(R).filter(i=>!R.tried.has(i)&&R.players[i].ws);
  if(ok||!open.length){R.phase='result';R.reveal=R.cur.ans||'';}else R.phase='question';
  bc(R);}
function tally(R){const el=eligible(R).filter(i=>i!==R.buzzer&&R.players[i].ws);
  if(!el.length)return finish(R,false,'ما في مصوّتين');
  if(!el.every(i=>i in R.votes))return bc(R);
  const y=el.filter(i=>R.votes[i]).length,n=el.length-y;
  finish(R,y>n,y===n?'تعادل بالتصويت، تُحسب خاطئة':'');}
function leave(R,pid){const p=R.players[pid];if(!p)return;p.ws=null;
  if(R.phase==='lobby'||R.phase==='ended'){delete R.players[pid];R.order=R.order.filter(i=>i!==pid);}else p.left=true;
  if(R.host===pid){const h=R.order.find(i=>R.players[i]&&R.players[i].ws);if(h)R.host=h;}
  if(!R.order.some(i=>R.players[i].ws)){setTimeout(()=>{if(!R.order.some(i=>R.players[i]&&R.players[i].ws))delete rooms[R.code];},600000);}
  if(R.phase==='judging'&&R.votes)tally(R);else bc(R);}
wss.on('connection',ws=>{
  ws.on('message',raw=>{let m;try{m=JSON.parse(raw);}catch(e){return;}
    if(m.t==='ping')return;
    if(m.t==='create'){let c;do c=String(1000+Math.floor(Math.random()*9000));while(rooms[c]);
      const R=rooms[c]={code:c,host:'',players:{},order:[],phase:'lobby',qs:[],pool:[],cur:null,buzzer:null,tried:new Set(),help:null,deadline:0,votes:null,msg:'',reveal:'',said:'',n:0,qtext:''};
      const id=addPlayer(R,m.name||'',ws);R.host=id;R.players[id].ready=true;ws.code=c;ws.pid=id;send(ws,{type:'joined',pid:id,code:c});return bc(R);}
    if(m.t==='join'){const R=rooms[m.code];if(!R)return send(ws,{type:'error',msg:'الغرفة غير موجودة',fatal:true});
      let id=m.pid;
      if(id&&R.players[id]){const p=R.players[id];if(p.ws&&p.ws!==ws)try{p.ws.close();}catch(e){}p.ws=ws;p.left=false;clearTimeout(p.grace);}
      else{if(eligible(R).length>=10)return send(ws,{type:'error',msg:'الغرفة ممتلئة (10 لاعبين)',fatal:true});id=addPlayer(R,m.name||'',ws);}
      ws.code=R.code;ws.pid=id;send(ws,{type:'joined',pid:id,code:R.code});return bc(R);}
    const R=rooms[ws.code],P=R&&R.players[ws.pid];if(!P)return;const isH=ws.pid===R.host;
    switch(m.t){
      case'ready':if(R.phase==='lobby'){P.ready=!P.ready;bc(R);}break;
      case'qs':if(isH&&R.phase==='lobby'){R.qtext=String(m.text||'').slice(0,60000);R.qs=parse(R.qtext);bc(R);}break;
      case'start':if(!isH||R.phase!=='lobby')break;
        {R.qs=parse(R.qtext);const pl=eligible(R);
        if(pl.length<2)return send(ws,{type:'error',msg:'لازم لاعبين اثنين على الأقل'});
        if(!R.qs.length)return send(ws,{type:'error',msg:'أضف أسئلة أولاً'});
        if(pl.some(i=>!R.players[i].ready))return send(ws,{type:'error',msg:'لازم الكل يضغط «جاهز»'});
        pl.forEach(i=>{R.players[i].score=0;R.players[i].helps=3;});R.pool=shuffle(R.qs);R.n=0;nextQ(R);}break;
      case'buzz':if(R.phase==='question'&&!P.spec&&!P.left&&!R.tried.has(ws.pid)){R.buzzer=ws.pid;R.phase='answering';R.help=null;R.deadline=Date.now()+15000;
        R.timer=setTimeout(()=>{if(R.phase==='answering')finish(R,false,'انتهى الوقت');},15000);bc(R);}break;
      case'help':if(R.phase==='answering'&&R.buzzer===ws.pid&&!R.help&&P.helps>0){
        if(m.k==='hint'&&R.cur.hint)R.help='hint';else if(m.k==='opts'&&R.cur.opts.length)R.help='opts';else break;P.helps--;bc(R);}break;
      case'answer':if(R.phase==='answering'&&R.buzzer===ws.pid){R.said=String(m.text||'').slice(0,100);
        if(R.cur.ans){const ok=R.cur.ans.split(/[\/؛;]/).some(a=>norm(a)&&norm(a)===norm(R.said));finish(R,ok);}
        else{clearTimeout(R.timer);R.deadline=0;R.phase='judging';R.votes={};bc(R);tally(R);}}break;
      case'vote':if(R.phase==='judging'&&ws.pid!==R.buzzer&&!P.spec&&!(ws.pid in R.votes)){R.votes[ws.pid]=!!m.ok;tally(R);}break;
      case'next':if(isH&&(R.phase==='result'||R.phase==='question'))nextQ(R);break;
      case'again':if(isH&&R.phase==='ended'){R.phase='lobby';R.msg='';R.cur=null;R.order.forEach(i=>{const p=R.players[i];p.score=0;p.helps=3;p.spec=false;p.ready=i===R.host;});bc(R);}break;
      case'leave':leave(R,ws.pid);ws.code=null;break;}
  });
  ws.on('close',()=>{const R=rooms[ws.code],P=R&&R.players[ws.pid];if(!P||P.ws!==ws)return;P.ws=null;bc(R);
    P.grace=setTimeout(()=>{if(!P.ws)leave(R,ws.pid);},30000);});
});
server.listen(process.env.PORT||3000,()=>console.log('running'));
