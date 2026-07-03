// ─────────────────────────────────────────────────────────────
//  Data service — single entry point for all product & order I/O.
//
//  In MOCK mode (VITE_USE_MOCK=true, the default) everything runs against an
//  in-memory copy of the seed products + a local orders array. Nothing leaves
//  the browser, so the whole app is fully functional with zero setup.
//
//  In LIVE mode it talks to Firestore. Swapping between the two is just the
//  env flag — no page or component changes required.
// ─────────────────────────────────────────────────────────────
import {
  USE_MOCK,
  getDb,
  getAuthInstance,
  getAdminDb,
  getAdminStorageInstance,
} from '../config/firebase'
import { PRODUCTS } from '../data/products'
import { generateOrderRef } from '../utils/orderRef'

const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled']
export { ORDER_STATUSES }

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

// ── in-memory mock state ──
let mockProducts = PRODUCTS.map((p) => ({ ...p }))
let mockOrders = []
let mockCustomers = [] // { uid, email, password, customerName, phone, address, city, postalCode }
let mockNextUid = 1

// ─────────────────────── PRODUCTS ───────────────────────

export async function getProducts() {
  if (USE_MOCK) {
    await delay()
    return mockProducts.map((p) => ({ ...p }))
  }
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(await getDb(), 'products'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getProduct(id) {
  if (USE_MOCK) {
    await delay(150)
    const found = mockProducts.find((p) => p.id === id)
    return found ? { ...found } : null
  }
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(await getDb(), 'products', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// addProduct/updateProduct/deleteProduct/uploadProductImage/deleteProductImage
// are only ever called from the admin dashboard, so they go through the
// admin's own Firebase app instance (getAdminDb/getAdminStorageInstance) —
// keeping them authenticated as the admin even if a customer session also
// happens to be active in the same browser. See config/firebase.js.
export async function addProduct(data) {
  if (USE_MOCK) {
    await delay()
    const id = `p${String(Date.now()).slice(-6)}`
    const product = { id, createdAt: new Date().toISOString(), ...data }
    mockProducts = [product, ...mockProducts]
    return product
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = await addDoc(collection(await getAdminDb(), 'products'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data }
}

export async function updateProduct(id, data) {
  if (USE_MOCK) {
    await delay()
    mockProducts = mockProducts.map((p) =>
      p.id === id ? { ...p, ...data } : p
    )
    return { id, ...data }
  }
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(await getAdminDb(), 'products', id), data)
  return { id, ...data }
}

export async function deleteProduct(id) {
  if (USE_MOCK) {
    await delay()
    mockProducts = mockProducts.filter((p) => p.id !== id)
    return true
  }
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(await getAdminDb(), 'products', id))
  return true
}

// Uploads a product image to Firebase Storage and returns its download URL.
// Requires Storage to be enabled on the Firebase project — see README.
export async function uploadProductImage(file, productId) {
  const storage = await getAdminStorageInstance()
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const path = `products/${productId || 'new'}-${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// Best-effort cleanup of a product's Storage image. Silently no-ops for
// non-Storage URLs (e.g. the Unsplash placeholders used by the seed data).
export async function deleteProductImage(url) {
  if (!url || !url.includes('firebasestorage')) return
  try {
    const storage = await getAdminStorageInstance()
    const { ref, deleteObject } = await import('firebase/storage')
    await deleteObject(ref(storage, url))
  } catch (err) {
    console.warn('Could not delete product image from Storage:', err)
  }
}

// ─────────────────────── CUSTOMER ACCOUNTS ───────────────────────
//
// Placing an order now requires a customer account: a first-time buyer
// creates one right at checkout (name/phone/address + a password), a
// returning one just signs in. The account's profile doc mirrors the
// checkout fields so future orders (and the account page) can prefill from
// it. Firestore rules only let a customer read/write their *own* profile —
// never another customer's.

export async function signUpCustomer({ email, password, customerName, phone, address, city, postalCode }) {
  if (USE_MOCK) {
    await delay(400)
    if (mockCustomers.some((c) => c.email === email)) {
      const err = new Error('Email already in use')
      err.code = 'auth/email-already-in-use'
      throw err
    }
    const uid = `mock-customer-${mockNextUid++}`
    const customer = { uid, email, password, customerName, phone, address, city, postalCode: postalCode || '' }
    mockCustomers = [...mockCustomers, customer]
    return { uid, email }
  }

  const auth = await getAuthInstance()
  const { createUserWithEmailAndPassword } = await import('firebase/auth')
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(doc(await getDb(), 'customers', credential.user.uid), {
    customerName,
    email,
    phone,
    address,
    city,
    postalCode: postalCode || '',
    createdAt: serverTimestamp(),
  })
  return credential.user
}

export async function signInCustomer(email, password) {
  if (USE_MOCK) {
    await delay(300)
    const found = mockCustomers.find((c) => c.email === email && c.password === password)
    if (!found) {
      const err = new Error('Invalid credentials')
      err.code = 'auth/invalid-credential'
      throw err
    }
    return { uid: found.uid, email: found.email }
  }
  const auth = await getAuthInstance()
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signOutCustomer() {
  if (USE_MOCK) {
    await delay(100)
    return true
  }
  const auth = await getAuthInstance()
  const { signOut } = await import('firebase/auth')
  await signOut(auth)
  return true
}

export async function getCustomerProfile(uid) {
  if (USE_MOCK) {
    await delay(150)
    const found = mockCustomers.find((c) => c.uid === uid)
    return found ? { id: uid, ...found } : null
  }
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(await getDb(), 'customers', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateCustomerProfile(uid, data) {
  if (USE_MOCK) {
    await delay(200)
    mockCustomers = mockCustomers.map((c) => (c.uid === uid ? { ...c, ...data } : c))
    return true
  }
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(await getDb(), 'customers', uid), data)
  return true
}

// ─────────────────────── ORDERS ───────────────────────
//
// Order documents are keyed by their own orderRef (e.g. "ECL-7F3K9Q") for a
// friendly, human-readable ID. Every order carries a customerId, and
// firestore.rules only let that customer (or an admin) read it — this is
// what "sign in to see my orders" (account page / tracking) is built on.

export async function createOrder(order) {
  if (USE_MOCK) {
    await delay(500)
    const orderRef = generateOrderRef()
    const nowIso = new Date().toISOString()
    const saved = {
      id: orderRef,
      ...order,
      status: 'pending',
      orderRef,
      createdAt: nowIso,
      statusHistory: [{ status: 'pending', changedAt: nowIso }],
    }
    mockOrders = [saved, ...mockOrders]
    // Decrement stock for each purchased product, same as the live path.
    mockProducts = mockProducts.map((p) => {
      const item = order.items.find((i) => i.productId === p.id)
      if (!item) return p
      return { ...p, stock: Math.max(0, (p.stock ?? 0) - item.quantity) }
    })
    return saved
  }

  // Create the order (at a doc ID equal to its own orderRef) and decrement
  // each purchased product's stock atomically in one transaction — either
  // everything succeeds or nothing does. Retries a handful of times on the
  // (astronomically unlikely) chance of a orderRef collision.
  const { doc, runTransaction, serverTimestamp, increment } = await import('firebase/firestore')
  const db = await getDb()

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderRef = generateOrderRef()
    const orderDocRef = doc(db, 'orders', orderRef)
    try {
      return await runTransaction(db, async (tx) => {
        const existing = await tx.get(orderDocRef)
        if (existing.exists()) throw new Error('ORDER_REF_COLLISION')

        const nowIso = new Date().toISOString()
        const data = {
          ...order,
          status: 'pending',
          orderRef,
          createdAt: serverTimestamp(),
          statusHistory: [{ status: 'pending', changedAt: nowIso }],
        }
        tx.set(orderDocRef, data)
        for (const item of order.items) {
          tx.update(doc(db, 'products', item.productId), {
            stock: increment(-item.quantity),
          })
        }
        return { id: orderRef, ...data, createdAt: nowIso }
      })
    } catch (err) {
      if (err.message === 'ORDER_REF_COLLISION' && attempt < 4) continue
      throw err
    }
  }
}

function normalizeOrderDoc(id, data) {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt ?? null,
    statusHistory: (data.statusHistory || []).map((h) => ({
      ...h,
      changedAt: h.changedAt?.toDate?.().toISOString?.() ?? h.changedAt ?? null,
    })),
  }
}

export async function getOrders() {
  if (USE_MOCK) {
    await delay()
    return mockOrders.map((o) => ({ ...o }))
  }
  // Admin-only listing (every order, not just one customer's) — goes
  // through the admin's own Firebase app instance, see config/firebase.js.
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const q = query(collection(await getAdminDb(), 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => normalizeOrderDoc(d.id, d.data()))
}

// The signed-in customer's own order history — powers the account/tracking
// page. firestore.rules only return documents where customerId matches the
// caller, so this can never surface anyone else's orders.
export async function getMyOrders(uid) {
  if (USE_MOCK) {
    await delay(300)
    return mockOrders
      .filter((o) => o.customerId === uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  const { collection, getDocs, query, where } = await import('firebase/firestore')
  const q = query(collection(await getDb(), 'orders'), where('customerId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => normalizeOrderDoc(d.id, d.data()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Restores or re-deducts product stock when an order moves into or out of
// 'cancelled'. Cancelling gives units back to inventory; un-cancelling (e.g.
// an admin correcting a mistaken cancellation) takes them out again — so
// stock always reflects only genuinely active/fulfilled orders. Also appends
// every transition to statusHistory, which powers the tracking timeline.
export async function updateOrderStatus(id, status) {
  const nowIso = new Date().toISOString()

  if (USE_MOCK) {
    await delay(200)
    const target = mockOrders.find((o) => o.id === id)
    if (target) {
      const wasCancelled = target.status === 'cancelled'
      const willBeCancelled = status === 'cancelled'
      if (willBeCancelled !== wasCancelled) {
        const sign = willBeCancelled ? 1 : -1
        mockProducts = mockProducts.map((p) => {
          const item = target.items.find((i) => i.productId === p.id)
          if (!item) return p
          return { ...p, stock: Math.max(0, (p.stock ?? 0) + sign * item.quantity) }
        })
      }
    }
    mockOrders = mockOrders.map((o) =>
      o.id === id
        ? { ...o, status, statusHistory: [...(o.statusHistory || []), { status, changedAt: nowIso }] }
        : o
    )
    return true
  }

  // Admin-only action — goes through the admin's own Firebase app instance.
  const { doc, runTransaction, increment } = await import('firebase/firestore')
  const db = await getAdminDb()
  const orderRef = doc(db, 'orders', id)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(orderRef)
    if (!snap.exists()) throw new Error('Order not found')
    const order = snap.data()
    const wasCancelled = order.status === 'cancelled'
    const willBeCancelled = status === 'cancelled'

    if (willBeCancelled !== wasCancelled) {
      const sign = willBeCancelled ? 1 : -1
      for (const item of order.items || []) {
        tx.update(doc(db, 'products', item.productId), {
          stock: increment(sign * item.quantity),
        })
      }
    }
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
    tx.update(orderRef, { status, statusHistory: [...history, { status, changedAt: nowIso }] })
  })
  return true
}

// ─────────────────────── REVIEWS ───────────────────────
//
// Public create-only, like orders: anyone can submit a review, but it only
// becomes visible once an admin approves it (status starts 'pending').

let mockReviews = []

export async function addReview(review) {
  if (USE_MOCK) {
    await delay(300)
    const saved = { id: `r${Date.now()}`, ...review, status: 'pending', createdAt: new Date().toISOString() }
    mockReviews = [saved, ...mockReviews]
    return saved
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = await addDoc(collection(await getDb(), 'reviews'), {
    ...review,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...review, status: 'pending', createdAt: new Date().toISOString() }
}

// Approved reviews for a single product (storefront-facing).
export async function getApprovedReviews(productId) {
  if (USE_MOCK) {
    await delay()
    return mockReviews.filter((r) => r.productId === productId && r.status === 'approved')
  }
  const { collection, getDocs, query, where } = await import('firebase/firestore')
  const q = query(
    collection(await getDb(), 'reviews'),
    where('productId', '==', productId),
    where('status', '==', 'approved')
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.().toISOString?.() ?? d.data().createdAt ?? null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// All reviews regardless of status (admin moderation view). Admin-only —
// goes through the admin's own Firebase app instance.
export async function getAllReviews() {
  if (USE_MOCK) {
    await delay()
    return [...mockReviews]
  }
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const q = query(collection(await getAdminDb(), 'reviews'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.().toISOString?.() ?? d.data().createdAt ?? null,
  }))
}

export async function updateReviewStatus(id, status) {
  if (USE_MOCK) {
    await delay(150)
    mockReviews = mockReviews.map((r) => (r.id === id ? { ...r, status } : r))
    return true
  }
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(await getAdminDb(), 'reviews', id), { status })
  return true
}

export async function deleteReview(id) {
  if (USE_MOCK) {
    await delay(150)
    mockReviews = mockReviews.filter((r) => r.id !== id)
    return true
  }
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(await getAdminDb(), 'reviews', id))
  return true
}
