# Online Shop (Delivery): Frontend Demo

Customer shop site plus an **owner admin** where the shop owner manages orders (updating each
order's delivery status) and adds, edits and deletes products. Customers browse products, add them
with the cart button on each product, check out with delivery details, pay, and follow the delivery
status. **Delivery is free.** The layout follows the reference store, with its own refreshed styling.
All shop details, photos and products are **placeholders**.

## Run it

```bash
npm install
npm run dev
```

- Shop: http://localhost:5173
- Owner admin: http://localhost:5173/#/admin (demo passcode **1234**). Opens on *Orders*; the menu
  editor is at `#/admin/menu`.

`npm run build` creates a static site in `dist/` that can be uploaded to any web host.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. One-time
setup in the GitHub repo: **Settings → Pages → Source: GitHub Actions**. The site is then at
`https://<username>.github.io/<repo>/` (admin at `…/#/admin`).

## Replacing the placeholders

| What | Where |
| --- | --- |
| Shop name, description, phone, delivery hours, notice text, currency, admin passcode | `src/config/store.ts` |
| Logo and cover photos (desktop + mobile) | `public/placeholder/` (replace the files or change the paths in `store.ts`) |
| Products and categories | Owner admin (`#/admin`), or the starting catalogue in `src/data/seedMenu.ts` |
| Product tags used by the Filters panel | `src/data/tags.ts` |
| Delivery status steps | `DELIVERY_STEPS` in `src/lib/orders.ts` |
| Theme colour (buttons, active category, highlights; hover and light tints follow it) | `--main` in `src/styles/base.css` (placeholder orange `#c8461b`) |

## How ordering works (customer)

1. **Cart button** at the bottom right of each product adds it to the cart. It then turns into
   a − / + quantity control, and back into the cart button at 0. Clicking elsewhere on a product
   opens its details.
2. **Place Order** opens the checkout panel: step 1 *Delivery* (items, delivery time, delivery
   details), step 2 *Payment* (card or Apple Pay / Google Pay), then **Pay**. Delivery is free, so
   the total is just the items.
3. After paying, the customer sees the **delivery status** (Order Confirmed → Packing →
   Out for Delivery → Delivered), as set by the owner. It is also available from *My Orders* in the
   side menu and from the "Order … Track" pill on the shop page.

## Owner admin

**Orders** (opens first)

- Every order as a card: order number and time, requested delivery time, customer name, phone
  (tap to call), address and delivery note, items, total and payment method.
- Tap a status (Order Confirmed / Packing / Out for Delivery / Delivered) to update an order. The
  customer's tracking page shows it straight away. Tapping an earlier status undoes a mistake.
- Filter by *To Deliver*, *Delivered* or *All*. The Orders tab shows how many are still to deliver.

**Menu**

- Add, edit and delete products: name, description, price, category, tags and photo upload.
  Photos are shrunk automatically.
- Add, rename and delete categories. Empty categories are hidden on the shop.
- "Reset to sample menu" restores the placeholder catalogue.

## Demo limitations (need a backend before going live)

- **Payment is simulated.** No money is taken. Test card: 4242 4242 4242 4242, any future expiry,
  any 3 digits. Card details are never saved (only the last 4 digits are shown on the order).
  The live site must use a payment provider's secure card fields (e.g. Stripe or Square), so card
  numbers never pass through this site's own code or server.
- Products, the cart and orders are saved in the **browser's local storage**, so each
  browser/device has its own copy. **The owner's Orders page only shows orders placed in the same
  browser**, and status updates only reach customers in that browser (other tabs update live, so
  you can demo it with the shop in one tab and the admin in another). Collecting every customer's
  orders in one place needs the backend below.
- The admin passcode is checked in the browser. It is **not real security**.
- Customer Login / Sign Up and the language menu are UI only.

Production next steps: a database + API for products and orders (so the owner's Orders page
receives every order), real owner login, image storage, a payment provider, and order
notifications (SMS/email, and an alert on the Orders page when a new order arrives). The swap
points are `src/lib/menuStore.ts` (products) and `src/lib/orders.ts` (orders, including
`setOrderStep` for status updates).

## Project layout

```
src/
  config/store.ts      shop details (placeholders)
  data/                sample catalogue + filter tags
  lib/                 products/cart/orders state, card checks, routing, formatting, hours, images
  components/          icons, modal/drawer/sheet/page shells, shared controls
  store/               shop: top bar, header, category bar, product cards, checkout, tracking
  admin/               owner admin: passcode gate, orders manager, product manager, product form
  styles/              base, store, pages, admin CSS
```
