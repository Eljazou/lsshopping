/**
 * Seed Firestore with the ~50 demo products from src/data/products.js
 *
 * Usage:
 *   1. Firebase console → Project settings → Service accounts →
 *      "Generate new private key". Save the JSON somewhere private.
 *   2. Point GOOGLE_APPLICATION_CREDENTIALS at it, then run the seed:
 *
 *        # macOS / Linux
 *        GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run seed
 *
 *        # Windows (PowerShell)
 *        $env:GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"; npm run seed
 *
 * Requires: npm i -D firebase-admin
 *
 * NOTE: This writes with the Admin SDK, which bypasses security rules — that's
 * why seeding products (which are not client-writable) works here.
 */
import { readFileSync } from 'node:fs'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { PRODUCTS } from '../src/data/products.js'

function initAdmin() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) {
    try {
      const svc = JSON.parse(readFileSync(credPath, 'utf8'))
      return initializeApp({ credential: cert(svc) })
    } catch (e) {
      console.error(`Could not read service account at ${credPath}:`, e.message)
      process.exit(1)
    }
  }
  // Fall back to application default credentials (e.g. gcloud auth).
  return initializeApp({ credential: applicationDefault() })
}

async function seed() {
  initAdmin()
  const db = getFirestore()
  console.log(`Seeding ${PRODUCTS.length} products…`)

  let batch = db.batch()
  let ops = 0

  for (const product of PRODUCTS) {
    const { id, ...data } = product
    const ref = db.collection('products').doc(id)
    batch.set(ref, { ...data, createdAt: FieldValue.serverTimestamp() })
    ops++
    if (ops === 400) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }
  if (ops > 0) await batch.commit()

  console.log('✅ Done. Products seeded to the "products" collection.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
