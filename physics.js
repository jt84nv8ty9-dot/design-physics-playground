(() => {
  'use strict';
  const stage = document.querySelector('.playground');
  const elements = [...stage.querySelectorAll('.piece')];
  const initialCount = elements.length;
  const spawnImages = Array.from({length:15},(_,i)=>`art-${String(i+1).padStart(3,'0')}.jpg`);
  let spawnIndex=7, pressStart=null;
  spawnImages.forEach(src=>{const img=new Image();img.src=`assets/${src}`;});
  const { Engine, Bodies, Body, Composite, Constraint, Vector, Query } = Matter;
  const engine = Engine.create({ positionIterations: 10, velocityIterations: 8 });
  engine.gravity.y = 0.35;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Measured against the supplied 1288 × 658 recording, not today's changed headline.
  const layout = {
    seventh: [870, 80, 195, 195, 12], jamie: [174, 100, 195, 195, 0], chips: [457, 101, 195, 195, 16],
    racquets: [677, 245, 195, 195, -10], ding: [938, 265, 195, 195, -3],
    radnor: [1160, 227, 195, 195, -29], prowly: [139, 548, 195, 195, 0],
    lets: [194, 288, 310, 112, -15], things: [512, 480, 393, 112, -23],
    up: [886, 550, 196, 112, 71], shake: [1100, 438, 358, 112, -25],
    copy: [636, 549, 390, 132, -23], work: [293, 620, 72, 35, -3],
    studio: [654, 636, 135, 35, -8], contact: [790, 641, 135, 35, 0]
  };
  let bodies = [], scale = 1, raf = 0, last = 0, drag = null, pointer = null;
  let active = true, moved = false, suppressClickUntil = 0;
  function render() {
    bodies.forEach((body,i) => {
      elements[i].style.transform = `translate3d(${body.position.x-body.plugin.w/2}px,${body.position.y-body.plugin.h/2}px,0) rotate(${body.angle}rad)`;
    });
  }
  function reset() {
    release(); Composite.clear(engine.world, false); Engine.clear(engine);
    elements.splice(initialCount).forEach(el=>el.remove());spawnIndex=7;pressStart=null;
    const w=stage.clientWidth, h=stage.clientHeight, mobile=w<600;
    scale=mobile?w/660:Math.min(w/1288,h/658);
    stage.style.setProperty('--unit',`${scale}px`);
    const ox=(w-1288*scale)/2, oy=h-658*scale;
    bodies=elements.map((el,i)=>{
      let [x,y,bw,bh,a]=layout[el.dataset.key];
      if(mobile){
        const mob={seventh:[535,230],jamie:[125,140],chips:[380,160],racquets:[525,465],ding:[420,780],radnor:[145,650],prowly:[120,1000],lets:[215,370],things:[350,590],up:[490,1010],shake:[340,1170],copy:[340,875],work:[70,1250],studio:[260,1280],contact:[485,1280]};
        [x,y]=mob[el.dataset.key]; y=y/1320*(h/scale);
      }
      const px=mobile?x*scale:ox+x*scale, py=mobile?y*scale:oy+y*scale;
      const width=bw*scale,height=bh*scale;
      el.style.width=`${width}px`;el.style.height=`${height}px`;
      const b=Bodies.rectangle(px,py,width,height,{angle:a*Math.PI/180,restitution:.38,friction:.38,frictionStatic:.65,frictionAir:.025,density:.0015,chamfer:{radius:Math.min(5*scale,5)},label:el.dataset.key});
      b.plugin={w:width,h:height};
      Composite.add(engine.world,b);return b;
    });
    const thick=200;
    Composite.add(engine.world,[Bodies.rectangle(w/2,h+thick/2,w+400,thick,{isStatic:true,friction:.65}),Bodies.rectangle(-thick/2,h/2,thick,h+800,{isStatic:true}),Bodies.rectangle(w+thick/2,h/2,thick,h+800,{isStatic:true}),Bodies.rectangle(w/2,-thick/2-150,w+400,thick,{isStatic:true})]);
    render();last=0;
  }
  function point(event){const r=stage.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};}
  function spawn(p) {
    if(elements.length>=initialCount+24){Composite.remove(engine.world,bodies[initialCount]);bodies.splice(initialCount,1);elements.splice(initialCount,1)[0].remove();}
    const size=195*scale;
    const el=document.createElement('div');el.className='piece picture spawned';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Drag new artwork');
    const img=document.createElement('img');img.src=`assets/${spawnImages[spawnIndex++%spawnImages.length]}`;img.alt='New collage artwork';img.draggable=false;el.append(img);
    el.style.width=el.style.height=`${size}px`;stage.append(el);
    const b=Bodies.rectangle(Math.max(size/2,Math.min(stage.clientWidth-size/2,p.x)),Math.max(size/2,Math.min(stage.clientHeight-size/2,p.y)),size,size,{angle:(Math.random()-.5)*.6,restitution:.4,friction:.38,frictionAir:.025,density:.0015,chamfer:{radius:5*scale}});
    b.plugin={w:size,h:size};Body.setVelocity(b,{x:(Math.random()-.5)*3*scale,y:-3*scale});Body.setAngularVelocity(b,(Math.random()-.5)*.06);
    elements.push(el);bodies.push(b);Composite.add(engine.world,b);render();
  }
  function release(){
    if(drag){Composite.remove(engine.world,drag);drag=null;}
    stage.classList.remove('dragging');pointer=null;
  }
  stage.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const p=point(e);pressStart=p;moved=false; const candidates=Query.point(bodies,p);
    if(!candidates.length)return;
    const body=candidates[candidates.length-1];
    const offset=Vector.sub(p,body.position);
    drag=Constraint.create({pointA:p,bodyB:body,pointB:offset,stiffness:.16,damping:.1,length:0});
    Composite.add(engine.world,drag);pointer={...p,startX:p.x,startY:p.y,time:performance.now()};moved=false;
    stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');
    if(e.pointerType==='touch')e.preventDefault();
  });
  stage.addEventListener('pointermove',e=>{
    const p=point(e),now=performance.now();
    if(pressStart&&Math.hypot(p.x-pressStart.x,p.y-pressStart.y)>6)moved=true;
    if(drag){drag.pointA=p;if(pointer&&Math.hypot(p.x-pointer.startX,p.y-pointer.startY)>5)moved=true;return;}
    if(e.pointerType==='touch'||reduced.matches){pointer=null;return;}
    if(pointer){
      const dt=Math.max(10,now-pointer.time),vx=(p.x-pointer.x)/dt,vy=(p.y-pointer.y)/dt;
      if(Math.hypot(vx,vy)>.12){
        for(const body of Query.point(bodies,p)){
          Body.applyForce(body,p,{x:Math.max(-.004,Math.min(.004,vx*.0012))*body.mass,y:Math.max(-.004,Math.min(.002,vy*.0012)) *body.mass});
        }
      }
    }
    pointer={...p,time:now};
  });
  function endDrag(e){if(e.type==='pointerup'&&pressStart&&!moved)spawn(point(e));if(moved)suppressClickUntil=performance.now()+350;pressStart=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);release();}
  stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('pointerleave',()=>{if(!drag)pointer=null;});
  stage.addEventListener('click',e=>{if(performance.now()<suppressClickUntil)e.preventDefault();},true);
  stage.addEventListener('keydown',e=>{
    const index=elements.indexOf(e.target);if(index<0)return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();spawn({...bodies[index].position});return;}
    const moves={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-7],ArrowDown:[0,4]};
    if(moves[e.key]){e.preventDefault();const [x,y]=moves[e.key];Body.setVelocity(bodies[index],{x:x*scale,y:y*scale});if(reduced.matches){Body.translate(bodies[index],{x:x*scale*5,y:y*scale*5});render();}}
  });
  const resetButton=document.querySelector('.reset');
  resetButton.addEventListener('click',()=>{reset();document.querySelector('#announcement').textContent='Collage reset.';});
  document.querySelector('.logo').addEventListener('click',e=>{e.preventDefault();reset();});
  const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle');
  menu.innerHTML=document.querySelector('header nav').innerHTML;
  menu.querySelector('.expertise-menu').removeAttribute('id');
  menu.querySelector('.expertise>button').removeAttribute('aria-controls');
  document.querySelectorAll('.expertise>button').forEach(button=>button.addEventListener('click',()=>{const open=button.parentElement.classList.toggle('open');button.setAttribute('aria-expanded',String(open));}));
  toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));toggle.textContent=menu.hidden?'MENU':'CLOSE';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){release();document.querySelectorAll('.expertise').forEach(el=>{el.classList.remove('open');el.querySelector('button').setAttribute('aria-expanded','false');});if(document.activeElement?.closest('.expertise'))document.activeElement.blur();menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='MENU';}});
  new IntersectionObserver(([entry])=>{active=entry.isIntersecting;last=0;}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)release();});
  function frame(time){
    if(active&&!document.hidden&&(!reduced.matches||drag)){
      const dt=last?Math.min(time-last,32):16.67;
      // Small substeps keep fast throws from crossing another thin word tile.
      Engine.update(engine,dt/2);Engine.update(engine,dt/2);render();
    }
    last=time;raf=requestAnimationFrame(frame);
  }
  let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(reset,150);}).observe(stage);
  reset();raf=requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);release();});
})();
