import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/noto-sans-malayalam/malayalam-400.css';
import '@fontsource/noto-sans-malayalam/malayalam-600.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = reduced ? null : new Lenis({ duration: 1.15, smoothWheel: true });
lenis?.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis?.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.getElementById('year').textContent = new Date().getFullYear();

// One continuous scene: a savings seed, a growing sprout, and orbital ripples.
const mount = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: devicePixelRatio < 2, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.AmbientLight(0xd8efb0, 1.3));
  const key = new THREE.DirectionalLight(0xffe9aa, 3); key.position.set(-3, 6, 6); scene.add(key);
  const rim = new THREE.PointLight(0xc8fc9b, 28); rim.position.set(3, 2, 3); scene.add(rim);
  const warm = new THREE.PointLight(0xc28a37, 18); warm.position.set(-3, -2, 2); scene.add(warm);
  const object = new THREE.Group(); scene.add(object);
  const gold = new THREE.MeshStandardMaterial({ color: 0xccad60, metalness: .78, roughness: .27 });
  const goldEdge = new THREE.MeshStandardMaterial({ color: 0xe7ca78, metalness: .65, roughness: .25 });
  const coinGroup = new THREE.Group(); object.add(coinGroup);
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.23, 1.23, .18, 96), gold);
  coin.rotation.x = Math.PI / 2; coinGroup.add(coin);
  for (const z of [-.105,.105]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.12, .025, 12, 100), goldEdge);
    ring.position.z = z; coinGroup.add(ring);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(.98,.006,6,100),goldEdge);inner.position.z=z;coinGroup.add(inner);
  }
  for(let i=0;i<80;i++) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(.012,.075,.185),goldEdge);
    const a=i/80*Math.PI*2; ridge.position.set(Math.cos(a)*1.224,Math.sin(a)*1.224,0);ridge.rotation.z=a-Math.PI/2;coinGroup.add(ridge);
  }
  const coinCanvas = document.createElement('canvas');coinCanvas.width=512;coinCanvas.height=512;
  const ctx=coinCanvas.getContext('2d');
  ctx.clearRect(0,0,512,512);ctx.fillStyle='#f2da93';ctx.textAlign='center';ctx.font='200 215px Georgia';ctx.fillText('₹',256,310);ctx.font='18px sans-serif';ctx.fillText('G R O W   T O G E T H E R',256,390);ctx.font='17px sans-serif';ctx.fillText('K S C B   ·   3 5 4',256,125);
  const coinTexture=new THREE.CanvasTexture(coinCanvas);coinTexture.colorSpace=THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.85,1.85),new THREE.MeshStandardMaterial({map:coinTexture,transparent:true,metalness:.5,roughness:.5,depthWrite:false}));face.position.z=.112;coinGroup.add(face);
  coinGroup.rotation.set(-.18,-.4,-.18);
  const sprout = new THREE.Group();sprout.position.set(0,1.08,0);object.add(sprout);
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(-.08,.55,0),new THREE.Vector3(.08,1.12,0),new THREE.Vector3(.02,1.75,0)]);
  sprout.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve,35,.027,8,false),new THREE.MeshStandardMaterial({color:0xadc86b,roughness:.6})));
  const leafMaterial = new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uTime:{value:0},uColor:{value:new THREE.Color('#b4ce72')}},vertexShader:`varying vec2 vUv; varying vec3 vNormal; uniform float uTime; void main(){vUv=uv;vNormal=normalMatrix*normal;vec3 p=position;p.z+=sin(uTime*1.3+p.x*2.5)*.065*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv; varying vec3 vNormal; uniform vec3 uColor; void main(){float vein=pow(max(0.,1.-abs(vUv.x-.5)*35.),3.);float ribs=pow(max(0.,sin((vUv.y-abs(vUv.x-.5)*.7)*95.)),14.)*.09;vec3 col=mix(uColor*.35,uColor,smoothstep(0.,1.,vUv.y));col+=vein*.13+ribs;float light=.65+abs(dot(normalize(vNormal),normalize(vec3(-.5,1.,1.))))*.4;gl_FragColor=vec4(col*light,1.);}`});
  function addLeaf(x,y,angle,scale){
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.6,.35,-.5,1.05,0,1.5);shape.bezierCurveTo(.5,1.05,.6,.35,0,0);
    const geometry=new THREE.ShapeGeometry(shape,24);const pos=geometry.attributes.position;
    for(let i=0;i<pos.count;i++){const vx=pos.getX(i),vy=pos.getY(i);pos.setZ(i,Math.sin(vy*1.7)*.15-Math.abs(vx)*.3)}geometry.computeVertexNormals();
    const leaf=new THREE.Mesh(geometry,leafMaterial);leaf.position.set(x,y,.02);leaf.rotation.set(.15,angle>0?-.4:.4,angle);leaf.scale.setScalar(scale);sprout.add(leaf);
    const vein=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,.01),new THREE.Vector3(0,.7,.15),new THREE.Vector3(0,1.48,.08)]),20,.006,4,false),new THREE.MeshBasicMaterial({color:0xd3e49a}));leaf.add(vein);
  }
  addLeaf(.02,.65,-.85,.85);addLeaf(.03,1.07,.9,.65);addLeaf(.02,1.5,-.35,.43);
  const orbitMaterial=new THREE.MeshBasicMaterial({color:0xb8ce80,transparent:true,opacity:.22});
  const orbits=new THREE.Group();object.add(orbits);
  for(let i=0;i<3;i++){const o=new THREE.Mesh(new THREE.TorusGeometry(1.7+i*.32,.005,4,150),orbitMaterial);o.rotation.set(1.1+i*.17,.2+i*.2,-.3);o.position.y=-.1;orbits.add(o)}
  const particleGeo=new THREE.BufferGeometry();const pts=new Float32Array(100*3);for(let i=0;i<pts.length;i+=3){pts[i]=(Math.random()-.5)*13;pts[i+1]=(Math.random()-.5)*9;pts[i+2]=(Math.random()-.5)*5-2}particleGeo.setAttribute('position',new THREE.BufferAttribute(pts,3));
  const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xe4d79b,size:.018,transparent:true,opacity:.5}));scene.add(particles);
  const journey=document.getElementById('journey');
  const companions=new THREE.Group();scene.add(companions);
  for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.05,32),gold);c.rotation.x=Math.PI/2;const a=i/8*Math.PI*2;c.position.set(Math.cos(a)*2.1,Math.sin(a)*1.85,Math.sin(a)*.5);companions.add(c)}
  companions.visible=false;
  let w=innerWidth,h=innerHeight,scroll=0,mx=0,my=0,journeyProgress=-1,journeyStart=0;const clock=new THREE.Clock();
  function resize(){w=innerWidth;h=innerHeight;journeyStart=journey.getBoundingClientRect().top+window.scrollY;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();object.position.set(w<650?1.0:2.05,w<650?-.15:-.4,0);object.scale.setScalar(w<650?.62:.85)}resize();addEventListener('resize',resize);
  addEventListener('pointermove',e=>{mx=(e.clientX/w-.5)*.16;my=(e.clientY/h-.5)*.12},{passive:true});
  function updateJourney(){scroll=window.scrollY/h;journeyStart=journey.getBoundingClientRect().top+window.scrollY;journeyProgress=(window.scrollY-journeyStart)/(journey.offsetHeight-h);const inJourney=!reduced&&window.scrollY>journeyStart-h&&window.scrollY<journeyStart+journey.offsetHeight;let opacity=Math.max(0,1-scroll*1.15);if(inJourney){opacity=Math.min(1,(window.scrollY-journeyStart+h)/h,(journeyStart+journey.offsetHeight-window.scrollY)/h)}mount.style.opacity=String(Math.max(0,opacity));const p=Math.max(0,Math.min(1,journeyProgress));const step=Math.min(2,Math.floor(p*3));journey.classList.toggle('active-step-1',step===1);journey.classList.toggle('active-step-2',step===2);document.getElementById('journey-count').textContent='0'+(step+1);document.querySelector('.journey-meter b').style.width=(p*100)+'%';}
  addEventListener('scroll',updateJourney,{passive:true});updateJourney();
  let frame;
  function render(){
    frame=requestAnimationFrame(render);
    const inJourney=!reduced&&journeyProgress>-.5&&journeyProgress<1.5;
    if(document.hidden||(scroll>1.1&&!inJourney))return;
    const t=clock.getElapsedTime(),p=Math.max(0,Math.min(1,journeyProgress));
    leafMaterial.uniforms.uTime.value=reduced?0:t;
    const baseScale=w<650?.62:.85;
    if(inJourney){
      camera.position.z=10-Math.sin(p*Math.PI)*2;
      object.position.set(w<650?.7:2.1,w<650?1.05:-.5,0);
      object.scale.setScalar(baseScale*(w<650?.8:1));
      coinGroup.rotation.set(-.18+p*.4,-.4+p*Math.PI*2,-.18+p*.3);
      sprout.scale.setScalar(.15+Math.min(1,p*1.8));
      companions.visible=p>.6;companions.position.copy(object.position);
      companions.scale.setScalar(Math.max(.01,(p-.6)*2.5));companions.rotation.z=t*.05;
      orbits.scale.setScalar(1+p*.35);
    }else{
      camera.position.z=10;object.position.set(w<650?1.0:2.05,(w<650?-.15:-.4)+(reduced?0:Math.sin(t*.6)*.045)+Math.min(scroll,1)*.5,0);
      object.scale.setScalar(baseScale);coinGroup.rotation.set(-.18,-.4+(reduced?0:Math.sin(t*.3)*.13)+Math.min(scroll,1)*.6,-.18);
      sprout.scale.setScalar(1);orbits.scale.setScalar(1);companions.visible=false;
    }
    object.rotation.y+=(mx-object.rotation.y)*.025;object.rotation.x+=(-my-object.rotation.x)*.025;
    orbits.rotation.y=reduced?0:t*.04;particles.rotation.z=reduced?0:t*.006;renderer.render(scene,camera);
  }render();
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);renderer.dispose()},{once:true});
} catch(e) { mount.classList.add('scene-fallback'); mount.innerHTML='<div class="fallback-sprout">✳</div>';addEventListener('scroll',()=>{mount.style.opacity=String(Math.max(0,1-scrollY/innerHeight*1.15))},{passive:true}); }

if(!reduced){
  gsap.from('.hero-title h1>span',{y:55,opacity:0,duration:1.3,stagger:.13,ease:'power3.out',delay:.15});
  gsap.from('.hero-top,.hero-bottom',{opacity:0,duration:1.3,delay:.5});
  gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.9,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
}
const chapterLinks=[...document.querySelectorAll('.chapter-nav a')];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){chapterLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}})},{rootMargin:'-30% 0px -50% 0px'});document.querySelectorAll('.chapter').forEach(s=>observer.observe(s));
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress-line').style.width=(max>0?scrollY/max*100:0)+'%'},{passive:true});

const menu=document.getElementById('menu'),menuButton=document.getElementById('menu-button');
function setMenu(open){document.body.classList.toggle('menu-open',open);menu.inert=!open;menuButton.setAttribute('aria-expanded',String(open));if(open){lenis?.stop();document.body.style.overflow='hidden';menu.querySelector('a').focus();}else{lenis?.start();document.body.style.overflow='';menuButton.focus();}}
menuButton.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('menu-open'))return;if(e.key==='Escape')setMenu(false);if(e.key==='Tab'){const items=[menuButton,...menu.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}}});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.hash);if(target&&lenis){e.preventDefault();lenis.scrollTo(target,{offset:-20});history.replaceState(null,'',a.hash)}}));
const originalHeadings=new Map([...document.querySelectorAll('[data-en]')].map(el=>[el,el.innerHTML]));
let ml=false;document.getElementById('language').addEventListener('click',e=>{ml=!ml;document.documentElement.lang=ml?'ml':'en';document.body.classList.toggle('ml',ml);document.querySelectorAll('[data-en]').forEach(el=>{if(!ml){el.innerHTML=originalHeadings.get(el);return}const value=el.dataset.ml;el.replaceChildren(...value.split('\\n').flatMap((text,i)=>i?[document.createElement('br'),document.createTextNode(text)]:[document.createTextNode(text)]));});e.currentTarget.textContent=ml?'English':'മലയാളം';e.currentTarget.setAttribute('aria-label',ml?'Switch language to English':'Switch language to Malayalam');ScrollTrigger.refresh()});

const branches={head:{title:'Head Office',address:'Ayankavu, Kuthukuzhi P.O.<br>Kothamangalam, Kerala',phone:'04852862496',display:'0485–2862496',query:'Kuthukuzhi Service Cooperative Bank Ayankavu'},kozhi:{title:'Kozhippilly Branch',address:'Bypass Junction, Kozhippilly<br>Kothamangalam, Kerala',phone:'04852861496',display:'0485–2861496',query:'Kuthukuzhi Service Cooperative Bank Kozhippilly'},kuthu:{title:'Kuthukuzhi Branch',address:'Near KSEB Office, Kuthukuzhi<br>Kothamangalam, Kerala',phone:'04852861795',display:'0485–2861795',query:'Kuthukuzhi Service Cooperative Bank KSEB Kuthukuzhi'}};
const tabs=[...document.querySelectorAll('[data-branch]')];
function selectBranch(b){tabs.forEach(t=>{const active=t===b;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});const data=branches[b.dataset.branch],panel=document.getElementById('branch-info');panel.setAttribute('aria-labelledby',b.id);panel.querySelector('h3').textContent=data.title;panel.querySelector('p').innerHTML=data.address;const phone=panel.querySelector('.branch-phone');phone.href='tel:'+data.phone;phone.textContent=data.display+' ↗';panel.querySelector('.text-link').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(data.query);decorateArrows(panel)}
tabs.forEach((b,i)=>{b.tabIndex=i===0?0:-1;b.addEventListener('click',()=>selectBranch(b));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectBranch(tabs[next]);tabs[next].focus()}})});

const dialog=document.getElementById('details'),content=document.getElementById('dialog-content');
const note='<p class="fine-print">Source: bank brochure supplied for this website. Rates and terms may change. Confirm current availability, eligibility and applicable charges directly with the bank.</p>';
const contact='<a class="text-link" href="tel:04852862496">TALK TO YOUR BANK ↗</a>';
const serviceContent={
 deposits:`<span class="eyebrow">01 / SAVE & GROW</span><h2>Good things<br>grow with time.</h2><p>Fixed deposit rates listed in the supplied bank brochure.</p><table><thead><tr><th>Deposit term</th><th>Annual rate</th></tr></thead><tbody>${[['15–45 days','6.25%'],['46–90 days','6.75%'],['91–179 days','7.00%'],['180–364 days','7.75%'],['1–2 years','8.00%'],['Above 2 years','8.10%']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table><p>Brochure benefit for senior citizens: an additional 0.50% interest.</p>${note}${contact}`,
 loans:`<span class="eyebrow">02 / BORROW WITH CONFIDENCE</span><h2>Room for your<br>next big thing.</h2><ul class="loan-list"><li><span>Gold loan</span><b>Up to ₹25 lakh</b></li><li><span>Agricultural loan<br><small>Brochure rate: 6%</small></span><b>Up to ₹3 lakh</b></li><li><span>Business loan<br><small>Up to 3 years</small></span><b>Up to ₹5 lakh</b></li><li><span>Vehicle loan<br><small>Up to 5 years</small></span><b>Up to ₹10 lakh</b></li><li><span>Long-term loan<br><small>Up to 10 years</small></span><b>Up to ₹10 lakh</b></li></ul>${note}${contact}`,
 calculator:`<span class="eyebrow">03 / MAKE A PLAN</span><h2>A clearer picture<br>of tomorrow.</h2><p>Explore an illustrative monthly repayment. This is an estimate, not a loan offer.</p><label for="amount">Loan amount <output id="amount-value"></output></label><input id="amount" type="range" min="10000" max="2500000" step="10000" value="300000"><label for="rate">Annual interest rate <output id="rate-value"></output></label><input id="rate" type="range" min="1" max="20" step="0.25" value="10"><label for="tenure">Repayment period <output id="tenure-value"></output></label><input id="tenure" type="range" min="1" max="10" step="1" value="5"><div class="emi-result" aria-live="polite"><span>Estimated monthly EMI</span><b id="emi"></b></div><p class="fine-print" id="total"></p><p class="fine-print">Reducing-balance estimate, excluding fees and charges. Choose your own rate; the default is illustrative and is not a published bank rate.</p>${contact}`,
 care:`<span class="eyebrow">CARE / CLOSE TO HOME</span><h2>A community<br>that cares.</h2><h3>Palliative care</h3><p>Contact the bank's palliative care service to enquire about available support.</p><a class="text-link" href="tel:9446572496">94465 72496 ↗</a><h3>Neethi Medical Store</h3><p>Bypass Junction, Kozhippilly.</p><a class="text-link" href="tel:7306648713">73066 48713 ↗</a>`,
 spaces:`<span class="eyebrow">SPACES / BRING PEOPLE TOGETHER</span><h2>Life's moments.<br>A place to share.</h2><ul class="loan-list"><li><span>Air-conditioned auditorium</span><b>300 seats</b></li><li><span>Sarga auditorium</span><b>100 seats</b></li><li><span>A/C conference hall</span><b>LCD projector</b></li></ul><p>Enquire about availability, facilities and booking charges with the head office.</p>${contact}`,
 transfers:`<span class="eyebrow">SERVICES / STAY CONNECTED</span><h2>Your world.<br>A little closer.</h2><p>The supplied brochure lists core banking, locker facilities at head office and branches, RTGS / NEFT, and Western Union money transfer.</p><p>Contact your nearest branch to check current availability, documentation and transaction limits.</p>${contact}`
};
document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{content.innerHTML=serviceContent[b.dataset.service];decorateArrows(content);dialog.showModal();lenis?.stop();document.body.style.overflow='hidden';if(b.dataset.service==='calculator')initCalculator()}));
function closeDialog(){dialog.close()}
dialog.querySelector('.close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});
dialog.addEventListener('close',()=>{lenis?.start();document.body.style.overflow=''});
function initCalculator(){const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);function update(){const p=Number(document.getElementById('amount').value),rate=Number(document.getElementById('rate').value),years=Number(document.getElementById('tenure').value),r=rate/1200,n=years*12,emi=p*r/(1-Math.pow(1+r,-n));document.getElementById('amount-value').textContent=money(p);document.getElementById('rate-value').textContent=rate+'%';document.getElementById('tenure-value').textContent=years+(years===1?' year':' years');document.getElementById('emi').textContent=money(emi);document.getElementById('total').textContent='Total repayment: '+money(emi*n)+' · Total interest: '+money(emi*n-p)}content.querySelectorAll('input').forEach(i=>i.addEventListener('input',update));update()}

let audioCtx,gain,audioOn=false;
document.getElementById('sound').addEventListener('click',async e=>{const button=e.currentTarget;try{if(!audioCtx){audioCtx=new AudioContext();gain=audioCtx.createGain();gain.gain.value=0;gain.connect(audioCtx.destination);[130.81,196,261.63].forEach((f,i)=>{const osc=audioCtx.createOscillator(),g=audioCtx.createGain();osc.type='sine';osc.frequency.value=f;g.gain.value=.018/(i+1);osc.connect(g);g.connect(gain);osc.start()})}await audioCtx.resume();audioOn=!audioOn;gain.gain.setTargetAtTime(audioOn?1:0,audioCtx.currentTime,.5);button.innerHTML='<span>▂ ▅ ▃ ▇</span> SOUND '+(audioOn?'ON':'OFF');button.setAttribute('aria-pressed',String(audioOn));button.setAttribute('aria-label',audioOn?'Disable ambient sound':'Enable ambient sound')}catch{button.textContent='SOUND UNAVAILABLE'}});
document.addEventListener('visibilitychange',()=>{if(audioCtx){if(document.hidden)audioCtx.suspend();else if(audioOn)audioCtx.resume()}});

// Render directional controls as vectors so they do not depend on OS symbol fonts.
function decorateArrows(root=document.body){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode()){if(/[↗↘↑]/.test(walker.currentNode.textContent)&&!['SCRIPT','STYLE'].includes(walker.currentNode.parentElement.tagName))nodes.push(walker.currentNode)}
 nodes.forEach(node=>{const frag=document.createDocumentFragment();node.textContent.split(/([↗↘↑])/).forEach(part=>{if(/[↗↘↑]/.test(part)){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','arrow-icon');svg.setAttribute('aria-hidden','true');svg.style.transform=part==='↘'?'rotate(90deg)':part==='↑'?'rotate(-45deg)':'';const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 19 19 5M5 5h14v14');svg.append(path);frag.append(svg)}else frag.append(document.createTextNode(part))});node.replaceWith(frag)})
}
decorateArrows();
