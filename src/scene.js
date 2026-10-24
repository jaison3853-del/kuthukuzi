import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const mix=THREE.MathUtils.lerp;
const ease=t=>t*t*(3-2*t);
const smoothTransition=d=>THREE.MathUtils.smoothstep(d,.25,1.15);

export function createScene(mount,{reduced=false,onReady=()=>{}}={}){
 let needsFrame=true;
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
 renderer.setClearColor(0x071e29);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 renderer.outputColorSpace=THREE.SRGBColorSpace;mount.append(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x123543,.045);
 const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.1,150);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.AmbientLight(0x8eb7c9,.4));
 const key=new THREE.DirectionalLight(0xd5e9dc,1.35);key.position.set(-4,7,5);scene.add(key);
 const light=new THREE.PointLight(0x9adbf4,36,22,2);scene.add(light);
 const goldLight=new THREE.PointLight(0xffd58b,34,15,2);scene.add(goldLight);
 const worlds=[];for(let i=0;i<6;i++){const g=new THREE.Group();g.position.x=i*16;scene.add(g);worlds.push(g)}
 const gold=new THREE.MeshStandardMaterial({color:0xbda05a,metalness:.88,roughness:.28,envMapIntensity:.8});
 const darkGold=new THREE.MeshStandardMaterial({color:0x837342,metalness:.75,roughness:.38});
 const teal=new THREE.MeshStandardMaterial({color:0x538d87,metalness:.65,roughness:.4});
 const luminous=new THREE.MeshStandardMaterial({color:0xe0ce88,emissive:0xbba55a,emissiveIntensity:.8,metalness:.7,roughness:.3});
 const lineMaterial=new THREE.MeshBasicMaterial({color:0x77bac4,transparent:true,opacity:.28});
 const warmLine=new THREE.MeshStandardMaterial({color:0xbba16b,emissive:0x8e7540,emissiveIntensity:.25,metalness:.7,roughness:.35});
 const matrix=new THREE.Matrix4();const dummy=new THREE.Object3D();
 const leafUniforms={uTime:{value:0}};
 const leafCanvas=document.createElement('canvas');leafCanvas.width=256;leafCanvas.height=512;const lctx=leafCanvas.getContext('2d');const lg=lctx.createLinearGradient(0,512,0,0);lg.addColorStop(0,'#163d31');lg.addColorStop(.55,'#3b6551');lg.addColorStop(1,'#6a8061');lctx.fillStyle=lg;lctx.fillRect(0,0,256,512);for(let i=0;i<2500;i++){lctx.fillStyle=Math.random()>.5?'#94ad7620':'#092e2e20';lctx.fillRect(Math.random()*256,Math.random()*512,1,2)}for(let y=0;y<512;y+=16){lctx.strokeStyle='#a5b08722';lctx.lineWidth=1;lctx.beginPath();lctx.moveTo(128,y);lctx.lineTo(0,y-90);lctx.moveTo(128,y);lctx.lineTo(256,y-90);lctx.stroke()}const leafTexture=new THREE.CanvasTexture(leafCanvas);leafTexture.colorSpace=THREE.SRGBColorSpace;
 const leafMaterial=new THREE.MeshStandardMaterial({color:0xa4bba3,map:leafTexture,metalness:.16,roughness:.5,side:THREE.DoubleSide});
 leafMaterial.onBeforeCompile=shader=>{shader.uniforms.uTime=leafUniforms.uTime;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(uTime * .7 + position.y * 2.2) * .035 * position.y;')};
 function tube(points,radius,material=warmLine,segments=40){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),segments,radius,5,false),material)}
 function coin(radius=1,front=true){
  const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,.13,80),gold);body.rotation.x=Math.PI/2;g.add(body);
  for(const z of [-.074,.074]){const rim=new THREE.Mesh(new THREE.TorusGeometry(radius*.93,.015,8,100),darkGold);rim.position.z=z;g.add(rim);const inner=new THREE.Mesh(new THREE.TorusGeometry(radius*.86,.006,6,100),gold);inner.position.z=z;g.add(inner)}
  const ridges=new THREE.InstancedMesh(new THREE.BoxGeometry(.009,.05,.135),darkGold,72);
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2;dummy.position.set(Math.cos(a)*radius,Math.sin(a)*radius,0);dummy.rotation.set(0,0,a-Math.PI/2);dummy.scale.set(1,1,1);dummy.updateMatrix();ridges.setMatrixAt(i,dummy.matrix)}g.add(ridges);
  if(front){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');c.textAlign='center';c.fillStyle='#e6d59c';c.font='190px Georgia';c.fillText('₹',256,315);c.font='bold 21px sans-serif';c.fillText('K S C B  ·  3 5 4',256,132);c.font='17px sans-serif';c.fillText('T R U S T  ·  T O G E T H E R',256,395);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const face=new THREE.Mesh(new THREE.PlaneGeometry(radius*1.67,radius*1.67),new THREE.MeshStandardMaterial({map:tex,transparent:true,metalness:.65,roughness:.4,depthWrite:false}));face.position.z=.078;g.add(face)}
  return g;
 }
 function leaf(scale,angle,y,z,parent){
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.5,.38,-.37,1.2,0,1.8);shape.bezierCurveTo(.3,1.1,.49,.4,0,0);
  const geo=new THREE.ShapeGeometry(shape,28),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),v=pos.getY(i);geo.attributes.uv.setXY(i,(x+.45)/.9,v/1.8);pos.setZ(i,Math.sin(v*1.5)*.24-Math.abs(x)*.55)}geo.computeVertexNormals();
  const l=new THREE.Mesh(geo,leafMaterial);l.scale.setScalar(scale);l.rotation.set(.1,angle*.3,angle);l.position.set(0,y,z);parent.add(l);
  l.add(tube([new THREE.Vector3(0,0,.01),new THREE.Vector3(0,.8,.23),new THREE.Vector3(0,1.78,.1)],.007,teal,24));
  const ribs=[];for(let i=1;i<13;i++){const v=i/13*1.65;const width=.29*Math.sin(v/1.8*Math.PI);for(const sign of [-1,1])ribs.push(new THREE.Vector3(0,v,Math.sin(v*1.5)*.24+.008),new THREE.Vector3(width*sign,v+.13,Math.sin(v*1.5)*.24-width*.55+.01))}l.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ribs),new THREE.LineBasicMaterial({color:0x799989,transparent:true,opacity:.5})));
  return l;
 }
 function roots(parent,depth=2.1){
  for(let i=0;i<11;i++){const a=i/11*Math.PI*2;const pts=[];for(let j=0;j<7;j++){const f=j/6;pts.push(new THREE.Vector3(Math.sin(a+f*1.2)*f*.75,-f*depth,Math.cos(a+f)*f*.48))}parent.add(tube(pts,i<4?.018:.008,warmLine,40));
   if(i%2===0){const base=pts[3];for(const dir of [-1,1])parent.add(tube([base,new THREE.Vector3(base.x+dir*.2,base.y-.22,base.z+.08),new THREE.Vector3(base.x+dir*.45,base.y-.6,base.z+.13)],.004,warmLine,20))}
  }
 }
 // 00: a sculptural savings seed; the camera starts close to the future.
 const hero=new THREE.Group();worlds[0].add(hero);
 const heroCoin=coin(.95);heroCoin.position.set(0,.15,.15);heroCoin.rotation.set(-.15,-.2,-.12);hero.add(heroCoin);
 const sheath=new THREE.Group();sheath.position.z=-.65;hero.add(sheath);leaf(1.45,-.32,-.85,-.17,sheath);leaf(1.65,.29,-.95,-.25,sheath);leaf(1.15,-.73,-.5,-.1,sheath);leaf(.95,.83,-.5,-.2,sheath);leaf(1.05,.05,.8,-.35,sheath);
 const heroRoots=new THREE.Group();heroRoots.position.y=-.76;hero.add(heroRoots);roots(heroRoots,1.55);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(1.6,.003,4,160),lineMaterial);halo.rotation.x=.55;halo.rotation.y=.3;hero.add(halo);
 // 01: a double helix of co-operation, with actual tubular geometry and illuminated nodes.
 const helix=new THREE.Group();worlds[1].add(helix);
 const nodeMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.045,8,8),luminous,100);
 let nodeIndex=0;for(let s=0;s<2;s++){const pts=[];for(let i=0;i<=100;i++){const t=i/100,y=(t-.5)*6.3,a=t*Math.PI*4+s*Math.PI;pts.push(new THREE.Vector3(Math.cos(a)*.88,y,Math.sin(a)*.88))}helix.add(tube(pts,.022,warmLine,180));for(let i=0;i<50;i++){const t=i/49,a=t*Math.PI*4+s*Math.PI;dummy.position.set(Math.cos(a)*.88,(t-.5)*6.3,Math.sin(a)*.88);dummy.rotation.set(0,0,0);dummy.scale.setScalar(i%5===0?1.4:.65);dummy.updateMatrix();nodeMesh.setMatrixAt(nodeIndex++,dummy.matrix)}}helix.add(nodeMesh);
 for(let i=0;i<34;i++){const t=i/33,a=t*Math.PI*4,p=new THREE.Vector3(Math.cos(a)*.88,(t-.5)*6.3,Math.sin(a)*.88),q=new THREE.Vector3(-p.x,p.y,-p.z);helix.add(tube([p,p.clone().lerp(q,.5),q],.007,lineMaterial,4))}
 const helixOrbit=new THREE.Mesh(new THREE.TorusGeometry(1.8,.003,4,140),lineMaterial);helixOrbit.rotation.set(1.3,.4,.6);helix.add(helixOrbit);
 // 02: a cutaway soil cylinder and branching roots. Growth is driven by scroll, not a video.
 const growth=new THREE.Group();worlds[2].add(growth);
 const soilCanvas=document.createElement('canvas');soilCanvas.width=512;soilCanvas.height=512;const sc=soilCanvas.getContext('2d');sc.fillStyle='#1c211c';sc.fillRect(0,0,512,512);for(let i=0;i<32000;i++){const v=20+Math.random()*35;sc.fillStyle=`rgba(${v+10},${v+4},${v},${Math.random()*.7})`;sc.fillRect(Math.random()*512,Math.random()*512,Math.random()*3+1,Math.random()*2+1)}for(let y=0;y<512;y+=35){sc.strokeStyle='#9b8e6810';sc.beginPath();sc.moveTo(0,y);sc.lineTo(512,y+10);sc.stroke()}const soilTexture=new THREE.CanvasTexture(soilCanvas);soilTexture.colorSpace=THREE.SRGBColorSpace;const soilMaterial=new THREE.MeshStandardMaterial({color:0x777b69,map:soilTexture,bumpMap:soilTexture,bumpScale:.025,metalness:0,roughness:1,side:THREE.DoubleSide});
 const soilGeo=new THREE.CylinderGeometry(1.37,1.15,1.6,70,8,false,Math.PI*.12,Math.PI*1.7);
 const soilPos=soilGeo.attributes.position;for(let i=0;i<soilPos.count;i++){const y=soilPos.getY(i),x=soilPos.getX(i),z=soilPos.getZ(i);const noise=Math.sin(x*19+y*23+z*17)*.025;soilPos.setXYZ(i,x+noise,y,z+noise)}soilGeo.computeVertexNormals();
 const soil=new THREE.Mesh(soilGeo,soilMaterial);soil.position.y=-1.55;growth.add(soil);
 const soilTop=new THREE.Mesh(new THREE.CircleGeometry(1.34,70),soilMaterial);soilTop.rotation.x=-Math.PI/2;soilTop.position.y=-.75;growth.add(soilTop);
 const strataMaterial=new THREE.LineBasicMaterial({color:0x55717b,transparent:true,opacity:.35});
 for(let i=0;i<8;i++){const pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*1.7+Math.PI*.12;pts.push(new THREE.Vector3(Math.sin(a)*(1.17+i*.024),-2.3+i*.2,Math.cos(a)*(1.17+i*.024)))}growth.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),strataMaterial))}
 const plantedCoin=coin(.26);plantedCoin.rotation.set(-1.2,.4,-.4);plantedCoin.position.set(0,-.65,.1);growth.add(plantedCoin);
 const plant=new THREE.Group();plant.position.y=-.69;growth.add(plant);
 plant.add(tube([new THREE.Vector3(),new THREE.Vector3(-.07,.6,0),new THREE.Vector3(.08,1.5,0),new THREE.Vector3(0,2.65,0)],.021,teal,50));
 leaf(.75,-1.04,.6,.01,plant);leaf(.85,.95,1.1,-.02,plant);leaf(.67,-.65,1.8,0,plant);leaf(.5,.4,2.2,0,plant);
 const soilRoots=new THREE.Group();soilRoots.position.set(0,-.65,.17);growth.add(soilRoots);roots(soilRoots,1.65);
 const grainCount=160;const soilBits=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.025,0),soilMaterial,grainCount);for(let i=0;i<grainCount;i++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*1.3;dummy.position.set(Math.cos(a)*r,-.73,Math.sin(a)*r);dummy.rotation.set(Math.random(),Math.random(),0);dummy.scale.setScalar(.4+Math.random());dummy.updateMatrix();soilBits.setMatrixAt(i,dummy.matrix)}growth.add(soilBits);
 // 03: camera flies into a living field of connected community nodes.
 const network=new THREE.Group();worlds[3].add(network);
 const grid=15;const nodes=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,8,6),luminous,grid*grid);
 const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.007,.012,1,4),teal,grid*grid);const networkPositions=[];
 for(let x=0;x<grid;x++)for(let z=0;z<grid;z++){const i=x*grid+z,px=(x-7)*.53,pz=(z-7)*.53,py=.2+Math.sin(x*.8)*Math.cos(z*.6)*.22+Math.random()*.3;dummy.position.set(px,py,pz);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();nodes.setMatrixAt(i,dummy.matrix);networkPositions.push(new THREE.Vector3(px,py,pz));dummy.position.y=py/2-.8;dummy.scale.set(1,py+1.6,1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix)}network.add(nodes,stems);
 const links=[];for(let x=0;x<grid-1;x++)for(let z=0;z<grid-1;z++){const i=x*grid+z;if((x+z)%2===0)links.push(networkPositions[i],networkPositions[i+1],networkPositions[i],networkPositions[i+grid])}network.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(links),new THREE.LineBasicMaterial({color:0x61959f,transparent:true,opacity:.2})));
 for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.4+i*.55,.004,4,120),lineMaterial);ring.rotation.x=Math.PI/2;ring.position.set(0,-.73,0);network.add(ring)}
 const communityCoin=coin(.35);communityCoin.position.set(0,1,0);network.add(communityCoin);
 // 04: an architectural bank model, glass facades and scanning technical wireframe.
 const bank=new THREE.Group();worlds[4].add(bank);
 const stone=new THREE.MeshStandardMaterial({color:0xc7c5b0,roughness:.65,metalness:.1});const red=new THREE.MeshStandardMaterial({color:0x883c3e,roughness:.5,metalness:.3});const glass=new THREE.MeshPhysicalMaterial({color:0x1b5a75,metalness:.65,roughness:.15,clearcoat:1});
 function box(w,h,d,x,y,z,mat){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);b.position.set(x,y,z);bank.add(b);return b}
 box(3.2,.18,2.4,0,-1.5,0,stone);box(2.7,2.7,1.9,0,-.05,0,stone);box(1.45,2.15,.035,.25,0,1,glass);box(1.8,.12,.16,.25,1.1,1.02,red);box(.13,2.3,.14,-.58,0,1.04,red);box(.13,2.3,.14,1.08,0,1.04,red);box(.15,3.1,2.05,-1.3,.1,0,stone);box(3.1,.17,2.2,0,1.48,0,stone);box(3.35,.16,2.45,0,1.68,0,stone);box(1.6,.14,.9,.1,-.85,1.15,stone);box(.55,.7,.04,-.94,-1.03,1,glass);
 for(let i=0;i<4;i++)box(.012,2.1,.05,-.38+i*.39,0,1.04,teal);for(let i=0;i<4;i++)box(1.45,.01,.05,.25,-.8+i*.5,1.04,teal);
 const logoCanvas=document.createElement('canvas');logoCanvas.width=256;logoCanvas.height=256;const lc=logoCanvas.getContext('2d');lc.fillStyle='#a42c34';lc.fillRect(0,0,256,256);lc.fillStyle='#e5dfce';lc.textAlign='center';lc.font='bold 135px sans-serif';lc.fillText('K',128,166);lc.font='20px sans-serif';lc.fillText('K S C B   3 5 4',128,220);const logoTex=new THREE.CanvasTexture(logoCanvas);logoTex.colorSpace=THREE.SRGBColorSpace;const logo=new THREE.Mesh(new THREE.PlaneGeometry(.42,.42),new THREE.MeshStandardMaterial({map:logoTex,roughness:.5}));logo.position.set(-1.4,.95,1.03);bank.add(logo);
 const wire=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.5,3.8,2.6)),new THREE.LineBasicMaterial({color:0x9cdbd8,transparent:true,opacity:.27}));wire.position.y=.1;bank.add(wire);
 const scan=new THREE.Mesh(new THREE.PlaneGeometry(4.8,3.8),new THREE.MeshBasicMaterial({color:0x83d4dd,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));scan.rotation.x=-Math.PI/2;bank.add(scan);
 // A subtle typographic data cloud replaces a static footer with a final scene.
 const dataCanvas=document.createElement('canvas');dataCanvas.width=512;dataCanvas.height=1024;const dc=dataCanvas.getContext('2d');dc.font='11px monospace';for(let y=10;y<1024;y+=16){dc.fillStyle=y%48===10?'#9cbbad':'#457c86';dc.fillText('354  CO-OP  105  TRUST  354  GROWTH  105  TOGETHER',0,y)}const dataTexture=new THREE.CanvasTexture(dataCanvas);dataTexture.colorSpace=THREE.SRGBColorSpace;const dataMaterial=new THREE.MeshBasicMaterial({map:dataTexture,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false});
 for(let i=0;i<6;i++){const panel=new THREE.Mesh(new THREE.PlaneGeometry(2,5.5),dataMaterial);panel.position.set((i-2.5)*2.2,0,-2);worlds[4].add(panel)}
 const finale=new THREE.Group();worlds[5].add(finale);const finalCoin=coin(1.8);finalCoin.position.z=-4;finale.add(finalCoin);const finalRing=new THREE.Mesh(new THREE.TorusGeometry(3,.005,4,180),lineMaterial);finalRing.rotation.x=.5;finale.add(finalRing);
 // GPU particles gently move and form light columns throughout the camera journey.
 const count=innerWidth<650?600:1400,position=new Float32Array(count*3),seeds=new Float32Array(count);
 for(let i=0;i<count;i++){position[i*3]=(Math.random()-.5)*103+40;position[i*3+1]=(Math.random()-.5)*18;position[i*3+2]=(Math.random()-.5)*24;seeds[i]=Math.random()}
 const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.BufferAttribute(position,3));particlesGeo.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const particlesMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uPixel:{value:Math.min(devicePixelRatio,1.25)}},vertexShader:`attribute float aSeed;uniform float uTime;uniform float uPixel;varying float vAlpha;void main(){vec3 p=position;p.y+=sin(uTime*.12+aSeed*30.)*.3;p.x+=sin(uTime*.08+aSeed*20.)*.2;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.+aSeed*2.5)*uPixel*8./-mv.z,1.,5.);vAlpha=(.15+aSeed*.5)*smoothstep(35.,3.,-mv.z);}`,fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.03,d);gl_FragColor=vec4(.65,.84,.85,a*vAlpha);}`});scene.add(new THREE.Points(particlesGeo,particlesMat));
 // Render a procedural cloud field behind all geometry; no external video or image assets.
 const cloudScene=new THREE.Scene();const cloudCamera=new THREE.Camera();const cloudMaterial=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,uniforms:{uTime:{value:0},uProgress:{value:0},uAspect:{value:innerWidth/innerHeight}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uProgress;uniform float uAspect;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+2.;a*=.5;}return s;}void main(){vec2 p=vUv*vec2(uAspect,1.);float n=fbm(p*3.+vec2(uTime*.008,uProgress*.3));float mist=fbm(p*5.+n+vec2(-uTime*.006,.3));vec3 dark=vec3(.018,.07,.105),blue=vec3(.08,.24,.32),green=vec3(.19,.27,.23);vec3 col=mix(dark,blue,n*.8+mist*.3);float glow=exp(-length((vUv-vec2(.65,.52))*vec2(1.,1.4))*2.6);col+=mix(vec3(.01,.06,.09),green*.18,sin(uProgress*2.)*.5+.5)*glow;float vignette=1.-smoothstep(.25,.8,length(vUv-.5));col*=(.6+vignette*.4)*.38;gl_FragColor=vec4(col,1.);}`});cloudScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),cloudMaterial));
 let composer=null;let bloom=null;
 if(innerWidth>=800&&!reduced){composer=new EffectComposer(renderer);const backgroundPass=new RenderPass(cloudScene,cloudCamera);composer.addPass(backgroundPass);const renderPass=new RenderPass(scene,camera);renderPass.clear=false;composer.addPass(renderPass);bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.3,.65,.85);composer.addPass(bloom);composer.addPass(new OutputPass())}
 let progress=0,time=0,mx=0,my=0,frame=0,last=0;let mobile=innerWidth<650;const look=new THREE.Vector3();const currentLook=new THREE.Vector3();
 function resize(){needsFrame=true;mobile=innerWidth<650;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();cloudMaterial.uniforms.uAspect.value=camera.aspect;composer?.setSize(innerWidth,innerHeight)}resize();addEventListener('resize',resize);
 addEventListener('pointermove',e=>{if(!reduced){mx=(e.clientX/innerWidth-.5)*.12;my=(e.clientY/innerHeight-.5)*.08}},{passive:true});
 const getPaths=()=>[{x:0,y:.3,z:mobile?9.7:8.7,tx:0,ty:.25},{x:16,y:.4,z:mobile?12:8.7,tx:mobile?16:14.35,ty:mobile?-1.35:0},{x:30.8,y:.9,z:mobile?11.3:9.4,tx:mobile?32:30.5,ty:mobile?-1.3:-.05},{x:47.5,y:3.5,z:mobile?12:9.5,tx:mobile?48:46.1,ty:mobile?-1.9:0},{x:62.8,y:1.1,z:mobile?12.5:9.8,tx:mobile?64:62.3,ty:mobile?-1.7:0},{x:80,y:.3,z:12,tx:80,ty:0}];
 function render(now=0){frame=requestAnimationFrame(render);if(document.hidden||document.body.classList.contains('menu-open')||document.querySelector('dialog[open]')||(reduced&&!needsFrame))return;if(now-last<1000/(mobile?30:40))return;needsFrame=false;const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
  const paths=getPaths();const p=Math.max(0,Math.min(5,progress)),index=Math.min(4,Math.floor(p)),f=ease(p-index),a=paths[index],b=paths[index+1];
  // Keep camera movement continuous while sliding between spatially separated chapters.
  const targetX=mix(a.x,b.x,f);camera.position.set(targetX+mx,mix(a.y,b.y,f)+my,mix(a.z,b.z,f));look.set(mix(a.tx,b.tx,f),mix(a.ty,b.ty,f),0);currentLook.copy(look);camera.lookAt(currentLook);
  light.position.set(targetX-3,1.5,3);goldLight.position.set(targetX+2,3,1);
  hero.rotation.y=reduced?0:Math.sin(time*.18)*.12;heroCoin.rotation.y=-.2+(reduced?0:Math.sin(time*.23)*.15);
  helix.rotation.y=reduced?0:time*.1;helix.rotation.z=-.12;
  const g=THREE.MathUtils.smoothstep(p,1.5,2.5);plant.scale.setScalar(.45+g*.55);soilRoots.scale.y=.65+g*.35;
  growth.rotation.y=.25+(reduced?0:Math.sin(time*.16)*.08);
  network.rotation.y=reduced?0:Math.sin(time*.06)*.06;communityCoin.rotation.y=reduced?0:time*.2;
  bank.rotation.y=-.5+(reduced?0:Math.sin(time*.12)*.09);scan.position.y=reduced?.4:Math.sin(time*.45)*1.8;
  finale.rotation.y=reduced?-.25:Math.sin(time*.08)*.3;
  leafUniforms.uTime.value=reduced?0:time;particlesMat.uniforms.uTime.value=reduced?0:time;cloudMaterial.uniforms.uTime.value=reduced?0:time;cloudMaterial.uniforms.uProgress.value=p;
  worlds.forEach((w,i)=>{const distance=Math.abs(i-p);w.visible=distance<.95;const spacing=mobile?3.3:6;w.position.x=targetX+(i-p)*spacing+(i*16-paths[i].x);w.scale.setScalar(1-smoothTransition(distance)*.35)});
  if(composer){composer.render()}else{renderer.autoClear=false;renderer.clear();renderer.render(cloudScene,cloudCamera);renderer.render(scene,camera)}
 }
 render();renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('scene-unavailable')});
 renderer.domElement.addEventListener('webglcontextrestored',()=>document.body.classList.remove('scene-unavailable'));
 onReady();
 return {setProgress(value){if(value!==progress)needsFrame=true;progress=value},dispose(){cancelAnimationFrame(frame);removeEventListener('resize',resize);environment.dispose();renderer.dispose();composer?.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}};
}
