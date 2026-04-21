import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../lib/db'

const C = {
  bg:'#f4f5f7', white:'#ffffff', line:'#e8ebf0', lineSoft:'#f0f2f5',
  text:'#1f2937', textSub:'#6b7280', textMuted:'#9aa3b2',
  primary:'#e8302c', primarySoft:'#fdecec',
  green:'#16a34a', greenSoft:'#e8f5ee',
  blue:'#2563eb', blueSoft:'#eaf1fd',
}
const AVATAR_COLORS = ['#e8302c','#2563eb','#16a34a','#7c3aed','#f59e0b','#0891b2','#db2777','#64748b']

export default function Profile({ user, profile, onUpdate, onClose }) {
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || user?.user_metadata?.avatar_color || C.primary)
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
      setMsg('Đã lưu thay đổi')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg('Lỗi: ' + e.message) }
    setLoading(false)
  }

  const changePw = async () => {
    if (newPw !== confirmPw) { setMsg('Mật khẩu không khớp'); return }
    if (newPw.length < 6) { setMsg('Tối thiểu 6 ký tự'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setMsg('Lỗi: ' + error.message)
    else { setMsg('Đã đổi mật khẩu'); setChangingPw(false); setNewPw(''); setConfirmPw('') }
    setTimeout(() => setMsg(''), 3000)
    setLoading(false)
  }

  const signOut = async () => { await supabase.auth.signOut() }

  const inp = { width:'100%', background:C.white, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
  const lbl = { fontSize:12, fontWeight:600, color:C.textSub, marginBottom:6, display:'block' }
  const isOk = msg && !msg.startsWith('Lỗi') && !msg.includes('không')

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,.45)', display:'flex', alignItems:'flex-end', zIndex:300}} onClick={onClose}>
      <div style={{background:C.white, borderRadius:'20px 20px 0 0', padding:'10px 18px 40px', width:'100%', maxHeight:'90vh', overflowY:'auto', boxSizing:'border-box'}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40, height:4, borderRadius:4, background:C.line, margin:'0 auto 18px'}}/>

        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'14px', background:C.lineSoft, borderRadius:10}}>
          <div style={{width:56, height:56, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', flexShrink:0}}>
            {initials}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontWeight:700, fontSize:15, color:C.text}}>{fullName || 'Chưa đặt tên'}</div>
            <div style={{fontSize:12, color:C.textSub, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user?.email}</div>
            <div style={{display:'flex', gap:6, marginTop:8}}>
              {AVATAR_COLORS.map(c=>(
                <div key={c} onClick={()=>setAvatarColor(c)} style={{width:20, height:20, borderRadius:'50%', background:c, cursor:'pointer', border:avatarColor===c?`2px solid ${C.white}`:'2px solid transparent', boxShadow:avatarColor===c?`0 0 0 1.5px ${c}`:'none'}}/>
              ))}
            </div>
          </div>
        </div>

        {msg && <div style={{background:isOk?C.greenSoft:C.primarySoft, border:`1px solid ${isOk?C.green:C.primary}55`, borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:isOk?C.green:C.primary}}>{msg}</div>}

        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div><span style={lbl}>Họ và tên</span>
            <input style={inp} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nguyễn Văn A"/>
          </div>
          <div><span style={lbl}>Email</span>
            <input style={{...inp, color:C.textMuted, background:C.lineSoft}} value={user?.email || ''} readOnly/>
          </div>
          <button onClick={saveProfile} disabled={loading} style={{background:C.primary, border:'none', borderRadius:8, padding:'13px 0', width:'100%', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1}}>
            {loading?'Đang lưu...':'Lưu thông tin'}
          </button>

          <div style={{height:1, background:C.line, margin:'4px 0'}}/>

          {!changingPw ? (
            <button onClick={()=>setChangingPw(true)} style={{background:C.white, border:`1px solid ${C.line}`, borderRadius:8, padding:'12px 0', width:'100%', color:C.text, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
              Đổi mật khẩu
            </button>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:10, background:C.lineSoft, borderRadius:10, padding:'14px'}}>
              <div style={{fontWeight:700, fontSize:13, marginBottom:2}}>Đổi mật khẩu</div>
              <div><span style={lbl}>Mật khẩu mới</span><input style={inp} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} minLength={6} placeholder="Tối thiểu 6 ký tự"/></div>
              <div><span style={lbl}>Xác nhận</span><input style={inp} type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Nhập lại mật khẩu mới"/></div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>{setChangingPw(false);setNewPw('');setConfirmPw('')}} style={{flex:1, background:C.white, border:`1px solid ${C.line}`, borderRadius:8, padding:'11px 0', color:C.textSub, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit'}}>Huỷ</button>
                <button onClick={changePw} disabled={loading} style={{flex:2, background:C.blue, border:'none', borderRadius:8, padding:'11px 0', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1}}>Lưu mật khẩu</button>
              </div>
            </div>
          )}

          <button onClick={signOut} style={{background:C.white, border:`1px solid ${C.primary}`, borderRadius:8, padding:'12px 0', width:'100%', color:C.primary, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
