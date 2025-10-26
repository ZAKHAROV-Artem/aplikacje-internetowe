// Sends analytics events to Google Tag Manager when configured.
// Minimal emitter: fires a GET beacon to the GTM loader with container ID and basic event params.

import fetch from "node-fetch";

function resolveEventName(evt: any): string {
  if (evt?.type === "CREATE_PICKUP_REQUEST") return "Pickup Requested";
  return String(evt?.type || "event");
}

class GtmDispatcher {
  async send(
    evt: any,
    context: { gtm?: { containerId: string } }
  ): Promise<void> {
    const gtm = context.gtm;
    if (!gtm || !gtm.containerId) return;

    const phone = (evt?.payload && (evt.payload as any).phone) as
      | string
      | undefined;
    if (!phone) return; // rely on upstream check for phone presence

    const eventName = resolveEventName(evt);

    const params = new URLSearchParams({
      id: gtm.containerId,
      ev: eventName,
      uid: phone,
    });

    const url = `https://www.googletagmanager.com/gtm.js?${params.toString()}`;

    try {
      const resp = await fetch(url, { method: "GET" });
      if (!resp.ok) {
        // Swallow error to avoid blocking other adapters
        console.warn(`GTM dispatch failed: ${resp.status} ${resp.statusText}`);
      }
    } catch (err) {
      console.warn(`GTM dispatch error: ${String(err)}`);
    }
  }
}

const gtmDispatcher = new GtmDispatcher();

export { gtmDispatcher };
