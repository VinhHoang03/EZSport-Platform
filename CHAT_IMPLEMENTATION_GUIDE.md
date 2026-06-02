# 💬 Hướng Dẫn Sử Dụng Chat Owner-Player

## ✅ Đã Hoàn Thành

### Backend:
1. ✅ **Model**: `conversation.model.ts` - Lưu trữ conversations và messages
2. ✅ **Controller**: `conversation.controller.ts` - Xử lý logic chat
3. ✅ **Routes**: `conversation.routes.ts` - API endpoints
4. ✅ **Service**: Đã đăng ký routes trong `index.routes.ts`

### Frontend:
1. ✅ **Owner Chat**: `ezsport-web/src/pages/owner/chats/OwnerMessage.tsx`
2. ✅ **Player Chat**: `ezsport-web/src/pages/player/chats/PlayerMessage.tsx`
3. ✅ **Service**: `conversation.service.ts` - API calls
4. ✅ **Routes**: Đã thêm route `/messages` cho player

---

## 📍 Vị Trí Chat

### Owner:
- **Đường dẫn**: `/owner/page` → Tab "Tin nhắn"
- **Component**: `OwnerMessage` (đã tích hợp vào OwnerPage)

### Player:
- **Đường dẫn**: `/messages`
- **Component**: `PlayerMessage` (standalone page)

---

## 🔧 Cần Làm Thêm

### 1. Thêm Nút "Nhắn tin với chủ sân" vào VenueDetail

**File**: `ezsport-web/src/components/player/VenueDetail.tsx`

Thêm import:
\`\`\`typescript
import { useNavigate } from 'react-router-dom';
import { conversationService } from '../../services/conversation.service';
import { ROUTES } from '../../constants';
\`\`\`

Thêm state và function:
\`\`\`typescript
const navigate = useNavigate();
const [creatingChat, setCreatingChat] = useState(false);

const handleChatWithOwner = async () => {
  if (!venueData?.owner) {
    alert('Không tìm thấy thông tin chủ sân');
    return;
  }

  try {
    setCreatingChat(true);
    
    // Tạo hoặc lấy conversation
    const conversation = await conversationService.createOrGetConversation({
      otherUserId: venueData.owner._id, // hoặc venueData.ownerId
      venueId: venueData._id,
    });

    // Chuyển đến trang chat
    navigate(ROUTES.MESSAGES);
    
  } catch (error) {
    console.error('Error creating conversation:', error);
    alert('Không thể tạo hội thoại. Vui lòng thử lại.');
  } finally {
    setCreatingChat(false);
  }
};
\`\`\`

Thêm nút vào UI (ví dụ bên cạnh nút "Đặt sân"):
\`\`\`tsx
<Button
  variant="outline-success"
  onClick={handleChatWithOwner}
  disabled={creatingChat}
  style={{ 
    borderRadius: '12px', 
    padding: '12px 24px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
  {creatingChat ? (
    <>
      <span className="spinner-border spinner-border-sm" />
      Đang tạo...
    </>
  ) : (
    <>
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
      Nhắn tin với chủ sân
    </>
  )}
</Button>
\`\`\`

### 2. Thêm Link Chat vào Navigation (Player)

**File**: `ezsport-web/src/components/shared/Navigation.tsx`

Thêm menu item:
\`\`\`tsx
<Nav.Link 
  href="/messages" 
  className="d-flex align-items-center gap-2"
>
  <span className="material-symbols-outlined">chat</span>
  Tin nhắn
</Nav.Link>
\`\`\`

### 3. Cập nhật Venue Model (Backend)

**File**: `ezsport-backend/src/models/venue.model.ts`

Đảm bảo có field `owner`:
\`\`\`typescript
owner: { 
  type: Schema.Types.ObjectId, 
  ref: "User", 
  required: true 
}
\`\`\`

### 4. Populate Owner trong Venue API

**File**: `ezsport-backend/src/controllers/venue.controller.ts`

Khi lấy venue detail, populate owner:
\`\`\`typescript
const venue = await Venue.findById(id)
  .populate('owner', 'fullName email avatar');
\`\`\`

---

## 🧪 Test Chat

### Bước 1: Tạo Conversation (Postman)

\`\`\`bash
POST http://localhost:5000/api/conversations
Headers:
  Authorization: Bearer <PLAYER_TOKEN>
Body:
{
  "otherUserId": "<OWNER_USER_ID>",
  "venueId": "<VENUE_ID>"
}
\`\`\`

### Bước 2: Gửi Tin Nhắn

\`\`\`bash
POST http://localhost:5000/api/conversations/message
Headers:
  Authorization: Bearer <PLAYER_TOKEN>
Body:
{
  "conversationId": "<CONVERSATION_ID>",
  "text": "Xin chào, sân còn trống không ạ?"
}
\`\`\`

### Bước 3: Xem Conversations

\`\`\`bash
GET http://localhost:5000/api/conversations
Headers:
  Authorization: Bearer <PLAYER_TOKEN>
\`\`\`

---

## 📊 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/conversations` | Lấy danh sách hội thoại |
| GET | `/api/conversations/:id` | Lấy chi tiết hội thoại |
| POST | `/api/conversations` | Tạo hội thoại mới |
| POST | `/api/conversations/message` | Gửi tin nhắn |
| PUT | `/api/conversations/:id/read` | Đánh dấu đã đọc |
| DELETE | `/api/conversations/:id` | Xóa hội thoại |

---

## 🎨 UI Features

### Owner Chat:
- ✅ Danh sách hội thoại với player
- ✅ Hiển thị avatar, tên, tin nhắn cuối
- ✅ Số tin nhắn chưa đọc
- ✅ Tìm kiếm hội thoại
- ✅ Gửi/nhận tin nhắn realtime
- ✅ Đánh dấu đã đọc tự động

### Player Chat:
- ✅ Danh sách hội thoại với owner
- ✅ Hiển thị tên venue liên quan
- ✅ Icon venue trên avatar
- ✅ Số tin nhắn chưa đọc
- ✅ Tìm kiếm hội thoại
- ✅ Gửi/nhận tin nhắn
- ✅ Đánh dấu đã đọc tự động

---

## 🚀 Cải Tiến Tương Lai

1. **WebSocket/Socket.io**: Realtime chat không cần refresh
2. **Typing indicator**: Hiển thị "đang nhập..."
3. **Read receipts**: Hiển thị "đã xem"
4. **File upload**: Gửi hình ảnh, file đính kèm
5. **Push notifications**: Thông báo tin nhắn mới
6. **Online status**: Hiển thị trạng thái online/offline
7. **Message reactions**: Emoji reactions
8. **Delete/Edit messages**: Xóa/sửa tin nhắn đã gửi

---

## 📝 Notes

- Chat hiện tại là **polling-based** (load khi vào trang)
- Để có realtime chat, cần implement **WebSocket**
- Owner chỉ chat với Player
- Player chỉ chat với Owner
- Mỗi conversation liên kết với 1 venue (optional)
- Tin nhắn được lưu vĩnh viễn trong database

---

## ❓ Troubleshooting

### Lỗi "Không tìm thấy người dùng"
- Kiểm tra `otherUserId` có đúng không
- Kiểm tra user có tồn tại trong database không

### Lỗi "Không có quyền truy cập"
- Kiểm tra token JWT có hợp lệ không
- Kiểm tra user có phải participant của conversation không

### Conversation không hiển thị
- Kiểm tra populate có hoạt động không
- Kiểm tra filter query có đúng không
- Check console log để xem API response

---

**Tác giả**: Kiro AI Assistant  
**Ngày tạo**: 2026-05-30  
**Version**: 1.0
