// ─────────────────────────────────────────────────────────────
//  Email notification service (EmailJS).
//
//  Sends the store owner an email whenever a new order is placed.
//  Until you add real EmailJS keys to .env, this runs in STUB mode:
//  it logs the exact payload it *would* send to the console and resolves
//  successfully, so the checkout flow works end-to-end during development.
//
//  EmailJS setup: see README → "EmailJS setup".
// ─────────────────────────────────────────────────────────────

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const OWNER_EMAIL = import.meta.env.VITE_STORE_OWNER_EMAIL || 'owner@example.com'

const isConfigured =
  SERVICE_ID &&
  TEMPLATE_ID &&
  PUBLIC_KEY &&
  !SERVICE_ID.startsWith('your_') &&
  !TEMPLATE_ID.startsWith('your_')

function buildParams(order) {
  const itemsText = order.items
    .map(
      (i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`
    )
    .join('\n')

  return {
    to_email: OWNER_EMAIL,
    order_ref: order.orderRef,
    customer_name: order.customerName,
    customer_email: order.email,
    customer_phone: order.phone,
    customer_address: `${order.address}, ${order.city} ${order.postalCode || ''}`.trim(),
    customer_notes: order.notes || '—',
    order_items: itemsText,
    order_total: `${order.total} DH`,
    order_date: new Date().toLocaleString(),
  }
}

export async function sendOrderEmail(order) {
  const params = buildParams(order)

  if (!isConfigured) {
    // STUB mode — no keys configured yet.
    console.info(
      '%c[EmailJS stub] Order notification (not actually sent)',
      'color:#8f57ec;font-weight:bold'
    )
    console.table(params)
    return { ok: true, stubbed: true }
  }

  try {
    // Loaded dynamically so the dependency is only pulled when configured.
    const emailjs = (await import('@emailjs/browser')).default
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY })
    return { ok: true, stubbed: false }
  } catch (err) {
    // Never block order completion because the email failed.
    console.error('[EmailJS] Failed to send order notification:', err)
    return { ok: false, error: err }
  }
}
