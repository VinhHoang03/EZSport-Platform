# 🚀 Quick Start - AI Court Search

## ⚡ 3 Steps to Test

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd ezsport-backend
npm run dev

# Terminal 2 - Frontend  
cd ezsport-web
npm run dev
```

### Step 2: Open Browser
```
http://localhost:5173
```

### Step 3: Find the AI Button
```
Look for: 🤖 (purple circle button)
Location: Bottom right corner
Pages: Venues page or App page (map view)
```

---

## 🎯 Where is the AI Button?

```
┌─────────────────────────────────────────────────┐
│  Navigation Bar                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│           MAP OR COURT LIST                     │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                          🤖     │ ← AI button (NEW!)
│                                                 │
│                                          💬     │ ← Chat button
└─────────────────────────────────────────────────┘
   Bottom right corner (stacked vertically)
   AI button: 100px from bottom
   Chat button: 24px from bottom
```

---

## 🧪 Quick Test

1. **Click the 🤖 button**
2. **Try this prompt**: "Tìm sân bóng đá giá rẻ"
3. **See results** with AI explanation
4. **Click "Chỉ đường"** to see map integration

---

## ✅ What You Should See

### Before Click
- Purple gradient circle button with 🤖 emoji
- Positioned above the chat button (💬)

### After Click
- Modal opens with title "🤖 AI Tìm Sân Thông Minh"
- 4 quick prompt buttons
- Search input field
- "🔍 Tìm" button

### After Search
- AI explanation box (purple gradient)
- Matched criteria badges
- Court cards with images
- "🧭 Chỉ đường" and "👁️ Xem chi tiết" buttons

---

## 🐛 Troubleshooting

### Button not showing?
- Make sure you're on the map page (not landing page)
- Check browser console for errors
- Try refreshing the page (Ctrl+R)

### Modal not opening?
- Clear browser cache
- Check if backend is running
- Restart frontend dev server

### Search not working?
- Verify backend is on port 5000
- Check `.env` file has Groq API key
- Look at backend console for errors

---

## 📞 Need Help?

Check these files:
- `AI_INTEGRATION_COMPLETE.md` - Full documentation
- `FIX_AI_IMPORT_ERROR.md` - Import error solution
- `HOW_TO_USE_AI.md` - User guide

---

**🎉 That's it! Click 🤖 and start searching!**
