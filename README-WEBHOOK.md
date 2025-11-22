# PayOS Webhook Integration

## Overview
API để tích hợp webhook từ PayOS cho việc xử lý thanh toán.

## Endpoints

### POST /api/webhooks
Nhận webhook từ PayOS khi có giao dịch thanh toán.

**Request Body:**
```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {
    "accountNumber": "0888290899999",
    "amount": 2000,
    "description": "nap tien c70f9975f8764f8db",
    "reference": "FT25321824039739",
    "transactionDateTime": "2025-11-16 16:56:40",
    "virtualAccountNumber": "",
    "counterAccountBankId": "01202001",
    "counterAccountBankName": "",
    "counterAccountName": "TRUONG HOANG HIEP",
    "counterAccountNumber": "4270797658",
    "virtualAccountName": "",
    "currency": "VND",
    "orderCode": 760207,
    "paymentLinkId": "9a8c543a2b074ac09e077bf28e4734cf",
    "code": "00",
    "desc": "success",
    "signature": "fb983c5631e4696a2a73bf740f547e839428002e4f517bbd002afc9f45ec8af2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received successfully",
  "data": { /* webhook document */ }
}
```

### GET /api/webhooks
Lấy danh sách webhooks hoặc kiểm tra giao dịch cụ thể.

**Query Parameters:**
- `description`: Mô tả giao dịch (sử dụng regex) - *cho VietQR*
- `amount`: Số tiền giao dịch - *cho VietQR*
- `orderCode`: Mã đơn hàng PayOS - *cho PayOS*
- `page`: Số trang (mặc định: 1) - *cho danh sách*
- `limit`: Số lượng item mỗi trang (mặc định: 10, tối đa: 100) - *cho danh sách*

**Examples:**

1. **Check giao dịch VietQR:**
```
GET /api/webhooks?description=nap tien c70f9975f8764f8db&amount=2000
```

2. **Check giao dịch PayOS:**
```
GET /api/webhooks?orderCode=760207
```

3. **Lấy danh sách webhooks:**
```
GET /api/webhooks?page=1&limit=20
```

**Response cho việc check giao dịch:**
```json
{
  "success": true,
  "data": "done", // hoặc "none" nếu không tìm thấy
  "webhooks": [ /* array of matching webhooks, max 5 items */ ]
}
```

**Response cho danh sách:**
```json
{
  "success": true,
  "data": [ /* array of webhooks */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Cách sử dụng

### 1. Nhận Webhook từ PayOS
PayOS sẽ gửi POST request đến `/api/webhooks` khi có giao dịch.

### 2. Kiểm tra giao dịch

#### VietQR:
```javascript
const checkVietQRPayment = async (uuid, amount) => {
  const description = `nap tien ${uuid}`;
  const response = await fetch(`/api/webhooks?description=${encodeURIComponent(description)}&amount=${amount}`);
  const result = await response.json();

  if (result.success && result.data === "done") {
    console.log("Thanh toán VietQR thành công!");
    return result.webhooks[0]; // Lấy webhook đầu tiên
  } else {
    console.log("Chưa nhận được thanh toán VietQR");
    return null;
  }
};
```

#### PayOS:
```javascript
const checkPayOSPayment = async (orderCode) => {
  const response = await fetch(`/api/webhooks?orderCode=${orderCode}`);
  const result = await response.json();

  if (result.success && result.data === "done") {
    console.log("Thanh toán PayOS thành công!");
    return result.webhooks[0];
  } else {
    console.log("Chưa nhận được thanh toán PayOS");
    return null;
  }
};
```

### 3. Lấy danh sách webhooks với phân trang
```javascript
const getWebhooks = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/webhooks?page=${page}&limit=${limit}`);
  const result = await response.json();

  if (result.success) {
    console.log(`Trang ${result.pagination.page}/${result.pagination.pages}`);
    console.log(`Tổng cộng: ${result.pagination.total} webhooks`);
    return result.data;
  }
};
```

## Lưu ý
- API tự động kiểm tra trùng lặp dựa trên `reference` và `amount`
- Sử dụng regex case-insensitive cho description khi tìm kiếm
- **Check giao dịch:** Tối đa 5 kết quả trùng khớp (để xử lý trường hợp trùng lặp)
- **Danh sách:** Hỗ trợ phân trang, tối đa 100 items/trang
- Sắp xếp theo thời gian tạo (mới nhất trước)