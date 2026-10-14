# Online Shop (Delivery)

Customer shop site plus an **owner admin** where the shop owner manages orders (delivery status,
cancel/restore) and the catalogue (products, categories, photos). Customers browse, add products to
the cart, check out with delivery details, and follow the delivery status. **Delivery is free.**

The site and its API run on **Cloudflare Workers**: the database is **D1** (SQLite) and uploaded
product photos are stored in **R2**. One deploy serves both the website and the API from the same
domain.

## Run it locally

Requires Node 22.12 or newer.

```bash
npm install
cp .dev.vars.example .dev.vars        # then set a local owner password in .dev.vars
npm run db:migrate:local              # creates the local database with the starting catalogue
npm run dev
```

- Shop: http://localhost:5173
- Owner admin: http://localhost:5173/#/admin (log in with the password from `.dev.vars`).
  Opens on *Orders*; the menu editor is at `#/admin/menu`.

`npm run dev` runs the API (`worker/`) inside the Vite dev server with a local database and photo
store in `.wrangler/state/` (delete that folder and migrate again to start fresh).

### Tests

With `npm run dev` running, `npm run test:api` checks every API route end to end: menu, owner
login and lockout, editing, photo upload, ordering (including that prices can't be changed from the
browser), tracking, status changes, cancel/restore and logout. It creates test orders, so it only
runs against the local dev server.

## Deploying

### One-time setup

1. Create a Cloudflare account, then sign in from this folder: `npx wrangler login`.
2. Create the database and paste the printed `database_id` into `wrangler.jsonc`:
   `npx wrangler d1 create online-order-db`
3. Create the photo store: `npx wrangler r2 bucket create online-order-images`
4. Set the owner password (at least 8 characters; a long passphrase is best):
   `npx wrangler secret put ADMIN_PASSWORD`
5. Deploy: `npm run deploy` (builds, applies database migrations, deploys). The site is then at
   `https://online-order-website.<your-subdomain>.workers.dev`. Add the shop's domain in the
   Cloudflare dashboard: *Workers & Pages → online-order-website → Settings → Domains & Routes*.

Changing `ADMIN_PASSWORD` later signs the owner out on every device.

### Automatic deploys from GitHub

`.github/workflows/deploy.yml` builds on every push to `main` and, once these repository secrets
exist (*Settings → Secrets and variables → Actions*), applies database migrations and deploys:

- `CLOUDFLARE_API_TOKEN`: an API token with *Workers Scripts*, *D1* and *Workers R2 Storage* edit
  permissions.
- `CLOUDFLARE_ACCOUNT_ID`: shown on the Cloudflare dashboard.

Without them the workflow only checks that the site builds. GitHub Pages is no longer used (it can't
run the API, and its terms don't allow shops); switch it off under *Settings → Pages*.

### Database changes

Add a new numbered file to `migrations/` (never edit one that has been deployed). `npm run deploy`
and the GitHub workflow apply new migrations before deploying the code.

## Replacing the placeholders

| What | Where |
| --- | --- |
| Shop name, description, phone, delivery hours, notice text, currency, minimum age | `src/config/store.ts` |
| Logo and cover photos (desktop + mobile) | `public/placeholder/` (replace the files or change the paths in `store.ts`) |
| Products and categories | Owner admin (`#/admin/menu`) |
| Product tags used by the Filters panel | `src/data/tags.ts` |
| Delivery status steps | `DELIVERY_STEPS` in `src/lib/delivery.ts` |
| Theme colour | `--main` in `src/styles/base.css` (placeholder orange `#c8461b`) |

## Starting catalogue

21 categories and 127 products were imported once from the client's photos in `product-photos/`
(one folder per category; the folder name gives the price, or the file name when an item's price
differs). Product names were read from the photos. Optimised square photos are in
`public/products/` and the data is the migration `migrations/0002_catalog.sql`.

From now on the catalogue is managed in the owner admin. Notes from the import:

- Duplicate photos were merged: Marlboro Red, IGET Strawberry Kiwi Ice, VELO Crispy Peppermint and
  Mango Flame, the RAW Black King Size / RAW Tips / RAW Classic 1¼ cone box shots, and two of the
  three Metal Grinder photos (same grinder). RAW Perforated Wide Tips was in both PAPERS and RAW
  PAPERS; it is listed under RAW PAPERS.
- The GRINDERS folder was empty, so that category has no products yet (empty categories are hidden
  in the shop).
- Typos fixed in category names: CIGARETTES, CONDOMS.

## How ordering works (customer)

1. On first visit the customer confirms they are 18 or older (`minimumAge` in `store.ts`).
2. **Cart button** on each product adds it to the cart; it then becomes a − / + control.
3. **Place Order** opens checkout: step 1 *Delivery* (items, delivery time, delivery details),
   step 2 *Payment*: **Pay on delivery** (cash or card to the driver), a required 18+ / photo ID
   confirmation, then **Place Order**. The server works out prices and the total itself.
4. The customer then sees the **delivery status** (Order Confirmed → Packing → Out for Delivery →
   Delivered), updated by the owner. The page refreshes itself. It is also under *My Orders* in the
   side menu and the "Order … Track" pill on the shop page.

Online card payment is not connected yet. It will be added as a second option in step 2 once a
payment provider is chosen.

## Owner admin

**Orders** (opens first; checks for new orders and changes every 10 seconds)

- Every order still to deliver, plus the latest 100 finished ones: number and time, delivery time,
  customer, phone (tap to call), address and note, items, total and payment method.
- Tap a status to update an order; the customer's tracking page follows within seconds. Tapping an
  earlier status undoes a mistake.
- **Cancel order** (e.g. a prank or a customer who called to cancel) and **Restore Order**.
- Filter by *To Deliver*, *Delivered* or *All*. The Orders tab shows how many are still to deliver.

**Menu**

- Add, edit and delete products: name, description, price, category, tags and photo. Photos are
  shrunk in the browser, then uploaded.
- Add, rename and delete categories. Deleting a category deletes its products.
- **Log Out** signs the owner out on that device; otherwise a login lasts 30 days.

## How it works

```
worker/            API (Cloudflare Worker)
  index.ts         routes: /api/* and /images/*; everything else is the website
  auth.ts          owner login, session cookie, logout
  menu.ts          catalogue read + owner editing
  orders.ts        checkout, tracking, owner order list and status changes
  images.ts        photo upload/serve/delete (R2)
  rateLimit.ts     slows down password guessing and order spam
migrations/        database schema and starting catalogue (D1)
src/
  config/store.ts  shop details (placeholders)
  lib/             API client, menu/orders/cart state, owner session, delivery steps, formatting
  store/           shop: top bar, header, category bar, product cards, checkout, tracking
  admin/           owner admin: login, orders, menu editor, product form
  styles/          CSS
public/            static files (products/ = catalogue photos, _headers = security headers)
scripts/           api-test.mjs
```

Security notes:

- The owner password is a Cloudflare secret, never in the website code. Logins use an HttpOnly,
  Secure, SameSite=Strict cookie; only a hash of it is stored. 10 wrong passwords lock that visitor
  out for 15 minutes.
- Order prices and totals come from the database. A visitor can place at most 10 orders per 10
  minutes. Order tracking links use random, unguessable ids.
- Writes from other websites are refused, uploads are limited to images up to 5 MB, and the site
  sends a Content-Security-Policy and frame-blocking headers (`public/_headers`).
