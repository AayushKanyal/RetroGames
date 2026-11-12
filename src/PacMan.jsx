import React, { useEffect, useRef, useState } from "react";

const MAP = [
"###################",
"#........#........#",
"#.##.###.#.###.##..",
"#o#.............#o#",
"#.##.#.#####.#.##..",
"#....#...#...#....#",
"####.###.#.###.####",
"   #.#.......#.#   ",
"####.#.## ##.#.####",
".....#.#GGG#.#.....",
"####.#.#####.#.####",
"   #...........#   ",
"####.#.#####.#.####",
"#....#...#...#....#",
"#.##.###.#.###.##..",
"#o..............###",
"###################"
];

const TILE=24;
const DIRS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
const key=(x,y)=>`${x},${y}`;
const walkable=(x,y)=>MAP[y]?.[x] && MAP[y][x]!=="#";

export default function PacMan(){
 const canvas=useRef(null), game=useRef(null);
 const [score,setScore]=useState(0),[status,setStatus]=useState("ready"),[level,setLevel]=useState(1);
 const reset=()=>{const dots=new Set();MAP.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==="."||v==="o")dots.add(key(x,y))}));
 game.current={px:1,py:1,dir:[0,0],next:[0,0],ghosts:[{x:9,y:9,c:"#ff5577"},{x:10,y:9,c:"#55d9ff"},{x:8,y:9,c:"#ffb84d"}],dots,power:0,tick:0};setScore(0);setStatus("ready")};
 useEffect(()=>{reset()},[]);
 useEffect(()=>{
  const onKey=e=>{if(DIRS[e.key]){e.preventDefault();game.current.next=DIRS[e.key];if(status==="ready")setStatus("playing")}if(e.key===" "&&status!=="playing")setStatus("playing")};
  window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)
 },[status]);
 useEffect(()=>{
  const ctx=canvas.current?.getContext("2d");if(!ctx)return;let frame=0;
  const draw=()=>{
   const g=game.current;if(!g)return;ctx.fillStyle="#080b20";ctx.fillRect(0,0,MAP[0].length*TILE,MAP.length*TILE);
   MAP.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==="#"){ctx.fillStyle="#243bdb";ctx.fillRect(x*TILE,y*TILE,TILE,TILE);ctx.strokeStyle="#4964ff";ctx.strokeRect(x*TILE+3,y*TILE+3,TILE-6,TILE-6)}else if(g.dots.has(key(x,y))){ctx.fillStyle=v==="o"?"#fff":"#ffe8a3";ctx.beginPath();ctx.arc(x*TILE+12,y*TILE+12,v==="o"?5:2.5,0,Math.PI*2);ctx.fill()}}));
   // Pac-Man
   ctx.fillStyle="#ffdf35";ctx.beginPath();ctx.arc(g.px*TILE+12,g.py*TILE+12,10,.25*Math.PI,1.75*Math.PI);ctx.lineTo(g.px*TILE+12,g.py*TILE+12);ctx.fill();
   g.ghosts.forEach((gh,i)=>{ctx.fillStyle=g.power>0?"#5a75ff":gh.c;ctx.beginPath();ctx.arc(gh.x*TILE+12,gh.y*TILE+12,10,Math.PI,0);ctx.lineTo(gh.x*TILE+22,gh.y*TILE+22);ctx.lineTo(gh.x*TILE+16,gh.y*TILE+18);ctx.lineTo(gh.x*TILE+11,gh.y*TILE+22);ctx.lineTo(gh.x*TILE+5,gh.y*TILE+18);ctx.lineTo(gh.x*TILE+2,gh.y*TILE+22);ctx.closePath();ctx.fill();ctx.fillStyle="white";ctx.fillRect(gh.x*TILE+7,gh.y*TILE+8,4,5);ctx.fillRect(gh.x*TILE+15,gh.y*TILE+8,4,5)});
   if(status==="ready"||status==="over"||status==="won"){ctx.fillStyle="#000b";ctx.fillRect(20,MAP.length*TILE/2-32,MAP[0].length*TILE-40,64);ctx.fillStyle="white";ctx.font="bold 20px system-ui";ctx.textAlign="center";ctx.fillText(status==="ready"?"PRESS SPACE OR ARROW":status==="won"?"MAZE CLEARED!":"GAME OVER",MAP[0].length*TILE/2,MAP.length*TILE/2+5);ctx.textAlign="left"}
  };
  const step=()=>{const g=game.current;if(status==="playing"&&g){
    if(frame++%7===0){let [nx,ny]=g.next;if(walkable(g.px+nx,g.py+ny)){g.dir=g.next}let [dx,dy]=g.dir;if(walkable(g.px+dx,g.py+dy)){g.px+=dx;g.py+=dy}
      const k=key(g.px,g.py);if(g.dots.has(k)){g.dots.delete(k);setScore(s=>s+10);if(MAP[g.py][g.px]==="o")g.power=70}if(g.power>0)g.power--;
      g.ghosts.forEach(gh=>{if(Math.random()<.65){let options=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>walkable(gh.x+a,gh.y+b));if(options.length){let d=options[Math.floor(Math.random()*options.length)];gh.x+=d[0];gh.y+=d[1]}}});if(g.ghosts.some(gh=>gh.x===g.px&&gh.y===g.py)){if(g.power>0){g.ghosts.forEach(gh=>{gh.x=9;gh.y=9});setScore(s=>s+200)}else setStatus("over")}if(g.dots.size===0)setStatus("won");
    }}draw();frame=requestAnimationFrame(step)};
  frame=requestAnimationFrame(step);return()=>cancelAnimationFrame(frame)
 },[status]);
 return <div className="gameBox"><div className="stats"><span>SCORE <b>{score}</b></span><span>LEVEL <b>{level}</b></span></div><canvas ref={canvas} width={MAP[0].length*TILE} height={MAP.length*TILE} style={{maxWidth:"100%",height:"auto"}}/><p className="hint">Arrow keys to move · Power pellets let you eat ghosts</p><button onClick={()=>{reset();setStatus("playing")}}>▶ Restart Pac-Man</button></div>
}
