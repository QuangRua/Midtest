# BIT240031_FoodManager
## ĐỀ KIỂM TRA GIỮA KỲ - MÔN: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
**Đề tài:** Quản lý món ăn  
**Mã số sinh viên (MSSV):** `BIT240031`  
**Công nghệ:** React Native (Expo SDK 58, React 19) + REST API qua MockAPI + AsyncStorage (Lưu trữ cục bộ & Đồng bộ Offline)

---

## 1. Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh


### Bước 1: Mở thư mục dự án
```bash
Git clone https://github.com/QuangRua/Midtest.git
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

---

## 3. Cấu Hình MockAPI REST API

- **MockAPI Base URL:** `https://6ad7470795e98f36aef23112.mockapi.io/api/v1`
- 2 Endpoint tương ứng trên MockAPI:
  + `GET/POST/PUT/DELETE` `https://6ad7470795e98f36aef23112.mockapi.io/api/v1/BIT240031_DishCategory`
  + `GET/POST/PUT/DELETE` `https://6ad7470795e98f36aef23112.mockapi.io/api/v1/BIT240031_Dish`
