import React,{useState} from "react";

const COLORS=["red","blue","green","yellow"];
const LABELS=["0","1","2","3","4","5","6","7","8","9","Skip","Reverse","+2"];
const makeDeck=()=>{let d=[];COLORS.forEach(c=>{d.push({c,n:"0"});for(let n=1;n<=9;n++){d.push({c,n:String(n)},{c,n:String(n)})}["Skip","Reverse","+2"].forEach(n=>d.push({c,n},{c,n}))});for(let i=0;i<4;i++)d.push({c:"wild",n:"Wild"},{c:"wild",n:"+4"});return d.sort(()=>Math.random()-.5)};
const valid=(card,top,color)=>card.c==="wild"||card.c===color||card.n===top.n;
const colorHex={red:"#e74b4b",blue:"#3589e8",green:"#28a86b",yellow:"#e9bd2d"};
function Card({card,onClick,small=false,disabled=false}){return <button disabled={disabled} onClick={onClick} style={{width:small?58:78,height:small?88:116,borderRadius:12,border:"3px solid white",background:card.c==="wild"?"#252536":colorHex[card.c],color:card.c==="yellow"?"#202020":"white",fontWeight:900,fontSize:small?16:22,boxShadow:"0 3px 7px #0005",position:"relative",flexShrink:0,opacity:disabled?.65:1}}><span style={{fontSize:small?11:14,position:"absolute",top:4,left:5}}>{card.n}</span><span>{card.n}</span><span style={{fontSize:small?11:14,position:"absolute",bottom:4,right:5}}>{card.n}</span></button>}
export default function Uno(){
 const [hand,setHand]=useState([]),[opp,setOpp]=useState([]),[deck,setDeck]=useState([]),[discard,setDiscard]=useState([]),[color,setColor]=useState("red"),[turn,setTurn]=useState("you"),[msg,setMsg]=useState("Press New Game"),[over,setOver]=useState(false),[started,setStarted]=useState(false);
 const top=discard[discard.length-1];
 const newGame=()=>{let d=makeDeck(),h=d.splice(0,7),o=d.splice(0,7),first=d.findIndex(c=>c.c!=="wild"&&["Skip","Reverse","+2"].includes(c.n)===false);let f=d.splice(first,1)[0];setHand(h);setOpp(o);setDeck(d);setDiscard([f]);setColor(f.c);setTurn("you");setMsg("Your turn — match color or number");setOver(false);setStarted(true)};
 const draw=(who)=>{if(!deck.length){setMsg("Deck empty — start a new game");return}let d=[...deck],c=d.pop();setDeck(d);if(who==="you")setHand(h=>[...h,c]);else setOpp(o=>[...o,c])};
 const play=(idx)=>{if(turn!=="you"||over)return;let c=hand[idx];if(!valid(c,top,color)){setMsg("That card doesn't match the color or number");return}let h=hand.filter((_,i)=>i!==idx);setHand(h);setDiscard(a=>[...a,c]);if(c.c!=="wild")setColor(c.c);if(!h.length){setOver(true);setMsg("🎉 You win!");return}
 if(c.c==="wild"){setMsg("Choose a color");setTurn("choose");return}
 if(["Skip","Reverse","+2"].includes(c.n)){if(c.n==="+2"){draw("cpu");draw("cpu")}setMsg("CPU skipped / penalty");setTurn("cpu");setTimeout(cpu,700)}else{setTurn("cpu");setTimeout(cpu,700)}
 };
 const cpu=()=>{if(over)return;let i=opp.findIndex(c=>valid(c,discard[discard.length-1],color));if(i<0){draw("cpu");setMsg("CPU drew a card");setTurn("you");return}let c=opp[i],o=opp.filter((_,j)=>j!==i);setOpp(o);setDiscard(a=>[...a,c]);if(c.c!=="wild")setColor(c.c);if(!o.length){setOver(true);setMsg("CPU wins! Try again.");return}if(c.c==="wild")setColor(COLORS[Math.floor(Math.random()*4)]);if(c.n==="+2"){draw("you");draw("you")}setMsg("CPU played "+c.n);setTurn("you")};
 const chooseColor=c=>{setColor(c);setTurn("cpu");setMsg("Color chosen: "+c);setTimeout(cpu,700)};
 return <div className="gameBox" style={{color:"white",textAlign:"center",padding:12}}>
 <div className="stats"><span>UNO</span><span>{started?`Your cards: ${hand.length}`:"Classic card game"}</span></div>
 <div style={{background:"#176b4c",borderRadius:18,padding:16,minHeight:340}}>
 <div style={{fontSize:14,opacity:.8}}>CPU · {opp.length} cards</div><div style={{display:"flex",justifyContent:"center",gap:5,margin:12}}>{opp.slice(0,7).map((_,i)=><div key={i} style={{width:25,height:38,background:"#29294b",border:"2px solid white",borderRadius:5,transform:"rotate(4deg)"}}/>)}</div>
 <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:22,margin:"22px 0"}}><button onClick={()=>{if(started&&turn==="you")draw("you")}} style={{background:"#29294b",color:"white",border:"2px solid white",borderRadius:12,padding:18}}>DRAW<br/>CARD</button>{top&&<div style={{transform:"rotate(-6deg)"}}><Card card={top}/></div>}</div>
 <div style={{fontWeight:700,minHeight:28}}>{msg}</div>
 {turn==="choose"&&<div style={{display:"flex",justifyContent:"center",gap:8,margin:8}}>{COLORS.map(c=><button key={c} onClick={()=>chooseColor(c)} style={{background:colorHex[c],border:0,borderRadius:50,width:42,height:42}}/>)}</div>}
 <div style={{fontSize:12,marginTop:8}}>Current color: <b style={{color:colorHex[color]}}>{color.toUpperCase()}</b></div>
 </div>
 <div style={{display:"flex",justifyContent:"center",gap:8,margin:12,flexWrap:"wrap"}}><button onClick={newGame}>🃏 New Game</button><button onClick={()=>{if(started&&turn==="you"&&!over){draw("you");setMsg("You drew a card")}}}>＋ Draw</button></div>
 <div style={{fontSize:13,marginBottom:8}}>YOUR HAND · {hand.length} cards {turn!=="you"&&!over?"(CPU turn)":""}</div>
 <div style={{display:"flex",gap:8,overflowX:"auto",padding:"8px 3px 15px",justifyContent:"flex-start"}}>{hand.map((c,i)=><Card key={i} card={c} small onClick={()=>play(i)} disabled={!started||turn!=="you"||over}/>)}</div>
 <p className="hint">Match the top card by color or number. Wild cards let you choose a color. First to empty their hand wins.</p>
 </div>
}
