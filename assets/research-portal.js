"use strict";

(() => {
  const canvas = document.querySelector("#spatial-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const stage = canvas.closest(".xr-stage");
  const controls = document.querySelector(".xr-controls");
  const topicButtons = [...document.querySelectorAll("[data-portal-topic]")];
  const title = document.querySelector("#portal-topic-title");
  const description = document.querySelector("#portal-topic-description");
  const link = document.querySelector("#portal-research-link");
  const status = document.querySelector("#xr-status");
  const connections = document.querySelector("#portal-connections");
  const shuffle = document.querySelector("#portal-shuffle");
  const reset = document.querySelector("#portal-reset");
  const colors = ["#e91b63", "#efb4cf", "#f9e975", "#92c43d", "#539ed4", "#222d82"];
  const topics = [
    { name: "Spatial recording", label: "RECORD", color: colors[0], position: [148, 28, 12], description: "How can we capture an experience as something we can move through, rather than just watch? I explore spatial recordings of actions, objects, and their relationships.", url: "https://arxiv.org/abs/2603.07627" },
    { name: "Scene graphs", label: "CONNECT", color: colors[1], position: [-98, 100, -65], description: "Objects become more meaningful through their connections. Scene graphs help organize objects, interactions, and events within a recorded experience.", url: "https://arxiv.org/abs/2603.07627" },
    { name: "Adaptive playback", label: "REVISIT", color: colors[2], position: [35, -112, 80], description: "A recording doesn't have to be a fixed timeline. My work explores task breakpoints that let people revisit an activity at different levels of detail.", url: "https://arxiv.org/abs/2603.07627" },
    { name: "Object interaction", label: "INTERACT", color: colors[3], position: [-147, -42, 15], description: "What if the object itself could help you find a moment? I study interfaces that connect selecting a physical part with retrieving its recorded assembly event.", url: "https://arrc.kaist.ac.kr/publications/object-driven-event-retrieval-with-assembled-object-interface-for-mixed-reality" },
    { name: "Shared spaces", label: "SHARE", color: colors[4], position: [64, 76, -112], description: "Different rooms can become a shared place to collaborate. My collaborative research considers spatial affordances when connecting remote mixed reality environments.", url: "https://arxiv.org/abs/2408.04297" },
    { name: "AR & VR", label: "EXPLORE", color: "#d4d8ff", position: [-18, -12, -146], description: "I explore how people interact with information beyond a flat screen, bringing together spatial computing, interaction, and immersive experiences.", url: "#research" }
  ];
  const initial = { yaw: -.45, pitch: .2, selected: 0 };
  const state = { ...initial, hovered: null, connections: true };
  let width = 0;
  let height = 0;
  let targets = [];
  let drag = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function project([px, py, pz]) {
    const x = px * Math.cos(state.yaw) - pz * Math.sin(state.yaw);
    const z = px * Math.sin(state.yaw) + pz * Math.cos(state.yaw);
    const y = py * Math.cos(state.pitch) - z * Math.sin(state.pitch);
    const depth = py * Math.sin(state.pitch) + z * Math.cos(state.pitch);
    const scale = Math.min(width / 480, height / 370) * 650 / (650 - depth);
    return { x: width / 2 + x * scale, y: height * .49 - y * scale, z: depth, scale };
  }

  function line(points, color, lineWidth = 1) {
    ctx.beginPath();
    points.forEach((point, i) => {
      const p = project(point);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function draw() {
    if (!width || !height) return;
    // An opaque background keeps the portal consistent across Canvas renderers.
    ctx.fillStyle = "#1c246b";
    ctx.fillRect(0, 0, width, height);
    const ambient = ctx.createRadialGradient(width*.48,height*.48,0,width*.48,height*.48,width*.6);
    ambient.addColorStop(0,"rgba(83,158,212,.25)");
    ambient.addColorStop(1,"rgba(34,45,130,0)");
    ctx.fillStyle = ambient;
    ctx.fillRect(0,0,width,height);

    for (let i=0; i<44; i++) {
      const x=24+((Math.sin(i*127.1)*43758.5453)%1+1)%1*(width-48);
      const y=58+((Math.sin(i*269.5)*43758.5453)%1+1)%1*(height-112);
      ctx.beginPath();ctx.arc(x,y,i%7===0 ? 1.2 : .65,0,Math.PI*2);
      ctx.fillStyle=`rgba(218,231,255,${.15+(i%4)*.07})`;ctx.fill();
    }

    // Three intersecting orbital planes make a spatial lens, with no moving camera at rest.
    for (let plane=0; plane<3; plane++) {
      const points=[];
      for (let i=0; i<=96; i++) {
        const a=i/96*Math.PI*2;
        const c=Math.cos(a)*123,s=Math.sin(a)*123;
        points.push(plane===0 ? [c,s,0] : plane===1 ? [c,0,s] : [0,c,s]);
      }
      line(points,plane===0 ? "rgba(83,158,212,.52)" : "rgba(164,191,255,.19)",plane===0 ? 1.2 : .8);
    }

    if (state.connections) {
      topics.forEach((topic,i)=> {
        line([[0,0,0],topic.position],i===state.selected ? topic.color+"b3" : "rgba(174,196,250,.16)",i===state.selected ? 1.5 : .75);
      });
      const selected=topics[state.selected];
      ctx.setLineDash([3,7]);
      topics.forEach((topic,i)=> {if(i!==state.selected) line([selected.position,topic.position],"rgba(174,196,250,.15)",.7);});
      ctx.setLineDash([]);
    }

    const core=project([0,0,0]);
    const halo=ctx.createRadialGradient(core.x,core.y,1,core.x,core.y,40*core.scale);
    halo.addColorStop(0,"rgba(177,219,255,.4)");halo.addColorStop(1,"rgba(83,158,212,0)");
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(core.x,core.y,40*core.scale,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(core.x,core.y,10*core.scale,0,Math.PI*2);
    ctx.fillStyle="#edf4ff";ctx.fill();
    ctx.strokeStyle="rgba(177,219,255,.55)";ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(core.x,core.y,18*core.scale,0,Math.PI*2);ctx.stroke();

    targets=topics.map((topic,index)=>({...project(topic.position),index,topic})).sort((a,b)=>a.z-b.z);
    targets.forEach((point)=> {
      const selected=point.index===state.selected;
      const active=selected || point.index===state.hovered;
      const radius=(active ? 9 : 6)*point.scale;
      const glow=ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,radius*3.5);
      glow.addColorStop(0,point.topic.color+(active ? "88" : "44"));
      glow.addColorStop(1,point.topic.color+"00");
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(point.x,point.y,radius*3.5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);
      ctx.fillStyle=point.topic.color;ctx.fill();
      ctx.lineWidth=1.3;ctx.strokeStyle=active ? "#fff" : "rgba(255,255,255,.55)";ctx.stroke();
      if (active) {
        ctx.beginPath();ctx.arc(point.x,point.y,radius+6,0,Math.PI*2);
        ctx.strokeStyle=point.topic.color+"99";ctx.lineWidth=.8;ctx.stroke();
      }
      const onRight=point.x>=width/2;
      ctx.font=`${active ? 600 : 400} ${width<400 ? 10 : 11}px "Segoe UI", Arial, sans-serif`;
      ctx.textAlign=onRight ? "left" : "right";
      ctx.fillStyle=active ? "#fff" : "#c3cbee";
      const labelWidth=ctx.measureText(point.topic.label).width;
      const labelX=clamp(point.x+(onRight ? 1 : -1)*(radius+13),onRight ? 22 : labelWidth+22,onRight ? width-labelWidth-22 : width-22);
      ctx.fillText(point.topic.label,labelX,clamp(point.y+3,75,height-65));
    });
    ctx.textAlign="left";
  }

  function selectTopic(index, announce = true) {
    state.selected=index;
    const topic=topics[index];
    title.textContent=topic.name;
    description.textContent=topic.description;
    link.setAttribute("href",topic.url);
    if (topic.url.startsWith("#")) {
      link.removeAttribute("target");link.removeAttribute("rel");
    } else {
      link.setAttribute("target","_blank");link.setAttribute("rel","noopener");
    }
    topicButtons.forEach((button,i)=> {
      button.classList.toggle("is-active",i===index);
      button.setAttribute("aria-pressed",String(i===index));
    });
    if (announce) status.textContent=`${topic.name} selected. Explore the related research below.`;
    draw();
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    draw();
  }

  function hitTest(x,y) {
    return [...targets].reverse().find((p)=>Math.hypot(p.x-x,p.y-y)<Math.max(22,15*p.scale));
  }

  topicButtons.forEach((button,index)=>button.addEventListener("click",()=>selectTopic(index)));
  connections.addEventListener("click",()=> {
    state.connections=!state.connections;
    connections.setAttribute("aria-pressed",String(state.connections));
    status.textContent=state.connections ? "Connections shown." : "Connections hidden. The ideas remain connected.";
    draw();
  });
  shuffle.addEventListener("click",()=> {
    state.yaw+=(.7+Math.random()*.9)*(Math.random()>.5 ? 1 : -1);
    state.pitch=Math.random()*.8-.4;state.hovered=null;
    selectTopic((state.selected+1+Math.floor(Math.random()*5))%topics.length);
  });
  function resetView() {
    Object.assign(state,initial,{hovered:null,connections:true});
    connections.setAttribute("aria-pressed","true");
    selectTopic(0,false);status.textContent="View reset. Pick an idea to explore.";
  }
  reset.addEventListener("click",resetView);
  canvas.addEventListener("pointerdown",(event)=> {
    if (event.button!==0 || drag) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
    canvas.setPointerCapture(event.pointerId);canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove",(event)=> {
    const rect=canvas.getBoundingClientRect();
    if (drag && drag.id===event.pointerId) {
      if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5) drag.moved=true;
      state.yaw+=(event.clientX-drag.x)*.008;
      state.pitch=clamp(state.pitch+(event.clientY-drag.y)*.006,-.65,.65);
      drag.x=event.clientX;drag.y=event.clientY;state.hovered=null;
    } else state.hovered=hitTest(event.clientX-rect.left,event.clientY-rect.top)?.index ?? null;
    canvas.classList.toggle("has-target",state.hovered!==null && !drag);
    draw();
  });
  function endDrag(event,cancelled=false) {
    if(!drag || drag.id!==event.pointerId)return;
    if(!cancelled && !drag.moved) {
      const rect=canvas.getBoundingClientRect();
      const target=hitTest(event.clientX-rect.left,event.clientY-rect.top);
      if(target)selectTopic(target.index);
    }
    drag=null;canvas.classList.remove("is-dragging");
    if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener("pointerup",(event)=>endDrag(event));
  canvas.addEventListener("pointercancel",(event)=>endDrag(event,true));
  canvas.addEventListener("lostpointercapture",()=> {drag=null;canvas.classList.remove("is-dragging");});
  canvas.addEventListener("pointerleave",()=> {
    if(!drag){state.hovered=null;canvas.classList.remove("has-target");draw();}
  });
  canvas.addEventListener("keydown",(event)=> {
    if(event.key==="Home"){event.preventDefault();resetView();return;}
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
    event.preventDefault();
    if(event.key==="ArrowLeft")state.yaw-=.15;
    if(event.key==="ArrowRight")state.yaw+=.15;
    if(event.key==="ArrowUp")state.pitch=clamp(state.pitch+.1,-.65,.65);
    if(event.key==="ArrowDown")state.pitch=clamp(state.pitch-.1,-.65,.65);
    state.hovered=null;draw();
  });

  canvas.hidden=false;stage.parentElement.classList.add("is-interactive");
  stage.querySelector(".xr-fallback").hidden=true;controls.hidden=false;
  if("ResizeObserver" in window)new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize",resize);
  resize();selectTopic(0,false);
})();
