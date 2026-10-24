import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/noto-sans-malayalam/malayalam-400.css';
import '@fontsource/noto-sans-malayalam/malayalam-600.css';
import './style.css';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { initUI } from './ui.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis=reduced?null:new Lenis({duration:1.25,smoothWheel:true});
gsap.ticker.add(t=>lenis?.raf(t*1000));gsap.ticker.lagSmoothing(0);
const panels=[...document.querySelectorAll('.story-panel')];
const ids=panels.map(p=>p.id);
const names=['THE BEGINNING','THE FOUNDATION','THE POSSIBILITIES','THE COMMUNITY','THE NEXT GENERATION','YOUR NEXT CHAPTER'];
const nav=[...document.querySelectorAll('.chapter-nav a')];
let scene=null,current=-1,ready=false;
const maxScroll=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function update(){
 let progress=Math.max(0,Math.min(5,scrollY/maxScroll()*5));if(reduced)progress=Math.round(progress);
 const active=Math.round(progress);
 panels.forEach((panel,i)=>{const distance=progress-i,opacity=1-smoothstep(.19,.51,Math.abs(distance));panel.style.opacity=opacity;panel.style.transform=reduced?'none':`translate3d(0,${-distance*55}px,0)`;panel.classList.toggle('active',i===active);panel.inert=i!==active;panel.setAttribute('aria-hidden',String(i!==active))});
 if(active!==current){current=active;document.body.dataset.chapter=String(active);panels.forEach(p=>p.classList.remove('entering'));if(ready&&!reduced){panels[active].classList.add('entering');gsap.fromTo('#transition-flash',{opacity:.07},{opacity:0,duration:.8,overwrite:true})}document.getElementById('chapter-number').textContent='0'+active;document.getElementById('chapter-name').textContent=names[active];nav.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}
 document.querySelector('.progress-line i').style.width=progress/5*100+'%';
 scene?.setProgress(progress);document.body.style.setProperty('--story-progress',progress);
}
lenis?.on('scroll',update);addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
function goTo(index,{immediate=false}={}){const top=index/5*maxScroll();if(lenis)lenis.scrollTo(top,{immediate:immediate||reduced});else scrollTo({top,behavior:'instant'});history.replaceState(null,'','#'+ids[index]);if(immediate)update()}
const menu=document.getElementById('menu'),menuButton=document.getElementById('menu-button');
function setMenu(open){document.body.classList.toggle('menu-open',open);menu.inert=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');if(open){lenis?.stop();document.body.style.overflow='hidden';menu.querySelector('a').focus()}else{lenis?.start();document.body.style.overflow='';menuButton.focus()}}
menuButton.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
menu.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{if(document.body.classList.contains('menu-open'))setMenu(false)}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const i=ids.indexOf(a.hash.slice(1));if(i>=0){e.preventDefault();if(document.body.classList.contains('menu-open'))setMenu(false);goTo(i)}}));
addEventListener('keydown',e=>{if(document.body.classList.contains('menu-open')){if(e.key==='Escape')setMenu(false);if(e.key==='Tab'){const items=[menuButton,...menu.querySelectorAll('a,button')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}}return}if(document.querySelector('dialog[open]')||/INPUT|BUTTON/.test(e.target.tagName))return;if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();goTo(Math.min(5,current+1))}if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goTo(Math.max(0,current-1))}});
document.getElementById('restart').addEventListener('click',()=>goTo(0));
// The reference journey loops at the end; only an intentional further scroll restarts it.
let loopLocked=false;
addEventListener('wheel',e=>{if(reduced||loopLocked||document.querySelector('dialog[open]')||document.body.classList.contains('menu-open'))return;if(e.deltaY>25&&scrollY>=maxScroll()-2){loopLocked=true;goTo(0,{immediate:true});setTimeout(()=>loopLocked=false,1600)}},{passive:true});
let touchStart=0;
addEventListener('touchstart',e=>{touchStart=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{if(!reduced&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('menu-open')&&scrollY>=maxScroll()-2&&touchStart-e.changedTouches[0].clientY>75)goTo(0,{immediate:true})},{passive:true});
const translations=[...document.querySelectorAll('[data-en]')];let ml=false;
function setEcho(){document.querySelectorAll('.glitch').forEach(h=>{h.dataset.echo=h.innerText})}setEcho();
document.getElementById('language').addEventListener('click',e=>{ml=!ml;document.documentElement.lang=ml?'ml':'en';document.body.classList.toggle('ml',ml);translations.forEach(el=>{el.replaceChildren(...el.dataset[ml?'ml':'en'].split('\\n').flatMap((s,i)=>i?[document.createElement('br'),document.createTextNode(s)]:[document.createTextNode(s)]))});e.currentTarget.textContent=ml?'English':'മലയാളം';e.currentTarget.setAttribute('aria-label',ml?'Switch headings to English':'Switch headings to Malayalam');setEcho()});
initUI(lenis);
function loadProgress(p){document.getElementById('load-count').textContent=p+'%';document.querySelector('.loader-line i').style.width=p+'%'}
loadProgress(12);
try{
 const {createScene}=await import('./scene.js');loadProgress(45);
 scene=createScene(document.getElementById('scene'),{reduced,onReady:()=>loadProgress(85)});update();
}catch(error){document.body.classList.add('scene-unavailable');console.warn('3D scene unavailable. The accessible story and banking information remain available.');loadProgress(85)}
await document.fonts.ready;loadProgress(100);ready=true;document.getElementById('loader').classList.add('loaded');panels[current]?.classList.add('entering');
if(location.hash&&ids.includes(location.hash.slice(1)))goTo(ids.indexOf(location.hash.slice(1)),{immediate:true});
addEventListener('pagehide',()=>{scene?.dispose();lenis?.destroy()},{once:true});
