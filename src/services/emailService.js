// ─────────────────────────────────────────────────────────────
//  Email notification service (EmailJS).
//
//  Two independent flows, each with its own EmailJS template:
//   1. sendOrderEmail        → store owner, once per new order.
//   2. sendCustomerStatusEmail → the customer, once when the order is placed
//      and again every time its status changes, until delivered/cancelled.
//
//  Until you add real EmailJS keys to .env, both run in STUB mode: they log
//  the exact payload they *would* send to the console and resolve
//  successfully, so checkout and admin status changes work end-to-end
//  during development.
//
//  EmailJS setup: see README → "EmailJS setup".
// ─────────────────────────────────────────────────────────────
import i18n from '../i18n'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const OWNER_EMAIL = import.meta.env.VITE_STORE_OWNER_EMAIL || 'owner@example.com'

const isConfigured =
  SERVICE_ID &&
  TEMPLATE_ID &&
  PUBLIC_KEY &&
  !SERVICE_ID.startsWith('your_') &&
  !TEMPLATE_ID.startsWith('your_')

const isCustomerConfigured =
  SERVICE_ID &&
  CUSTOMER_TEMPLATE_ID &&
  PUBLIC_KEY &&
  !SERVICE_ID.startsWith('your_') &&
  !CUSTOMER_TEMPLATE_ID.startsWith('your_')

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

function buildCustomerParams(order, language) {
  const t = i18n.getFixedT(language)
  const isNewOrder = order.status === 'pending'
  const itemsText = order.items
    .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
    .join('\n')
  const trackingUrl = `${window.location.origin}/suivi/${order.orderRef}`

  return {
    to_email: order.email,
    to_name: order.customerName,
    order_ref: order.orderRef,
    status_label: t(`admin.status.${order.status}`),
    subject: isNewOrder
      ? t('email.newOrderSubject', { ref: order.orderRef })
      : t('email.statusUpdateSubject', { ref: order.orderRef }),
    intro_text: isNewOrder
      ? t('email.newOrderIntro', { name: order.customerName })
      : t('email.statusUpdateIntro', { name: order.customerName }),
    order_items: itemsText,
    order_total: `${order.total} DH`,
    tracking_url: trackingUrl,
    tracking_cta: t('email.trackingCta'),
  }
}

// Sends the customer an email with their order reference and current status.
// Called once right after checkout (status = 'pending') and again every time
// an admin changes the order's status, so the customer is kept in the loop
// all the way through delivery (or cancellation).
export async function sendCustomerStatusEmail(order, language = 'fr') {
  if (!order.email) return { ok: false, error: new Error('Order has no customer email') }
  const params = buildCustomerParams(order, language)

  if (!isCustomerConfigured) {
    console.info(
      '%c[EmailJS stub] Customer status email (not actually sent)',
      'color:#f95d94;font-weight:bold'
    )
    console.table(params)
    return { ok: true, stubbed: true }
  }

  try {
    const emailjs = (await import('@emailjs/browser')).default
    await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE_ID, params, { publicKey: PUBLIC_KEY })
    return { ok: true, stubbed: false }
  } catch (err) {
    console.error('[EmailJS] Failed to send customer status email:', err)
    return { ok: false, error: err }
  }
}
