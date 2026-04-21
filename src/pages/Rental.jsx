import { useState, useEffect, useCallback } from "react"
import * as db from "../lib/db"

/* ════ PALETTE ════ */
const C = {
  bg: "#f0f2f5", white: "#ffffff", surface2: "#f7f8fa",
  line: "#e4e7ec", lineSoft: "#eef0f3",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  primary: "#2563eb", primarySoft: "#eff4ff", primaryDark: "#1d4ed8",
  green: "#059669", greenSoft: "#ecfdf5",
  red: "#dc2626", redSoft: "#fef2f2",
  amber: "#d97706", amberSoft: "#fffbeb",
  purple: "#7c3aed", purpleSoft: "#ede9fe",
  teal: "#0891b2", tealSoft: "#ecfeff",
}

const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
const fmtN = n => new Intl.NumberFormat("vi-VN").format(n)
const fmtShort = n => { const a = Math.abs(n); return a >= 1e9 ? (n / 1e9).toFixed(1) + " tỷ" : a >= 1e6 ? (n / 1e6).toFixed(1) + " tr" : a >= 1e3 ? (n / 1e3).toFixed(0) + "k" : fmtN(n) }
const today = new Date(), thisMonth = today.getMonth() + 1, thisYear = today.getFullYear()

const SUB_TABS = [
  { key: "dashboard", label: "Tổng quan", icon: "📊" },
  { key: "rooms", label: "Phòng", icon: "🚪" },
  { key: "meter", label: "Điện / Nước", icon: "⚡" },
  { key: "invoices", label: "Hóa đơn", icon: "🧾" },
  { key: "tenants", label: "Khách thuê", icon: "👤" },
]

/* ── shared styles ── */
const inp = { width: "100%", background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 8, padding: "11px 13px", color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }
const sel = { ...inp, appearance: "none" }
const lbl = { fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 5, display: "block" }
const btnPri = { background: C.primary, border: "none", borderRadius: 8, padding: "12px 0", width: "100%", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }
const moSt = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(2px)" }
const moBx = { background: C.white, borderRadius: "16px 16px 0 0", padding: "8px 20px 36px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box" }
const dragPill = { width: 36, height: 4, borderRadius: 4, background: C.line, margin: "8px auto 18px" }

function StatusBadge({ status }) {
  const map = { empty: [C.green, C.greenSoft, "Trống"], occupied: [C.amber, C.amberSoft, "Đã thuê"] }
  const [fg, bg, label] = map[status] || [C.textSub, C.surface2, status]
  return <span style={{ background: bg, color: fg, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{label}</span>
}

function InvoiceStatus({ status }) {
  const paid = status === "paid"
  return <span style={{ background: paid ? C.greenSoft : C.redSoft, color: paid ? C.green : C.red, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{paid ? "Đã TT" : "Chưa TT"}</span>
}

/* ════ SUB-TAB: DASHBOARD ════ */
function RentalDashboard({ rooms, tenants, invoices, setSubTab }) {
  const occupied = rooms.filter(r => r.status === "occupied").length
  const empty = rooms.filter(r => r.status === "empty").length
  const thisMonthInv = invoices.filter(i => i.month === thisMonth && i.year === thisYear)
  const unpaid = thisMonthInv.filter(i => i.status === "unpaid")
  const revenue = thisMonthInv.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0)

  const stats = [
    { label: "Tổng phòng", value: rooms.length, icon: "🚪", color: C.primary, bg: C.primarySoft, tab: "rooms" },
    { label: "Phòng trống", value: empty, icon: "✅", color: C.green, bg: C.greenSoft, tab: "rooms" },
    { label: "Đang thuê", value: occupied, icon: "👥", color: C.amber, bg: C.amberSoft, tab: "tenants" },
    { label: "Chưa thu tiền", value: unpaid.length, icon: "🧾", color: C.red, bg: C.redSoft, tab: "invoices" },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)", padding: "32px 16px 40px", color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: .75, marginBottom: 4 }}>Doanh thu tháng {thisMonth}/{thisYear}</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px" }}>{fmt(revenue)}</div>
        <div style={{ fontSize: 12, opacity: .8, marginTop: 6 }}>Nhà trọ · {rooms.length} phòng</div>
      </div>

      {/* Stats grid */}
      <div style={{ margin: "0 16px", marginTop: -20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, position: "relative", zIndex: 2 }}>
        {stats.map((s, i) => (
          <button key={i} onClick={() => setSubTab(s.tab)} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,.07)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Unpaid invoices */}
      {unpaid.length > 0 && (
        <>
          <div style={{ padding: "20px 16px 8px", fontSize: 14, fontWeight: 700 }}>Hóa đơn chưa thu — Tháng {thisMonth}</div>
          <div style={{ background: C.white, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            {unpaid.map((inv, i) => {
              const room = rooms.find(r => r.id === inv.room_id)
              return (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < unpaid.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🚪</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{room?.name || "Phòng"}</div>
                    <div style={{ fontSize: 11, color: C.textSub, marginTop: 1 }}>Tháng {inv.month}/{inv.year}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{fmtShort(inv.total)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
      {unpaid.length === 0 && (
        <div style={{ margin: "20px 16px", background: C.greenSoft, border: `1px solid ${C.green}44`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Tất cả hóa đơn tháng này đã được thu!</span>
        </div>
      )}
    </div>
  )
}

/* ════ SUB-TAB: ROOMS ════ */
function RoomsTab({ rooms, setRooms }) {
  const BLANK = { name: "", floor: "1", price: "", status: "empty", note: "" }
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm(BLANK); setModal({ mode: "add" }) }
  const openEdit = r => { setForm({ name: r.name, floor: String(r.floor), price: fmtN(r.price), status: r.status, note: r.note || "" }); setModal({ mode: "edit", id: r.id }) }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const payload = { name: form.name, floor: parseInt(form.floor) || 1, price: parseInt(form.price.replace(/\D/g, "") || 0), status: form.status, note: form.note }
      if (modal.mode === "add") { const r = await db.createRoom(payload); setRooms(rs => [...rs, r]) }
      else { const r = await db.updateRoom(modal.id, payload); setRooms(rs => rs.map(x => x.id === modal.id ? r : x)) }
      setModal(null)
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }
  const del = async () => {
    if (!confirm("Xoá phòng này?")) return
    await db.deleteRoom(modal.id)
    setRooms(rs => rs.filter(r => r.id !== modal.id))
    setModal(null)
  }

  const byFloor = rooms.reduce((g, r) => { (g[r.floor] = g[r.floor] || []).push(r); return g }, {})
  const floors = Object.keys(byFloor).map(Number).sort((a, b) => a - b)

  return (
    <div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Danh sách phòng</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{rooms.length} phòng · {rooms.filter(r => r.status === "empty").length} trống</div>
        </div>
        <button onClick={openAdd} style={{ background: C.primary, border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Thêm phòng</button>
      </div>

      {rooms.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚪</div>
          <div style={{ color: C.textSub, fontSize: 14, marginBottom: 20 }}>Chưa có phòng nào</div>
          <button onClick={openAdd} style={{ ...btnPri, width: "auto", padding: "11px 24px" }}>+ Thêm phòng đầu tiên</button>
        </div>
      )}

      {floors.map(floor => (
        <div key={floor}>
          <div style={{ padding: "10px 16px 6px", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            Tầng {floor}
          </div>
          <div style={{ background: C.white }}>
            {byFloor[floor].map((r, i) => (
              <div key={r.id} onClick={() => openEdit(r)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < byFloor[floor].length - 1 ? `1px solid ${C.lineSoft}` : "none", cursor: "pointer" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: r.status === "empty" ? C.greenSoft : C.amberSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🚪</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{fmtN(r.price)} ₫/tháng</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay" style={moSt} onClick={() => setModal(null)}>
          <div className="modal-box" style={moBx} onClick={e => e.stopPropagation()}>
            <div className="drag-pill" style={dragPill} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{modal.mode === "add" ? "Thêm phòng" : "Chỉnh sửa phòng"}</div>
              {modal.mode === "edit" && <button onClick={del} style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 6, padding: "5px 12px", color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Xoá</button>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><span style={lbl}>Tên phòng</span><input style={inp} placeholder="VD: Phòng 101" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><span style={lbl}>Tầng</span><input style={inp} type="number" min="1" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} /></div>
                <div style={{ flex: 2 }}><span style={lbl}>Giá thuê/tháng (₫)</span><input style={{ ...inp, fontWeight: 700 }} inputMode="numeric" placeholder="0" value={form.price} onChange={e => { const v = e.target.value.replace(/\D/g, ""); setForm(f => ({ ...f, price: v ? fmtN(parseInt(v)) : "" })) }} /></div>
              </div>
              <div><span style={lbl}>Trạng thái</span>
                <select style={sel} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="empty">Trống</option>
                  <option value="occupied">Đã thuê</option>
                </select>
              </div>
              <div><span style={lbl}>Ghi chú</span><input style={inp} placeholder="..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
              <button style={{ ...btnPri, opacity: saving ? .6 : 1 }} onClick={save} disabled={saving}>{saving ? "Đang lưu..." : modal.mode === "add" ? "Thêm phòng" : "Lưu thay đổi"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════ SUB-TAB: METER READINGS (Điện/Nước) ════ */
function MeterTab({ rooms, readings, setReadings, invoices, setInvoices }) {
  const BLANK_METER = { room_id: "", month: String(thisMonth), year: String(thisYear), elec_old: "", elec_new: "", water_old: "", water_new: "", elec_price: "4000", water_price: "15000" }
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK_METER)
  const [saving, setSaving] = useState(false)

  const elecUsed = Math.max(0, parseInt(form.elec_new || 0) - parseInt(form.elec_old || 0))
  const waterUsed = Math.max(0, parseInt(form.water_new || 0) - parseInt(form.water_old || 0))
  const elecCost = elecUsed * parseInt(form.elec_price || 0)
  const waterCost = waterUsed * parseInt(form.water_price || 0)

  const save = async () => {
    if (!form.room_id) return alert("Chọn phòng!")
    setSaving(true)
    try {
      const reading = {
        room_id: form.room_id, month: parseInt(form.month), year: parseInt(form.year),
        elec_old: parseInt(form.elec_old || 0), elec_new: parseInt(form.elec_new || 0),
        water_old: parseInt(form.water_old || 0), water_new: parseInt(form.water_new || 0),
        elec_price: parseInt(form.elec_price || 4000), water_price: parseInt(form.water_price || 15000),
      }
      const r = await db.upsertMeterReading(reading)
      setReadings(rs => { const idx = rs.findIndex(x => x.id === r.id); return idx >= 0 ? rs.map(x => x.id === r.id ? r : x) : [r, ...rs] })

      // Tạo / cập nhật hóa đơn
      const room = rooms.find(rm => rm.id === form.room_id)
      const existInv = invoices.find(i => i.room_id === form.room_id && i.month === parseInt(form.month) && i.year === parseInt(form.year))
      const invPayload = {
        room_id: form.room_id, month: parseInt(form.month), year: parseInt(form.year),
        rent_amount: room?.price || 0, elec_amount: elecCost, water_amount: waterCost, other_amount: 0,
      }
      if (!existInv) {
        const inv = await db.createInvoice(invPayload)
        setInvoices(is => [inv, ...is])
      } else {
        const inv = await db.updateInvoice(existInv.id, { ...invPayload, total: invPayload.rent_amount + elecCost + waterCost })
        setInvoices(is => is.map(x => x.id === existInv.id ? inv : x))
      }
      setModal(false)
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  const grouped = readings.reduce((g, r) => {
    const key = `${r.year}-${String(r.month).padStart(2, "0")}`
    ;(g[key] = g[key] || []).push(r)
    return g
  }, {})
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Điện — Nước</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Nhập chỉ số, hệ thống tự tính tiền</div>
        </div>
        <button onClick={() => { setForm(BLANK_METER); setModal(true) }} style={{ background: C.primary, border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Nhập chỉ số</button>
      </div>

      {readings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <div style={{ color: C.textSub, fontSize: 14 }}>Chưa có chỉ số nào được nhập</div>
        </div>
      )}

      {sortedKeys.map(key => {
        const [yr, mo] = key.split("-")
        return (
          <div key={key}>
            <div style={{ padding: "10px 16px 6px", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
              Tháng {parseInt(mo)}/{yr}
            </div>
            <div style={{ background: C.white }}>
              {grouped[key].map((r, i) => {
                const room = rooms.find(rm => rm.id === r.room_id)
                const elec = Math.max(0, r.elec_new - r.elec_old)
                const water = Math.max(0, r.water_new - r.water_old)
                return (
                  <div key={r.id} style={{ padding: "14px 16px", borderBottom: i < grouped[key].length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{room?.name || "Phòng"}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{fmtShort(elec * r.elec_price + water * r.water_price)} ₫</div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1, background: C.amberSoft, borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, marginBottom: 3 }}>⚡ ĐIỆN</div>
                        <div style={{ fontSize: 12, color: C.text }}>{r.elec_old} → {r.elec_new} kWh</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginTop: 1 }}>{fmtShort(elec * r.elec_price)} ₫</div>
                      </div>
                      <div style={{ flex: 1, background: C.tealSoft, borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, marginBottom: 3 }}>💧 NƯỚC</div>
                        <div style={{ fontSize: 12, color: C.text }}>{r.water_old} → {r.water_new} m³</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginTop: 1 }}>{fmtShort(water * r.water_price)} ₫</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Modal nhập chỉ số */}
      {modal && (
        <div className="modal-overlay" style={moSt} onClick={() => setModal(false)}>
          <div className="modal-box" style={moBx} onClick={e => e.stopPropagation()}>
            <div className="drag-pill" style={dragPill} />
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Nhập chỉ số điện / nước</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><span style={lbl}>Phòng</span>
                <select style={sel} value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><span style={lbl}>Tháng</span><input style={inp} type="number" min="1" max="12" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} /></div>
                <div style={{ flex: 1 }}><span style={lbl}>Năm</span><input style={inp} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
              </div>
              {/* Electricity */}
              <div style={{ background: C.amberSoft, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 10 }}>⚡ Điện</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}><span style={lbl}>Chỉ số cũ</span><input style={{ ...inp, background: C.white }} type="number" min="0" value={form.elec_old} onChange={e => setForm(f => ({ ...f, elec_old: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><span style={lbl}>Chỉ số mới</span><input style={{ ...inp, background: C.white }} type="number" min="0" value={form.elec_new} onChange={e => setForm(f => ({ ...f, elec_new: e.target.value }))} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1 }}><span style={lbl}>Đơn giá (₫/kWh)</span><input style={{ ...inp, background: C.white }} type="number" value={form.elec_price} onChange={e => setForm(f => ({ ...f, elec_price: e.target.value }))} /></div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 11, color: C.textSub, marginBottom: 5 }}>Tiêu thụ: {elecUsed} kWh</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.amber }}>{fmt(elecCost)}</div>
                  </div>
                </div>
              </div>
              {/* Water */}
              <div style={{ background: C.tealSoft, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 10 }}>💧 Nước</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}><span style={lbl}>Chỉ số cũ</span><input style={{ ...inp, background: C.white }} type="number" min="0" value={form.water_old} onChange={e => setForm(f => ({ ...f, water_old: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><span style={lbl}>Chỉ số mới</span><input style={{ ...inp, background: C.white }} type="number" min="0" value={form.water_new} onChange={e => setForm(f => ({ ...f, water_new: e.target.value }))} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1 }}><span style={lbl}>Đơn giá (₫/m³)</span><input style={{ ...inp, background: C.white }} type="number" value={form.water_price} onChange={e => setForm(f => ({ ...f, water_price: e.target.value }))} /></div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 11, color: C.textSub, marginBottom: 5 }}>Tiêu thụ: {waterUsed} m³</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.teal }}>{fmt(waterCost)}</div>
                  </div>
                </div>
              </div>
              {/* Total */}
              <div style={{ background: C.primarySoft, borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>Tổng điện + nước</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>{fmt(elecCost + waterCost)}</span>
              </div>
              <button style={{ ...btnPri, opacity: saving ? .6 : 1 }} onClick={save} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu & Tạo hóa đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════ SUB-TAB: INVOICES ════ */
function InvoicesTab({ invoices, setInvoices, rooms }) {
  const [filter, setFilter] = useState("all") // all | unpaid | paid

  const filtered = invoices.filter(i => filter === "all" || i.status === filter)
  const grouped = filtered.reduce((g, i) => {
    const key = `${i.year}-${String(i.month).padStart(2, "0")}`
    ;(g[key] = g[key] || []).push(i)
    return g
  }, {})
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const markPaid = async (inv) => {
    try {
      const updated = await db.markInvoicePaid(inv.id)
      setInvoices(is => is.map(i => i.id === inv.id ? updated : i))
    } catch (e) { alert(e.message) }
  }

  const filtB = a => ({ border: `1.5px solid ${a ? C.primary : C.line}`, background: a ? C.primarySoft : C.white, borderRadius: 6, padding: "6px 14px", color: a ? C.primary : C.textSub, fontWeight: a ? 600 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit" })

  const totalUnpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + i.total, 0)

  return (
    <div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "20px 16px 14px" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Hóa đơn & Thanh toán</div>
        {totalUnpaid > 0 && <div style={{ fontSize: 12, color: C.red, marginTop: 2, fontWeight: 500 }}>Chưa thu: {fmt(totalUnpaid)}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: C.white, borderBottom: `1px solid ${C.line}` }}>
        {[["all", "Tất cả"], ["unpaid", "Chưa TT"], ["paid", "Đã TT"]].map(([k, l]) => (
          <button key={k} style={filtB(filter === k)} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: C.textSub, fontSize: 13 }}>Không có hóa đơn nào</div>}

      {sortedKeys.map(key => {
        const [yr, mo] = key.split("-")
        return (
          <div key={key}>
            <div style={{ padding: "10px 16px 6px", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
              Tháng {parseInt(mo)}/{yr}
            </div>
            <div style={{ background: C.white }}>
              {grouped[key].map((inv, i) => {
                const room = rooms.find(r => r.id === inv.room_id)
                return (
                  <div key={inv.id} style={{ padding: "14px 16px", borderBottom: i < grouped[key].length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧾</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{room?.name || "Phòng"}</div>
                          <InvoiceStatus status={inv.status} />
                        </div>
                        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                          {[["🏠 Phòng", inv.rent_amount], ["⚡ Điện", inv.elec_amount], ["💧 Nước", inv.water_amount]].map(([label, val]) => (
                            <div key={label} style={{ background: C.surface2, borderRadius: 7, padding: "6px 8px" }}>
                              <div style={{ fontSize: 10, color: C.textSub }}>{label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 2 }}>{fmtShort(val)}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <div>
                            <span style={{ fontSize: 11, color: C.textSub }}>Tổng: </span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{fmt(inv.total)}</span>
                          </div>
                          {inv.status === "unpaid" && (
                            <button onClick={() => markPaid(inv)} style={{ background: C.green, border: "none", borderRadius: 7, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              ✓ Thu tiền
                            </button>
                          )}
                          {inv.status === "paid" && inv.paid_date && (
                            <div style={{ fontSize: 11, color: C.textMuted }}>Đã thu {inv.paid_date}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ════ SUB-TAB: TENANTS ════ */
function TenantsTab({ tenants, setTenants, rooms, setRooms }) {
  const BLANK = { name: "", phone: "", id_card: "", room_id: "", move_in_date: today.toISOString().slice(0, 10), move_out_date: "", deposit: "", monthly_rent: "", note: "" }
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm(BLANK); setModal({ mode: "add" }) }
  const openEdit = t => {
    setForm({ name: t.name, phone: t.phone || "", id_card: t.id_card || "", room_id: t.room_id || "", move_in_date: t.move_in_date, move_out_date: t.move_out_date || "", deposit: t.deposit ? fmtN(t.deposit) : "", monthly_rent: t.monthly_rent ? fmtN(t.monthly_rent) : "", note: t.note || "" })
    setModal({ mode: "edit", id: t.id })
  }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const payload = { name: form.name, phone: form.phone, id_card: form.id_card, room_id: form.room_id || null, move_in_date: form.move_in_date, move_out_date: form.move_out_date || null, deposit: parseInt(form.deposit.replace(/\D/g, "") || 0), monthly_rent: parseInt(form.monthly_rent.replace(/\D/g, "") || 0), note: form.note }
      if (modal.mode === "add") {
        const t = await db.createTenant(payload)
        setTenants(ts => [...ts, t])
        if (form.room_id) { const r = await db.updateRoom(form.room_id, { status: "occupied" }); setRooms(rs => rs.map(x => x.id === form.room_id ? r : x)) }
      } else {
        const t = await db.updateTenant(modal.id, payload)
        setTenants(ts => ts.map(x => x.id === modal.id ? t : x))
        if (form.room_id) { const r = await db.updateRoom(form.room_id, { status: "occupied" }); setRooms(rs => rs.map(x => x.id === form.room_id ? r : x)) }
      }
      setModal(null)
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async () => {
    if (!confirm("Xoá khách thuê này?")) return
    const t = tenants.find(x => x.id === modal.id)
    await db.deleteTenant(modal.id)
    setTenants(ts => ts.filter(x => x.id !== modal.id))
    if (t?.room_id) { const r = await db.updateRoom(t.room_id, { status: "empty" }); setRooms(rs => rs.map(x => x.id === t.room_id ? r : x)) }
    setModal(null)
  }

  const active = tenants.filter(t => !t.move_out_date || new Date(t.move_out_date) >= today)
  const inactive = tenants.filter(t => t.move_out_date && new Date(t.move_out_date) < today)

  const TenantRow = ({ t }) => {
    const room = rooms.find(r => r.id === t.room_id)
    const isActive = !t.move_out_date || new Date(t.move_out_date) >= today
    return (
      <div onClick={() => openEdit(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.lineSoft}`, cursor: "pointer" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: isActive ? C.primarySoft : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
          <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
            {room ? `🚪 ${room.name} · ` : ""}{t.phone || "—"}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>Vào: {t.move_in_date}{t.move_out_date ? ` · Ra: ${t.move_out_date}` : ""}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.primary : C.textSub }}>{fmtShort(t.monthly_rent || 0)} ₫</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>cọc: {fmtShort(t.deposit || 0)}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Hợp đồng & Khách thuê</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{active.length} đang ở · {inactive.length} đã rời</div>
        </div>
        <button onClick={openAdd} style={{ background: C.primary, border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Thêm</button>
      </div>

      {tenants.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <div style={{ color: C.textSub, fontSize: 14, marginBottom: 20 }}>Chưa có khách thuê nào</div>
          <button onClick={openAdd} style={{ ...btnPri, width: "auto", padding: "11px 24px" }}>+ Thêm khách đầu tiên</button>
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{ padding: "10px 16px 6px", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>Đang thuê ({active.length})</div>
          <div style={{ background: C.white }}>{active.map(t => <TenantRow key={t.id} t={t} />)}</div>
        </>
      )}
      {inactive.length > 0 && (
        <>
          <div style={{ padding: "10px 16px 6px", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>Đã rời ({inactive.length})</div>
          <div style={{ background: C.white }}>{inactive.map(t => <TenantRow key={t.id} t={t} />)}</div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" style={moSt} onClick={() => setModal(null)}>
          <div className="modal-box" style={moBx} onClick={e => e.stopPropagation()}>
            <div className="drag-pill" style={dragPill} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{modal.mode === "add" ? "Thêm khách thuê" : "Chỉnh sửa"}</div>
              {modal.mode === "edit" && <button onClick={del} style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 6, padding: "5px 12px", color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Xoá</button>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div><span style={lbl}>Họ tên</span><input style={inp} placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><span style={lbl}>Số điện thoại</span><input style={inp} placeholder="0912..." inputMode="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div style={{ flex: 1 }}><span style={lbl}>CMND/CCCD</span><input style={inp} placeholder="0123..." value={form.id_card} onChange={e => setForm(f => ({ ...f, id_card: e.target.value }))} /></div>
              </div>
              <div><span style={lbl}>Phòng</span>
                <select style={sel} value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name} {r.status === "empty" ? "(Trống)" : "(Đã có người)"}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><span style={lbl}>Ngày vào ở</span><input style={inp} type="date" value={form.move_in_date} onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} /></div>
                <div style={{ flex: 1 }}><span style={lbl}>Ngày rời (nếu có)</span><input style={inp} type="date" value={form.move_out_date} onChange={e => setForm(f => ({ ...f, move_out_date: e.target.value }))} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><span style={lbl}>Tiền thuê/tháng (₫)</span><input style={{ ...inp, fontWeight: 700 }} inputMode="numeric" placeholder="0" value={form.monthly_rent} onChange={e => { const v = e.target.value.replace(/\D/g, ""); setForm(f => ({ ...f, monthly_rent: v ? fmtN(parseInt(v)) : "" })) }} /></div>
                <div style={{ flex: 1 }}><span style={lbl}>Tiền cọc (₫)</span><input style={{ ...inp, fontWeight: 700 }} inputMode="numeric" placeholder="0" value={form.deposit} onChange={e => { const v = e.target.value.replace(/\D/g, ""); setForm(f => ({ ...f, deposit: v ? fmtN(parseInt(v)) : "" })) }} /></div>
              </div>
              <div><span style={lbl}>Ghi chú</span><input style={inp} placeholder="..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
              <button style={{ ...btnPri, opacity: saving ? .6 : 1, marginTop: 4 }} onClick={save} disabled={saving}>{saving ? "Đang lưu..." : modal.mode === "add" ? "Thêm khách thuê" : "Lưu thay đổi"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════ MAIN EXPORT: Rental ════ */
export default function Rental() {
  const [subTab, setSubTab] = useState("dashboard")
  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [readings, setReadings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([db.getRooms(), db.getTenants(), db.getMeterReadings(), db.getInvoices()])
      .then(([rm, tn, rd, inv]) => { setRooms(rm); setTenants(tn); setReadings(rd); setInvoices(inv) })
      .catch(e => console.error("Rental load error:", e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
      <div style={{ fontSize: 36 }}>🏘️</div>
      <div style={{ color: C.textSub, fontSize: 14 }}>Đang tải dữ liệu...</div>
    </div>
  )

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            flexShrink: 0, border: "none", background: "none", padding: "14px 16px", cursor: "pointer",
            fontFamily: "inherit", fontSize: 13, fontWeight: subTab === t.key ? 700 : 400,
            color: subTab === t.key ? C.primary : C.textSub,
            borderBottom: subTab === t.key ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
          }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === "dashboard" && <RentalDashboard rooms={rooms} tenants={tenants} invoices={invoices} setSubTab={setSubTab} />}
      {subTab === "rooms" && <RoomsTab rooms={rooms} setRooms={setRooms} />}
      {subTab === "meter" && <MeterTab rooms={rooms} readings={readings} setReadings={setReadings} invoices={invoices} setInvoices={setInvoices} />}
      {subTab === "invoices" && <InvoicesTab invoices={invoices} setInvoices={setInvoices} rooms={rooms} />}
      {subTab === "tenants" && <TenantsTab tenants={tenants} setTenants={setTenants} rooms={rooms} setRooms={setRooms} />}
    </div>
  )
}
