# Module đặt lịch với huấn luyện viên

## 1. Mục tiêu và phạm vi MVP

Cho phép người chơi tìm huấn luyện viên (HLV), xem hồ sơ và lịch trống, gửi yêu cầu đặt buổi tập, thanh toán, và theo dõi lịch hẹn. HLV quản lý hồ sơ/lịch rảnh và xác nhận hoặc từ chối yêu cầu. Admin kiểm duyệt hồ sơ HLV.

Module này **không phụ thuộc vào đặt sân** ở MVP: một lịch hẹn có thể chưa gắn với sân. Việc liên kết sân/đặt sân cùng buổi tập là hạng mục mở rộng.

### Vai trò

| Vai trò | Trách nhiệm |
| --- | --- |
| Player | Tìm, đặt, thanh toán, hủy và đánh giá buổi tập. |
| Coach | Tạo hồ sơ, khai báo lịch rảnh, xử lý yêu cầu và hoàn tất buổi tập. |
| Admin | Kiểm duyệt HLV và xử lý các trường hợp cần can thiệp. |

### Trạng thái đề xuất

`PENDING_PAYMENT` → `PENDING_COACH_CONFIRMATION` → `CONFIRMED` → `COMPLETED`.

Các nhánh kết thúc: `REJECTED`, `CANCELLED_BY_PLAYER`, `CANCELLED_BY_COACH`, `EXPIRED`, `NO_SHOW`.

> Khi thanh toán thất bại hoặc quá hạn, lịch ở `PENDING_PAYMENT` chuyển sang `EXPIRED` và slot được mở lại. Trường `paymentStatus` tách riêng: `UNPAID`, `PAID`, `REFUNDED`, `FAILED`.

## 2. User stories ưu tiên MVP

### Epic A — Khám phá và lựa chọn HLV

#### US-01 — Xem danh sách HLV

**Là một Player, tôi muốn** xem danh sách HLV đang hoạt động **để** chọn người phù hợp.

**Tiêu chí nghiệm thu**

- Chỉ hiển thị HLV đã được Admin phê duyệt và đang mở nhận lịch.
- Mỗi thẻ HLV có ảnh đại diện, tên, môn thể thao, chuyên môn, khu vực/dạy online, giá từ mỗi giờ, đánh giá trung bình và số lượt đánh giá.
- Có trạng thái tải, trống và lỗi rõ ràng.

#### US-02 — Tìm kiếm và lọc HLV

**Là một Player, tôi muốn** tìm/lọc HLV theo môn thể thao, khu vực hoặc hình thức dạy **để** rút ngắn thời gian lựa chọn.

**Tiêu chí nghiệm thu**

- Có tìm theo tên hoặc từ khóa chuyên môn.
- Có bộ lọc: môn thể thao, hình thức `online`/`offline`, khu vực và khoảng giá.
- Các bộ lọc có thể xóa và kết quả phản ánh đúng điều kiện đang chọn.

#### US-03 — Xem hồ sơ HLV

**Là một Player, tôi muốn** xem hồ sơ chi tiết của HLV **để** quyết định có đặt lịch hay không.

**Tiêu chí nghiệm thu**

- Hiển thị giới thiệu, chuyên môn, kinh nghiệm/chứng chỉ, môn thể thao, hình thức dạy, khu vực, giá, thời lượng hỗ trợ và đánh giá.
- Hiển thị lịch trống gần nhất theo múi giờ `Asia/Ho_Chi_Minh`.
- Chỉ HLV ở trạng thái được phê duyệt mới có trang công khai.

### Epic B — Đặt và thanh toán buổi tập

#### US-04 — Chọn slot và gửi yêu cầu đặt lịch

**Là một Player, tôi muốn** chọn ngày, giờ và thời lượng còn trống **để** gửi yêu cầu đặt buổi tập với HLV.

**Tiêu chí nghiệm thu**

- Người chơi chỉ chọn được slot trong lịch khả dụng, ở thời điểm tương lai và phù hợp thời lượng HLV cung cấp.
- Màn hình xác nhận thể hiện HLV, thời gian bắt đầu/kết thúc, hình thức, địa điểm/link online (nếu đã có), đơn giá, phí, giảm giá và tổng tiền.
- Hệ thống kiểm tra xung đột lại ở server trước khi tạo lịch; không tạo hai lịch trùng cùng slot của một HLV.
- Có thể thêm ghi chú/mục tiêu tập luyện; thông tin này chỉ Player, Coach và Admin liên quan được xem.

#### US-05 — Thanh toán lịch tập

**Là một Player, tôi muốn** thanh toán lịch tập trực tuyến **để** hoàn tất yêu cầu đặt lịch.

**Tiêu chí nghiệm thu**

- Tích hợp theo phương thức thanh toán hiện có của dự án (PayOS); tổng tiền ở server là nguồn dữ liệu tin cậy.
- Callback/webhook hợp lệ cập nhật `paymentStatus` thành `PAID`, rồi lịch thành `PENDING_COACH_CONFIRMATION`.
- Thanh toán không thành công hoặc quá hạn không xác nhận lịch và giải phóng slot.
- Không xử lý callback trùng lặp thành nhiều lần thanh toán/xác nhận.

#### US-06 — HLV xác nhận hoặc từ chối yêu cầu

**Là một Coach, tôi muốn** xác nhận hoặc từ chối yêu cầu đã thanh toán **để** quản lý lịch dạy của mình.

**Tiêu chí nghiệm thu**

- Coach chỉ thấy yêu cầu thuộc hồ sơ của mình và đang `PENDING_COACH_CONFIRMATION`.
- Xác nhận chuyển lịch sang `CONFIRMED`; từ chối yêu cầu nhập lý do và chuyển sang `REJECTED`.
- Khi từ chối, hệ thống tạo yêu cầu hoàn tiền theo chính sách đã định và thông báo Player.
- Hai thao tác không thể làm thay đổi lịch đã hủy, hết hạn hoặc được xử lý trước đó.

### Epic C — Quản lý lịch hẹn

#### US-07 — Player xem và hủy lịch

**Là một Player, tôi muốn** xem danh sách/chi tiết và hủy lịch tập của mình **để** chủ động điều chỉnh kế hoạch.

**Tiêu chí nghiệm thu**

- Có các nhóm lịch sắp tới, đã hoàn thành và đã hủy; chỉ hiển thị lịch của tài khoản đăng nhập.
- Chi tiết lịch hiển thị đầy đủ trạng thái, thanh toán, thông tin HLV, thời gian, hình thức và chính sách hủy áp dụng.
- Chỉ hủy được lịch trước thời hạn cấu hình; lịch cập nhật `CANCELLED_BY_PLAYER`, slot được mở lại và hoàn tiền xử lý theo chính sách.

#### US-08 — Coach quản lý lịch dạy

**Là một Coach, tôi muốn** xem lịch dạy và đánh dấu hoàn thành **để** theo dõi các buổi tập.

**Tiêu chí nghiệm thu**

- Coach chỉ xem và thao tác trên lịch của chính mình.
- Có lịch theo ngày/tuần, phân biệt yêu cầu chờ xử lý, đã xác nhận và lịch đã kết thúc.
- Coach chỉ đánh dấu `COMPLETED` sau giờ kết thúc của buổi tập; hành động được lưu thời điểm thực hiện.

#### US-09 — Coach quản lý lịch rảnh

**Là một Coach, tôi muốn** khai báo và cập nhật lịch rảnh **để** Player chỉ đặt được các khung giờ tôi có thể dạy.

**Tiêu chí nghiệm thu**

- Coach tạo được khung lặp theo thứ trong tuần và các ngoại lệ theo ngày (nghỉ/bận/mở thêm).
- Không cho xóa hoặc chỉnh sửa lịch rảnh làm mất thời gian của lịch `CONFIRMED`.
- Khi tắt nhận lịch, các slot tương lai không còn xuất hiện để đặt mới, nhưng lịch đã xác nhận vẫn giữ nguyên.

### Epic D — Hồ sơ và quản trị HLV

#### US-10 — Coach tạo/cập nhật hồ sơ

**Là một Coach, tôi muốn** tạo và cập nhật hồ sơ chuyên môn **để** được hiển thị cho Player sau khi duyệt.

**Tiêu chí nghiệm thu**

- Bắt buộc: tên hiển thị, ít nhất một môn thể thao/chuyên môn, hình thức dạy, đơn giá, thời lượng và khu vực nếu dạy offline.
- Hỗ trợ giới thiệu, kinh nghiệm, chứng chỉ, ảnh đại diện và mức giá theo thời lượng.
- Thay đổi quan trọng sau khi đã duyệt sẽ đưa hồ sơ về `PENDING_REVIEW` (quy tắc cụ thể do Admin cấu hình).

#### US-11 — Admin kiểm duyệt Coach

**Là một Admin, tôi muốn** duyệt hoặc từ chối hồ sơ Coach **để** đảm bảo chất lượng HLV công khai.

**Tiêu chí nghiệm thu**

- Admin xem được các hồ sơ `PENDING_REVIEW`, thông tin và tài liệu chứng minh (nếu có).
- Có thao tác `APPROVED`, `REJECTED`, `SUSPENDED`; từ chối/tạm ngưng bắt buộc có lý do.
- Chỉ `APPROVED` và đang nhận lịch được xuất hiện trong tìm kiếm/cho đặt lịch.
- Mọi quyết định lưu người thực hiện, thời điểm và lý do.

## 3. Hạng mục sau MVP

- US-12: Player đánh giá HLV sau khi lịch `COMPLETED`; mỗi lịch chỉ đánh giá một lần.
- US-13: Thông báo trong ứng dụng/email cho thanh toán, xác nhận, từ chối, hủy và nhắc lịch.
- US-14: Đặt sân kèm buổi tập, kiểm tra song song slot sân và HLV.
- US-15: Gói buổi tập, mã giảm giá, hoa hồng/nền tảng và đối soát thu nhập Coach.
- US-16: Chat Player–Coach, chỉ mở khi có lịch hợp lệ.

## 4. Quy tắc nghiệp vụ cần chốt trước khi code

1. HLV là `role` người dùng mới (`coach`) hay là `player` có `CoachProfile`? Đề xuất: thêm role `coach` và tách `CoachProfile` để quản lý dữ liệu chuyên môn.
2. Chính sách hủy/hoàn tiền: mốc thời gian, tỷ lệ hoàn và người có quyền quyết định ngoại lệ.
3. Cách xác nhận: Coach xác nhận thủ công (đề xuất MVP) hay xác nhận tức thì theo lịch rảnh.
4. Mô hình giá: chỉ giá theo giờ (đề xuất MVP) hay gói/giá theo số người.
5. Offline: Player tự thỏa thuận địa điểm hay bắt buộc liên kết với sân trên EZSport.
6. Hình thức thông báo ban đầu: in-app, email, hay cả hai.

## 5. Định nghĩa hoàn thành cho một user story

- API có xác thực, phân quyền và kiểm tra dữ liệu đầu vào ở server.
- Giao diện có trạng thái tải/rỗng/lỗi và không chỉ dựa vào kiểm tra phía client.
- Quy tắc chuyển trạng thái, xung đột slot và giá tiền có kiểm thử.
- Các thao tác thay đổi trạng thái quan trọng lưu lịch sử/audit tối thiểu.
- Luồng chính được kiểm thử thủ công end-to-end với tài khoản Player, Coach và Admin.
