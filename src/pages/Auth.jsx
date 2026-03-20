import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#080c14', surface:'#0e1520', card:'#121b2a', border:'#1a2a40',
  borderLight:'#243348', accent:'#f0b429', green:'#17d9a1',
  red:'#f05252', blue:'#5b8def', text:'#e6eaf4', textSub:'#8496b5', textMuted:'#445570',
}
const AVATAR_COLORS = ['#17d9a1','#5b8def','#f0b429','#9f7aea','#f05252','#f97316','#ec4899','#14b8a6']

export default function Auth() {
  const [screen, setScreen] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarColor, setAvatarColor] = useState('#17d9a1')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [showPw, setShowPw] = useState(false)

  const reset = () => { setError(''); setMsg('') }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(
      error.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng' : error.message
    )
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) setError(error.message)
    else setMsg('📧 Link đặt lại mật khẩu đã gửi vào email!')
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
  const inp = { width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'13px 16px', color:C.text, fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
  const lbl = { fontSize:10, fontWeight:700, letterSpacing:2, color:C.textMuted, textTransform:'uppercase', marginBottom:7, display:'block' }
  const btn = (bg) => ({ width:'100%', background:bg, border:'none', borderRadius:14, padding:'15px 0', color:bg===C.accent||bg===C.green?'#07090f':C.text, fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 4px 14px ${bg}44`, opacity:loading?0.7:1 })
  const linkBtn = { background:'none', border:'none', color:C.accent, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline' }

  // ── VERIFY ──
  if (screen === 'verify') return (
    <div style={{minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:400, textAlign:'center'}}>
        <div style={{fontSize:64, marginBottom:16}}>📧</div>
        <div style={{fontSize:22, fontWeight:800, color:C.text, marginBottom:10}}>Kiểm tra email</div>
        <div style={{fontSize:14, color:C.textSub, marginBottom:24, lineHeight:1.6}}>
          Link xác nhận đã gửi đến<br/><strong style={{color:C.accent}}>{email}</strong>
        </div>
        <div style={{background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:'16px 20px', marginBottom:20, fontSize:13, color:C.textSub, textAlign:'left', lineHeight:1.8}}>
          1. Mở email → tìm thư từ <strong style={{color:C.text}}>Finance App</strong><br/>
          2. Nhấn <strong style={{color:C.green}}>Xác nhận email</strong><br/>
          3. Quay lại đây để đăng nhập
        </div>
        <button onClick={()=>setScreen('login')} style={btn(C.accent)}>→ Đến trang đăng nhập</button>
        <div style={{marginTop:14, fontSize:12, color:C.textMuted}}>
          Không nhận được?{' '}
          <button onClick={async()=>{await supabase.auth.resend({type:'signup',email});setMsg('✅ Đã gửi lại!')}} style={linkBtn}>Gửi lại</button>
        </div>
        {msg && <div style={{marginTop:10, color:C.green, fontSize:13}}>{msg}</div>}
      </div>
    </div>
  )

  // ── FORGOT ──
  if (screen === 'forgot') return (
    <div style={{minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:400}}>
        <div style={{textAlign:'center', marginBottom:30}}>
          <div style={{fontSize:48, marginBottom:10}}>🔑</div>
          <div style={{fontSize:22, fontWeight:800, color:C.text, marginBottom:6}}>Quên mật khẩu?</div>
          <div style={{fontSize:13, color:C.textMuted}}>Nhập email để nhận link đặt lại</div>
        </div>
        <div style={{background:C.card, border:`1.5px solid ${C.borderLight}`, borderRadius:22, padding:'24px 22px'}}>
          {error && <div style={{background:`${C.red}18`, border:`1px solid ${C.red}44`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:13, color:C.red}}>⚠️ {error}</div>}
          {msg && <div style={{background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:13, color:C.green}}>{msg}</div>}
          <form onSubmit={handleForgot}>
            <div style={{marginBottom:16}}><span style={lbl}>Email</span><input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <button type="submit" disabled={loading} style={btn(C.accent)}>{loading?'⏳ Đang gửi...':'📧 Gửi link đặt lại'}</button>
          </form>
          <div style={{textAlign:'center', marginTop:16}}>
            <button onClick={()=>{setScreen('login');reset()}} style={linkBtn}>← Quay lại đăng nhập</button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── MAIN ──
  return (
    <div style={{minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, paddingTop:40}}>
      <div style={{width:'100%', maxWidth:420}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{fontSize:52, marginBottom:8}}>💰</div>
          <div style={{fontSize:26, fontWeight:900, letterSpacing:-1, color:C.text}}>Finance App</div>
          <div style={{fontSize:13, color:C.textMuted, marginTop:3}}>Quản lý tài chính cá nhân</div>
        </div>

        <div style={{background:C.card, border:`1.5px solid ${C.borderLight}`, borderRadius:26, padding:'24px 22px 28px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>

          {/* Tabs */}
          <div style={{display:'flex', background:C.surface, borderRadius:16, padding:4, marginBottom:24, gap:4}}>
            {[['login','🔐 Đăng nhập'],['register','✨ Đăng ký']].map(([m,label])=>(
              <button key={m} onClick={()=>{setScreen(m);reset()}}
                style={{flex:1, padding:'11px 0', borderRadius:13, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13, transition:'all .2s',
                  background:screen===m?C.accent:'transparent', color:screen===m?'#07090f':C.textMuted,
                  boxShadow:screen===m?`0 2px 8px ${C.accent}44`:'none'}}>
                {label}
              </button>
            ))}
          </div>

          {error && <div style={{background:`${C.red}18`, border:`1px solid ${C.red}44`, borderRadius:12, padding:'11px 14px', marginBottom:16, fontSize:13, color:C.red}}>⚠️ {error}</div>}
          {msg && <div style={{background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:12, padding:'11px 14px', marginBottom:16, fontSize:13, color:C.green}}>{msg}</div>}

          {/* ── LOGIN ── */}
          {screen === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{display:'flex', flexDirection:'column', gap:13}}>
                <div><span style={lbl}>Email</span>
                  <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
                </div>
                <div><span style={lbl}>Mật khẩu</span>
                  <div style={{position:'relative'}}>
                    <input style={{...inp, paddingRight:50}} type={showPw?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:16, padding:0}}>{showPw?'🙈':'👁'}</button>
                  </div>
                </div>
                <div style={{textAlign:'right', marginTop:-6}}>
                  <button type="button" onClick={()=>{setScreen('forgot');reset()}} style={linkBtn}>Quên mật khẩu?</button>
                </div>
                <button type="submit" disabled={loading} style={btn(C.accent)}>{loading?'⏳ Đang đăng nhập...':'→ Đăng nhập'}</button>

                {/* Divider */}
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{flex:1, height:1, background:C.border}}/><span style={{fontSize:12, color:C.textMuted, flexShrink:0}}>hoặc</span><div style={{flex:1, height:1, background:C.border}}/>
                </div>

                {/* Google */}
                <button type="button" onClick={handleGoogle} disabled={googleLoading}
                  style={{width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'13px 0', color:C.text, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:googleLoading?0.7:1}}>
                  {googleLoading ? '⏳ Đang chuyển hướng...' : <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Tiếp tục với Google
                  </>}
                </button>

                <div style={{textAlign:'center', fontSize:13, color:C.textMuted}}>
                  Chưa có tài khoản?{' '}
                  <button type="button" onClick={()=>{setScreen('register');reset()}} style={linkBtn}>Đăng ký ngay</button>
                </div>
              </div>
            </form>
          )}

          {/* ── REGISTER ── */}
          {screen === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{display:'flex', flexDirection:'column', gap:13}}>
                <div><span style={lbl}>Họ và tên</span>
                  <input style={inp} type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={e=>setFullName(e.target.value)} required autoComplete="name"/>
                </div>

                {fullName.trim() && (
                  <div style={{display:'flex', alignItems:'center', gap:14, background:C.surface, borderRadius:14, padding:'12px 16px'}}>
                    <div style={{width:48, height:48, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#07090f', flexShrink:0, boxShadow:`0 4px 12px ${avatarColor}66`}}>
                      {initials}
                    </div>
                    <div>
                      <div style={{fontWeight:700, fontSize:14, color:C.text}}>{fullName}</div>
                      <div style={{fontSize:11, color:C.textMuted, marginTop:3}}>Chọn màu avatar:</div>
                      <div style={{display:'flex', gap:6, marginTop:6}}>
                        {AVATAR_COLORS.map(c=>(
                          <div key={c} onClick={()=>setAvatarColor(c)} style={{width:20, height:20, borderRadius:'50%', background:c, cursor:'pointer', border:avatarColor===c?'2px solid white':'2px solid transparent', transition:'all .15s'}}/>
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
                    <input style={{...inp, paddingRight:50}} type={showPw?'text':'password'} placeholder="Tối thiểu 6 ký tự" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete="new-password"/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:16, padding:0}}>{showPw?'🙈':'👁'}</button>
                  </div>
                  {password && (
                    <div style={{marginTop:6, display:'flex', gap:4, alignItems:'center'}}>
                      {[6,8,12].map(len=>(
                        <div key={len} style={{height:3, flex:1, borderRadius:3, background:password.length>=len?C.green:C.border, transition:'background .3s'}}/>
                      ))}
                      <span style={{fontSize:10, color:password.length>=12?C.green:password.length>=8?C.accent:C.red, fontWeight:700, marginLeft:4, flexShrink:0}}>
                        {password.length>=12?'Mạnh':password.length>=8?'Ổn':'Yếu'}
                      </span>
                    </div>
                  )}
                </div>
                <div><span style={lbl}>Xác nhận mật khẩu</span>
                  <input style={{...inp, borderColor:confirmPw&&confirmPw!==password?C.red:confirmPw?C.green:C.border}} type={showPw?'text':'password'} placeholder="Nhập lại mật khẩu" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} required autoComplete="new-password"/>
                  {confirmPw && <div style={{fontSize:11, marginTop:5, color:confirmPw===password?C.green:C.red, fontWeight:600}}>{confirmPw===password?'✓ Mật khẩu khớp':'✗ Mật khẩu chưa khớp'}</div>}
                </div>

                <button type="submit" disabled={loading} style={btn(C.green)}>{loading?'⏳ Đang tạo tài khoản...':'✓ Tạo tài khoản'}</button>

                {/* Divider */}
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{flex:1, height:1, background:C.border}}/><span style={{fontSize:12, color:C.textMuted, flexShrink:0}}>hoặc</span><div style={{flex:1, height:1, background:C.border}}/>
                </div>

                {/* Google */}
                <button type="button" onClick={handleGoogle} disabled={googleLoading}
                  style={{width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'13px 0', color:C.text, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:googleLoading?0.7:1}}>
                  {googleLoading ? '⏳ Đang chuyển hướng...' : <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Đăng ký với Google
                  </>}
                </button>

                <div style={{textAlign:'center', fontSize:13, color:C.textMuted}}>
                  Đã có tài khoản?{' '}
                  <button type="button" onClick={()=>{setScreen('login');reset()}} style={linkBtn}>Đăng nhập</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div style={{textAlign:'center', marginTop:20, fontSize:11, color:C.textMuted, lineHeight:1.6}}>
          🔒 Bảo mật bởi Supabase • Dữ liệu riêng tư từng người dùng
        </div>
      </div>
    </div>
  )
}
