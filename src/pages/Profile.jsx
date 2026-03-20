import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../lib/db'

const C = {
  bg:'#080c14', surface:'#0e1520', card:'#121b2a', border:'#1a2a40',
  borderLight:'#243348', accent:'#f0b429', green:'#17d9a1',
  red:'#f05252', text:'#e6eaf4', textSub:'#8496b5', textMuted:'#445570',
}
const AVATAR_COLORS = ['#17d9a1','#5b8def','#f0b429','#9f7aea','#f05252','#f97316','#ec4899','#14b8a6']

export default function Profile({ user, profile, onUpdate, onClose }) {
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || user?.user_metadata?.avatar_color || '#17d9a1')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const initials = fullName.trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'

  const saveProfile = async () => {
    setLoading(true)
    try {
      const updated = await upsertProfile({ full_name: fullName, avatar_color: avatarColor })
      await supabase.auth.updateUser({ data: { full_name: fullName, avatar_color: avatarColor } })
      onUpdate(updated)
      setMsg('✅ Đã lưu thay đổi!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg('❌ ' + e.message) }
    setLoading(false)
  }

  const changePw = async () => {
    if (newPw !== confirmPw) { setMsg('❌ Mật khẩu không khớp'); return }
    if (newPw.length < 6) { setMsg('❌ Tối thiểu 6 ký tự'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ Đã đổi mật khẩu!'); setChangingPw(false); setNewPw(''); setConfirmPw('') }
    setTimeout(() => setMsg(''), 3000)
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const inp = { width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'13px 16px', color:C.text, fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
  const lbl = { fontSize:10, fontWeight:700, letterSpacing:2, color:C.textMuted, textTransform:'uppercase', marginBottom:7, display:'block' }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(4,8,16,.85)', backdropFilter:'blur(12px)', display:'flex', alignItems:'flex-end', zIndex:300}} onClick={onClose}>
      <div style={{background:C.surface, borderTop:`1.5px solid ${C.borderLight}`, borderRadius:'28px 28px 0 0', padding:'12px 20px 44px', width:'100%', maxHeight:'90vh', overflowY:'auto', boxSizing:'border-box'}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40, height:4, borderRadius:4, background:C.border, margin:'0 auto 22px'}}/>

        {/* Avatar */}
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:'16px 18px', background:C.card, borderRadius:20, border:`1px solid ${C.border}`}}>
          <div style={{width:60, height:60, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'#07090f', flexShrink:0, boxShadow:`0 4px 16px ${avatarColor}66`}}>
            {initials}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800, fontSize:17, color:C.text}}>{fullName || 'Chưa đặt tên'}</div>
            <div style={{fontSize:12, color:C.textMuted, marginTop:3}}>{user?.email}</div>
            <div style={{display:'flex', gap:6, marginTop:8}}>
              {AVATAR_COLORS.map(c=>(
                <div key={c} onClick={()=>setAvatarColor(c)} style={{width:22, height:22, borderRadius:'50%', background:c, cursor:'pointer', border:avatarColor===c?'2.5px solid white':'2.5px solid transparent', transition:'all .15s', boxShadow:avatarColor===c?`0 0 8px ${c}88`:''}}/>
              ))}
            </div>
          </div>
        </div>

        {msg && <div style={{background:`${msg.startsWith('✅')?C.green:C.red}18`, border:`1px solid ${msg.startsWith('✅')?C.green:C.red}44`, borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:13, color:msg.startsWith('✅')?C.green:C.red}}>{msg}</div>}

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div><span style={lbl}>Họ và tên</span>
            <input style={inp} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nguyễn Văn A"/>
          </div>
          <div><span style={lbl}>Email</span>
            <input style={{...inp, color:C.textMuted}} value={user?.email} readOnly/>
          </div>
          <button onClick={saveProfile} disabled={loading} style={{background:C.accent, border:'none', borderRadius:14, padding:'14px 0', width:'100%', color:'#07090f', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1}}>
            {loading?'⏳ Đang lưu...':'✓ Lưu thông tin'}
          </button>

          {/* Change password */}
          <div style={{height:1, background:C.border}}/>
          {!changingPw ? (
            <button onClick={()=>setChangingPw(true)} style={{background:`${C.blue}18`, border:`1.5px solid ${C.blue}44`, borderRadius:14, padding:'13px 0', width:'100%', color:C.blue, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
              🔒 Đổi mật khẩu
            </button>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:12, background:C.card, borderRadius:18, padding:'16px 18px', border:`1px solid ${C.border}`}}>
              <div style={{fontWeight:700, fontSize:14, marginBottom:4}}>🔒 Đổi mật khẩu</div>
              <div><span style={lbl}>Mật khẩu mới</span><input style={inp} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} minLength={6} placeholder="Tối thiểu 6 ký tự"/></div>
              <div><span style={lbl}>Xác nhận</span><input style={inp} type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Nhập lại mật khẩu mới"/></div>
              <div style={{display:'flex', gap:10}}>
                <button onClick={()=>{setChangingPw(false);setNewPw('');setConfirmPw('')}} style={{flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 0', color:C.textSub, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit'}}>Huỷ</button>
                <button onClick={changePw} disabled={loading} style={{flex:2, background:C.blue, border:'none', borderRadius:12, padding:'12px 0', color:C.text, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1}}>Lưu mật khẩu</button>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button onClick={signOut} style={{background:`${C.red}12`, border:`1.5px solid ${C.red}33`, borderRadius:14, padding:'13px 0', width:'100%', color:C.red, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
