-- Shop database (Cloudflare D1 / SQLite). Prices are in cents; times are ms since 1970.

-- Catalogue: categories in display order, products in display order within their category.
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0),
  -- 'products/x.webp' (bundled with the site), '/images/products/x.jpg' (uploaded) or '' (placeholder)
  image TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array of tag names
  position INTEGER NOT NULL
);

CREATE INDEX products_by_category ON products (category_id, position);

-- Orders keep a copy of each line's name and price at the time of ordering.
CREATE TABLE orders (
  id TEXT PRIMARY KEY,            -- unguessable; the customer's tracking link uses it
  number INTEGER NOT NULL UNIQUE, -- short order number shown to people
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,    -- lets the owner's Orders page fetch only what changed
  lines TEXT NOT NULL,            -- JSON [{productId, name, price, qty}]
  total INTEGER NOT NULL,
  delivery_time TEXT NOT NULL,    -- 'ASAP' or 'HH:MM'
  customer TEXT NOT NULL,         -- JSON {name, phone}
  address TEXT NOT NULL,          -- JSON {street, suburb, postcode, instructions}
  payment TEXT NOT NULL,
  status_times TEXT NOT NULL,     -- JSON: when each delivery step was reached; the last is the current step
  cancelled_at INTEGER            -- set while the owner has the order cancelled
);

CREATE INDEX orders_by_update ON orders (updated_at);

-- Owner login sessions. Only a hash of the cookie token is stored.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  password_tag TEXT NOT NULL, -- changing the owner password signs out every device
  expires_at INTEGER NOT NULL
);

-- Recent login attempts and orders per visitor, used to slow down abuse.
CREATE TABLE rate_events (
  key TEXT NOT NULL,
  at INTEGER NOT NULL
);

CREATE INDEX rate_events_by_key ON rate_events (key, at);
CREATE INDEX rate_events_by_time ON rate_events (at);
