import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = { bg:'#080c14',surface:'#0e1520',card:'#121b2a',border:'#1a2a40',borderLight:'#243348',accent:'#f0b429',green:'#17d9a1',red:'#f05252',text:'#e6eaf4',textSub:'#8496b5',textMuted:'#445570' }

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setMsg('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('✅ Kiểm tra email để xác nhận tài khoản!')
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  const inp = { width:'100%',background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,padding:'14px 16px',color:C.text,fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:'inherit' }
  const lbl = { fontSize:10,fontWeight:700,letterSpacing:2,color:C.textMuted,textTransform:'uppercase',marginBottom:8,display:'block' }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{fontSize:56,marginBottom:10}}>💰</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,color:C.text}}>Finance App</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:4}}>Quản lý tài chính cá nhân</div>
        </div>
        <div style={{background:C.card,border:`1.5px solid ${C.borderLight}`,borderRadius:24,padding:'28px 24px'}}>
          <div style={{display:'flex',background:C.surface,borderRadius:14,padding:4,marginBottom:24}}>
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');setMsg('')}}
                style={{flex:1,padding:'10px 0',borderRadius:11,border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:13,transition:'all .2s',background:mode===m?C.accent:'transparent',color:mode===m?'#07090f':C.textMuted}}>
                {m==='login'?'Đăng nhập':'Đăng ký'}
              </button>
            ))}
          </div>
          {error&&<div style={{background:`${C.red}18`,border:`1px solid ${C.red}44`,borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:13,color:C.red}}>⚠️ {error}</div>}
          {msg&&<div style={{background:`${C.green}18`,border:`1px solid ${C.green}44`,borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:13,color:C.green}}>{msg}</div>}
          <form onSubmit={handle}>
            <div style={{marginBottom:14}}><span style={lbl}>Email</span><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div style={{marginBottom:20}}><span style={lbl}>Mật khẩu</span><input style={inp} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/></div>
            <button type="submit" disabled={loading} style={{width:'100%',background:C.accent,border:'none',borderRadius:14,padding:'15px 0',color:'#07090f',fontWeight:800,fontSize:15,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',opacity:loading?0.7:1,boxShadow:`0 4px 14px ${C.accent}44`}}>
              {loading?'⏳ Đang xử lý...':mode==='login'?'→ Đăng nhập':'✓ Tạo tài khoản'}
            </button>
          </form>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0'}}>
            <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.textMuted}}>hoặc</span><div style={{flex:1,height:1,background:C.border}}/>
          </div>
          <button onClick={handleGoogle} style={{width:'100%',background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,padding:'13px 0',color:C.text,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <span style={{fontSize:18}}>🔵</span> Tiếp tục với Google
          </button>
        </div>
      </div>
    </div>
  )
}
