# DepositModal Component - Chỉ dùng PayOS

## Tổng quan
Component `DepositModal` đã được đơn giản hóa để chỉ hỗ trợ thanh toán qua PayOS với tích hợp webhook tự động.

## Tính năng chính

### ✅ Thanh toán chỉ qua PayOS
- **QR code tự động**: Tạo QR PayOS với orderCode duy nhất
- **Polling thông minh**: Kiểm tra webhook mỗi 3 giây sau khi tạo QR
- **Timeout an toàn**: Tự động dừng sau 10 phút
- **Tự động tạo đơn**: Gọi `onCreateInvoice` khi thanh toán thành công

### ✅ UI/UX đơn giản
- Giao diện tập trung vào PayOS
- Hiển thị QR code real-time
- Trạng thái thanh toán trực quan
- Auto-close khi thành công

## Cách sử dụng

### 1. Import component
```tsx
import { DepositModal } from '@/components/DepositModal';
```

### 2. Sử dụng trong component parent
```tsx
const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

const handleCreateInvoice = (amount: number) => {
  // Logic tạo invoice sau khi thanh toán thành công
  console.log('Tạo invoice với số tiền:', amount);
  // Gọi API tạo invoice...
};

return (
  <DepositModal
    isOpen={isDepositModalOpen}
    onClose={() => setIsDepositModalOpen(false)}
    onCreateInvoice={handleCreateInvoice}
  />
);
```

## API Endpoints được sử dụng

### GET /api/webhooks
- **PayOS**: `?orderCode={orderCode}`

### POST /api/payos-link
```json
{
  "orderCode": 123456,
  "amount": 100000,
  "description": "nap tien abc123",
  "cancelUrl": "...",
  "returnUrl": "..."
}
```

## Flow hoạt động

1. **User nhập số tiền** → Tạo orderCode duy nhất
2. **Tạo QR code PayOS** → Gọi API PayOS
3. **Bắt đầu polling** → Kiểm tra webhook mỗi 3 giây
4. **Nhận webhook** → API trả về `data: "done"`
5. **Tạo invoice** → Gọi `onCreateInvoice(amount)`
6. **Auto close** → Modal tự động đóng sau 2 giây

## Cấu hình cần thiết

### PayOS
- Đảm bảo API `/api/payos-link` hoạt động
- Cấu hình `cancelUrl` và `returnUrl` phù hợp
- OrderCode được tạo tự động với timestamp

## Xử lý lỗi

### Timeout (10 phút)
- Tự động dừng polling
- Hiển thị thông báo "Hết thời gian chờ thanh toán"

### Lỗi mạng
- Log lỗi ra console
- Tiếp tục polling (không dừng)

### Webhook lỗi
- Kiểm tra response format
- Chỉ xử lý khi `result.success && result.data === "done"`

## Performance

- **Minimal requests**: Chỉ query webhook khi cần thiết
- **Smart polling**: 3 giây interval, không quá tải server
- **Auto cleanup**: Xóa timers khi component unmount
- **Memory safe**: Sử dụng useRef cho timers

## Bảo mật

- UUID ngẫu nhiên cho mỗi giao dịch
- Content được sanitize (max 25 chars cho PayOS)
- Không expose sensitive data trong frontend

## Troubleshooting

### QR không hiển thị
- Check console logs
- Verify API endpoints
- Check network connectivity

### Webhook không được nhận
- Verify webhook data structure
- Check MongoDB connection
- Test API manually

### Polling không dừng
- Check component cleanup
- Verify success conditions
- Check for JavaScript errors