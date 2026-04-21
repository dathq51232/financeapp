import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import * as db from "./lib/db"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile"

/* ════ PALETTE — professional blue/neutral ════ */
const C={
  bg:"#f0f2f5",
  white:"#ffffff",
  surface2:"#f7f8fa",
  line:"#e4e7ec",
  lineSoft:"#eef0f3",
  text:"#111827",
  textSub:"#6b7280",
  textMuted:"#9ca3af",
  primary:"#2563eb",
  primarySoft:"#eff4ff",
  primaryDark:"#1d4ed8",
  green:"#059669",
  greenSoft:"#ecfdf5",
  red:"#dc2626",
  redSoft:"#fef2f2",
  blue:"#2563eb",
  blueSoft:"#eff4ff",
  amber:"#d97706",
  amberSoft:"#fffbeb",
  purple:"#7c3aed",
  purpleSoft:"#ede9fe",
  teal:"#0891b2",
  tealSoft:"#ecfeff",
}
const CAT_ICONS={"Ăn uống":"🍜","Di chuyển":"🚗","Nhà ở":"🏠","Mua sắm":"🛍","Giải trí":"🎮","Sức khỏe":"💊","Giáo dục":"📚","Lương":"💼","Freelance":"💻","Đầu tư":"📈","Thưởng":"🎁","Khác":"📦"}
const CATS_THU=["Lương","Freelance","Đầu tư","Thưởng","Khác"]
const CATS_CHI=["Ăn uống","Di chuyển","Nhà ở","Mua sắm","Giải trí","Sức khỏe","Giáo dục","Khác"]
const CAT_COLORS=[C.primary,C.amber,C.blue,C.green,C.purple,"#0891b2","#db2777","#64748b"]
const CARD_PALETTE=[C.blue,C.purple,C.green,C.primary,C.amber,"#0891b2","#db2777","#64748b"]
const today=new Date(),thisMonth=today.getMonth(),thisYear=today.getFullYear()
const fmt=n=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(n)
const fmtN=n=>new Intl.NumberFormat("vi-VN").format(n)
const fmtShort=n=>{const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(1)+" tỷ":a>=1e6?(n/1e6).toFixed(1)+" tr":a>=1e3?(n/1e3).toFixed(0)+"k":fmtN(n)}
const fmtInput=v=>{const n=v.replace(/\D/g,"");return n?fmtN(parseInt(n)):""}
const getDaysUntil=day=>{const d=new Date(thisYear,thisMonth,day);if(d<today)d.setMonth(d.getMonth()+1);return Math.ceil((d-today)/86400000)}
const VN_DAY=["CN","T2","T3","T4","T5","T6","T7"]
const fmtDateHead=ds=>{const d=new Date(ds),t=today.toISOString().slice(0,10);const y=new Date();y.setDate(y.getDate()-1);const ys=y.toISOString().slice(0,10);if(ds===t)return"Hôm nay";if(ds===ys)return"Hôm qua";return`${VN_DAY[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`}

function Avatar({name,color,size=36}){
  const initials=(name||"?").trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
  return(<div style={{width:size,height:size,borderRadius:"50%",background:color||C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.4,fontWeight:700,color:"#fff",flexShrink:0}}>{initials}</div>)
}

function NavItem({icon,label,active,onClick,special,badge}){
  if(special)return(<button onClick={onClick} style={{flex:"0 0 auto",border:"none",background:"none",cursor:"pointer",padding:0,marginBottom:4}}>
    <div style={{width:46,height:46,borderRadius:13,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:300,color:"#fff",boxShadow:`0 4px 14px ${C.primary}55`}}>{icon}</div>
  </button>)
  return(<button onClick={onClick} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,border:"none",background:"none",cursor:"pointer",padding:"6px 0 4px",position:"relative",outline:"none"}}>
    <div style={{fontSize:18,color:active?C.primary:C.textMuted,position:"relative",transition:"color .15s"}}>
      {icon}
      {badge>0&&<div style={{position:"absolute",top:-4,right:-8,minWidth:15,height:15,padding:"0 3px",borderRadius:8,background:C.red,border:`2px solid ${C.white}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff"}}>{badge>9?"9+":badge}</div>}
    </div>
    <span style={{fontSize:10,fontWeight:active?600:400,color:active?C.primary:C.textMuted,letterSpacing:".1px"}}>{label}</span>
    {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2.5,borderRadius:2,background:C.primary}}/>}
  </button>)
}

/* Một dòng giao dịch — phẳng, phân cách kẻ mỏng */
function TxRow({tx,accounts,onDelete,last}){
  const [open,setOpen]=useState(false)
  const acc=accounts.find(a=>a.id===tx.account_id),isInc=tx.type==="thu"
  return(<div style={{background:C.white,borderBottom:last?"none":`1px solid ${C.lineSoft}`}}>
    <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer"}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:C.lineSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{CAT_ICONS[tx.category]||"📦"}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.category}</div>
        <div style={{fontSize:11,color:C.textSub,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note||(acc?acc.name:"—")}</div>
      </div>
      <div style={{fontSize:14,fontWeight:700,color:isInc?C.green:C.text,whiteSpace:"nowrap"}}>{isInc?"+":"-"}{fmtN(tx.amount)}</div>
    </div>
    {open&&(<div style={{padding:"10px 16px",borderTop:`1px solid ${C.lineSoft}`,background:C.lineSoft,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:12,color:C.textSub}}>{acc?`${acc.icon} ${acc.name}`:"—"} · {tx.date}</div>
      <button onClick={()=>onDelete(tx)} style={{background:C.white,border:`1px solid ${C.primary}`,borderRadius:6,padding:"5px 12px",color:C.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Xoá</button>
    </div>)}
  </div>)
}

/* Donut SVG — 4 màu flat, không glow */
function Donut({segments,center}){
  const R=44,cx=55,cy=55,sw=14,circ=2*Math.PI*R
  let offset=0
  const total=segments.reduce((s,x)=>s+x.value,0)||1
  return(<svg width="110" height="110" viewBox="0 0 110 110">
    <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.lineSoft} strokeWidth={sw}/>
    {segments.map((s,i)=>{const len=(s.value/total)*circ,dash=`${len} ${circ-len}`,off=-offset;offset+=len;return(
      <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={dash} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`}/>
    )})}
    <text x={cx} y={cy-4} textAnchor="middle" fill={C.textSub} fontSize="10">{center?.label||""}</text>
    <text x={cx} y={cy+12} textAnchor="middle" fill={C.text} fontSize="14" fontWeight="700">{center?.value||""}</text>
  </svg>)
}

/* ════ CARD FORM — standalone để tránh mất focus ════ */
function CardFormFields({cardForm,setCardForm,saveCard,mode}){
  const inp={width:"100%",background:C.white,border:`1px solid ${C.line}`,borderRadius:8,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}
  const lbl={fontSize:12,fontWeight:600,color:C.textSub,marginBottom:6,display:"block"}
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div><span style={lbl}>Tên thẻ</span><input style={inp} placeholder="VD: Visa Vietcombank" value={cardForm.name} onChange={e=>setCardForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
    <div><span style={lbl}>Ngân hàng</span><input style={inp} placeholder="VCB, HSBC, MB..." value={cardForm.bank} onChange={e=>setCardForm(f=>({...f,bank:e.target.value}))}/></div>
    <div><span style={lbl}>Hạn mức (₫)</span><input style={{...inp,fontWeight:700}} placeholder="0" inputMode="numeric" value={cardForm.credit_limit} onChange={e=>setCardForm(f=>({...f,credit_limit:fmtInput(e.target.value)}))}/></div>
    <div><span style={lbl}>Dư nợ hiện tại (₫)</span><input style={{...inp,fontWeight:700,color:C.primary}} placeholder="0" inputMode="numeric" value={cardForm.used} onChange={e=>setCardForm(f=>({...f,used:fmtInput(e.target.value)}))}/></div>
    <div style={{display:"flex",gap:10}}>
      <div style={{flex:1}}><span style={lbl}>Ngày chốt sao kê</span><input style={inp} placeholder="15" type="number" min="1" max="31" value={cardForm.closing_day} onChange={e=>setCardForm(f=>({...f,closing_day:e.target.value}))}/></div>
      <div style={{flex:1}}><span style={lbl}>Ngày thanh toán</span><input style={inp} placeholder="5" type="number" min="1" max="31" value={cardForm.payment_day} onChange={e=>setCardForm(f=>({...f,payment_day:e.target.value}))}/></div>
    </div>
    <div><span style={lbl}>Màu thẻ</span>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {CARD_PALETTE.map(c=>(
          <div key={c} onClick={()=>setCardForm(f=>({...f,color:c}))} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:cardForm.color===c?`3px solid ${C.white}`:`3px solid transparent`,boxShadow:cardForm.color===c?`0 0 0 2px ${c}`:"none"}}/>
        ))}
      </div>
    </div>
    <button onClick={saveCard} style={{background:C.primary,border:"none",borderRadius:8,padding:"13px 0",width:"100%",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
      {mode==="add"?"Thêm thẻ":"Lưu thay đổi"}
    </button>
  </div>)
}

/* ════ MAIN APP ════ */
export default function App(){
  const [session,setSession]=useState(undefined)
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState(null)
  const [showProfile,setShowProfile]=useState(false)
  const [accounts,setAccounts]=useState([])
  const [transactions,setTransactions]=useState([])
  const [creditCards,setCreditCards]=useState([])
  const [loading,setLoading]=useState(false)
  const [tab,setTab]=useState("overview")
  const [filterType,setFilterType]=useState("all")
  const [savingTx,setSavingTx]=useState(false)
  const [form,setForm]=useState({type:"chi",amount:"",category:"",note:"",date:today.toISOString().slice(0,10),account_id:""})
  const [accModal,setAccModal]=useState(null)
  const [accForm,setAccForm]=useState({name:"",balance:"",icon:"🏦",color:C.blue})
  const BLANK_CARD={name:"",credit_limit:"",used:"",closing_day:"",payment_day:"",bank:"",color:C.blue}
  const [cardModal,setCardModal]=useState(null)
  const [cardForm,setCardForm]=useState(BLANK_CARD)

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setUser(session?.user??null)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setSession(session);setUser(session?.user??null)})
    return()=>subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!session){setAccounts([]);setTransactions([]);setCreditCards([]);setProfile(null);return}
    setLoading(true)
    Promise.all([db.getAccounts(),db.getTransactions(),db.getCreditCards(),db.getProfile()])
      .then(([accs,txs,cards,prof])=>{setAccounts(accs);setTransactions(txs);setCreditCards(cards);setProfile(prof)})
      .finally(()=>setLoading(false))
  },[session])

  useEffect(()=>{if(accounts.length&&!form.account_id)setForm(f=>({...f,account_id:accounts[0].id}))},[accounts])

  const monthTx=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===thisMonth&&d.getFullYear()===thisYear})
  const monthIncome=monthTx.filter(t=>t.type==="thu").reduce((s,t)=>s+t.amount,0)
  const monthExpense=monthTx.filter(t=>t.type==="chi").reduce((s,t)=>s+t.amount,0)
  const totalBalance=accounts.reduce((s,a)=>s+a.balance,0)
  const totalDebt=creditCards.reduce((s,c)=>s+c.used,0)

  const urgentCards=creditCards.filter(c=>getDaysUntil(c.payment_day)<=5 && c.used>0)
  const urgentTotal=urgentCards.reduce((s,c)=>s+Math.round(c.used*.05),0)
  const cardsByPayDay=creditCards.reduce((g,c)=>{(g[c.payment_day]=g[c.payment_day]||[]).push(c);return g},{})
  const sortedPayDays=Object.keys(cardsByPayDay).map(Number).sort((a,b)=>getDaysUntil(a)-getDaysUntil(b))

  const filtered=[...transactions].filter(t=>filterType==="all"||t.type===filterType)
  const catExp={};monthTx.filter(t=>t.type==="chi").forEach(t=>{catExp[t.category]=(catExp[t.category]||0)+t.amount})
  const catList=Object.entries(catExp).sort((a,b)=>b[1]-a[1])

  const displayName=profile?.full_name||user?.user_metadata?.full_name||user?.email?.split("@")[0]||"User"
  const avatarColor=profile?.avatar_color||user?.user_metadata?.avatar_color||C.primary

  // Group transactions by date for list rendering
  const groupByDate=list=>{
    const g={}
    list.forEach(t=>{(g[t.date]=g[t.date]||[]).push(t)})
    return Object.entries(g).sort((a,b)=>b[0].localeCompare(a[0]))
  }

  const addTransaction=async()=>{
    if(!form.amount||!form.category||!form.account_id)return
    const amt=parseInt(form.amount.replace(/\D/g,""));if(!amt)return
    setSavingTx(true)
    try{
      const newTx=await db.createTransaction({...form,amount:amt})
      setTransactions(txs=>[newTx,...txs])
      setAccounts(accs=>accs.map(a=>a.id===form.account_id?{...a,balance:a.balance+(form.type==="thu"?amt:-amt)}:a))
      setForm(f=>({...f,amount:"",category:"",note:""}))
      setTab("transactions")
    }catch(e){alert(e.message)}finally{setSavingTx(false)}
  }
  const deleteTx=async(tx)=>{
    await db.deleteTransaction(tx.id,tx)
    setTransactions(ts=>ts.filter(t=>t.id!==tx.id))
    setAccounts(accs=>accs.map(a=>a.id===tx.account_id?{...a,balance:a.balance+(tx.type==="thu"?-tx.amount:tx.amount)}:a))
  }
  const openAddAcc=()=>{setAccForm({name:"",balance:"",icon:"🏦",color:C.blue});setAccModal({mode:"add"})}
  const openEditAcc=acc=>{setAccForm({name:acc.name,balance:fmtN(acc.balance),icon:acc.icon,color:acc.color});setAccModal({mode:"edit",id:acc.id})}
  const saveAcc=async()=>{
    const bal=parseInt(accForm.balance.replace(/\D/g,"")||"0");if(!accForm.name)return
    if(accModal.mode==="add"){const a=await db.createAccount({name:accForm.name,balance:bal,icon:accForm.icon,color:accForm.color});setAccounts(accs=>[...accs,a])}
    else{const a=await db.updateAccount(accModal.id,{name:accForm.name,balance:bal,icon:accForm.icon,color:accForm.color});setAccounts(accs=>accs.map(x=>x.id===accModal.id?a:x))}
    setAccModal(null)
  }
  const deleteAcc=async(id)=>{
    if(accounts.length<=1)return
    await db.deleteAccount(id);setAccounts(accs=>accs.filter(a=>a.id!==id));setTransactions(ts=>ts.filter(t=>t.account_id!==id));setAccModal(null)
  }
  const openAddCard=()=>{setCardForm(BLANK_CARD);setCardModal({mode:"add"})}
  const openEditCard=card=>{setCardForm({name:card.name,credit_limit:fmtN(card.credit_limit),used:fmtN(card.used),closing_day:String(card.closing_day),payment_day:String(card.payment_day),bank:card.bank,color:card.color});setCardModal({mode:"edit",id:card.id})}
  const saveCard=async()=>{
    if(!cardForm.name||!cardForm.credit_limit)return
    const payload={name:cardForm.name,bank:cardForm.bank,color:cardForm.color,credit_limit:parseInt(cardForm.credit_limit.replace(/\D/g,"")||0),used:parseInt(cardForm.used.replace(/\D/g,"")||0),closing_day:parseInt(cardForm.closing_day||15),payment_day:parseInt(cardForm.payment_day||5)}
    if(cardModal.mode==="add"){const c=await db.createCreditCard(payload);setCreditCards(cs=>[...cs,c])}
    else{const c=await db.updateCreditCard(cardModal.id,payload);setCreditCards(cs=>cs.map(x=>x.id===cardModal.id?c:x))}
    setCardModal(null)
  }
  const deleteCard=async(id)=>{await db.deleteCreditCard(id);setCreditCards(cs=>cs.filter(c=>c.id!==id));setCardModal(null)}

  /* ────── style tokens ────── */
  const inputSt={width:"100%",background:C.white,border:`1.5px solid ${C.line}`,borderRadius:8,padding:"11px 13px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color .15s"}
  const selSt={...inputSt,appearance:"none"}
  const lbl={fontSize:12,fontWeight:600,color:C.textSub,marginBottom:5,display:"block",letterSpacing:".2px"}
  const btnPrimary={background:C.primary,border:"none",borderRadius:8,padding:"12px 0",width:"100%",color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit",letterSpacing:".1px"}
  const moSt={position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"flex-end",zIndex:200,backdropFilter:"blur(2px)"}
  const moBx={background:C.white,borderRadius:"16px 16px 0 0",padding:"8px 20px 40px",width:"100%",maxHeight:"88vh",overflowY:"auto",boxSizing:"border-box",boxShadow:"0 -4px 24px rgba(0,0,0,.12)"}
  const dragPill={width:36,height:4,borderRadius:4,background:C.line,margin:"0 auto 20px"}
  const tabBtn=a=>({flex:1,border:"none",background:"none",padding:"11px 0",fontSize:13,fontWeight:a?600:400,color:a?C.primary:C.textSub,cursor:"pointer",fontFamily:"inherit",position:"relative",borderBottom:a?`2px solid ${C.primary}`:"2px solid transparent"})
  const filtB=a=>({border:`1.5px solid ${a?C.primary:C.line}`,background:a?C.primarySoft:C.white,borderRadius:6,padding:"6px 14px",color:a?C.primary:C.textSub,fontWeight:a?600:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"})
  const groupTitle={padding:"12px 16px 6px",fontSize:11,color:C.textMuted,fontWeight:600,letterSpacing:".6px",textTransform:"uppercase"}
  const dateHead=(d,total,colorTotal)=>({})

  if(session===undefined)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>💰</div>
  if(!session)return <Auth/>
  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <div style={{fontSize:40}}>💰</div><div style={{color:C.textSub,fontSize:14}}>Đang tải dữ liệu...</div>
  </div>

  return(<div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter','Be Vietnam Pro',-apple-system,'Segoe UI',sans-serif",paddingBottom:88}}>

    {/* ═══ OVERVIEW ═══ */}
    {tab==="overview"&&<div>
      {/* Header — professional navy gradient */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",padding:"48px 16px 52px",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowProfile(true)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
              <Avatar name={displayName} color="rgba(255,255,255,.2)" size={36}/>
            </button>
            <div>
              <div style={{fontSize:11,opacity:.75,fontWeight:400,letterSpacing:".3px"}}>Xin chào,</div>
              <div style={{fontSize:15,fontWeight:700,letterSpacing:"-.1px"}}>{displayName}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,opacity:.7}}>Tháng</div>
            <div style={{fontSize:14,fontWeight:600}}>{thisMonth+1}/{thisYear}</div>
          </div>
        </div>
        <div style={{fontSize:11,opacity:.75,fontWeight:500,letterSpacing:".3px",marginBottom:4}}>Tổng số dư</div>
        <div style={{fontSize:32,fontWeight:700,letterSpacing:"-1px",lineHeight:1.1}}>{fmt(totalBalance)}</div>
        {totalDebt>0&&<div style={{fontSize:12,opacity:.8,marginTop:6,background:"rgba(0,0,0,.15)",display:"inline-block",padding:"3px 10px",borderRadius:20}}>Dư nợ thẻ: −{fmtShort(totalDebt)}</div>}
      </div>

      {/* Summary 3 cột — nhô lên, style card sạch */}
      <div style={{margin:"0 16px",background:C.white,border:`1px solid ${C.line}`,borderRadius:12,display:"flex",marginTop:-24,position:"relative",zIndex:2,boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}>
        {[
          {label:"Thu tổng",val:"+"+fmtShort(monthIncome),color:C.green,bg:C.greenSoft},
          {label:"Chi tổng",val:"−"+fmtShort(monthExpense),color:C.red,bg:C.redSoft},
          {label:"Còn lại",val:fmtShort(monthIncome-monthExpense),color:monthIncome-monthExpense>=0?C.green:C.red,bg:monthIncome-monthExpense>=0?C.greenSoft:C.redSoft},
        ].map((s,i)=>
          <div key={i} style={{flex:1,padding:"14px 10px",textAlign:"center",borderLeft:i>0?`1px solid ${C.lineSoft}`:"none"}}>
            <div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginBottom:5,letterSpacing:".3px",textTransform:"uppercase"}}>{s.label}</div>
            <div style={{fontSize:15,fontWeight:700,color:s.color}}>{s.val}</div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"14px 16px 6px"}}>
        {[
          {i:"−",t:"Ghi chi",bg:C.redSoft,fg:C.red,on:()=>{setForm(f=>({...f,type:"chi",category:""}));setTab("add")}},
          {i:"+",t:"Ghi thu",bg:C.greenSoft,fg:C.green,on:()=>{setForm(f=>({...f,type:"thu",category:""}));setTab("add")}},
          {i:"⇄",t:"Tài khoản",bg:C.blueSoft,fg:C.blue,on:()=>setTab("accounts")},
          {i:"≡",t:"Hồ sơ",bg:C.surface2||"#f7f8fa",fg:C.textSub,on:()=>setShowProfile(true)},
        ].map((a,i)=>(
          <button key={i} onClick={a.on} style={{background:C.white,border:`1px solid ${C.line}`,borderRadius:10,padding:"12px 4px",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 1px 3px rgba(0,0,0,.06)",transition:"box-shadow .15s"}}>
            <div style={{width:34,height:34,margin:"0 auto 7px",borderRadius:9,background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:a.fg,fontWeight:700}}>{a.i}</div>
            <div style={{fontSize:11,color:C.textSub,fontWeight:500,letterSpacing:".1px"}}>{a.t}</div>
          </button>
        ))}
      </div>

      {/* Nhắc thanh toán thẻ */}
      {urgentCards.length>0&&<div onClick={()=>setTab("cards")} style={{margin:"8px 16px 0",background:C.primarySoft,border:`1px solid ${C.primary}55`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{fontSize:16}}>🔔</div>
          <div style={{flex:1,fontSize:13,fontWeight:700,color:C.primary}}>Nhắc thanh toán thẻ</div>
          <div style={{fontSize:11,color:C.primary,fontWeight:600}}>{urgentCards.length} thẻ ›</div>
        </div>
        {urgentCards.map(c=>{const d=getDaysUntil(c.payment_day);return(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,marginTop:4}}>
            <span style={{color:C.text,fontWeight:500}}>{c.name}</span>
            <span style={{marginLeft:"auto",color:d<=1?C.primary:C.amber,fontWeight:700}}>{d===0?"Hôm nay":d===1?"Ngày mai":`Còn ${d} ngày`}</span>
          </div>
        )})}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px solid ${C.primary}33`}}>
          <span style={{fontSize:11,color:C.textSub}}>Tổng tối thiểu</span>
          <span style={{fontSize:13,fontWeight:700,color:C.primary}}>{fmt(urgentTotal)}</span>
        </div>
      </div>}

      {/* Tài khoản */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 8px"}}>
        <div style={{fontSize:14,fontWeight:700}}>Tài khoản</div>
        <button onClick={openAddAcc} style={{background:"none",border:"none",color:C.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
      </div>
      <div style={{background:C.white,borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`}}>
        {accounts.map((acc,i)=>(
          <div key={acc.id} onClick={()=>openEditAcc(acc)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<accounts.length-1?`1px solid ${C.lineSoft}`:"none",cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.lineSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{acc.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600}}>{acc.name}</div>
              <div style={{fontSize:11,color:C.textSub,marginTop:2}}>Số dư khả dụng</div>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap"}}>{fmtN(acc.balance)} ₫</div>
          </div>
        ))}
        {accounts.length===0&&<button onClick={openAddAcc} style={{width:"100%",padding:"18px 0",border:"none",background:"none",color:C.textSub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm tài khoản đầu tiên</button>}
      </div>

      {/* Chi tiêu theo danh mục */}
      {catList.length>0&&<>
        <div style={groupTitle}>Chi tiêu theo danh mục</div>
        <div style={{background:C.white,borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`}}>
          {catList.slice(0,5).map(([cat,amt],i)=>{const pct=Math.round(amt/monthExpense*100),color=CAT_COLORS[i%CAT_COLORS.length];return(
            <div key={cat} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<Math.min(catList.length,5)-1?`1px solid ${C.lineSoft}`:"none"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:C.lineSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{CAT_ICONS[cat]||"📦"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                  <span style={{fontWeight:600}}>{cat}</span>
                  <span style={{color:C.textSub}}>{fmtN(amt)} ₫ · {pct}%</span>
                </div>
                <div style={{height:4,background:C.lineSoft,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3}}/>
                </div>
              </div>
            </div>
          )})}
        </div>
      </>}

      {/* Giao dịch gần đây */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 8px"}}>
        <div style={{fontSize:14,fontWeight:700}}>Giao dịch gần đây</div>
        <button onClick={()=>setTab("transactions")} style={{background:"none",border:"none",color:C.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Xem tất cả</button>
      </div>
      {transactions.length===0
        ?<div style={{background:C.white,border:`1px solid ${C.line}`,margin:"0 16px",borderRadius:10,padding:32,textAlign:"center",color:C.textSub,fontSize:13}}>Chưa có giao dịch nào</div>
        :<div style={{background:C.white,borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`}}>
          {groupByDate(transactions.slice(0,10)).map(([date,list])=>{
            const day=list.reduce((s,t)=>s+(t.type==="thu"?t.amount:-t.amount),0)
            return(<div key={date}>
              <div style={{padding:"8px 16px",background:C.lineSoft,display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:600,color:C.textSub}}>
                <span>{fmtDateHead(date)} · {date.slice(5).split("-").reverse().join("/")}</span>
                <span style={{color:day>=0?C.green:C.text}}>{day>=0?"+":""}{fmtN(day)} ₫</span>
              </div>
              {list.map((tx,i)=><TxRow key={tx.id} tx={tx} accounts={accounts} onDelete={deleteTx} last={i===list.length-1}/>)}
            </div>)
          })}
        </div>
      }
    </div>}

    {/* ═══ TRANSACTIONS ═══ */}
    {tab==="transactions"&&<div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.line}`,padding:"44px 16px 14px"}}>
        <div style={{fontSize:17,fontWeight:700,color:C.text}}>Giao dịch</div>
        <div style={{fontSize:12,color:C.textSub,marginTop:2}}>{transactions.length} giao dịch</div>
      </div>
      <div style={{display:"flex",gap:8,padding:"10px 16px",background:C.white,borderBottom:`1px solid ${C.line}`}}>
        {["all","thu","chi"].map(f=><button key={f} style={filtB(filterType===f)} onClick={()=>setFilterType(f)}>{f==="all"?"Tất cả":f==="thu"?"Thu":"Chi"}</button>)}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",color:C.textSub,padding:48,fontSize:13}}>Chưa có giao dịch</div>}
      {filtered.length>0&&<div style={{background:C.white,borderBottom:`1px solid ${C.line}`}}>
        {groupByDate(filtered).map(([date,list])=>{
          const day=list.reduce((s,t)=>s+(t.type==="thu"?t.amount:-t.amount),0)
          return(<div key={date}>
            <div style={{padding:"8px 16px",background:C.lineSoft,display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:600,color:C.textSub}}>
              <span>{fmtDateHead(date)} · {date.slice(5).split("-").reverse().join("/")}</span>
              <span style={{color:day>=0?C.green:C.text}}>{day>=0?"+":""}{fmtN(day)} ₫</span>
            </div>
            {list.map((tx,i)=><TxRow key={tx.id} tx={tx} accounts={accounts} onDelete={deleteTx} last={i===list.length-1}/>)}
          </div>)
        })}
      </div>}
    </div>}

    {/* ═══ ADD ═══ */}
    {tab==="add"&&<div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.line}`,padding:"44px 16px 14px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setTab("overview")} style={{background:"none",border:"none",color:C.text,fontSize:20,cursor:"pointer",lineHeight:1,padding:"0 4px 0 0"}}>&#8592;</button>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>Thêm giao dịch</div>
          <div style={{fontSize:12,color:C.textSub,marginTop:1}}>Ghi lại thu / chi hàng ngày</div>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",background:C.surface2||"#f7f8fa",border:`1px solid ${C.line}`,borderRadius:9,padding:3,marginBottom:14}}>
          <button onClick={()=>setForm(f=>({...f,type:"chi",category:""}))} style={{flex:1,padding:"9px 0",border:"none",borderRadius:7,background:form.type==="chi"?C.white:"transparent",color:form.type==="chi"?C.red:C.textSub,fontWeight:form.type==="chi"?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:form.type==="chi"?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>Chi tiêu</button>
          <button onClick={()=>setForm(f=>({...f,type:"thu",category:""}))} style={{flex:1,padding:"9px 0",border:"none",borderRadius:7,background:form.type==="thu"?C.white:"transparent",color:form.type==="thu"?C.green:C.textSub,fontWeight:form.type==="thu"?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:form.type==="thu"?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>Thu nhập</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><span style={lbl}>Số tiền (₫)</span><input style={{...inputSt,fontSize:20,fontWeight:700,color:form.type==="thu"?C.green:C.primary}} placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:fmtInput(e.target.value)}))} inputMode="numeric"/></div>
          <div><span style={lbl}>Danh mục</span><select style={selSt} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="">-- Chọn danh mục --</option>{(form.type==="thu"?CATS_THU:CATS_CHI).map(c=><option key={c}>{c}</option>)}</select></div>
          <div><span style={lbl}>Tài khoản</span><select style={selSt} value={form.account_id} onChange={e=>setForm(f=>({...f,account_id:e.target.value}))}>{accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name} — {fmtShort(a.balance)}</option>)}</select></div>
          <div><span style={lbl}>Ngày</span><input style={inputSt} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><span style={lbl}>Ghi chú</span><input style={inputSt} placeholder="Mô tả..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={{...btnPrimary,background:form.type==="thu"?C.green:C.primary,opacity:savingTx?.7:1,marginTop:6}} onClick={addTransaction} disabled={savingTx}>{savingTx?"Đang lưu...":form.type==="thu"?"Ghi nhận thu nhập":"Ghi nhận chi tiêu"}</button>
        </div>
      </div>
    </div>}

    {/* ═══ CARDS ═══ */}
    {tab==="cards"&&<div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.line}`,padding:"44px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>Thẻ tín dụng</div>
          <div style={{fontSize:12,color:C.textSub,marginTop:2}}>{creditCards.length} thẻ · Dư nợ {fmtShort(totalDebt)}</div>
        </div>
        <button onClick={openAddCard} style={{background:C.primary,border:"none",borderRadius:7,padding:"7px 14px",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
      </div>

      {creditCards.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontSize:40,marginBottom:12}}>💳</div>
        <div style={{color:C.textSub,fontSize:14,marginBottom:20}}>Chưa có thẻ tín dụng nào</div>
        <button onClick={openAddCard} style={{...btnPrimary,width:"auto",padding:"11px 24px",display:"inline-block"}}>+ Thêm thẻ đầu tiên</button>
      </div>}

      {sortedPayDays.map(day=>{
        const group=cardsByPayDay[day]
        const daysLeft=getDaysUntil(day)
        const groupDebt=group.reduce((s,c)=>s+c.used,0)
        const groupMin=group.reduce((s,c)=>s+Math.round(c.used*.05),0)
        const isUrgent=daysLeft<=5
        return(<div key={day} style={{marginTop:16}}>
          <div style={{padding:"10px 16px",background:isUrgent?C.primarySoft:C.lineSoft,display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:isUrgent?C.primary:C.text}}>Thanh toán ngày {day}</div>
              <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{group.length} thẻ · {fmtShort(groupDebt)} · tối thiểu {fmtShort(groupMin)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:700,color:daysLeft===0?C.primary:daysLeft<=3?C.primary:daysLeft<=5?C.amber:C.green}}>{daysLeft===0?"Hôm nay":daysLeft===1?"Ngày mai":`${daysLeft} ngày`}</div>
              <div style={{fontSize:10,color:C.textMuted}}>đến hạn</div>
            </div>
          </div>
          <div style={{background:C.white}}>
            {group.map((card,i)=>{
              const pct=Math.round(card.used/card.credit_limit*100),dC=getDaysUntil(card.closing_day)
              return(<div key={card.id} onClick={()=>openEditCard(card)} style={{padding:"14px 16px",borderBottom:i<group.length-1?`1px solid ${C.lineSoft}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{width:40,height:28,borderRadius:4,background:card.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{width:20,height:14,borderRadius:2,background:"rgba(255,255,255,.25)"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.textSub,letterSpacing:1}}>{card.bank||"BANK"}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{card.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.primary}}>{fmtN(card.used)}</div>
                    <div style={{fontSize:10,color:C.textMuted}}>/{fmtShort(card.credit_limit)}</div>
                  </div>
                </div>
                <div style={{height:4,background:C.lineSoft,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>80?C.primary:pct>60?C.amber:C.blue,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textSub}}>
                  <span>{pct}% hạn mức</span>
                  <span>Chốt: còn {dC} ngày</span>
                </div>
              </div>)
            })}
          </div>
        </div>)
      })}

      {creditCards.length>0&&<div style={{margin:"16px",background:C.white,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:11,color:C.textSub,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Tổng kết dư nợ</div>
        {creditCards.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,fontSize:13}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
            <span style={{color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
          </div>
          <span style={{fontWeight:600,color:C.primary,whiteSpace:"nowrap"}}>{fmtN(c.used)} ₫</span>
        </div>)}
        <div style={{height:1,background:C.line,margin:"12px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}><span style={{fontWeight:700}}>Tổng cộng</span><span style={{fontWeight:700,color:C.primary}}>{fmt(totalDebt)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:6,color:C.textSub}}><span>Tổng tối thiểu</span><span style={{fontWeight:700,color:C.text}}>{fmt(Math.round(totalDebt*.05))}</span></div>
      </div>}
    </div>}

    {/* ═══ ACCOUNTS ═══ */}
    {tab==="accounts"&&<div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.line}`,padding:"44px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>Tài khoản</div>
          <div style={{fontSize:12,color:C.textSub,marginTop:2}}>Tổng: {fmt(totalBalance)}</div>
        </div>
        <button onClick={openAddAcc} style={{background:C.primary,border:"none",borderRadius:7,padding:"7px 14px",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Thêm</button>
      </div>
      <div style={{marginTop:16,background:C.white,borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`}}>
        {accounts.map((acc,i)=>(
          <div key={acc.id} onClick={()=>openEditAcc(acc)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<accounts.length-1?`1px solid ${C.lineSoft}`:"none",cursor:"pointer"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:C.lineSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{acc.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600}}>{acc.name}</div>
              <div style={{fontSize:11,color:C.textSub,marginTop:2}}>Số dư khả dụng</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,whiteSpace:"nowrap"}}>{fmtN(acc.balance)} ₫</div>
              <div style={{fontSize:10,color:C.primary,fontWeight:600,marginTop:2}}>Sửa</div>
            </div>
          </div>
        ))}
      </div>
    </div>}

    {/* ═══ BOTTOM NAV ═══ */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:C.white,borderTop:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px",paddingBottom:8,maxWidth:480,margin:"0 auto",boxShadow:"0 -2px 12px rgba(0,0,0,.06)"}}>
      <NavItem icon="🏠" label="Tổng quan" active={tab==="overview"} onClick={()=>setTab("overview")}/>
      <NavItem icon="📋" label="Giao dịch" active={tab==="transactions"} onClick={()=>setTab("transactions")}/>
      <NavItem icon="+" active={tab==="add"} onClick={()=>setTab("add")} special/>
      <NavItem icon="💳" label="Thẻ" active={tab==="cards"} onClick={()=>setTab("cards")} badge={urgentCards.length}/>
      <NavItem icon="🏦" label="Tài khoản" active={tab==="accounts"} onClick={()=>setTab("accounts")}/>
    </div>

    {/* ═══ ACCOUNT MODAL ═══ */}
    {accModal&&<div style={moSt} onClick={()=>setAccModal(null)}>
      <div style={moBx} onClick={e=>e.stopPropagation()}>
        <div style={dragPill}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:17}}>{accModal.mode==="add"?"Thêm tài khoản":"Chỉnh sửa tài khoản"}</div>
          {accModal.mode==="edit"&&<button onClick={()=>deleteAcc(accModal.id)} style={{background:C.white,border:`1px solid ${C.primary}`,borderRadius:6,padding:"6px 12px",color:C.primary,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Xoá</button>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><span style={lbl}>Tên tài khoản</span><input style={inputSt} placeholder="VD: Vietcombank..." value={accForm.name} onChange={e=>setAccForm(f=>({...f,name:e.target.value}))}/></div>
          <div><span style={lbl}>Số dư (₫)</span><input style={{...inputSt,fontSize:18,fontWeight:700}} placeholder="0" inputMode="numeric" value={accForm.balance} onChange={e=>setAccForm(f=>({...f,balance:fmtInput(e.target.value)}))}/></div>
          <div><span style={lbl}>Icon</span><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["🏦","💳","💵","🏧","💰","🪙","📱","🏠","💼","🚗"].map(ic=><div key={ic} onClick={()=>setAccForm(f=>({...f,icon:ic}))} style={{width:40,height:40,borderRadius:8,background:accForm.icon===ic?C.primarySoft:C.white,border:`1px solid ${accForm.icon===ic?C.primary:C.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer"}}>{ic}</div>)}
          </div></div>
          <div><span style={lbl}>Màu sắc</span><div style={{display:"flex",gap:10}}>
            {[C.blue,C.green,C.purple,C.amber,C.primary,"#0891b2","#db2777","#64748b"].map(c=><div key={c} onClick={()=>setAccForm(f=>({...f,color:c}))} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:accForm.color===c?`3px solid ${C.white}`:`3px solid transparent`,boxShadow:accForm.color===c?`0 0 0 2px ${c}`:"none"}}/>)}
          </div></div>
          <button style={btnPrimary} onClick={saveAcc}>{accModal.mode==="add"?"Thêm tài khoản":"Lưu thay đổi"}</button>
        </div>
      </div>
    </div>}

    {/* ═══ CARD MODAL ═══ */}
    {cardModal&&<div style={moSt} onClick={()=>setCardModal(null)}>
      <div style={moBx} onClick={e=>e.stopPropagation()}>
        <div style={dragPill}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:17}}>{cardModal.mode==="add"?"Thêm thẻ tín dụng":"Chỉnh sửa thẻ"}</div>
          {cardModal.mode==="edit"&&<button onClick={()=>deleteCard(cardModal.id)} style={{background:C.white,border:`1px solid ${C.primary}`,borderRadius:6,padding:"6px 12px",color:C.primary,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Xoá</button>}
        </div>
        <CardFormFields cardForm={cardForm} setCardForm={setCardForm} saveCard={saveCard} mode={cardModal.mode}/>
      </div>
    </div>}

    {/* PROFILE MODAL */}
    {showProfile&&<Profile user={user} profile={profile} onUpdate={setProfile} onClose={()=>setShowProfile(false)}/>}
  </div>)
}
