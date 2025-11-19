import crypto from 'crypto';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderCode, amount, description, cancelUrl, returnUrl } = body;

    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;

    const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const signature = crypto.createHmac('sha256', checksumKey).update(rawData).digest('hex');

    const payosRes = await axios.post('https://api-merchant.payos.vn/v2/payment-requests', {
      orderCode, amount, description, cancelUrl, returnUrl, signature
    }, {
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey
      }
    });
    return new Response(JSON.stringify(payosRes.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, detail: err?.response?.data }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}