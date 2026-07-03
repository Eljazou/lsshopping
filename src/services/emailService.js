// ─────────────────────────────────────────────────────────────
//  Email notification service (EmailJS).
//
//  One flow, one template: the customer gets an email once at checkout
//  (status: pending) and again every time an admin changes their order's
//  status, all the way through delivered/cancelled.
//
//  Until you add real EmailJS keys to .env, this runs in STUB mode: it logs
//  the exact payload it *would* send to the console and resolves
//  successfully, so checkout and admin status changes work end-to-end
//  during development.
//
//  EmailJS setup: see README → "EmailJS setup".
// ─────────────────────────────────────────────────────────────
import i18n from '../i18n'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const isConfigured =
  SERVICE_ID &&
  TEMPLATE_ID &&
  PUBLIC_KEY &&
  !SERVICE_ID.startsWith('your_') &&
  !TEMPLATE_ID.startsWith('your_')

function buildParams(order, language) {
  const t = i18n.getFixedT(language)
  const isNewOrder = order.status === 'pending'
  const itemsText = order.items
    .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
    .join('\n')
  const trackingUrl = `${window.location.origin}/suivi/${order.orderRef}`

  return {
    to_email: order.email,
    to_name: order.customerName,
    customer_name: order.customerName,
    customer_phone: order.phone,
    customer_email: order.email,
    customer_address: `${order.address}, ${order.city} ${order.postalCode || ''}`.trim(),
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
  const params = buildParams(order, language)

  if (!isConfigured) {
    console.info(
      '%c[EmailJS stub] Customer status email (not actually sent)',
      'color:#f95d94;font-weight:bold'
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
    // Never block order completion / status updates because the email failed.
    console.error('[EmailJS] Failed to send customer status email:', err)
    return { ok: false, error: err }
  }
}
