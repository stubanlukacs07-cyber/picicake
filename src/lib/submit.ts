import { ENDPOINTS } from '../data/config';

export type SubmitState = 'idle' | 'sending' | 'done' | 'error';

export type SubmitResult = { ok: boolean; simulated: boolean; checkoutUrl?: string };

/**
 * Elküldi a payloadot a megadott webhookra (GHL / Make).
 * Ha az endpoint nincs beállítva, nem hibázik: a payload a konzolba kerül,
 * hogy a felület integráció nélkül is végigtesztelhető legyen.
 */
export async function submit(kind: keyof typeof ENDPOINTS, payload: Record<string, unknown>): Promise<SubmitResult> {
  const url = ENDPOINTS[kind];
  const body = { ...payload, kind, submittedAt: new Date().toISOString(), source: 'picicake.hu' };

  if (!url) {
    console.info(`[PiciCake] "${kind}" webhook nincs beállítva. Payload:`, body);
    await new Promise((r) => setTimeout(r, 450));
    return { ok: true, simulated: true } as SubmitResult;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Webhook hiba: ${res.status}`);

  /* Ha a backend Stripe Checkout linket ad vissza, azt átadjuk a hívónak. */
  let checkoutUrl: string | undefined;
  try {
    const data = (await res.clone().json()) as { checkoutUrl?: string; url?: string };
    checkoutUrl = data.checkoutUrl ?? data.url;
  } catch {
    /* a webhook üres vagy nem JSON választ adott — ez rendben van */
  }

  return { ok: true, simulated: false, checkoutUrl };
}
