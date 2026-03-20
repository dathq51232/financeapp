import { useState, useEffect } from "react";

const C = {
  bg:"#080c14", surface:"#0e1520", card:"#121b2a", border:"#1a2a40", borderLight:"#243348",
  accent:"#f0b429", accentGlow:"rgba(240,180,41,0.18)",
  green:"#17d9a1", greenGlow:"rgba(23,217,161,0.15)",
  red:"#f05252",   redGlow:"rgba(240,82,82,0.15)",
  blue:"#5b8def",  blueGlow:"rgba(91,141,239,0.15)",
  purple:"#9f7aea", text:"#e6eaf4", textSub:"#8496b5", textMuted:"#445570",
  glass:"rgba(10,15,24,0.9)",
};

const CAT_ICONS={"Ăn uống":"🍜","Di chuyển":"🚗","Nhà ở":"🏠","Mua sắm":"🛍","Giải trí":"🎮","Sức khỏe":"💊","Giáo dục":"📚","Lương":"💼","Freelance":"💻","Đầu tư":"📈","Thưởng":"🎁","Khác":"📦"};
const CATS_THU=["Lương","Freelance","Đầu tư","Thưởng","Khác"];
const CATS_CHI=["Ăn uống","Di chuyển","Nhà ở","Mua sắm","Giải trí","Sức khỏe","Giáo dục","Khác"];
const CAT_COLORS=[C.red,"#f97316","#eab308","#22c55e",C.blue,C.purple,"#ec4899","#14b8a6"];
const CARD_PALETTE=["#5b8def","#9f7aea","#17d9a1","#f05252","#f0b429","#f97316","#ec4899","#14b8a6"];

const today=new Date(), thisMonth=today.getMonth(), thisYear=today.getFullYear();
const fmt=n=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(n);
const fmtN=n=>new Intl.NumberFormat("vi-VN").format(n);
const fmtShort=n=>{const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(1)+" tỷ":a>=1e6?(n/1e6).toFixed(1)+" tr":a>=1e3?(n/1e3).toFixed(0)+"k":fmtN(n);};
const fmtInput=v=>{const n=v.replace(/\D/g,"");return n?fmtN(parseInt(n)):"";};
const getDaysUntil=day=>{const d=new Date(thisYear,thisMonth,day);if(d<today)d.setMonth(d.getMonth()+1);return Math.ceil((d-today)/86400000);};

const INIT={
  accounts:[
    {id:1,name:"Vietcombank",balance:15200000,color:C.green,icon:"🏦"},
    {id:2,name:"Techcombank",balance:8500000,color:C.blue,icon:"💳"},
    {id:3,name:"Tiền mặt",balance:2300000,color:C.accent,icon:"💵"},
  ],
  transactions:[
    {id:1,type:"thu",amount:18000000,category:"Lương",note:"Lương tháng 3",date:"2026-03-05",account:1},
    {id:2,type:"chi",amount:3500000,category:"Ăn uống",note:"Chi tiêu ẩm thực",date:"2026-03-08",account:1},
    {id:3,type:"chi",amount:1200000,category:"Di chuyển",note:"Xăng + grab",date:"2026-03-10",account:3},
    {id:4,type:"thu",amount:2000000,category:"Freelance",note:"Thiết kế logo",date:"2026-03-12",account:2},
    {id:5,type:"chi",amount:800000,category:"Giải trí",note:"Netflix + Spotify",date:"2026-03-14",account:1},
    {id:6,type:"chi",amount:4200000,category:"Nhà ở",note:"Tiền thuê nhà",date:"2026-03-15",account:1},
  ],
  creditCards:[
    {id:1,name:"Visa Vietcombank",limit:50000000,used:12500000,closingDay:15,paymentDay:5,color:"#5b8def",bank:"VCB"},
    {id:2,name:"Mastercard HSBC",limit:80000000,used:34200000,closingDay:20,paymentDay:10,color:"#9f7aea",bank:"HSBC"},
  ],
};

/* ── DONUT ── */
function DonutChart({income,expense}){
  const total=income+expense||1,R=52,cx=70,cy=70,sw=10,circ=2*Math.PI*R;
  const iD=(income/total-0.03)*circ,eOff=(income/total)*circ,eD=(expense/total-0.03)*circ;
  return(
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={sw}/>
      {income>0&&<circle cx={cx} cy={cy} r={R} fill="none" stroke={C.green} strokeWidth={sw} strokeDasharray={`${iD} ${circ-iD}`} strokeLinecap="round" strokeDashoffset={circ*.25} style={{filter:`drop-shadow(0 0 5px ${C.green}88)`}}/>}
      {expense>0&&<circle cx={cx} cy={cy} r={R} fill="none" stroke={C.red} strokeWidth={sw} strokeDasharray={`${eD} ${circ-eD}`} strokeLinecap="round" strokeDashoffset={circ*.25-eOff} style={{filter:`drop-shadow(0 0 5px ${C.red}88)`}}/>}
      <text x={cx} y={cy-9} textAnchor="middle" fill={C.textSub} fontSize="8.5" fontWeight="700" letterSpacing="1">TIẾT KIỆM</text>
      <text x={cx} y={cy+9} textAnchor="middle" fill={income-expense>=0?C.green:C.red} fontSize="14" fontWeight="800">{fmtShort(income-expense)}</text>
      <text x={cx} y={cy+23} textAnchor="middle" fill={C.textMuted} fontSize="8">tháng này</text>
    </svg>
  );
}

/* ── SPARKLINE ── */
function Sparkline({data,color}){
  if(!data.length)return null;
  const max=Math.max(...data,1),pts=data.map((v,i)=>`${(i/(data.length-1||1))*76},${26-((v/max)*20)}`).join(" ");
  const last=pts.split(" ").pop().split(",");
  return(
    <svg width="80" height="28" viewBox="0 0 80 28">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/>
      <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r="3" fill={color}/>
    </svg>
  );
}

/* ── NAV ── */
function NavItem({icon,label,active,onClick,special}){
  return(
    <button onClick={onClick} style={{flex:special?"0 0 auto":1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,border:"none",background:"none",cursor:"pointer",padding:special?"0":"8px 0",position:"relative",outline:"none"}}>
      {special?(
        <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#d4900f)`,boxShadow:`0 4px 18px ${C.accentGlow},0 0 0 3px ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginTop:-16}}>{icon}</div>
      ):(
        <>
          <div style={{width:38,height:38,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,background:active?`${C.accent}18`:"transparent",transition:"background .2s"}}>{icon}</div>
          <span style={{fontSize:10,fontWeight:active?700:500,color:active?C.accent:C.textMuted,transition:"color .2s"}}>{label}</span>
          {active&&<div style={{position:"absolute",bottom:2,width:4,height:4,borderRadius:"50%",background:C.accent,boxShadow:`0 0 6px ${C.accent}`}}/>}
        </>
      )}
    </button>
  );
}

/* ── ACC CARD (scroll) ── */
function AccCard({acc,onClick}){
  const [p,setP]=useState(false);
  return(
    <div onClick={onClick} onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)}
      style={{flexShrink:0,width:160,borderRadius:22,padding:"18px 18px 16px",background:`linear-gradient(145deg,${acc.color}20,${C.card} 75%)`,border:`1.5px solid ${acc.color}44`,cursor:"pointer",transform:p?"scale(0.95)":"scale(1)",transition:"transform .15s",boxShadow:p?"none":`0 4px 18px ${acc.color}15`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-18,right:-18,width:72,height:72,borderRadius:"50%",background:`${acc.color}14`}}/>
      <div style={{fontSize:26,marginBottom:10}}>{acc.icon}</div>
      <div style={{fontSize:11,color:C.textSub,fontWeight:600,marginBottom:4}}>{acc.name}</div>
      <div style={{fontSize:18,fontWeight:900,color:acc.color,letterSpacing:-0.5}}>{fmtShort(acc.balance)}</div>
      <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{fmtN(acc.balance)}₫</div>
      <div style={{position:"absolute",bottom:10,right:12,fontSize:9,color:`${acc.color}77`,fontWeight:700}}>SỬA ✏</div>
    </div>
  );
}

/* ── CREDIT CARD MINI (dashboard scroll) ── */
function CreditCardMini({card,onClick}){
  const pct=Math.round(card.used/card.limit*100), dP=getDaysUntil(card.paymentDay), [p,setP]=useState(false);
  return(
    <div onClick={onClick} onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)}
      style={{flexShrink:0,width:195,borderRadius:22,padding:"18px 18px 16px",
      background:`linear-gradient(145deg,${card.color}28,${C.card} 70%)`,
      border:`1.5px solid ${card.color}55`,cursor:"pointer",
      transform:p?"scale(0.95)":"scale(1)",transition:"transform .15s",
      boxShadow:p?"none":`0 4px 20px ${card.color}20`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${card.color}18`}}/>
      {/* chip */}
      <div style={{width:30,height:22,borderRadius:5,background:`linear-gradient(135deg,${card.color}88,${card.color}44)`,border:`1px solid ${card.color}66`,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:20,height:14,borderRadius:3,border:`1px solid ${card.color}44`,background:`${card.color}22`}}/>
      </div>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:card.color,marginBottom:2}}>{card.bank}</div>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
      {/* usage bar */}
      <div style={{height:4,background:C.border,borderRadius:4,marginBottom:6}}>
        <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>80?C.red:pct>60?C.accent:card.color,borderRadius:4,boxShadow:`0 0 8px ${pct>80?C.red:card.color}66`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:11,color:C.textSub}}>{fmtShort(card.used)} / {fmtShort(card.limit)}</div>
        <div style={{fontSize:10,fontWeight:700,color:dP<=3?C.red:C.green}}>TT: {dP}ng</div>
      </div>
      <div style={{fontSize:9,color:C.textMuted,marginTop:4}}>{pct}% hạn mức • Chốt ngày {card.closingDay}</div>
      <div style={{position:"absolute",bottom:10,right:12,fontSize:9,color:`${card.color}77`,fontWeight:700}}>SỬA ✏</div>
    </div>
  );
}

/* ── TX ROW ── */
function TxRow({tx,accounts,onDelete}){
  const [open,setOpen]=useState(false), acc=accounts.find(a=>a.id===tx.account), isInc=tx.type==="thu";
  return(
    <div style={{borderRadius:18,overflow:"hidden",marginBottom:8,background:C.card,border:`1px solid ${C.border}`}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 16px",cursor:"pointer"}}>
        <div style={{width:42,height:42,borderRadius:13,fontSize:18,background:isInc?C.greenGlow:C.redGlow,border:`1px solid ${isInc?C.green:C.red}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{CAT_ICONS[tx.category]||"📦"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.category}</div>
          <div style={{fontSize:11,color:C.textSub,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note||"—"}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontWeight:800,fontSize:14,color:isInc?C.green:C.red}}>{isInc?"+":"-"}{fmtShort(tx.amount)}</div>
          <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{tx.date.slice(5)}</div>
        </div>
      </div>
      {open&&(
        <div style={{padding:"10px 16px 13px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(8,12,20,.6)"}}>
          <div style={{fontSize:12,color:C.textSub}}>{acc?`${acc.icon} ${acc.name}`:"—"} · {tx.date}</div>
          <button onClick={()=>onDelete(tx.id)} style={{background:C.redGlow,border:`1px solid ${C.red}44`,borderRadius:10,padding:"6px 14px",color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑 Xoá</button>
        </div>
      )}
    </div>
  );
}

/* ── CREDIT CARD FULL (cards tab) ── */
function CreditCardFull({card,onEdit}){
  const pct=Math.round(card.used/card.limit*100), dC=getDaysUntil(card.closingDay), dP=getDaysUntil(card.paymentDay);
  return(
    <div style={{borderRadius:24,overflow:"hidden",marginBottom:16,border:`1.5px solid ${card.color}44`,background:`linear-gradient(140deg,${card.color}20,${C.card} 65%)`,position:"relative"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:`${card.color}14`}}/>
      <div style={{padding:"20px 20px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:card.color,textTransform:"uppercase",marginBottom:4}}>{card.bank}</div>
            <div style={{fontWeight:800,fontSize:17,color:C.text}}>{card.name}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:28}}>💳</div>
            <button onClick={onEdit} style={{background:`${card.color}22`,border:`1.5px solid ${card.color}55`,borderRadius:12,padding:"7px 14px",color:card.color,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏ Sửa</button>
          </div>
        </div>
        <div style={{background:"rgba(0,0,0,.3)",borderRadius:16,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSub,marginBottom:8}}>
            <span>Đã dùng</span><span>Hạn mức</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontWeight:800,fontSize:18,color:pct>80?C.red:C.text}}>{fmtShort(card.used)}</span>
            <span style={{fontWeight:700,fontSize:14,color:C.textSub}}>{fmtShort(card.limit)}</span>
          </div>
          <div style={{height:7,background:C.border,borderRadius:7}}>
            <div style={{height:"100%",width:`${Math.min(pct,100)}%`,borderRadius:7,background:pct>80?C.red:pct>60?C.accent:card.color,boxShadow:`0 0 10px ${pct>80?C.red:card.color}77`}}/>
          </div>
          <div style={{fontSize:11,color:pct>80?C.red:C.textMuted,marginTop:7,fontWeight:600}}>{pct}% hạn mức đã sử dụng</div>
        </div>
      </div>
      <div style={{display:"flex",borderTop:`1px solid ${card.color}22`}}>
        <div style={{flex:1,padding:"14px 18px",borderRight:`1px solid ${card.color}22`}}>
          <div style={{fontSize:9,color:C.textMuted,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>CHỐT SỔ</div>
          <div style={{fontWeight:800,fontSize:18,color:C.text}}>Ngày {card.closingDay}</div>
          <div style={{fontSize:11,fontWeight:700,color:dC<=3?C.red:C.accent,marginTop:3}}>⏱ Còn {dC} ngày</div>
        </div>
        <div style={{flex:1,padding:"14px 18px"}}>
          <div style={{fontSize:9,color:C.textMuted,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>THANH TOÁN</div>
          <div style={{fontWeight:800,fontSize:18,color:C.text}}>Ngày {card.paymentDay}</div>
          <div style={{fontSize:11,fontWeight:700,color:dP<=3?C.red:C.green,marginTop:3}}>⏱ Còn {dP} ngày</div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${card.color}22`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,0,0,.25)"}}>
        <span style={{fontSize:12,color:C.textSub}}>Tối thiểu cần trả</span>
        <span style={{fontWeight:800,fontSize:15,color:C.accent}}>{fmt(Math.round(card.used*.05))}</span>
      </div>
    </div>
  );
}

/* ════════════════════════ MAIN APP ════════════════════════ */
export default function App(){
  const [data,setData]=useState(()=>{try{const s=localStorage.getItem("fd4");return s?JSON.parse(s):INIT;}catch{return INIT;}});
  const [tab,setTab]=useState("overview");
  const [filterType,setFilterType]=useState("all");
  const [form,setForm]=useState({type:"chi",amount:"",category:"",note:"",date:today.toISOString().slice(0,10),account:1});

  // Account modal
  const [accModal,setAccModal]=useState(null);
  const [accForm,setAccForm]=useState({name:"",balance:"",icon:"🏦",color:C.green});

  // Credit card modal — supports add & edit
  const BLANK_CARD={name:"",limit:"",used:"",closingDay:"",paymentDay:"",bank:"",color:"#5b8def"};
  const [cardModal,setCardModal]=useState(null); // null | {mode:"add"} | {mode:"edit",id}
  const [cardForm,setCardForm]=useState(BLANK_CARD);

  useEffect(()=>{try{localStorage.setItem("fd4",JSON.stringify(data));}catch{}},[data]);

  const monthTx=data.transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===thisMonth&&d.getFullYear()===thisYear;});
  const monthIncome=monthTx.filter(t=>t.type==="thu").reduce((s,t)=>s+t.amount,0);
  const monthExpense=monthTx.filter(t=>t.type==="chi").reduce((s,t)=>s+t.amount,0);
  const totalBalance=data.accounts.reduce((s,a)=>s+a.balance,0);
  const totalDebt=data.creditCards.reduce((s,c)=>s+c.used,0);
  const filtered=[...data.transactions].filter(t=>filterType==="all"||t.type===filterType).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const catExp={};
  monthTx.filter(t=>t.type==="chi").forEach(t=>{catExp[t.category]=(catExp[t.category]||0)+t.amount;});
  const catList=Object.entries(catExp).sort((a,b)=>b[1]-a[1]);

  const spark=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-6+i);const ds=d.toISOString().slice(0,10);return data.transactions.filter(t=>t.type==="chi"&&t.date===ds).reduce((s,t)=>s+t.amount,0);});

  /* ── Handlers ── */
  const addTransaction=()=>{
    if(!form.amount||!form.category)return;
    const amt=parseInt(form.amount.replace(/\D/g,""));if(!amt)return;
    const newTx={id:Date.now(),...form,amount:amt,account:parseInt(form.account)};
    setData(d=>({...d,transactions:[newTx,...d.transactions],accounts:d.accounts.map(a=>a.id===newTx.account?{...a,balance:a.balance+(newTx.type==="thu"?amt:-amt)}:a)}));
    setForm({type:"chi",amount:"",category:"",note:"",date:today.toISOString().slice(0,10),account:1});
    setTab("transactions");
  };
  const deleteTx=id=>{const tx=data.transactions.find(t=>t.id===id);if(!tx)return;setData(d=>({...d,transactions:d.transactions.filter(t=>t.id!==id),accounts:d.accounts.map(a=>a.id===tx.account?{...a,balance:a.balance+(tx.type==="thu"?-tx.amount:tx.amount)}:a)}));};

  // Account CRUD
  const openAddAcc=()=>{setAccForm({name:"",balance:"",icon:"🏦",color:C.green});setAccModal({mode:"add"});};
  const openEditAcc=acc=>{setAccForm({name:acc.name,balance:fmtN(acc.balance),icon:acc.icon,color:acc.color});setAccModal({mode:"edit",id:acc.id});};
  const saveAcc=()=>{const bal=parseInt(accForm.balance.replace(/\D/g,"")||"0");if(!accForm.name)return;if(accModal.mode==="add")setData(d=>({...d,accounts:[...d.accounts,{id:Date.now(),name:accForm.name,balance:bal,icon:accForm.icon,color:accForm.color}]}));else setData(d=>({...d,accounts:d.accounts.map(a=>a.id===accModal.id?{...a,name:accForm.name,balance:bal,icon:accForm.icon,color:accForm.color}:a)}));setAccModal(null);};
  const deleteAcc=id=>{if(data.accounts.length<=1)return;setData(d=>({...d,accounts:d.accounts.filter(a=>a.id!==id),transactions:d.transactions.filter(t=>t.account!==id)}));setAccModal(null);};

  // Credit card CRUD
  const openAddCard=()=>{setCardForm(BLANK_CARD);setCardModal({mode:"add"});};
  const openEditCard=card=>{setCardForm({name:card.name,limit:fmtN(card.limit),used:fmtN(card.used),closingDay:String(card.closingDay),paymentDay:String(card.paymentDay),bank:card.bank,color:card.color});setCardModal({mode:"edit",id:card.id});};
  const saveCard=()=>{
    if(!cardForm.name||!cardForm.limit)return;
    const payload={name:cardForm.name,bank:cardForm.bank,color:cardForm.color,
      limit:parseInt(cardForm.limit.replace(/\D/g,"")||0),used:parseInt(cardForm.used.replace(/\D/g,"")||0),
      closingDay:parseInt(cardForm.closingDay||15),paymentDay:parseInt(cardForm.paymentDay||5)};
    if(cardModal.mode==="add")setData(d=>({...d,creditCards:[...d.creditCards,{id:Date.now(),...payload}]}));
    else setData(d=>({...d,creditCards:d.creditCards.map(c=>c.id===cardModal.id?{...c,...payload}:c)}));
    setCardModal(null);
  };
  const deleteCard=id=>{setData(d=>({...d,creditCards:d.creditCards.filter(c=>c.id!==id)}));setCardModal(null);};

  /* ── Shared styles ── */
  const inputSt={width:"100%",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"14px 16px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const selSt={...inputSt,appearance:"none"};
  const btnSt=c=>({background:c,border:"none",borderRadius:16,padding:"15px 0",width:"100%",color:c===C.accent?"#07090f":C.text,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 14px ${c}44`});
  const lbl={fontSize:10,fontWeight:700,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:8,display:"block"};
  const moSt={position:"fixed",inset:0,background:"rgba(4,8,16,.8)",backdropFilter:"blur(12px)",display:"flex",alignItems:"flex-end",zIndex:200};
  const moBx={background:C.surface,borderTop:`1.5px solid ${C.borderLight}`,borderRadius:"28px 28px 0 0",padding:"12px 20px 44px",width:"100%",maxHeight:"88vh",overflowY:"auto",boxSizing:"border-box"};
  const dragPill={width:40,height:4,borderRadius:4,background:C.border,margin:"0 auto 22px"};
  const typB=(a,c)=>({flex:1,border:`2px solid ${a?c:C.border}`,background:a?`${c}18`:"transparent",borderRadius:14,padding:"13px 0",color:a?c:C.textSub,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"});
  const filtB=a=>({border:`1.5px solid ${a?C.accent:C.border}`,background:a?`${C.accent}18`:"transparent",borderRadius:20,padding:"7px 16px",color:a?C.accent:C.textSub,fontWeight:a?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit"});
  const secTitle={fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:1.5,textTransform:"uppercase"};

  const CardFormFields=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div><span style={lbl}>Tên thẻ</span><input style={inputSt} placeholder="VD: Visa Vietcombank" value={cardForm.name} onChange={e=>setCardForm(f=>({...f,name:e.target.value}))}/></div>
      <div><span style={lbl}>Ngân hàng</span><input style={inputSt} placeholder="VCB, HSBC, MB..." value={cardForm.bank} onChange={e=>setCardForm(f=>({...f,bank:e.target.value}))}/></div>
      <div><span style={lbl}>Hạn mức tín dụng (₫)</span><input style={{...inputSt,fontSize:18,fontWeight:800,color:C.accent}} placeholder="0" inputMode="numeric" value={cardForm.limit} onChange={e=>setCardForm(f=>({...f,limit:fmtInput(e.target.value)}))}/></div>
      <div><span style={lbl}>Dư nợ hiện tại (₫)</span><input style={{...inputSt,fontSize:16,fontWeight:700,color:C.red}} placeholder="0" inputMode="numeric" value={cardForm.used} onChange={e=>setCardForm(f=>({...f,used:fmtInput(e.target.value)}))}/></div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><span style={lbl}>Ngày chốt sao kê</span><input style={inputSt} placeholder="15" type="number" min="1" max="31" value={cardForm.closingDay} onChange={e=>setCardForm(f=>({...f,closingDay:e.target.value}))}/></div>
        <div style={{flex:1}}><span style={lbl}>Ngày thanh toán</span><input style={inputSt} placeholder="5" type="number" min="1" max="31" value={cardForm.paymentDay} onChange={e=>setCardForm(f=>({...f,paymentDay:e.target.value}))}/></div>
      </div>
      <div><span style={lbl}>Màu thẻ</span>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {CARD_PALETTE.map(c=><div key={c} onClick={()=>setCardForm(f=>({...f,color:c}))} style={{width:34,height:34,borderRadius:"50%",background:c,cursor:"pointer",border:cardForm.color===c?"3px solid white":"3px solid transparent",boxShadow:cardForm.color===c?`0 0 12px ${c}99`:"none",transition:"all .15s"}}/>)}
        </div>
      </div>
      {/* Preview */}
      {cardForm.name&&(
        <div style={{background:`${cardForm.color}18`,border:`1.5px solid ${cardForm.color}44`,borderRadius:18,padding:"16px 18px"}}>
          <div style={{fontSize:10,fontWeight:800,color:cardForm.color,letterSpacing:2,marginBottom:4}}>{cardForm.bank||"BANK"}</div>
          <div style={{fontWeight:800,fontSize:15,color:C.text,marginBottom:8}}>{cardForm.name}</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSub}}>
            <span>Dư nợ: <strong style={{color:C.red}}>{cardForm.used?cardForm.used+"₫":"—"}</strong></span>
            <span>Hạn: <strong style={{color:C.accent}}>{cardForm.limit?cardForm.limit+"₫":"—"}</strong></span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textMuted,marginTop:6}}>
            <span>Chốt: ngày {cardForm.closingDay||"?"}</span>
            <span>Thanh toán: ngày {cardForm.paymentDay||"?"}</span>
          </div>
        </div>
      )}
      <button style={btnSt(C.accent)} onClick={saveCard}>{cardModal?.mode==="add"?"✓ Thêm thẻ":"✓ Lưu thay đổi"}</button>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter','Be Vietnam Pro',sans-serif",paddingBottom:100}}>

      {/* ════ OVERVIEW ════ */}
      {tab==="overview"&&(
        <div>
          <div style={{padding:"48px 20px 0",background:`linear-gradient(180deg,${C.surface},${C.bg})`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <div style={{fontSize:12,color:C.textSub,marginBottom:3}}>Tháng {thisMonth+1} / {thisYear}</div>
                <div style={{fontSize:26,fontWeight:800,letterSpacing:-1}}>Tổng quan 📊</div>
              </div>
              <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#c97c0c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 4px 14px ${C.accentGlow}`}}>👤</div>
            </div>

            {/* HERO */}
            <div style={{background:"linear-gradient(140deg,#0f1d32,#0a1525)",border:`1.5px solid ${C.borderLight}`,borderRadius:26,padding:"22px 22px 20px",marginBottom:18,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}10,transparent 70%)`}}/>
              <div style={{position:"absolute",bottom:-30,left:-30,width:130,height:130,borderRadius:"50%",background:`radial-gradient(circle,${C.blue}10,transparent 70%)`}}/>
              <div style={{fontSize:10,color:C.textSub,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Tổng tài sản</div>
              <div style={{fontSize:36,fontWeight:900,letterSpacing:-2,color:C.accent,marginBottom:4,lineHeight:1}}>{fmt(totalBalance)}</div>
              {totalDebt>0&&<div style={{fontSize:12,color:C.red,marginBottom:16}}>Dư nợ thẻ: -{fmtShort(totalDebt)}</div>}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <DonutChart income={monthIncome} expense={monthExpense}/>
                <div style={{flex:1}}>
                  <div style={{background:C.greenGlow,border:`1px solid ${C.green}33`,borderRadius:14,padding:"12px 14px",marginBottom:10}}>
                    <div style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:1,marginBottom:3}}>↑ THU NHẬP</div>
                    <div style={{fontSize:19,fontWeight:800,color:C.green}}>+{fmtShort(monthIncome)}</div>
                  </div>
                  <div style={{background:C.redGlow,border:`1px solid ${C.red}33`,borderRadius:14,padding:"12px 14px"}}>
                    <div style={{fontSize:10,color:C.red,fontWeight:700,letterSpacing:1,marginBottom:3}}>↓ CHI TIÊU</div>
                    <div style={{fontSize:19,fontWeight:800,color:C.red}}>-{fmtShort(monthExpense)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{padding:"0 16px"}}>
            {/* SPARKLINE */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"16px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{...secTitle,marginBottom:4}}>Chi tiêu 7 ngày</div>
                <div style={{fontSize:20,fontWeight:800,color:C.red}}>{fmtShort(spark.reduce((s,v)=>s+v,0))}</div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>~ {fmtShort(spark.reduce((s,v)=>s+v,0)/7)}/ngày</div>
              </div>
              <Sparkline data={spark} color={C.red}/>
            </div>

            {/* ACCOUNTS */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={secTitle}>Tài khoản</div>
              <button onClick={openAddAcc} style={{background:`${C.accent}18`,border:`1px solid ${C.accent}44`,borderRadius:20,padding:"5px 14px",color:C.accent,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
            </div>
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",marginBottom:22}}>
              {data.accounts.map(acc=><AccCard key={acc.id} acc={acc} onClick={()=>openEditAcc(acc)}/>)}
            </div>

            {/* CREDIT CARDS ON DASHBOARD */}
            {data.creditCards.length>0&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={secTitle}>Thẻ tín dụng</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={openAddCard} style={{background:`${C.purple}18`,border:`1px solid ${C.purple}44`,borderRadius:20,padding:"5px 14px",color:C.purple,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
                    <button onClick={()=>setTab("cards")} style={{background:"none",border:"none",color:C.accent,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Chi tiết →</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",marginBottom:22}}>
                  {data.creditCards.map(card=><CreditCardMini key={card.id} card={card} onClick={()=>openEditCard(card)}/>)}
                </div>
                {/* total debt summary */}
                <div style={{background:`${C.red}0e`,border:`1px solid ${C.red}33`,borderRadius:18,padding:"14px 18px",marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:C.red,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Tổng dư nợ thẻ</div>
                    <div style={{fontSize:20,fontWeight:800,color:C.red}}>-{fmt(totalDebt)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Tối thiểu</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.accent}}>{fmt(Math.round(totalDebt*.05))}</div>
                  </div>
                </div>
              </>
            )}
            {data.creditCards.length===0&&(
              <div style={{marginBottom:22}}>
                <div style={{...secTitle,marginBottom:12}}>Thẻ tín dụng</div>
                <button onClick={openAddCard} style={{width:"100%",padding:"16px 0",borderRadius:18,border:`2px dashed ${C.border}`,background:"transparent",color:C.textMuted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm thẻ tín dụng</button>
              </div>
            )}

            {/* CATEGORIES */}
            {catList.length>0&&(
              <>
                <div style={{...secTitle,marginBottom:12}}>Chi tiêu theo danh mục</div>
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden",marginBottom:22}}>
                  {catList.map(([cat,amt],i)=>{
                    const pct=Math.round(amt/monthExpense*100),color=CAT_COLORS[i%CAT_COLORS.length];
                    return(
                      <div key={cat} style={{padding:"13px 18px",borderBottom:i<catList.length-1?`1px solid ${C.border}`:"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:19}}>{CAT_ICONS[cat]||"📦"}</span>
                            <div><div style={{fontWeight:600,fontSize:13,color:C.text}}>{cat}</div><div style={{fontSize:10,color:C.textMuted}}>{pct}%</div></div>
                          </div>
                          <div style={{fontWeight:800,fontSize:13,color}}>-{fmtShort(amt)}</div>
                        </div>
                        <div style={{height:4,background:C.border,borderRadius:4}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,boxShadow:`0 0 8px ${color}55`}}/></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* RECENT TX */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={secTitle}>Gần đây</div>
              <button onClick={()=>setTab("transactions")} style={{background:"none",border:"none",color:C.accent,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Xem tất cả →</button>
            </div>
            {data.transactions.slice(0,4).map(tx=><TxRow key={tx.id} tx={tx} accounts={data.accounts} onDelete={deleteTx}/>)}
          </div>
        </div>
      )}

      {/* ════ TRANSACTIONS ════ */}
      {tab==="transactions"&&(
        <div style={{padding:"52px 16px 0"}}>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:-1,marginBottom:18}}>Giao dịch 📋</div>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {["all","thu","chi"].map(f=><button key={f} style={filtB(filterType===f)} onClick={()=>setFilterType(f)}>{f==="all"?"Tất cả":f==="thu"?"📈 Thu":"📉 Chi"}</button>)}
          </div>
          {filtered.length===0&&<div style={{textAlign:"center",color:C.textMuted,padding:48,fontSize:14}}>Chưa có giao dịch</div>}
          {filtered.map(tx=><TxRow key={tx.id} tx={tx} accounts={data.accounts} onDelete={deleteTx}/>)}
        </div>
      )}

      {/* ════ ADD ════ */}
      {tab==="add"&&(
        <div style={{padding:"52px 16px 0"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:26,fontWeight:800,letterSpacing:-1,marginBottom:4}}>Thêm giao dịch ✍️</div>
            <div style={{fontSize:13,color:C.textSub}}>Ghi lại thu nhập hoặc chi tiêu</div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:22}}>
            <button style={typB(form.type==="chi",C.red)} onClick={()=>setForm(f=>({...f,type:"chi",category:""}))}>📉 Chi tiêu</button>
            <button style={typB(form.type==="thu",C.green)} onClick={()=>setForm(f=>({...f,type:"thu",category:""}))}>📈 Thu nhập</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><span style={lbl}>Số tiền (VNĐ)</span>
              <input style={{...inputSt,fontSize:22,fontWeight:800,color:form.type==="thu"?C.green:C.red}} placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:fmtInput(e.target.value)}))} inputMode="numeric"/>
            </div>
            <div><span style={lbl}>Danh mục</span>
              <select style={selSt} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="">-- Chọn danh mục --</option>
                {(form.type==="thu"?CATS_THU:CATS_CHI).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><span style={lbl}>Tài khoản</span>
              <select style={selSt} value={form.account} onChange={e=>setForm(f=>({...f,account:e.target.value}))}>
                {data.accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name} — {fmtShort(a.balance)}</option>)}
              </select>
            </div>
            <div><span style={lbl}>Ngày</span><input style={inputSt} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div><span style={lbl}>Ghi chú</span><input style={inputSt} placeholder="Mô tả giao dịch..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
            <button style={btnSt(form.type==="thu"?C.green:C.red)} onClick={addTransaction}>{form.type==="thu"?"✓ Ghi nhận thu nhập":"✓ Ghi nhận chi tiêu"}</button>
          </div>
        </div>
      )}

      {/* ════ CARDS TAB ════ */}
      {tab==="cards"&&(
        <div style={{padding:"52px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:26,fontWeight:800,letterSpacing:-1}}>Thẻ tín dụng 💳</div>
            <button onClick={openAddCard} style={{background:`${C.accent}18`,border:`1.5px solid ${C.accent}55`,borderRadius:20,padding:"8px 18px",color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
          </div>
          <div style={{fontSize:13,color:C.textSub,marginBottom:22}}>Hạn mức & lịch thanh toán</div>
          {data.creditCards.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>💳</div>
              <div style={{color:C.textMuted,fontSize:14,marginBottom:20}}>Chưa có thẻ tín dụng nào</div>
              <button onClick={openAddCard} style={{...btnSt(C.accent),width:"auto",padding:"12px 28px"}}>+ Thêm thẻ đầu tiên</button>
            </div>
          )}
          {data.creditCards.map(card=><CreditCardFull key={card.id} card={card} onEdit={()=>openEditCard(card)}/>)}
          {data.creditCards.length>0&&(
            <div style={{background:`${C.red}0e`,border:`1px solid ${C.red}33`,borderRadius:20,padding:"18px 20px",marginTop:6}}>
              <div style={{fontSize:11,color:C.textMuted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>TỔNG KẾT DƯ NỢ</div>
              {data.creditCards.map(c=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c.color}}/>
                    <span style={{fontSize:13,color:C.textSub}}>{c.name}</span>
                  </div>
                  <span style={{fontWeight:700,fontSize:13,color:C.red}}>{fmt(c.used)}</span>
                </div>
              ))}
              <div style={{height:1,background:C.border,margin:"12px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:800,fontSize:14,color:C.text}}>Tổng cộng</span>
                <span style={{fontWeight:900,fontSize:18,color:C.red}}>{fmt(totalDebt)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <span style={{fontSize:12,color:C.textSub}}>Tổng tối thiểu cần trả</span>
                <span style={{fontWeight:800,fontSize:14,color:C.accent}}>{fmt(Math.round(totalDebt*.05))}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ ACCOUNTS TAB ════ */}
      {tab==="accounts"&&(
        <div style={{padding:"52px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <div>
              <div style={{fontSize:26,fontWeight:800,letterSpacing:-1,marginBottom:2}}>Tài khoản 🏦</div>
              <div style={{fontSize:13,color:C.textSub}}>Tổng: {fmt(totalBalance)}</div>
            </div>
            <button onClick={openAddAcc} style={{background:`${C.accent}18`,border:`1.5px solid ${C.accent}55`,borderRadius:20,padding:"8px 18px",color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
          </div>
          {data.accounts.map(acc=>(
            <div key={acc.id} onClick={()=>openEditAcc(acc)} style={{background:C.card,border:`1.5px solid ${acc.color}33`,borderRadius:22,padding:"18px 20px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:16,boxShadow:`0 2px 14px ${acc.color}10`}}>
              <div style={{width:54,height:54,borderRadius:17,background:`${acc.color}22`,border:`1.5px solid ${acc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{acc.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>{acc.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:acc.color,boxShadow:`0 0 6px ${acc.color}`}}/>
                  <div style={{fontSize:12,color:C.textSub}}>Số dư khả dụng</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:900,fontSize:19,color:acc.color,letterSpacing:-0.5}}>{fmtShort(acc.balance)}</div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{fmtN(acc.balance)}₫</div>
                <div style={{fontSize:10,color:`${acc.color}88`,fontWeight:700,marginTop:3}}>✏ SỬA</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════ FLOATING NAV ════ */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,padding:"0 14px 14px",background:`linear-gradient(0deg,${C.bg} 55%,transparent)`}}>
        <div style={{background:C.glass,backdropFilter:"blur(24px) saturate(180%)",border:`1.5px solid ${C.borderLight}`,borderRadius:30,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"6px 10px",boxShadow:"0 8px 40px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.05) inset",maxWidth:480,margin:"0 auto"}}>
          <NavItem icon="🏠" label="Dashboard" active={tab==="overview"} onClick={()=>setTab("overview")}/>
          <NavItem icon="📋" label="Giao dịch" active={tab==="transactions"} onClick={()=>setTab("transactions")}/>
          <NavItem icon="+" label="" active={tab==="add"} onClick={()=>setTab("add")} special/>
          <NavItem icon="💳" label="Thẻ" active={tab==="cards"} onClick={()=>setTab("cards")}/>
          <NavItem icon="🏦" label="TK" active={tab==="accounts"} onClick={()=>setTab("accounts")}/>
        </div>
      </div>

      {/* ════ ACCOUNT MODAL ════ */}
      {accModal&&(
        <div style={moSt} onClick={()=>setAccModal(null)}>
          <div style={moBx} onClick={e=>e.stopPropagation()}>
            <div style={dragPill}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div style={{fontWeight:800,fontSize:20}}>{accModal.mode==="add"?"Thêm tài khoản":"Chỉnh sửa tài khoản"}</div>
              {accModal.mode==="edit"&&<button onClick={()=>deleteAcc(accModal.id)} style={{background:C.redGlow,border:`1px solid ${C.red}44`,borderRadius:12,padding:"8px 16px",color:C.red,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>🗑 Xoá</button>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><span style={lbl}>Tên tài khoản</span><input style={inputSt} placeholder="VD: Vietcombank..." value={accForm.name} onChange={e=>setAccForm(f=>({...f,name:e.target.value}))}/></div>
              <div><span style={lbl}>Số dư (VNĐ)</span><input style={{...inputSt,fontSize:22,fontWeight:800,color:C.accent}} placeholder="0" inputMode="numeric" value={accForm.balance} onChange={e=>setAccForm(f=>({...f,balance:fmtInput(e.target.value)}))}/></div>
              <div><span style={lbl}>Icon</span>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {["🏦","💳","💵","🏧","💰","🪙","📱","🏠","💼","🚗"].map(ic=>(
                    <div key={ic} onClick={()=>setAccForm(f=>({...f,icon:ic}))} style={{width:46,height:46,borderRadius:14,background:accForm.icon===ic?`${C.accent}28`:C.surface,border:`2px solid ${accForm.icon===ic?C.accent:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",transition:"all .15s"}}>{ic}</div>
                  ))}
                </div>
              </div>
              <div><span style={lbl}>Màu sắc</span>
                <div style={{display:"flex",gap:12}}>
                  {[C.green,C.blue,C.accent,C.purple,C.red,"#ff9f43","#14b8a6","#ec4899"].map(c=>(
                    <div key={c} onClick={()=>setAccForm(f=>({...f,color:c}))} style={{width:34,height:34,borderRadius:"50%",background:c,cursor:"pointer",border:accForm.color===c?"3px solid white":"3px solid transparent",boxShadow:accForm.color===c?`0 0 12px ${c}99`:"none",transition:"all .15s"}}/>
                  ))}
                </div>
              </div>
              <div style={{background:`${accForm.color||C.green}14`,border:`1.5px solid ${accForm.color||C.green}44`,borderRadius:18,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:15,background:`${accForm.color||C.green}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{accForm.icon||"🏦"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{accForm.name||"Tên tài khoản"}</div><div style={{fontSize:11,color:C.textSub}}>Xem trước</div></div>
                <div style={{fontWeight:900,fontSize:18,color:accForm.color||C.green}}>{accForm.balance?accForm.balance+"₫":"0₫"}</div>
              </div>
              <button style={btnSt(C.accent)} onClick={saveAcc}>{accModal.mode==="add"?"✓ Thêm tài khoản":"✓ Lưu thay đổi"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ CREDIT CARD MODAL (ADD / EDIT) ════ */}
      {cardModal&&(
        <div style={moSt} onClick={()=>setCardModal(null)}>
          <div style={moBx} onClick={e=>e.stopPropagation()}>
            <div style={dragPill}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div style={{fontWeight:800,fontSize:20}}>{cardModal.mode==="add"?"Thêm thẻ tín dụng":"Chỉnh sửa thẻ"}</div>
              {cardModal.mode==="edit"&&(
                <button onClick={()=>deleteCard(cardModal.id)} style={{background:C.redGlow,border:`1px solid ${C.red}44`,borderRadius:12,padding:"8px 16px",color:C.red,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>🗑 Xoá</button>
              )}
            </div>
            <CardFormFields/>
          </div>
        </div>
      )}
    </div>
  );
}
