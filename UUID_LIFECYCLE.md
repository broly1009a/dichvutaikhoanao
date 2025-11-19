## UUID Lifecycle & Cleanup Strategy

### Vấn đề gốc
UUID không được giải phóng → Database phình ra → Memory leak

### Giải pháp triển khai (3 tầng)

---

## 1️⃣ Database Level: MongoDB TTL Index

**File:** `/lib/models/Webhook.ts`

```typescript
expiresAt: { 
  type: Date, 
  default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
}

// TTL Index: Auto-delete after 24h
WebhookSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

**Tác dụng:**
- ✅ MongoDB **tự động xóa** webhooks khi `expiresAt` pass
- ⚡ CPU-efficient (MongoDB background task)
- 🔍 Index cho fast queries

**Timeline:**
- 0h: User tạo QR → webhook stored với `expiresAt = now + 24h`
- 24h: MongoDB xóa tự động
- ∞: Database không phình ra

---

## 2️⃣ Application Level: Cleanup API

**File:** `/app/api/webhooks/cleanup/route.ts`

### Manual Cleanup (GET)
```bash
curl "http://localhost:3000/api/webhooks/cleanup"
```

**Khi dùng:**
- Debug/testing
- Manual intervention

### Automated Cleanup (POST)
```bash
# Gọi từ cron job mỗi 6 giờ
curl -X POST "http://localhost:3000/api/webhooks/cleanup" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Config Vercel (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/webhooks/cleanup",
    "schedule": "0 */6 * * *"
  }]
}
```

**Tác dụng:**
- Xóa expired webhooks (backup for TTL)
- Mark pending sessions > 24h as `expired`
- Logging stats

---

## 3️⃣ Session Level: Rate Limiting

**File:** `/app/api/webhooks/check-session-limit/route.ts`

### Check UUID Status
```bash
GET /api/webhooks/check-session-limit?uuid=xxx-xxx-xxx
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "status": "pending",
  "message": "Session already exists - you can continue paying"
}
```

**Tác dụng:**
- Phát hiện trùng lặp UUID
- Cho phép user tiếp tục quét QR cũ nếu web bị tắt

### Max Pending Sessions
```bash
GET /api/webhooks/check-session-limit?accountNumber=123
```

**Response:**
```json
{
  "success": true,
  "canCreate": true,
  "pendingCount": 2,
  "maxAllowed": 5,
  "message": "You can create a new session (2/5)"
}
```

**Limit:** 5 pending sessions/account/24h (prevent abuse)

---

## Webhook Schema Update

```typescript
// Before
{
  code, desc, success, data, createdAt, updatedAt
}

// After
{
  code, desc, success, data,
  status: 'pending' | 'completed' | 'expired',  // ← Track state
  expiresAt: Date,                               // ← TTL for cleanup
  createdAt, updatedAt
}
```

**Status Flow:**
```
1. pending    → Session tạo QR, đang chờ thanh toán
2. completed  → Webhook nhận từ PayOS, thanh toán thành công
3. expired    → Quá 24h, sẵn sàng xóa
```

---

## DepositModal Logic

```typescript
// Generate QR:
1. generateUUID() → newUuid
2. CHECK: /api/webhooks/check-session-limit?uuid=newUuid
   - Nếu exists → reuse (tắt web rồi quay lại)
   - Nếu không → tạo PayOS link mới
3. Generate PayOS QR
4. Start SSE listening với newUuid
5. Webhook từ PayOS → update DB + cache + SSE push → client
6. Webhook tự động delete sau 24h (TTL)
```

---

## Performance & Cleanup

| Phase | Time | Action | DB Impact |
|-------|------|--------|-----------|
| **Creation** | 0h | Generate UUID + PayOS link | +1 webhook (pending) |
| **Payment** | 0-10m | Webhook received → marked completed | Status changed |
| **Cache** | 0-15m | Cache stores result | Memory (~1KB) |
| **Expiry** | 24h | TTL triggers automatic delete | -1 webhook |
| **Cleanup** | 24h+ | Cron job removes expired | Safety net |

---

## API Endpoints Summary

### Checking Status
```
GET /api/webhooks?uuid=xxx
GET /api/webhooks/stream?uuid=xxx  (SSE)
GET /api/webhooks/check-session-limit?uuid=xxx
```

### Cleanup
```
GET /api/webhooks/cleanup  (Manual)
POST /api/webhooks/cleanup (Cron job)
```

### Monitoring
```
GET /api/webhooks?page=1&limit=10  (List all)
GET /api/webhooks/check-session-limit?accountNumber=123  (Account stats)
```

---

## Troubleshooting

### Q: Webhook vẫn trong DB sau 24h?
**A:** MongoDB TTL delay lên tới 60 giây. Run cleanup job:
```bash
GET /api/webhooks/cleanup
```

### Q: User muốn quét lại cùng QR sau tắt web?
**A:** UUID không thay đổi → tìm được webhook cũ → reuse session

### Q: Quá 5 pending sessions?
**A:** API block tạo mới, user phải đợi hoặc hoàn thành cái cũ

---

## Environment Variables

```env
# Optional: Cleanup API authentication
CLEANUP_API_KEY=your-secret-key

# Vercel Cron
CRON_SECRET=your-cron-secret
```
