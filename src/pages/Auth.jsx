import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#f0f2f5', white:'#ffffff', line:'#e4e7ec', lineSoft:'#eef0f3',
  text:'#111827', textSub:'#6b7280', textMuted:'#9ca3af',
  primary:'#2563eb', primarySoft:'#eff4ff', primaryDark:'#1d4ed8',
  green:'#059669', greenSoft:'#ecfdf5',
  red:'#dc2626', redSoft:'#fef2f2',
  blue:'#2563eb',
}
const AVATAR_COLORS = ['#e8302c','#2563eb','#16a34a','#7c3aed','#f59e0b','#0891b2','#db2777','#64748b']

export default function Auth() {
  const [screen, setScreen] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarColor, setAvatarColor] = useState(C.primary)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [showPw, setShowPw] = useState(false)

  const reset = () => { setError(''); setMsg('') }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error.message)
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); reset()
    if (password !== confirmPw) { setError('Mật khẩu xác nhận không khớp'); setLoading(false); return }
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); setLoading(false); return }
    if (!fullName.trim()) { setError('Vui lòng nhập họ tên'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, avatar_color: avatarColor } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) { setLoading(false); return }
    if (data.user && !data.session) setScreen('verify')
    setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    if (error) setError(error.message)
    else setMsg('Link đặt lại mật khẩu đã gửi vào email')
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true); reset()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const initials = fullName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const inp = { width:'100%', background:C.white, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
  const lbl = { fontSize:12, fontWeight:600, color:C.textSub, marginBottom:6, display:'block' }
  const btnPrimary = { width:'100%', background:C.primary, border:'none', borderRadius:8, padding:'13px 0', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1 }
  const btnGhost = { width:'100%', background:C.white, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 0', color:C.text, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:googleLoading?0.7:1 }
  const linkBtn = { background:'none', border:'none', color:C.primary, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }

  // Header đỏ chung
  const Header = ({title,sub}) => (
    <div style={{background:C.white, borderBottom:`1px solid ${C.line}`, padding:'44px 20px 16px', textAlign:'center'}}>
      <div style={{width:48,height:48,borderRadius:13,background:C.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 10px'}}>💰</div>
      <div style={{fontSize:19, fontWeight:700, color:C.text}}>{title}</div>
      {sub && <div style={{fontSize:12, color:C.textSub, marginTop:3}}>{sub}</div>}
    </div>
  )

  const Alert = ({type,children}) => (
    <div style={{background:type==='err'?C.redSoft:C.greenSoft, border:`1px solid ${type==='err'?C.red:C.green}55`, borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:type==='err'?C.red:C.green}}>{children}</div>
  )

  // ── VERIFY ──
  if (screen === 'verify') return (
    <div style={{minHeight:'100vh', background:C.bg}}>
      <Header title="Kiểm tra email"/>
      <div style={{padding:'0 20px', maxWidth:420, margin:'0 auto', textAlign:'center'}}>
        <div style={{fontSize:44, marginBottom:10}}>📧</div>
        <div style={{fontSize:14, color:C.textSub, marginBottom:20, lineHeight:1.6}}>
          Link xác nhận đã gửi đến<br/><strong style={{color:C.text}}>{email}</strong>
        </div>
        <div style={{background:C.white, border:`1px solid ${C.line}`, borderRadius:10, padding:'14px 16px', marginBottom:18, fontSize:13, color:C.textSub, textAlign:'left', lineHeight:1.7}}>
          1. Mở email → tìm thư từ <strong style={{color:C.text}}>Finance App</strong><br/>
          2. Nhấn <strong style={{color:C.green}}>Xác nhận email</strong><br/>
          3. Quay lại đây để đăng nhập
        </div>
        <button onClick={()=>setScreen('login')} style={btnPrimary}>Đến trang đăng nhập</button>
        <div style={{marginTop:14, fontSize:12, color:C.textMuted}}>
          Không nhận được?{' '}
          <button onClick={async()=>{await supabase.auth.resend({type:'signup',email});setMsg('Đã gửi lại')}} style={linkBtn}>Gửi lại</button>
        </div>
        {msg && <div style={{marginTop:10, color:C.green, fontSize:13}}>{msg}</div>}
      </div>
    </div>
  )

  // ── FORGOT ──
  if (screen === 'forgot') return (
    <div style={{minHeight:'100vh', background:C.bg}}>
      <Header title="Quên mật khẩu" sub="Nhập email để nhận link đặt lại"/>
      <div style={{padding:'0 20px', maxWidth:420, margin:'0 auto'}}>
        <div style={{background:C.white, border:`1px solid ${C.line}`, borderRadius:12, padding:'20px 18px'}}>
          {error && <Alert type="err">{error}</Alert>}
          {msg && <Alert type="ok">{msg}</Alert>}
          <form onSubmit={handleForgot}>
            <div style={{marginBottom:14}}><span style={lbl}>Email</span><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <button type="submit" disabled={loading} style={btnPrimary}>{loading?'Đang gửi...':'Gửi link đặt lại'}</button>
          </form>
          <div style={{textAlign:'center', marginTop:14}}>
            <button onClick={()=>{setScreen('login');reset()}} style={linkBtn}>← Quay lại đăng nhập</button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── MAIN ──
  return (
    <div style={{minHeight:'100vh', background:C.bg, paddingBottom:30}}>
      <Header title="Finance App" sub="Quản lý tài chính cá nhân"/>
      <div style={{padding:'20px 20px 0', maxWidth:420, margin:'0 auto'}}>
        <div style={{background:C.white, border:`1px solid ${C.line}`, borderRadius:12, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>

          {/* Tabs */}
          <div style={{display:'flex', background:C.lineSoft, borderRadius:8, padding:3, marginBottom:18}}>
            {[['login','Đăng nhập'],['register','Đăng ký']].map(([m,label])=>(
              <button key={m} onClick={()=>{setScreen(m);reset()}}
                style={{flex:1, padding:'9px 0', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:screen===m?600:400, fontSize:13,
                  background:screen===m?C.white:'transparent', color:screen===m?C.primary:C.textSub,
                  boxShadow:screen===m?'0 1px 4px rgba(0,0,0,.1)':'none', transition:'all .15s'}}>
                {label}
              </button>
            ))}
          </div>

          {error && <Alert type="err">{error}</Alert>}
          {msg && <Alert type="ok">{msg}</Alert>}

          {/* ── LOGIN ── */}
          {screen === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div><span style={lbl}>Email</span>
                  <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
                </div>
                <div><span style={lbl}>Mật khẩu</span>
                  <div style={{position:'relative'}}>
                    <input style={{...inp, paddingRight:46}} type={showPw?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:15}}>{showPw?'🙈':'👁'}</button>
                  </div>
                </div>
                <div style={{textAlign:'right', marginTop:-4}}>
                  <button type="button" onClick={()=>{setScreen('forgot');reset()}} style={linkBtn}>Quên mật khẩu?</button>
                </div>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading?'Đang đăng nhập...':'Đăng nhập'}</button>

                <div style={{display:'flex', alignItems:'center', gap:12, margin:'4px 0'}}>
                  <div style={{flex:1, height:1, background:C.line}}/><span style={{fontSize:12, color:C.textMuted}}>hoặc</span><div style={{flex:1, height:1, background:C.line}}/>
                </div>

                <button type="button" onClick={handleGoogle} disabled={googleLoading} style={btnGhost}>
                  {googleLoading ? 'Đang chuyển hướng...' : <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Tiếp tục với Google
                  </>}
                </button>

                <div style={{textAlign:'center', fontSize:13, color:C.textSub, marginTop:2}}>
                  Chưa có tài khoản?{' '}
                  <button type="button" onClick={()=>{setScreen('register');reset()}} style={linkBtn}>Đăng ký ngay</button>
                </div>
              </div>
            </form>
          )}

          {/* ── REGISTER ── */}
          {screen === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div><span style={lbl}>Họ và tên</span>
                  <input style={inp} type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={e=>setFullName(e.target.value)} required autoComplete="name"/>
                </div>

                {fullName.trim() && (
                  <div style={{display:'flex', alignItems:'center', gap:12, background:C.lineSoft, borderRadius:8, padding:'12px 14px'}}>
                    <div style={{width:44, height:44, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0}}>
                      {initials}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:13, color:C.text}}>{fullName}</div>
                      <div style={{fontSize:11, color:C.textSub, marginTop:2}}>Màu avatar</div>
                      <div style={{display:'flex', gap:6, marginTop:5}}>
                        {AVATAR_COLORS.map(c=>(
                          <div key={c} onClick={()=>setAvatarColor(c)} style={{width:18, height:18, borderRadius:'50%', background:c, cursor:'pointer', border:avatarColor===c?`2px solid ${C.white}`:'2px solid transparent', boxShadow:avatarColor===c?`0 0 0 1.5px ${c}`:'none'}}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div><span style={lbl}>Email</span>
                  <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
                </div>
                <div><span style={lbl}>Mật khẩu</span>
                  <div style={{position:'relative'}}>
                    <input style={{...inp, paddingRight:46}} type={showPw?'text':'password'} placeholder="Tối thiểu 6 ký tự" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete="new-password"/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:15}}>{showPw?'🙈':'👁'}</button>
                  </div>
                  {password && (
                    <div style={{marginTop:6, display:'flex', gap:4, alignItems:'center'}}>
                      {[6,8,12].map(len=>(
                        <div key={len} style={{height:3, flex:1, borderRadius:3, background:password.length>=len?C.green:C.line}}/>
                      ))}
                      <span style={{fontSize:10, color:password.length>=12?C.green:password.length>=8?'#f59e0b':C.primary, fontWeight:700, marginLeft:4, flexShrink:0}}>
                        {password.length>=12?'Mạnh':password.length>=8?'Ổn':'Yếu'}
                      </span>
                    </div>
                  )}
                </div>
                <div><span style={lbl}>Xác nhận mật khẩu</span>
                  <input style={{...inp, borderColor:confirmPw&&confirmPw!==password?C.primary:confirmPw?C.green:C.line}} type={showPw?'text':'password'} placeholder="Nhập lại mật khẩu" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} required autoComplete="new-password"/>
                  {confirmPw && <div style={{fontSize:11, marginTop:5, color:confirmPw===password?C.green:C.primary, fontWeight:600}}>{confirmPw===password?'Mật khẩu khớp':'Mật khẩu chưa khớp'}</div>}
                </div>

                <button type="submit" disabled={loading} style={btnPrimary}>{loading?'Đang tạo tài khoản...':'Tạo tài khoản'}</button>

                <div style={{display:'flex', alignItems:'center', gap:12, margin:'4px 0'}}>
                  <div style={{flex:1, height:1, background:C.line}}/><span style={{fontSize:12, color:C.textMuted}}>hoặc</span><div style={{flex:1, height:1, background:C.line}}/>
                </div>

                <button type="button" onClick={handleGoogle} disabled={googleLoading} style={btnGhost}>
                  {googleLoading ? 'Đang chuyển hướng...' : <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Đăng ký với Google
                  </>}
                </button>

                <div style={{textAlign:'center', fontSize:13, color:C.textSub, marginTop:2}}>
                  Đã có tài khoản?{' '}
                  <button type="button" onClick={()=>{setScreen('login');reset()}} style={linkBtn}>Đăng nhập</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div style={{textAlign:'center', marginTop:16, fontSize:11, color:C.textMuted}}>
          Bảo mật bởi Supabase
        </div>
      </div>
    </div>
  )
}
