# Xomexo — handcrafted homeware (static site)

A complete, self-contained storefront for **xomexo.com**. Plain HTML, CSS and
vanilla JS — no build step, no dependencies, no server-side code. Drop the folder
on any host and it works.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home — hero, trust strip, craft categories, featured products, brand story, reviews, journal, newsletter |
| `shop.html` | Catalogue with working craft/price filters, sorting and an empty state |
| `product.html` | Product detail, driven by `?id=` (e.g. `product.html?id=bp-02`) — gallery, finishes, quantity, specs, care, related items |
| `about.html` | How the business sources and pays, artisan profiles |
| `contact.html` | Contact form, studio details, map, FAQ accordion |
| `404.html` | Not-found page |

## What actually works

- **Basket** — add / increment / remove, subtotal, slide-out drawer, persisted in
  `localStorage` under `xomexo.cart.v1`, survives page changes and reloads.
- **Shop filters** — multi-select craft + price bands, four sort orders, live
  result count, and the chosen category is written back to the URL so a filtered
  view can be shared (`shop.html?cat=textiles`).
- **Product pages** — every product renders from one data file; the page title,
  gallery, specs and related products all follow the `?id=`.
- **Responsive** — three breakpoints; the nav collapses to a burger under 860px.
- **Accessibility** — visible focus rings, `aria-current` nav state, labelled
  icon buttons, alt text on every image, and `prefers-reduced-motion` respected.

Checkout, search, accounts and the newsletter/contact forms are front-end only.
They acknowledge the action with a toast; nothing is sent anywhere.

## Where to edit things

- **Products** — `assets/js/products.js`. One array of objects; add, remove or
  reprice there and every page follows. Prices are plain integers in rupees;
  change `money()` in `assets/js/main.js` for another currency.
- **Colours, type, spacing** — the `:root` custom properties at the top of
  `assets/css/style.css`.
- **Copy** — directly in the HTML. The header, footer and cart drawer are
  duplicated across the five pages, so a nav change means editing each file.
- **Images** — `assets/img/*.svg`. These are hand-drawn vector stand-ins so the
  site works offline and weighs almost nothing. Replace them with real product
  photography before launch; keep the same filenames and nothing else changes.

## Deploying to xomexo.com (cPanel)

1. Upload the contents of this folder — not the folder itself — into
   `public_html/`.
2. `.htaccess` is included: it turns on gzip and caching, sets the 404 page, and
   lets `/shop` resolve to `/shop.html`. If the host is nginx instead, drop it
   and set the equivalents in the server block.
3. Update `robots.txt` and `sitemap.xml` if the domain or page set changes.
4. Issue an SSL certificate for the domain and force HTTPS.

## Before this goes live as a real shop

- Swap the illustrations for photographs of the actual stock.
- Replace the placeholder company details — GSTIN, address, phone, the
  `hello@ / trade@ / makers@` addresses — in every page footer and on
  `contact.html`.
- The statistics on the home and about pages (artisan count, payment ratio,
  amount paid, review totals) are written as realistic sample copy. They must be
  replaced with real figures or removed; publishing them as-is would be a false
  claim about the business.
- Wire the contact and newsletter forms to a real endpoint, and add a privacy
  policy and terms page — the footer already links to them.
- Point checkout at a payment provider, or move the catalogue onto a hosted cart.
