"use strict";

(() => {
  const canvas = document.querySelector("#spatial-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const stage = canvas.closest(".xr-stage");
  const controls = document.querySelector(".xr-controls");
  const timeline = document.querySelector("#xr-timeline");
  const progressLabel = document.querySelector("#xr-progress-label");
  const status = document.querySelector("#xr-status");
  const play = document.querySelector("#xr-play");
  const graph = document.querySelector("#xr-graph");
  const reset = document.querySelector("#xr-reset");
  const stepButtons = [...document.querySelectorAll("[data-xr-step]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const steps = [20, 52, 88, 100];
  const stepNames = ["Body", "Arms", "Rotors", "Ready"];
  const state = { yaw: -.55, pitch: .56, progress: 100, graph: false, playing: false, hovered: null, selected: null };
  let width = 0;
  let height = 0;
  let targets = [];
  let drag = null;
  let animation = 0;
  let startTime = null;
  let startProgress = 0;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (value) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
  const assembly = (start, end) => ease((state.progress - start) / (end - start));

  function project(point) {
    const x = point[0] * Math.cos(state.yaw) - point[2] * Math.sin(state.yaw);
    const z = point[0] * Math.sin(state.yaw) + point[2] * Math.cos(state.yaw);
    const vertical = point[1] * Math.cos(state.pitch) - z * Math.sin(state.pitch);
    const depth = point[1] * Math.sin(state.pitch) + z * Math.cos(state.pitch);
    const scale = Math.min(width / 650, height / 430) * 1.1;
    return { x: width / 2 + x * scale, y: height * .56 - vertical * scale, z: depth, scale };
  }

  function path(points, stroke, fill, lineWidth = 1, close = false) {
    if (!points.length) return;
    context.beginPath();
    points.forEach((point, index) => {
      const p = project(point);
      if (index === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
    });
    if (close) context.closePath();
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.lineWidth = lineWidth; context.strokeStyle = stroke; context.stroke(); }
  }

  function circle(point, radius, fill, stroke, lineWidth = 1) {
    const p = project(point);
    context.beginPath();
    context.arc(p.x, p.y, radius * p.scale, 0, Math.PI * 2);
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.lineWidth = lineWidth; context.strokeStyle = stroke; context.stroke(); }
  }

  function box(center, size, selected = false) {
    const [x, y, z] = center;
    const [sx, sy, sz] = size.map((value) => value / 2);
    const corners = [
      [x-sx,y-sy,z-sz], [x+sx,y-sy,z-sz], [x+sx,y-sy,z+sz], [x-sx,y-sy,z+sz],
      [x-sx,y+sy,z-sz], [x+sx,y+sy,z-sz], [x+sx,y+sy,z+sz], [x-sx,y+sy,z+sz]
    ];
    const faces = [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
    faces.map((indices, index) => ({ points: indices.map((i) => corners[i]), index }))
      .sort((a, b) => a.points.reduce((sum, p) => sum + project(p).z, 0) - b.points.reduce((sum, p) => sum + project(p).z, 0))
      .forEach((face) => path(face.points, selected ? "#0872ba" : "#419fd0", ["#a6dcf5","#72c8ef","#68bce8","#b4e6fa","#d5f2ff"][face.index], selected ? 2 : 1, true));
  }

  function rotor(center, selected) {
    const ring = [];
    for (let i = 0; i < 48; i++) {
      const angle = i / 48 * Math.PI * 2;
      ring.push([center[0] + Math.cos(angle) * 46, center[1], center[2] + Math.sin(angle) * 46]);
    }
    path(ring, selected ? "#0589dc" : "#4a9bc7", selected ? "rgba(70,184,243,.24)" : "rgba(171,221,248,.18)", selected ? 2.5 : 1.5, true);
    const angle = center[0] * .01 + .3;
    const blade = (direction) => [center[0] + Math.cos(angle) * 38 * direction, center[1]+2, center[2] + Math.sin(angle) * 38 * direction];
    path([blade(-1), blade(1)], "#258dca", null, 6 * project(center).scale);
    circle([center[0],center[1]+3,center[2]], 7, "#147cb6", "#fff", 1.5);
  }

  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    targets = [];
    const glow = context.createRadialGradient(width*.5,height*.5,10,width*.5,height*.5,width*.6);
    glow.addColorStop(0,"rgba(157,222,255,.28)");
    glow.addColorStop(1,"rgba(239,249,255,0)");
    context.fillStyle = glow;
    context.fillRect(0,0,width,height);

    // A world-aligned grid keeps the orbit anchored in a spatial coordinate system.
    for (let i=-6; i<=6; i++) {
      const alpha = .25 - Math.abs(i) * .021;
      path([[-300,-72,i*50],[300,-72,i*50]], `rgba(75,154,202,${alpha})`);
      path([[i*50,-72,-300],[i*50,-72,300]], `rgba(75,154,202,${alpha})`);
    }
    const origin = [-230,-71,170];
    path([origin,[-190,-71,170]],"#489dd3",null,1.5);
    path([origin,[-230,-31,170]],"#87b7d1",null,1.5);
    path([origin,[-230,-71,130]],"#74c7ef",null,1.5);
    const o = project(origin);
    context.fillStyle = "#6389a3";
    context.font = "9px ui-monospace, monospace";
    context.fillText("0, 0, 0",o.x-10,o.y+15);

    const bodyY = lerp(42,0,assembly(0,20));
    const bodyPoint = [0,bodyY,0];
    const arms = [];
    for (const x of [-1,1]) for (const z of [-1,1]) {
      const spread = lerp(190,116,assembly(22,52));
      const y = lerp(45,5,assembly(22,52));
      const center = [x*spread,y,z*spread*.7];
      const rotorY = y + lerp(86,16,assembly(56,88));
      arms.push({center,rotorPoint:[center[0],rotorY,center[2]],depth:project(center).z});
    }
    const pieces = [
      { depth:project(bodyPoint).z, draw:() => {
        box(bodyPoint,[92,29,64],state.hovered==="Body" || state.selected==="Body");
        path([[-29,bodyY+16,-17],[29,bodyY+16,-17],[29,bodyY+16,17],[-29,bodyY+16,17]],"#64b8e4","#e9f9ff",1,true);
        circle([0,bodyY+18,0],7,"#36abea");
        targets.push({...project([0,bodyY+15,0]),radius:35,name:"Body",step:0});
      } },
      ...arms.map((arm) => ({ depth:arm.depth, draw:() => {
        const selected = state.hovered==="Arms" || state.selected==="Arms";
        const inner=[Math.sign(arm.center[0])*28,bodyY-1,Math.sign(arm.center[2])*18];
        context.lineCap="round";
        path([inner,arm.center],selected ? "#1686c8" : "#91c7e2",null,12*project(arm.center).scale);
        path([inner,arm.center],"#d8f0ff",null,4*project(arm.center).scale);
        path([arm.center,arm.rotorPoint],"#79b1d1",null,5*project(arm.center).scale);
        rotor(arm.rotorPoint,state.hovered==="Rotors" || state.selected==="Rotors");
        const middle=inner.map((v,i)=>(v+arm.center[i])/2);
        targets.push({...project(middle),radius:21,name:"Arms",step:1});
        targets.push({...project(arm.rotorPoint),radius:39,name:"Rotors",step:2});
      } }))
    ];
    pieces.sort((a,b)=>a.depth-b.depth).forEach((piece)=>piece.draw());

    if (state.graph) {
      context.setLineDash([4,5]);
      arms.forEach((arm)=>path([bodyPoint,arm.rotorPoint],"rgba(15,124,191,.65)",null,1));
      context.setLineDash([]);
      [bodyPoint,...arms.map((arm)=>arm.rotorPoint)].forEach((point,index)=> {
        circle(point,7,"#fff","#168bca",1.5);
        const p=project(point);
        context.fillStyle="#176c9e";
        context.font="10px ui-monospace, monospace";
        context.fillText(index===0 ? "origin" : `part_0${index}`,p.x+10,p.y-9);
      });
    }

    // Bounding corners evoke an AR selection without covering the research content.
    const selectedTarget=targets.find((target)=>target.name===(state.hovered || state.selected));
    if (selectedTarget) {
      const {x,y,radius,scale}=selectedTarget;
      const r=radius*scale+9;
      context.strokeStyle="#178dce";
      context.lineWidth=1.3;
      for(const sx of [-1,1]) for(const sy of [-1,1]) {
        context.beginPath();context.moveTo(x+sx*r,y+sy*(r-7));context.lineTo(x+sx*r,y+sy*r);context.lineTo(x+sx*(r-7),y+sy*r);context.stroke();
      }
      context.fillStyle="#146fa2";
      context.font="10px ui-monospace, monospace";
      context.fillText(selectedTarget.name.toUpperCase(),x-r,y-r-9);
    }
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();
    width=rect.width;height=rect.height;
    const ratio=Math.min(window.devicePixelRatio || 1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
    draw();
  }

  function updateProgress(value) {
    state.progress=clamp(Number(value),0,100);
    timeline.value=String(Math.round(state.progress));
    timeline.style.setProperty("--progress",`${state.progress}%`);
    progressLabel.value=`${Math.round(state.progress)}%`;
    const index=state.progress<30 ? 0 : state.progress<60 ? 1 : state.progress<90 ? 2 : 3;
    timeline.setAttribute("aria-valuetext",`${Math.round(state.progress)} percent — ${stepNames[index]}`);
    stepButtons.forEach((button,i)=> {
      button.classList.toggle("is-active",i===index);
      button.setAttribute("aria-pressed",String(i===index));
    });
    draw();
  }

  function stopPlayback() {
    state.playing=false;
    cancelAnimationFrame(animation);
    animation=0;startTime=null;
    play.innerHTML='<span aria-hidden="true">▶</span> Replay';
    play.setAttribute("aria-pressed","false");
  }

  function tick(timestamp) {
    if (!state.playing) return;
    if (startTime===null) startTime=timestamp;
    updateProgress(startProgress+(timestamp-startTime)/85);
    if (state.progress>=100) {
      stopPlayback();
      status.textContent="Assembly complete. Select a part to revisit a step.";
    } else animation=requestAnimationFrame(tick);
  }

  function jumpToStep(index,name=stepNames[index]) {
    stopPlayback();
    state.selected=index===3 ? null : name;
    updateProgress(steps[index]);
    status.textContent=index===3 ? "Fully assembled. Drag to explore another view." : `${name} selected. Returned to assembly step ${index+1}.`;
  }

  function hitTest(x,y) {
    return [...targets].reverse().find((target)=>Math.hypot(target.x-x,target.y-y)<target.radius*target.scale);
  }

  timeline.addEventListener("input",()=> {stopPlayback();state.selected=null;updateProgress(timeline.value);});
  timeline.addEventListener("change",()=> {status.textContent=`Playback moved to ${Math.round(state.progress)} percent.`;});
  stepButtons.forEach((button,index)=>button.addEventListener("click",()=>jumpToStep(index)));
  play.addEventListener("click",()=> {
    if (state.playing) {stopPlayback();status.textContent="Playback paused.";return;}
    if (reduceMotion.matches) {
      const next=steps.findIndex((value)=>value>state.progress);
      jumpToStep(next===-1 ? 0 : next);
      return;
    }
    if (state.progress>=100) updateProgress(0);
    state.selected=null;state.hovered=null;state.playing=true;
    startProgress=state.progress;startTime=null;
    play.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause';
    play.setAttribute("aria-pressed","true");
    status.textContent="Replaying the assembly. You can scrub the timeline at any time.";
    animation=requestAnimationFrame(tick);
  });
  graph.addEventListener("click",()=> {
    state.graph=!state.graph;
    graph.setAttribute("aria-pressed",String(state.graph));
    status.textContent=state.graph ? "Scene graph shown. The origin connects to four rotor parts." : "Scene graph hidden.";
    draw();
  });
  reset.addEventListener("click",()=> {
    stopPlayback();state.yaw=-.55;state.pitch=.56;state.selected=null;state.hovered=null;state.graph=false;
    graph.setAttribute("aria-pressed","false");updateProgress(100);
    status.textContent="View reset. Ready to explore.";
  });
  canvas.addEventListener("pointerdown",(event)=> {
    if (event.button!==0 || drag) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove",(event)=> {
    const rect=canvas.getBoundingClientRect();
    if (drag && event.pointerId===drag.id) {
      if (Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5) drag.moved=true;
      state.yaw+=(event.clientX-drag.x)*.009;
      state.pitch=clamp(state.pitch+(event.clientY-drag.y)*.006,.15,1.15);
      drag.x=event.clientX;drag.y=event.clientY;state.hovered=null;
    } else state.hovered=hitTest(event.clientX-rect.left,event.clientY-rect.top)?.name || null;
    draw();
  });
  function endDrag(event,cancelled=false) {
    if (!drag || drag.id!==event.pointerId) return;
    if (!drag.moved && !cancelled) {
      const rect=canvas.getBoundingClientRect();
      const target=hitTest(event.clientX-rect.left,event.clientY-rect.top);
      if (target) jumpToStep(target.step,target.name);
    }
    drag=null;canvas.classList.remove("is-dragging");
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener("pointerup",(event)=>endDrag(event));
  canvas.addEventListener("pointercancel",(event)=>endDrag(event,true));
  canvas.addEventListener("lostpointercapture",()=> {drag=null;canvas.classList.remove("is-dragging");});
  canvas.addEventListener("pointerleave",()=> {if (!drag) {state.hovered=null;draw();}});
  canvas.addEventListener("keydown",(event)=> {
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (event.key==="ArrowLeft") state.yaw-=.15;
    if (event.key==="ArrowRight") state.yaw+=.15;
    if (event.key==="ArrowUp") state.pitch=clamp(state.pitch+.1,.15,1.15);
    if (event.key==="ArrowDown") state.pitch=clamp(state.pitch-.1,.15,1.15);
    draw();
  });
  document.addEventListener("visibilitychange",()=> {if (document.hidden) stopPlayback();});
  reduceMotion.addEventListener("change",()=> {stopPlayback();});
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries)=> {
      if (!entries[0].isIntersecting && state.playing) {stopPlayback();status.textContent="Playback paused. Press Replay to continue.";}
    }).observe(stage);
  }
  canvas.hidden=false;
  stage.parentElement.classList.add("is-interactive");
  stage.querySelector(".xr-fallback").hidden=true;
  controls.hidden=false;
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize",resize);
  resize();updateProgress(100);
})();
