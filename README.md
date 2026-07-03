# L&S Shopping — Cosmetics Storefront (Cash on Delivery)

A polished, portfolio-quality e-commerce storefront for a single-brand cosmetics
store. Customers browse products and place **Cash-on-Delivery (COD)** orders —
there is no online payment. Orders are recorded in Firestore and the store owner
is notified by email.

Built for the **Moroccan market**: fully **trilingual (العربية / Français /
English)** with automatic **RTL** layout for Arabic, prices in **MAD (DH)**.

---

## ✨ Features

- **Homepage** — hero, brand promises, category grid, featured bestsellers
- **Shop** — ~50 products, category filter, sort (price / newest), live search
- **Product detail** — gallery, description, quantity selector, related products
- **Cart** — persistent (localStorage), slide-in drawer + full cart page
- **Checkout (COD)** — name, email, phone, address, city, postal code, notes;
  saves the order + fires an owner email notification; confirmation screen with
  an order reference (`ECL-XXXXXX`)
- **Admin dashboard** — protected by **Firebase Authentication** (email/password);
  overview page with stats, orders management (status workflow, filter, search),
  and full product CRUD with **Firebase Storage** image uploads
- **i18n + RTL** — language switcher, per-product localized name/description
- **Mock-first storefront** — the customer-facing site runs fully offline on
  in-memory data; flip one env flag to go live on Firestore. The admin
  dashboard always requires live Firebase (see below).

## 🧱 Tech stack

| Layer | Choice |
|------|--------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (custom brand theme) |
| Routing | React Router v6 |
| i18n | react-i18next (en/fr/ar) |
| Database | Firebase Firestore |
| Email | EmailJS |
| Hosting | Firebase Hosting |

---

## 🚀 Quick start (mock mode — zero config)

```bash
npm install
cp .env.example .env    # optional; defaults already run in mock mode
npm run dev
```

Open http://localhost:5173. The storefront (Home, Shop, Cart, Checkout) works
immediately against in-memory data — no Firebase account required.

**The admin dashboard (`/admin`) always requires live Firebase** (Auth +
Storage have no mock equivalent). In mock mode, `/admin` shows a "Firebase
required" screen. See the next two sections to set it up.

---

## 🔥 Going live with Firebase

1. Create a project at <https://console.firebase.google.com>.
2. Create a **Web app** (Project settings → Your apps) and copy the config.
3. Create a **Firestore database** (production mode).
4. Fill your `.env`:

   ```env
   VITE_USE_MOCK=false
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Deploy the security rules (Firestore **and** Storage):

   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add        # pick your project
   firebase deploy --only firestore:rules,storage
   ```

---

## 🔑 Admin authentication (Firebase Auth)

The admin dashboard uses **Firebase Authentication (email/password)** — there
is **no public sign-up**. You create admin accounts yourself, manually:

1. Firebase console → **Authentication** → **Sign-in method** → enable the
   **Email/Password** provider.
2. **Authentication** → **Users** → **Add user** → enter the email and
   password you want to log in with at `/admin/login`.
3. That's it — any account you create here can sign in and has full admin
   access (there's no separate "role" field). Only create accounts for people
   you trust; see the security notes below for why.

## 🖼️ Firebase Storage (product image uploads)

Product images in the admin **Products** page upload to Firebase Storage.

1. Firebase console → **Storage** → **Get started** (this may prompt you to
   upgrade to the **Blaze** pay-as-you-go plan — the free tier's default
   quota is generous enough for a project like this).
2. Deploy `storage.rules` (see the command above, or `firebase deploy --only storage`).
3. Uploads go to a `products/` folder in your default bucket; the resulting
   download URL is saved as the product's `imageUrl`, exactly like the seeded
   Unsplash URLs — the storefront doesn't need to know the difference.

### Seed the database (~50 products)

The seed script uses the **Admin SDK** (bypasses rules):

```bash
npm i -D firebase-admin      # already in devDependencies
# Firebase console → Project settings → Service accounts → Generate new private key

# macOS / Linux
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run seed

# Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"; npm run seed
```

Keep `serviceAccount.json` **out of git** (already covered by `.gitignore`
patterns — never commit it).

---

## 📧 EmailJS setup (owner + customer notifications)

There are **two independent email flows**, each needing its own EmailJS
template. Until configured, both run in **stub mode** — they log the exact
payload to the browser console instead of sending, so checkout and admin
status changes work end-to-end without any setup.

| Flow | Function | Sent to | When |
|---|---|---|---|
| Owner notification | `sendOrderEmail()` | you (fixed address) | once, on every new order |
| Customer status email | `sendCustomerStatusEmail()` | the customer | at checkout, then again on **every** status change (confirmed/delivered/cancelled) |

1. Create an account at <https://dashboard.emailjs.com>.
2. Add an **Email Service** and note the **Service ID** (shared by both templates).
3. Copy your **Public Key** (Account → API keys).
4. Create **Template 1 — owner notification**, "To" field set to `{{to_email}}`, body using:
   `{{order_ref}} {{customer_name}} {{customer_email}} {{customer_phone}}`
   `{{customer_address}} {{customer_notes}} {{order_items}} {{order_total}} {{order_date}}`
5. Create **Template 2 — customer status update**, "To" field also `{{to_email}}`
   (this time it resolves to the *customer's* email, not yours), body using:
   `{{to_name}} {{order_ref}} {{status_label}} {{subject}} {{intro_text}}`
   `{{order_items}} {{order_total}} {{tracking_url}} {{tracking_cta}}`
   — `subject` and `intro_text` are already translated into the customer's
   chosen language (FR/EN/AR) by the app, so the template itself can stay
   simple and just place them in the email body/subject line.
6. Fill `.env`:

   ```env
   VITE_EMAILJS_SERVICE_ID=...
   VITE_EMAILJS_TEMPLATE_ID=...            # Template 1 (owner)
   VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=...   # Template 2 (customer)
   VITE_EMAILJS_PUBLIC_KEY=...
   VITE_STORE_OWNER_EMAIL=owner@yourstore.ma
   ```

7. Install the client: `npm i @emailjs/browser` (listed as an optional dep).

---

## 🌍 Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
# or everything at once:
firebase deploy
```

The SPA rewrite in `firebase.json` routes all paths to `index.html`.

---

## 🗂️ Data model (Firestore)

**products**
```
name:        { en, fr, ar }
description: { en, fr, ar }
price:       number   (MAD)
category:    'skincare' | 'makeup' | 'haircare' | 'fragrance' | 'bodycare' | 'tools'
imageUrl:    string
stock:       number
featured:    boolean
createdAt:   timestamp
```

**orders**
```
customerName, email, phone, address, city, postalCode, notes
items:     [{ productId, name, price, quantity }]
total:     number
status:    'pending' | 'confirmed' | 'delivered' | 'cancelled'
orderRef:  string   (e.g. ECL-7F3K9Q)
createdAt: timestamp
```

## 🔐 Security notes (please read)

This is a **client-only** app — there's no backend server, so the real access
control lives entirely in `firestore.rules` and `storage.rules`:

- **`products`** — publicly readable; writable only by a signed-in
  (Firebase Auth) user.
- **`orders`** — publicly *create*-only (so checkout works without login);
  reading and updating (status changes) require a signed-in user.
- **Storage `products/`** — publicly readable (so images render on the
  storefront); uploads/deletes require a signed-in user.

Because there's no public sign-up and no per-user "role" field, **any account
you create in Authentication > Users is trusted as an admin**. Only create
accounts for people who should have full store access. If you later need
different permission levels (e.g. a staff account that can't delete products),
add a `role` field to a `users` collection and check it in the rules instead
of just `request.auth != null`.

## 📁 Project structure

```
src/
├─ components/   layout · product · cart · ui primitives
├─ context/      Cart · Language · AdminAuth (Firebase Auth) · Toast
├─ config/       firebase.js (shared app + Firestore/Auth/Storage getters)
├─ data/         products.js (50 seed items) · categories.js
├─ i18n/         config + locales/{en,fr,ar}.json
├─ pages/
│   ├─ Home · Shop · ProductDetail · Cart · Checkout · OrderConfirmation
│   └─ admin/    RequireAdmin · AdminLogin · FirebaseRequiredNotice ·
│                AdminDashboard (layout) · AdminOverview · AdminOrders ·
│                AdminProducts · ProductFormModal · StatusBadge
├─ services/     dataService.js (Firestore + Storage) · emailService.js
└─ utils/        format.js · orderRef.js
scripts/seed.js  firestore.rules  storage.rules  firebase.json
```

## 🎨 Customizing the brand

- **Name / copy:** edit `src/i18n/locales/*.json` (`brand.name`, etc.).
- **Colors & fonts:** `tailwind.config.js` (`blush`, `plum`, `gold`) and the
  Google Fonts link in `index.html`.
- **Products:** `src/data/products.js`, or manage them live in the admin panel.

---

Made with care for the Moroccan cosmetics market · 🇲🇦
