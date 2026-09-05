/* Xomexo — front-end behaviour.
   No framework, no build step. Everything degrades to plain HTML if JS is off. */
(function () {
  'use strict';

  var PRODUCTS = window.XOMEXO_PRODUCTS || [];
  var CART_KEY = 'xomexo.cart.v1';

  /* ---------------------------------------------------------------- utils */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function money(paise) {
    return '₹' + Number(paise).toLocaleString('en-IN');
  }

  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) return PRODUCTS[i]; }
    return null;
  }

  function starRow(rating, reviews) {
    var full = Math.round(rating);
    var s = '';
    for (var i = 0; i < 5; i++) { s += i < full ? '★' : '☆'; }
    return '<span class="stars">' + s + '<small>' + rating.toFixed(1) +
      (reviews != null ? ' (' + reviews + ')' : '') + '</small></span>';
  }

  /* ----------------------------------------------------------------- cart */

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }

  function writeCart(lines) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch (e) { /* private mode */ }
    paintCart(lines);
  }

  function addToCart(id, qty) {
    var product = byId(id);
    if (!product || product.stock === 0) return;
    var lines = readCart();
    var hit = null;
    for (var i = 0; i < lines.length; i++) { if (lines[i].id === id) hit = lines[i]; }
    if (hit) { hit.qty += (qty || 1); }
    else { lines.push({ id: id, qty: qty || 1 }); }
    writeCart(lines);
    toast(product.name + ' added to your cart');
    openDrawer();
  }

  function removeFromCart(id) {
    writeCart(readCart().filter(function (l) { return l.id !== id; }));
  }

  function bumpQty(id, delta) {
    var lines = readCart();
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === id) {
        lines[i].qty += delta;
        if (lines[i].qty < 1) { lines.splice(i, 1); }
        break;
      }
    }
    writeCart(lines);
  }

  function paintCart(lines) {
    lines = lines || readCart();
    var count = lines.reduce(function (n, l) { return n + l.qty; }, 0);
    var total = lines.reduce(function (n, l) {
      var p = byId(l.id); return n + (p ? p.price * l.qty : 0);
    }, 0);

    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.style.display = count ? '' : 'none';
    });

    var body = $('[data-cart-body]');
    if (!body) return;

    if (!lines.length) {
      body.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p>' +
        '<a class="btn btn--ghost btn--sm" href="shop.html">Continue Shopping</a></div>';
    } else {
      body.innerHTML = lines.map(function (l) {
        var p = byId(l.id);
        if (!p) return '';
        return '<div class="cart-line">' +
          '<img src="' + p.img + '" alt="' + p.name + '">' +
          '<div><h4>' + p.name + '</h4>' +
          '<p>' + money(p.price) + ' &middot; qty ' + l.qty + '</p>' +
          '<button type="button" data-cart-dec="' + p.id + '">&minus;</button> ' +
          '<button type="button" data-cart-inc="' + p.id + '">+</button> ' +
          '<button type="button" data-cart-remove="' + p.id + '">Remove</button></div>' +
          '<strong>' + money(p.price * l.qty) + '</strong>' +
          '</div>';
      }).join('');
    }

    var totalEl = $('[data-cart-total]');
    if (totalEl) totalEl.textContent = money(total);
    var checkout = $('[data-checkout]');
    if (checkout) checkout.disabled = !lines.length;
  }

  /* --------------------------------------------------------------- drawer */

  function openDrawer() {
    var d = $('[data-drawer]'), b = $('[data-drawer-backdrop]');
    if (!d) return;
    d.classList.add('is-open');
    if (b) b.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    var d = $('[data-drawer]'), b = $('[data-drawer-backdrop]');
    if (!d) return;
    d.classList.remove('is-open');
    if (b) b.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
  }

  /* ---------------------------------------------------------------- toast */

  var toastTimer;
  function toast(msg) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-open'); }, 2600);
  }

  /* --------------------------------------------------------- product card */

  function cardHTML(p) {
    var tag = '';
    if (p.stock === 0) tag = '<span class="pcard-tag pcard-tag--out">Sold out</span>';
    else if (p.badge === 'Sale') tag = '<span class="pcard-tag pcard-tag--sale">Sale</span>';
    else if (p.badge) tag = '<span class="pcard-tag">' + p.badge + '</span>';

    var price = p.compareAt
      ? '<s>' + money(p.compareAt) + '</s>' + money(p.price)
      : money(p.price);

    var action = p.stock === 0
      ? '<button class="btn btn--sm btn--block" type="button" disabled>Sold out</button>'
      : '<button class="btn btn--sm btn--block" type="button" data-add="' + p.id + '">Add to Cart</button>';

    return '<article class="pcard reveal">' +
      '<div class="pcard-media">' + tag +
      '<a href="product.html?id=' + p.id + '"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></a>' +
      '<div class="pcard-quick">' + action + '</div>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<span class="pcard-cat">' + p.category + '</span>' +
      '<h3 class="pcard-title"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
      '<div class="pcard-price">' + price + '</div>' +
      starRow(p.rating, p.reviews) +
      '</div></article>';
  }

  function renderInto(el, list) {
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><p>No products match your filters.</p>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-clear-filters>Clear Filters</button></div>';
    } else {
      el.innerHTML = list.map(cardHTML).join('');
    }
    observeReveals(el);
  }

  /* ------------------------------------------------------- home page grid */

  function initFeatured() {
    $$('[data-featured]').forEach(function (el) {
      var ids = (el.getAttribute('data-featured') || '').split(',').filter(Boolean);
      var list = ids.length ? ids.map(byId).filter(Boolean) : PRODUCTS.slice(0, 4);
      renderInto(el, list);
    });
  }

  /* ------------------------------------------------------------ shop page */

  function initShop() {
    var grid = $('[data-shop-grid]');
    if (!grid) return;

    var countEl = $('[data-result-count]');
    var sortEl = $('[data-sort]');

    function activeCats() {
      return $$('[data-filter-cat]:checked').map(function (i) { return i.value; });
    }
    function activePrices() {
      return $$('[data-filter-price]:checked').map(function (i) { return i.value; });
    }
    function inPrice(p) {
      var bands = activePrices();
      if (!bands.length) return true;
      return bands.some(function (b) {
        var parts = b.split('-');
        var lo = Number(parts[0]);
        var hi = parts[1] === '' ? Infinity : Number(parts[1]);
        return p.price >= lo && p.price <= hi;
      });
    }

    function apply() {
      var cats = activeCats();
      var list = PRODUCTS.filter(function (p) {
        return (!cats.length || cats.indexOf(p.cat) > -1) && inPrice(p);
      });

      var sort = sortEl ? sortEl.value : 'featured';
      if (sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
      if (sort === 'new') list.sort(function (a, b) { return (b.badge === 'New') - (a.badge === 'New'); });

      renderInto(grid, list);
      if (countEl) {
        countEl.textContent = list.length + (list.length === 1 ? ' product' : ' products');
      }

      // reflect the filter state in the URL so the view can be shared
      var q = cats.length ? '?cat=' + cats.join(',') : '';
      history.replaceState(null, '', location.pathname + q);
    }

    // preselect from ?cat=
    var pre = new URLSearchParams(location.search).get('cat');
    if (pre) {
      pre.split(',').forEach(function (c) {
        var box = $('[data-filter-cat][value="' + c + '"]');
        if (box) box.checked = true;
      });
    }

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-filter-cat], [data-filter-price], [data-sort]')) apply();
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear-filters]')) {
        $$('[data-filter-cat], [data-filter-price]').forEach(function (i) { i.checked = false; });
        apply();
      }
    });

    apply();
  }

  /* --------------------------------------------------------- product page */

  function initProduct() {
    var root = $('[data-pdp]');
    if (!root) return;

    var id = new URLSearchParams(location.search).get('id');
    var p = byId(id) || PRODUCTS[0];

    document.title = p.name + ' | Xomexo';

    var crumb = $('[data-crumb-name]');
    if (crumb) crumb.textContent = p.name;

    // Product structured data, so the listing can show price and rating in search
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: location.origin + '/' + p.img,
      description: p.lead,
      brand: { '@type': 'Brand', name: 'Xomexo' },
      material: p.material,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: p.price,
        availability: p.stock === 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: p.rating,
        reviewCount: p.reviews
      }
    });
    document.head.appendChild(ld);

    var views = [
      { src: p.img, pos: 'center' },
      { src: p.img, pos: 'top' },
      { src: p.img, pos: 'bottom' },
      { src: 'assets/img/photos/workshop.jpg', pos: 'center' }
    ];

    var priceHTML = p.compareAt
      ? '<s>' + money(p.compareAt) + '</s>' + money(p.price)
      : money(p.price);

    root.innerHTML =
      '<div>' +
        '<div class="gallery-main"><img id="pdp-main" src="' + views[0].src + '" alt="' + p.name + '"></div>' +
        '<div class="gallery-thumbs" role="tablist">' +
          views.map(function (v, i) {
            return '<button role="tab" type="button" aria-selected="' + (i === 0) + '" data-view="' + i + '">' +
              '<img src="' + v.src + '" alt="View ' + (i + 1) + ' of ' + p.name + '" style="object-position:' + v.pos + '"></button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div>' +
        '<p class="eyebrow">' + p.category + '</p>' +
        '<h1 style="font-size:clamp(1.9rem,3.4vw,2.6rem)">' + p.name + '</h1>' +
        starRow(p.rating, p.reviews) +
        '<div class="pdp-price">' + priceHTML + '</div>' +
        '<p class="lede">' + p.lead + '</p>' +
        '<p class="pcard-cat">Finish</p>' +
        '<div class="swatches">' + p.colors.map(function (c, i) {
          return '<button class="swatch" type="button" style="background:' + c + '" aria-pressed="' + (i === 0) + '" aria-label="Finish ' + (i + 1) + '"></button>';
        }).join('') + '</div>' +
        '<div class="buy-row">' +
          '<div class="qty"><button type="button" data-qty="-1">&minus;</button><span data-qty-value>1</span><button type="button" data-qty="1">+</button></div>' +
          (p.stock === 0
            ? '<button class="btn btn--primary" type="button" disabled>Sold out</button>'
            : '<button class="btn btn--primary" type="button" data-add-detail="' + p.id + '">Add to Cart</button>') +
        '</div>' +
        '<p class="form-note">' + (p.stock === 0
            ? 'Currently out of stock. Expected back in about three weeks.'
            : (p.stock < 10 ? 'Hurry, only ' + p.stock + ' left in stock.' : 'In stock. Dispatched within 2 working days.')) +
        '</p>' +
        '<div class="accordion">' +
          '<details open><summary>Description</summary><div class="acc-body">' + p.story + '</div></details>' +
          '<details><summary>Product Details</summary><div class="acc-body"><ul class="spec-list">' +
            '<li><span>Material</span><span>' + p.material + '</span></li>' +
            '<li><span>Dimensions</span><span>' + p.dims + '</span></li>' +
            '<li><span>Made in</span><span>' + p.origin + '</span></li>' +
            '<li><span>Artisan</span><span>' + p.artisan + '</span></li>' +
          '</ul></div></details>' +
          '<details><summary>Care Instructions</summary><div class="acc-body">' + p.care + '</div></details>' +
          '<details><summary>Shipping &amp; Returns</summary><div class="acc-body">Free shipping across India on orders over ' + money(2500) + '. Delivered in 3&ndash;6 working days. Worldwide shipping from ' + money(1900) + '. Returns accepted within 15 days, unused and in its original packing.</div></details>' +
        '</div>' +
      '</div>';

    // gallery
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-view]');
      if (t) {
        var v = views[Number(t.getAttribute('data-view'))];
        var main = $('#pdp-main');
        main.src = v.src;
        main.style.objectPosition = v.pos;
        $$('[data-view]', root).forEach(function (b) { b.setAttribute('aria-selected', b === t); });
      }
      var sw = e.target.closest('.swatch');
      if (sw) { $$('.swatch', root).forEach(function (b) { b.setAttribute('aria-pressed', b === sw); }); }
    });

    // quantity
    var qty = 1;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]');
      if (!b) return;
      qty = Math.max(1, qty + Number(b.getAttribute('data-qty')));
      $('[data-qty-value]', root).textContent = qty;
    });

    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add-detail]');
      if (b) addToCart(b.getAttribute('data-add-detail'), qty);
    });

    // related
    var rel = $('[data-related]');
    if (rel) {
      renderInto(rel, PRODUCTS.filter(function (x) {
        return x.cat === p.cat && x.id !== p.id;
      }).concat(PRODUCTS.filter(function (x) {
        return x.cat !== p.cat;
      })).slice(0, 4));
    }
  }

  /* --------------------------------------------------------------- reveal */

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;

  function observeReveals(root) {
    var nodes = $$('.reveal', root || document);
    if (!io) { nodes.forEach(function (n) { n.classList.add('is-in'); }); return; }
    nodes.forEach(function (n, i) {
      n.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(n);
    });
  }

  /* ----------------------------------------------------------------- init */

  document.addEventListener('DOMContentLoaded', function () {
    initFeatured();
    initShop();
    initProduct();
    paintCart();
    observeReveals();

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // mobile nav
    var burger = $('[data-burger]');
    if (burger) {
      burger.addEventListener('click', function () {
        var nav = $('[data-nav]');
        var open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open);
      });
    }

    // global click handlers
    document.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) { e.preventDefault(); addToCart(add.getAttribute('data-add'), 1); return; }

      if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openDrawer(); return; }
      if (e.target.closest('[data-close-cart]') || e.target.closest('[data-drawer-backdrop]')) { closeDrawer(); return; }

      var rm = e.target.closest('[data-cart-remove]');
      if (rm) { removeFromCart(rm.getAttribute('data-cart-remove')); return; }
      var inc = e.target.closest('[data-cart-inc]');
      if (inc) { bumpQty(inc.getAttribute('data-cart-inc'), 1); return; }
      var dec = e.target.closest('[data-cart-dec]');
      if (dec) { bumpQty(dec.getAttribute('data-cart-dec'), -1); return; }

      if (e.target.closest('[data-checkout]')) {
        toast('Online checkout is coming soon. Please call or WhatsApp +91 11 4050 2288 to place this order.');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    // forms — no backend yet, so acknowledge and reset
    $$('form[data-fake-submit]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        toast(form.getAttribute('data-fake-submit') || 'Thanks — we will be in touch.');
        form.reset();
      });
    });
  });
})();
