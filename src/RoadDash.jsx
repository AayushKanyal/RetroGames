import React, { useEffect, useRef, useState } from "react";

const W=420, H=620;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export default function RoadDash(){
  const canvasRef=useRef(null), gameRef=useRef(null), keys=useRef({});
  const [score,setScore]=useState(0),[best,setBest]=useState(()=>Number(localStorage.getItem("retroverse-roaddash-best")||0));
  const [status,setStatus]=useState("ready");
  const reset=()=>{
    gameRef.current={player:{x:W/2-22,y:H-130,w:44,h:76},cars:[],coins:[],speed:4,roadOffset:0,score:0,spawn:0,coinSpawn:0,alive:true};
    setScore(0);setStatus("ready");
  };
  useEffect(()=>{reset()},[]);
  useEffect(()=>{
    const down=e=>{if(["ArrowLeft","ArrowRight"," ","ArrowUp","ArrowDown"].includes(e.key))e.preventDefault();keys.current[e.key]=true;if(status==="ready"&&(e.key===" "||e.key.startsWith("Arrow")))setStatus("playing");};
    const up=e=>{keys.current[e.key]=false;};
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)};
  },[status]);
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas?.getContext("2d");if(!ctx)return;
    let raf=0,last=0;
    const rounded=(x,y,w,h,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()};
    const drawCar=(c)=>{
      rounded(c.x,c.y,c.w,c.h,9,c.color);
      rounded(c.x+7,c.y+12,c.w-14,20,5,"#bde8ff");
      rounded(c.x+7,c.y+c.h-26,c.w-14,16,4,"#26364b");
      ctx.fillStyle="#101522";ctx.fillRect(c.x-3,c.y+13,5,16);ctx.fillRect(c.x+c.w-2,c.y+13,5,16);ctx.fillRect(c.x-3,c.y+c.h-25,5,16);ctx.fillRect(c.x+c.w-2,c.y+c.h-25,5,16);
    };
    const loop=t=>{
      const dt=Math.min((t-last)/16.67||1,2);last=t;
      const g=gameRef.current;
      if(!g)return;
      if(status==="playing"&&g.alive){
        const p=g.player,move=6.3*dt;
        if(keys.current.ArrowLeft||keys.current.a||keys.current.A)p.x-=move;
        if(keys.current.ArrowRight||keys.current.d||keys.current.D)p.x+=move;
        p.x=clamp(p.x,86,W-86-p.w);
        g.speed=Math.min(11,g.speed+0.0015*dt);g.roadOffset=(g.roadOffset+g.speed*dt)%80;
        g.spawn-=dt;g.coinSpawn-=dt;
        if(g.spawn<=0){const lanes=[105,180,255,330];const lane=lanes[Math.floor(Math.random()*lanes.length)];g.cars.push({x:lane,y:-100,w:44,h:76,color:["#f05252","#f4b942","#8b6cff","#45c9a5"][Math.floor(Math.random()*4)],speed:g.speed+Math.random()*2});g.spawn=Math.max(24,55-Math.floor(g.speed*2))+Math.random()*20;}
        if(g.coinSpawn<=0){g.coins.push({x:[125,205,285,335][Math.floor(Math.random()*4)],y:-20,r:11});g.coinSpawn=45+Math.random()*35;}
        g.cars.forEach(c=>c.y+=(c.speed+g.speed*.35)*dt);g.coins.forEach(c=>c.y+=g.speed*dt);
        g.cars=g.cars.filter(c=>c.y<H+100);g.coins=g.coins.filter(c=>c.y<H+30);
        const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
        if(g.cars.some(c=>hit(p,c))){g.alive=false;setStatus("over");}
        g.coins=g.coins.filter(c=>{const got=p.x<c.x+c.r&&p.x+p.w>c.x-c.r&&p.y<c.y+c.r&&p.y+p.h>c.y-c.r;if(got){g.score+=50;setScore(g.score)}return !got});
        g.score+=Math.floor(dt*g.speed);setScore(g.score);
      }
      // Background and road
      ctx.fillStyle="#146b42";ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#2c3038";ctx.fillRect(65,0,W-130,H);
      ctx.fillStyle="#e8e8e8";ctx.fillRect(76,0,5,H);ctx.fillRect(W-81,0,5,H);
      ctx.fillStyle="#f7d84a";for(let y=-80+g.roadOffset;y<H;y+=80){ctx.fillRect(W/2-3,y,6,42);ctx.fillRect(155,y,4,28);ctx.fillRect(261,y,4,28)}
      // trees / roadside dots
      for(let y=-30+g.roadOffset*1.4;y<H;y+=105){ctx.fillStyle="#0b4c2d";ctx.beginPath();ctx.arc(30,y,14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(W-30,y+35,14,0,Math.PI*2);ctx.fill()}
      g.coins.forEach(c=>{ctx.fillStyle="#ffd83d";ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff4a8";ctx.lineWidth=3;ctx.stroke()});
      g.cars.forEach(drawCar);
      drawCar({...g.player,color:"#27a8ff"});
      // HUD
      ctx.fillStyle="#fff";ctx.font="bold 18px system-ui";ctx.fillText("SCORE "+g.score,18,30);ctx.fillText("BEST "+best,18,54);
      if(status==="ready"||status==="over"){
        ctx.fillStyle="rgba(5,10,20,.76)";ctx.fillRect(35,H/2-75,W-70,150);
        ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 27px system-ui";ctx.fillText(status==="ready"?"ROAD DASH":"CRASH!",W/2,H/2-25);
        ctx.font="16px system-ui";ctx.fillText(status==="ready"?"Press an arrow key or tap Start":"Score: "+g.score,W/2,H/2+12);ctx.fillText("Dodge traffic • Collect coins",W/2,H/2+42);ctx.textAlign="left";
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);
  },[status,best]);
  useEffect(()=>{if(status==="over"){const s=gameRef.current?.score||0;if(s>best){setBest(s);localStorage.setItem("retroverse-roaddash-best",String(s))}}},[status]);
  const press=(key)=>{keys.current[key]=true;if(status==="ready")setStatus("playing");setTimeout(()=>keys.current[key]=false,140)};
  return <div className="gameBox" style={{textAlign:"center"}}>
    <div className="stats"><span>ROAD DASH</span><span>BEST <b>{best}</b></span></div>
    <canvas ref={canvasRef} width={W} height={H} style={{width:"min(100%,420px)",height:"auto",borderRadius:12,display:"block",margin:"0 auto"}}/>
    <div style={{display:"flex",justifyContent:"center",gap:12,margin:"12px 0"}}>
      <button onPointerDown={()=>press("ArrowLeft")}>◀ Left</button><button onClick={()=>{reset();setStatus("playing")}}>▶ Start / Restart</button><button onPointerDown={()=>press("ArrowRight")}>Right ▶</button>
    </div>
    <p className="hint">Use ← → or A / D · Dodge cars and collect coins</p>
  </div>;
}
