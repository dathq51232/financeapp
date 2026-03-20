# 💰 Finance App — Quản lý Tài chính Cá nhân

Ứng dụng quản lý tài chính cá nhân được xây dựng bằng React + Vite, giao diện dark mode hiện đại.

## ✨ Tính năng

### 📊 Dashboard Tổng quan
- Hiển thị **tổng tài sản** tất cả tài khoản
- **Biểu đồ Donut** thu/chi tháng hiện tại
- **Sparkline** chi tiêu 7 ngày gần nhất
- Tài khoản cuộn ngang (swipeable cards)
- Thẻ tín dụng mini — hiển thị hạn mức & ngày thanh toán
- Phân tích chi tiêu theo danh mục (thanh màu)
- Giao dịch gần nhất

### 🏦 Tài khoản
- **Thêm / Sửa / Xoá** tài khoản
- Chọn icon & màu sắc tuỳ chỉnh
- Số dư tự động cập nhật khi thêm giao dịch

### 💳 Thẻ tín dụng
- **Thêm / Sửa / Xoá** thẻ tín dụng
- Hiển thị hạn mức, dư nợ, % đã dùng
- **Ngày chốt sao kê** & **ngày thanh toán** với đếm ngược
- Cảnh báo đỏ khi gần đến hạn (≤ 3 ngày)
- Tính tự động số tiền tối thiểu cần trả (5%)
- Tổng kết dư nợ toàn bộ thẻ

### 📈 Giao dịch
- Ghi nhận **Thu nhập** & **Chi tiêu**
- Lọc theo loại giao dịch
- Xem chi tiết & xoá từng giao dịch
- Số dư tài khoản cập nhật tức thì

### 🎨 Thiết kế
- Dark mode toàn bộ
- Floating Nav Bar với hiệu ứng glassmorphism
- Nút **"+"** nổi giữa thanh nav
- Responsive cho mobile

## 🚀 Cài đặt & Chạy

```bash
npm install
npm run dev
```

## 🔧 Build production

```bash
npm run build
npm run preview
```

## 🛠 Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **localStorage** — Lưu dữ liệu cục bộ (không cần backend)
- Pure CSS-in-JS (inline styles)

## 📁 Cấu trúc

```
financeapp/
├── src/
│   ├── App.jsx       # Toàn bộ logic & UI
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── index.html
├── vite.config.js
└── package.json
```

---

> Dữ liệu lưu trong `localStorage` của trình duyệt. Không cần đăng nhập, không cần internet.
