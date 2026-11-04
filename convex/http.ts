import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { safeEqual } from './throttle';

const http = httpRouter();

async function hmacSha512Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Paystack calls this when a payment succeeds, even if the customer closed the tab.
 * Only requests signed with our secret key are accepted.
 * Set this address in the Paystack dashboard (Settings > API Keys & Webhooks):
 *   <your Convex site URL>/paystack/webhook
 */
http.route({
  path: '/paystack/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return new Response('Not configured', { status: 503 });

    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') ?? '';
    if (!safeEqual(signature, await hmacSha512Hex(secret, body))) {
      return new Response('Invalid signature', { status: 401 });
    }

    let event: { event?: string; data?: { reference?: string; status?: string; amount?: number; currency?: string; channel?: string } };
    try {
      event = JSON.parse(body);
    } catch {
      return new Response('Bad request', { status: 400 });
    }

    if (event.event === 'charge.success' && event.data?.reference) {
      await ctx.runMutation(internal.paystack.applyVerification, {
        reference: event.data.reference,
        status: String(event.data.status ?? ''),
        amount: Number(event.data.amount ?? 0),
        currency: String(event.data.currency ?? ''),
        channel: event.data.channel ? String(event.data.channel) : undefined,
      });
    }
    return new Response('ok', { status: 200 });
  }),
});

export default http;
