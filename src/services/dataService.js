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
import { USE_MOCK, getDb, getStorageInstance } from '../config/firebase'
import { PRODUCTS } from '../data/products'
import { generateOrderRef } from '../utils/orderRef'

const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled']
export { ORDER_STATUSES }

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

// ── in-memory mock state ──
let mockProducts = PRODUCTS.map((p) => ({ ...p }))
let mockOrders = []

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

export async function addProduct(data) {
  if (USE_MOCK) {
    await delay()
    const id = `p${String(Date.now()).slice(-6)}`
    const product = { id, createdAt: new Date().toISOString(), ...data }
    mockProducts = [product, ...mockProducts]
    return product
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = await addDoc(collection(await getDb(), 'products'), {
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
  await updateDoc(doc(await getDb(), 'products', id), data)
  return { id, ...data }
}

export async function deleteProduct(id) {
  if (USE_MOCK) {
    await delay()
    mockProducts = mockProducts.filter((p) => p.id !== id)
    return true
  }
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(await getDb(), 'products', id))
  return true
}

// Uploads a product image to Firebase Storage and returns its download URL.
// Requires Storage to be enabled on the Firebase project — see README.
export async function uploadProductImage(file, productId) {
  const storage = await getStorageInstance()
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
    const storage = await getStorageInstance()
    const { ref, deleteObject } = await import('firebase/storage')
    await deleteObject(ref(storage, url))
  } catch (err) {
    console.warn('Could not delete product image from Storage:', err)
  }
}

// ─────────────────────── ORDERS ───────────────────────

export async function createOrder(order) {
  const orderRef = generateOrderRef()
  const payload = {
    ...order,
    status: 'pending',
    orderRef,
    createdAt: new Date().toISOString(),
  }

  if (USE_MOCK) {
    await delay(500)
    const saved = { id: `o${Date.now()}`, ...payload }
    mockOrders = [saved, ...mockOrders]
    // Decrement stock for each purchased product, same as the live path.
    mockProducts = mockProducts.map((p) => {
      const item = order.items.find((i) => i.productId === p.id)
      if (!item) return p
      return { ...p, stock: Math.max(0, (p.stock ?? 0) - item.quantity) }
    })
    return saved
  }

  // Create the order and decrement each purchased product's stock atomically
  // — either both succeed or neither does. Uses increment() so concurrent
  // checkouts don't clobber each other's stock counts.
  const { collection, doc, writeBatch, serverTimestamp, increment } =
    await import('firebase/firestore')
  const db = await getDb()
  const batch = writeBatch(db)

  const orderDocRef = doc(collection(db, 'orders'))
  batch.set(orderDocRef, {
    ...order,
    status: 'pending',
    orderRef,
    createdAt: serverTimestamp(),
  })

  for (const item of order.items) {
    batch.update(doc(db, 'products', item.productId), {
      stock: increment(-item.quantity),
    })
  }

  await batch.commit()
  return { id: orderDocRef.id, ...payload }
}

export async function getOrders() {
  if (USE_MOCK) {
    await delay()
    return mockOrders.map((o) => ({ ...o }))
  }
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const q = query(collection(await getDb(), 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt ?? null,
    }
  })
}

// Restores or re-deducts product stock when an order moves into or out of
// 'cancelled'. Cancelling gives units back to inventory; un-cancelling (e.g.
// an admin correcting a mistaken cancellation) takes them out again — so
// stock always reflects only genuinely active/fulfilled orders.
export async function updateOrderStatus(id, status) {
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
    mockOrders = mockOrders.map((o) => (o.id === id ? { ...o, status } : o))
    return true
  }

  const { doc, runTransaction, increment } = await import('firebase/firestore')
  const db = await getDb()
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
    tx.update(orderRef, { status })
  })
  return true
}
