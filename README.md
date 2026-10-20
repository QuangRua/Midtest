# BIT240031_FoodManager
## ĐỀ KIỂM TRA GIỮA KỲ - MÔN: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
**Đề tài:** Quản lý món ăn  
**Mã số sinh viên (MSSV):** `BIT240031`  
**Công nghệ:** React Native (Expo SDK 58, React 19) + REST API qua MockAPI + AsyncStorage (Lưu trữ cục bộ & Đồng bộ Offline)

---

## 1. Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

Thư mục dự án: `C:\Users\Admin\.gemini\antigravity\scratch\BIT240031_FoodManager`

### Bước 1: Mở thư mục dự án
```bash
cd C:\Users\Admin\.gemini\antigravity\scratch\BIT240031_FoodManager
```

### Bước 2: Chạy ứng dụng

#### Cách 1: Chạy trực tiếp trên Trình duyệt Web (Nhanh nhất & thuận tiện demo)
```bash
npm run web
```
Ứng dụng sẽ tự động mở trên trình duyệt tại `http://localhost:8081`.

#### Cách 2: Chạy trên điện thoại thật qua Expo Go (Android / iOS)
```bash
npm start
```
- Mở app **Expo Go** trên điện thoại.
- Quét mã QR hiển thị trên Terminal để trải nghiệm trực tiếp trên máy thật.

#### Cách 3: Chạy trên Android Emulator
```bash
npm run android
```

---

## 2. Cấu Trúc Dữ Liệu & Quy Định Tiền Tố {MSSV}_

Tuân thủ nghiêm ngặt quy định: **Tên bảng và tất cả các trường dữ liệu bắt buộc có tiền tố `BIT240031_` ở đầu**.

### Bảng 1: `BIT240031_DishCategory`
| Trường dữ liệu | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `BIT240031_Id` | String | Mã loại món (Khóa chính) |
| `BIT240031_Name` | String | Tên loại món (Bắt buộc, không trùng) |
| `BIT240031_Description` | String | Mô tả loại món |

### Bảng 2: `BIT240031_Dish`
| Trường dữ liệu | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `BIT240031_Id` | String | Mã món ăn (Khóa chính) |
| `BIT240031_Name` | String | Tên món ăn (Bắt buộc, không trùng trong cùng loại) |
| `BIT240031_Price` | Number | Giá bán (Bắt buộc > 0) |
| `BIT240031_PreparationTime`| Number | Thời gian chế biến (phút, Bắt buộc > 0) |
| `BIT240031_IsAvailable` | Boolean | Trạng thái (true: Đang bán, false: Ngừng bán) |
| `BIT240031_Description` | String | Mô tả món ăn |
| `BIT240031_DishCategoryId` | String | Mã loại món tham chiếu |
| `BIT240031_DishImage` | Array | Mảng hình ảnh: `[{ BIT240031_ImageUrl, BIT240031_IsThumbnail }]` |

> **Dữ liệu mẫu ban đầu:** Ứng dụng đã khởi tạo sẵn **3 loại món ăn** và **5 món ăn** phong phú với đầy đủ hình ảnh, giá bán, thời gian chế biến nhanh/chậm.

---

## 3. Cấu Hình MockAPI REST API

- **Endpoint mặc định:** `https://6759c5d1099e3090dbe28ef4.mockapi.io/api/v1`
- Người dùng / Giảng viên có thể cấu hình hoặc kiểm tra kết nối với MockAPI bất kỳ lúc nào tại màn hình **Settings (Cài đặt)** -> Mục **MockAPI REST API Endpoint** -> Nhấn **Kiểm tra kết nối (Test Connection)** và **Lưu (Save)**.
- 2 Endpoint tương ứng trên MockAPI:
  + `GET/POST/PUT/DELETE` `https://{project_id}.mockapi.io/api/v1/BIT240031_DishCategory`
  + `GET/POST/PUT/DELETE` `https://{project_id}.mockapi.io/api/v1/BIT240031_Dish`

---

## 4. Chi Tiết Thực Hiện Các Yêu Cầu Chức Năng (6.0 / 6.0 Điểm)

### 4.1. Giao diện và quản lý món ăn (1.0 điểm)
- Màn hình **Danh sách món ăn** (`DishListScreen`): Hiển thị danh sách thẻ món ăn với ảnh đại diện, tên, loại món, giá bán, huy hiệu thời gian chế biến, trạng thái bán.
- Màn hình **Chi tiết món ăn** (`DishDetailScreen`): Xem chi tiết món, bộ sưu tập ảnh, đổi ảnh đại diện trực tiếp, nút sửa món và xóa món.
- Màn hình **Thêm món ăn** (`DishFormScreen`): Form nhập liệu có dropdown chọn loại món từ CSDL, quản lý ảnh bằng URL.
- Màn hình **Chỉnh sửa món ăn**: Tự động load dữ liệu cũ lên form, lưu và cập nhật ngay lập tức.
- Thao tác xóa món có **Modal xác nhận** cảnh báo nguy hiểm (`ConfirmModal`).
- Quản lý loại món ăn riêng biệt tại màn hình `CategoryScreen`.

### 4.2. Danh sách, tìm kiếm và sắp xếp (1.0 điểm)
- **Tìm kiếm:** Tìm theo một phần tên món (Real-time case-insensitive).
- **Lọc đồng thời:**
  + Lọc theo Loại món (`All` hoặc từng loại món cụ thể).
  + Lọc theo Trạng thái (`All Statuses` hoặc `Available Only` - Đang bán).
  + Lọc theo Khoảng giá (`Min Price` - `Max Price`).
  + Các điều kiện có thể kết hợp đồng thời (phối hợp tìm tên + chọn loại + khoảng giá + trạng thái).
- **Sắp xếp:**
  + Giá: Tăng dần (`Price: Low to High`).
  + Giá: Giảm dần (`Price: High to Low`).
  + Thời gian chế biến: Tăng dần (`Prep Time: Shortest first`).
  + Mặc định (`Default / Recent`).
- **Giữ trạng thái lọc:** Lưu vào Context và AsyncStorage. Khi chuyển sang màn hình Chi tiết / Sửa / Thêm rồi quay lại Danh sách, toàn bộ điều kiện tìm kiếm, lọc và sắp xếp vẫn được **giữ nguyên 100%**.

### 4.3. Quản lý ảnh và thời gian chế biến (1.0 điểm)
- **Quản lý ảnh bằng ImageUrl:** Nhập URL ảnh và nhấn Thêm; hiển thị danh sách ảnh xem trước; mỗi món cho phép chọn ảnh đại diện (`IsThumbnail = true`), đảm bảo mỗi món **chỉ có tối đa 01 ảnh thumbnail**.
- **Hiển thị nhiều ảnh:** Màn hình chi tiết hiển thị ảnh to nổi bật và thanh trượt chọn các ảnh phụ; có nút "Chọn làm ảnh đại diện" nhanh.
- **Phân loại thời gian chế biến:**
  + Nếu `PreparationTime <= 15 phút`: Hiển thị huy hiệu **"Quick / Nhanh"** (màu xanh lá, biểu tượng tia chớp ⚡).
  + Nếu `PreparationTime > 15 phút`: Hiển thị huy hiệu **"Regular / Thông thường"** (màu xanh dương, biểu tượng đồng hồ ⏱️).
  + Tính toán tự động theo logic, không cần lưu thêm thuộc tính thừa trong CSDL.

### 4.4. Ràng buộc và xử lý lỗi (1.0 điểm)
- **Ràng buộc loại món:** Không cho phép xóa loại món đang có món ăn sử dụng (hiển thị thông báo lỗi rõ ràng).
- **Món ngừng bán:** Vẫn xuất hiện trong danh sách quản lý đầy đủ, nhưng khi chọn lọc "Available Only / Chỉ món đang bán" thì sẽ được ẩn đi.
- **Kiểm tra dữ liệu (Validation):**
  + Tên món không được để trống.
  + Giá bán phải là số > 0.
  + Thời gian chế biến phải là số > 0.
  + Loại món phải hợp lệ.
  + **Tên món không được trùng** trong cùng một loại món ăn.
  + Khoảng giá lọc: Giá Min không được lớn hơn Giá Max.
- **Xử lý ngoại lệ:** Khi Id không tồn tại, khi danh sách/ảnh trống, khi mất kết nối MockAPI (chuyển sang lưu offline an toàn).

### 4.5. Giao diện đa ngôn ngữ (0.5 điểm)
- Ngôn ngữ mặc định: **Tiếng Anh (English)**.
- Cho phép chuyển đổi nhanh chóng giữa **English 🇬🇧 <-> Tiếng Việt 🇻🇳** thông qua nút bấm trên thanh Header.
- Áp dụng đầy đủ cho tất cả màn hình: Danh sách, Thêm, Sửa, Chi tiết, Cài đặt, Quản lý loại món, nhãn, nút bấm, thông báo xác nhận và thông báo lỗi validation.
- Lưu trữ lựa chọn ngôn ngữ vào `AsyncStorage`, duy trì ngay cả khi tắt mở lại ứng dụng.

---

## 5. Yêu Cầu Nâng Cao: Hoạt Động Offline & Tự Động Đồng Bộ (1.5 điểm)

### Cơ chế hoạt động:
1. **Khi không có kết nối Internet (hoặc bật công tắc "Simulate Offline Mode" trong Settings):**
   - Ứng dụng hiển thị Banner cảnh báo màu đỏ: *"Offline Mode: Changes will auto-sync when online"*.
   - Người dùng vẫn thực hiện **Tạo mới (Create)**, **Chỉnh sửa (Edit)** hoặc **Xóa (Delete)** món ăn bình thường.
   - Món mới được tạo với ID tạm thời `temp_...` và hiển thị ngay lập tức trên giao diện.
   - Thao tác được lưu vào bộ nhớ cục bộ `AsyncStorage` và hàng đợi đồng bộ `@BIT240031_SyncQueue`.
2. **Khi có Internet trở lại (hoặc tắt "Simulate Offline Mode"):**
   - Bộ lắng nghe mạng tự động phát hiện kết nối trực tuyến.
   - Hệ thống **tự động kích hoạt đồng bộ (Auto Sync)** các tác vụ trong hàng đợi lên MockAPI qua REST API mà **không cần người dùng phải bấm nút nào**.
   - MockAPI phản hồi ID thực tế, hệ thống tự động cập nhật lại ID thực tế vào bộ nhớ local thay thế cho ID tạm thời.
   - Đảm bảo tính nhất quán dữ liệu, **không phát sinh bản ghi trùng lặp**.

---

## 6. Kịch Bản Demo Quay Video Chấm Điểm

1. **Giới thiệu:** Mở ứng dụng, chỉ rõ MSSV `BIT240031` xuất hiện nổi bật trên thanh Header và màn hình Cài đặt.
2. **Đa ngôn ngữ:** Bấm nút chuyển ngôn ngữ `EN -> VI` và ngược lại để thấy toàn bộ giao diện chuyển đổi mượt mà.
3. **Danh sách & Bộ lọc:**
   - Tìm kiếm món theo từ khóa (ví dụ gõ "bò" hoặc "phở").
   - Lọc theo loại món Khai vị / Món chính.
   - Lọc theo trạng thái Đang bán (món ngừng bán sẽ ẩn đi).
   - Lọc theo khoảng giá.
   - Sắp xếp giá tăng dần / thời gian chế biến.
   - Bấm vào chi tiết một món, quay lại danh sách để chứng minh điều kiện lọc vẫn được giữ nguyên.
4. **Chi tiết & Ảnh đại diện:**
   - Mở món có nhiều ảnh, duyệt qua các ảnh.
   - Nhấn "Chọn làm ảnh đại diện" để đổi thumbnail.
5. **Thêm / Sửa / Xóa:**
   - Thêm một món mới, kiểm tra validation (để trống tên, giá = 0, trùng tên cùng loại).
   - Xóa một món ăn với modal xác nhận.
6. **Kiểm tra ràng buộc loại món:**
   - Vào "Quản lý loại món", thử xóa loại đang có món ăn -> Hiện thông báo chặn.
7. **Demo Offline & Tự Động Đồng Bộ (1.5 điểm):**
   - Vào Cài đặt, bật switch **"Simulate Offline Mode"** (hoặc tắt Wifi máy).
   - Quay lại thêm 1 món ăn mới (ví dụ "Bún Bò Huế Offline") hoặc sửa giá 1 món. Thấy món cập nhật ngay trên máy và hiện `1 pending changes to sync`.
   - Vào Cài đặt, tắt **"Simulate Offline Mode"** (hoặc bật lại Wifi).
   - Quan sát ứng dụng **tự động đồng bộ** lên MockAPI mà không cần bấm nút; sau khi đồng bộ số hàng đợi về 0 và dữ liệu hiển thị hoàn toàn nhất quán!
