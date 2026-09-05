# Xomexo — handmade home decor storefront

Static storefront for **xomexo.com**. Plain HTML, CSS and vanilla JS. No build
step, no dependencies, no server-side code. Deploys by copying files.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: hero, USP strip, category tiles, bestsellers, new arrivals, brand section, reviews, blog, newsletter |
| `shop.html` | Catalogue with working category/price filters and sorting |
| `product.html` | Product detail, driven by `?id=` (e.g. `product.html?id=kt-11`) |
| `about.html` | Company story, sourcing process, artisan profiles |
| `contact.html` | Contact form, office details, map, FAQ |
| `404.html` | Not-found page |

## What actually works

- **Cart** — add, increase, decrease, remove, subtotal, slide-out drawer.
  Persisted in `localStorage` (`xomexo.cart.v1`), survives reloads.
- **Filters and sorting** — multi-select category and price, four sort orders,
  live count, empty state. The chosen category is written to the URL, so
  `shop.html?cat=textiles` is shareable and the filter box reflects it on load.
- **Product pages** — one data file feeds the grid, the detail page and the cart.
  Each product page also injects Product schema (price, availability, rating).
- **Responsive** — nav collapses to a burger below 860px.
- **Accessibility** — focus rings, `aria-current`, labelled icon buttons, alt
  text, `prefers-reduced-motion` respected.

Checkout, search, login and the two forms are front-end only. They show a
confirmation message; nothing is submitted anywhere yet.

## Where to edit things

- **Products** — `assets/js/products.js`. One array of objects. Add, remove or
  reprice there and every page follows. Prices are plain rupee integers; change
  `money()` in `assets/js/main.js` for another currency.
- **Colours, fonts, spacing** — the `:root` variables at the top of
  `assets/css/style.css`.
- **Copy** — directly in the HTML. Header, footer and cart drawer are duplicated
  across the pages, so a nav change means editing each file.
- **Photos** — `assets/img/photos/`. Keep the same filenames when replacing.

## Photography

Product and lifestyle photos are stock images from Unsplash, downloaded into the
repo so the site has no external image dependency. The Unsplash License allows
commercial use without attribution.

They are stand-ins. They show similar products, not the actual stock, and the
same images appear on other sites. Replace them with your own photography before
you promote the site.

`logo.svg`, `favicon.svg` and `map.svg` are drawn in-house. The map is a stylised
illustration, not a real map; swap it for an embedded map or a real one before
launch.

## Deploying

The site is served from `/home/grapme/public_html/xomexo.com` on the cPanel box,
attached to this repo. To deploy:

```bash
su - grapme -c 'cd ~/public_html/xomexo.com && git pull'
```

`.htaccess` (included) enables gzip and caching, sets the 404 page, and lets
`/shop` resolve to `/shop.html`. Update `robots.txt` and `sitemap.xml` if pages
are added or the domain changes.

## Before this trades as a real shop

- **Replace the placeholder business details.** The GSTIN
  (`07AABCX1234M1Z5`), the Nehru Place address, the phone number and the
  `hello@ / trade@ / makers@` addresses are invented. They appear in every page
  footer, on `contact.html` and in the JSON-LD on the home page.
- **Replace the placeholder statistics and reviews.** Artisan counts, order
  counts, ratings, review quotes and artisan names are sample copy. Publishing
  them as-is would be a false claim about the business.
- Replace the stock photography with your own product shots.
- Wire the contact and newsletter forms to a real endpoint.
- Add the Privacy Policy and Terms pages the footer already links to.
- Connect a payment provider, or move the catalogue onto a hosted cart.
