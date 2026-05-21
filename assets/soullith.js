/* ============================================================
   SOUL LITH — Global JavaScript (Unified & Bug-Fixed)
   Single IIFE, single DOMContentLoaded, standardized is-visible
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Cached elements ──────────────────────────────────── */
    var siteHeader        = document.getElementById('sl-site-header');
    var mainHeader        = siteHeader ? siteHeader.querySelector('.sl-main-header') : null;
    var hamburger         = document.getElementById('sl-mobile-open');
    var mobileMenu        = document.getElementById('sl-mobile-nav');
    var dimOverlay        = document.getElementById('sl-dim-overlay');
    var mobileCloseBtn    = document.getElementById('sl-mobile-close');
    var announcementBar   = document.getElementById('sl-announcement-bar');
    var announcementClose = document.getElementById('sl-announcement-close');

    /* ── Prevent # links ──────────────────────────────────── */
    document.addEventListener('click', function (e) {
      var link = e.target && typeof e.target.closest === 'function'
        ? e.target.closest('a[href="#"]') : null;
      if (link) e.preventDefault();
    });

    /* ── Header height sync ───────────────────────────────── */
    function syncHeaderHeight() {
      if (siteHeader) {
        document.documentElement.style.setProperty(
          '--header-height', siteHeader.offsetHeight + 'px'
        );
      }
    }
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    window.addEventListener('load', syncHeaderHeight);
    requestAnimationFrame(syncHeaderHeight);

    /* ── Dim overlay helpers ──────────────────────────────── */
    /* Standardized: always use is-visible (not is-open)       */
    function showDim() {
      if (dimOverlay) dimOverlay.classList.add('is-visible');
    }
    function hideDim() {
      var mobOpen     = mobileMenu && mobileMenu.classList.contains('is-open');
      var desktopOpen = document.querySelector('.sl-mega-panel.is-open, .sl-has-dropdown.is-open');
      if (!mobOpen && !desktopOpen && dimOverlay) {
        dimOverlay.classList.remove('is-visible');
      }
    }

    /* ══════════════════════════════════════════════════════
       MOBILE MENU
    ══════════════════════════════════════════════════════ */
    function openMobile() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('is-open');
      if (hamburger) hamburger.classList.add('is-open');
      showDim();
      document.body.style.overflow    = 'hidden';
      document.body.style.touchAction = 'none';
    }

    function closeMobile() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('is-open');
      if (hamburger) hamburger.classList.remove('is-open');
      hideDim();
      document.body.style.overflow    = '';
      document.body.style.touchAction = '';
    }

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        mobileMenu && mobileMenu.classList.contains('is-open') ? closeMobile() : openMobile();
      });
    }
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobile);
    if (dimOverlay) {
      dimOverlay.addEventListener('click', function () {
        closeMobile();
        closeAllDesktop();
      });
    }
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMobile();
    });

    /* ── Announcement bar dismiss ─────────────────────────── */
    if (announcementBar && announcementClose && siteHeader && mainHeader) {
      announcementClose.addEventListener('click', function () {
        var startH  = siteHeader.offsetHeight;
        var targetH = mainHeader.offsetHeight;
        siteHeader.style.height   = startH + 'px';
        siteHeader.style.overflow = 'hidden';
        announcementBar.style.display = 'none';
        document.documentElement.style.setProperty('--header-height', targetH + 'px');
        requestAnimationFrame(function () { siteHeader.style.height = targetH + 'px'; });
        siteHeader.addEventListener('transitionend', function finish(ev) {
          if (ev.propertyName !== 'height') return;
          siteHeader.style.height   = '';
          siteHeader.style.overflow = '';
          syncHeaderHeight();
          siteHeader.removeEventListener('transitionend', finish);
        });
      });
    }

    /* ══════════════════════════════════════════════════════
       DESKTOP NAV — Mega panels & dropdowns
       Hover listens on mainHeader (not individual items)
       so cursor moving trigger → panel never flickers.
    ══════════════════════════════════════════════════════ */
    var navItems   = document.querySelectorAll('.sl-nav-item[data-mega]');
    var megaPanels = document.querySelectorAll('.sl-mega-panel');
    var dropItems  = document.querySelectorAll('.sl-has-dropdown');
    var closeTimer = null;

    function closeAllDesktop() {
      clearTimeout(closeTimer);
      megaPanels.forEach(function (p) { p.classList.remove('is-open'); });
      navItems.forEach(function (i) {
        i.classList.remove('is-open');
        var b = i.querySelector('[aria-expanded]');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      dropItems.forEach(function (i) {
        i.classList.remove('is-open');
        var b = i.querySelector('[aria-expanded]');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      hideDim();
    }

    function openMega(key) {
      closeAllDesktop();
      var panel   = document.querySelector('.sl-mega-panel[data-panel="' + key + '"]');
      var navItem = document.querySelector('.sl-nav-item[data-mega="' + key + '"]');
      if (!panel || !navItem) return;
      panel.classList.add('is-open');
      navItem.classList.add('is-open');
      var b = navItem.querySelector('[aria-expanded]');
      if (b) b.setAttribute('aria-expanded', 'true');

    }

    function openDropdown(item) {
      closeAllDesktop();
      item.classList.add('is-open');
      var b = item.querySelector('[aria-expanded]');
      if (b) b.setAttribute('aria-expanded', 'true');

    }

    /* Hover */
    navItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        openMega(item.dataset.mega);
      });
    });
    dropItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        openDropdown(item);
      });
    });
    if (mainHeader) {
      mainHeader.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(closeAllDesktop, 180);
      });
      mainHeader.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
      });
    }

    /* Bridge: keep panels/dropdowns alive when cursor moves into them */
    megaPanels.forEach(function (panel) {
      panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      panel.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeAllDesktop, 180); });
    });
    document.querySelectorAll('.sl-dropdown').forEach(function (dd) {
      dd.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      dd.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeAllDesktop, 180); });
    });

    /* Click / keyboard */
    navItems.forEach(function (item) {
      var t = item.querySelector('.sl-nav-trigger');
      if (t) t.addEventListener('click', function (e) {
        e.stopPropagation();
        item.classList.contains('is-open') ? closeAllDesktop() : openMega(item.dataset.mega);
      });
    });
    dropItems.forEach(function (item) {
      var t = item.querySelector('.sl-nav-trigger');
      if (t) t.addEventListener('click', function (e) {
        e.stopPropagation();
        item.classList.contains('is-open') ? closeAllDesktop() : openDropdown(item);
      });
    });

    /* Outside click */
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.sl-main-header')) closeAllDesktop();
    });

    /* ══════════════════════════════════════════════════════
       MOBILE ACCORDION
    ══════════════════════════════════════════════════════ */
    var accordions = document.querySelectorAll('.sl-mob-accordion');
    accordions.forEach(function (acc) {
      var trigger = acc.querySelector('.sl-mob-trigger');
      var panel   = acc.querySelector('.sl-mob-panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = acc.classList.contains('is-open');
        accordions.forEach(function (other) {
          if (other === acc) return;
          other.classList.remove('is-open');
          var op = other.querySelector('.sl-mob-panel');
          if (op) op.hidden = true;
          var ob = other.querySelector('[aria-expanded]');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        });
        if (isOpen) {
          acc.classList.remove('is-open');
          panel.hidden = true;
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          acc.classList.add('is-open');
          panel.hidden = false;
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ══════════════════════════════════════════════════════
       PREDICTIVE SEARCH
    ══════════════════════════════════════════════════════ */
    var searchOverlay = document.getElementById('sl-search-overlay');
    var searchInput   = document.getElementById('sl-search-input');
    var searchResults = document.getElementById('sl-search-results');
    var searchHint    = document.getElementById('sl-search-hint');
    var searchClose   = document.getElementById('sl-search-close');
    var searchTrigger = document.getElementById('sl-search-trigger');
    var searchTrigMob = document.getElementById('sl-search-trigger-mobile');

    function openSearch() {
      if (!searchOverlay || !searchInput) return;
      searchOverlay.classList.add('is-open');
      searchOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { searchInput.focus(); }, 350);
    }

    function closeSearch() {
      if (!searchOverlay || !searchInput) return;
      searchOverlay.classList.remove('is-open');
      searchOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
      if (searchHint) searchHint.style.opacity = '1';
    }

    if (searchOverlay && searchInput) {
      var synonyms = {
        'purple':'amethyst','violet':'amethyst','pink':'rose quartz','rose':'rose quartz',
        'green':'aventurine','luck':'aventurine','black':'tourmaline','dark':'obsidian',
        'yellow':'citrine','golden':'citrine','orange':'carnelian','red':'carnelian',
        'white':'selenite','clear':'clear quartz','blue':'lapis lazuli',
        'protection':'tourmaline obsidian','love':'rose quartz','heart':'rose quartz',
        'abundance':'citrine pyrite','money':'citrine pyrite','wealth':'pyrite','prosperity':'citrine',
        'healing':'quartz','health':'quartz','sleep':'amethyst','insomnia':'amethyst lepidolite',
        'anxiety':'amethyst lepidolite','stress':'amethyst','calm':'blue lace agate',
        'energy':'carnelian','focus':'fluorite','clarity':'clear quartz',
        'spiritual':'crystal','meditation':'amethyst quartz','ball':'sphere','wand':'tower',
        'stick':'tower','necklace':'pendant','chain':'pendant',
        'jewellery':'bracelet pendant','jewelry':'bracelet pendant',
        'rough':'raw','natural':'raw','unpolished':'raw','polished':'tumble','smooth':'tumble',
        'tree':'crystal tree','plant':'crystal tree','pyramid':'pyramid','orgone':'orgone pyramid',
        'chakra':'chakra','7 chakra':'7 chakra','shree':'shree yantra','yantra':'shree yantra',
        'salt lamp':'salt lamp'
      };

      function lev(a, b) {
        if (!a.length) return b.length;
        if (!b.length) return a.length;
        var dp = [];
        for (var i = 0; i <= b.length; i++) dp[i] = [i];
        for (var j = 0; j <= a.length; j++) dp[0][j] = j;
        for (var i = 1; i <= b.length; i++)
          for (var j = 1; j <= a.length; j++)
            dp[i][j] = b[i-1] === a[j-1] ? dp[i-1][j-1]
              : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        return dp[b.length][a.length];
      }

      function expandQuery(raw) {
        var q = raw.toLowerCase().trim(), extra = [];
        Object.keys(synonyms).forEach(function (k) {
          if (q === k || q.indexOf(k) !== -1) extra.push(synonyms[k]);
        });
        q.split(/\s+/).forEach(function (word) {
          if (word.length < 4) return;
          Object.keys(synonyms).forEach(function (k) {
            if (k.indexOf(' ') !== -1) return;
            if (lev(word, k) === 1) extra.push(synonyms[k]);
          });
        });
        return extra.length ? q + ' ' + extra.join(' ') : q;
      }

      var searchTimer = null;
      function doSearch(raw) {
        clearTimeout(searchTimer);
        var q = raw.trim();
        if (q.length < 2) {
          if (searchResults) searchResults.innerHTML = '';
          if (searchHint) searchHint.style.opacity = '1';
          return;
        }
        if (searchHint) searchHint.style.opacity = '0';
        if (searchResults) searchResults.innerHTML = '<div class="sl-search-loading">Searching...</div>';
        searchTimer = setTimeout(function () {
          fetch('/search/suggest.json?q=' + encodeURIComponent(expandQuery(q))
            + '&resources[type]=product&resources[limit]=6'
            + '&resources[options][unavailable_products]=last'
            + '&resources[options][fields]=title,product_type,variants.title,tag')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              var products = (data.resources && data.resources.results && data.resources.results.products) || [];
              if (!products.length) {
                searchResults.innerHTML = '<div class="sl-search-no-results">No results for "<em>' + raw + '</em>" — try a stone name or intention.</div>';
                return;
              }
              var html = '';
              products.forEach(function (p) {
                var img = p.featured_image
                  ? '<img src="' + p.featured_image.url + '" alt="' + (p.featured_image.alt || '') + '" class="sl-search-result-img" loading="lazy">'
                  : '<div class="sl-search-result-img-placeholder"></div>';
                var price = p.price ? '₹' + parseInt(p.price, 10).toLocaleString('en-IN') : '';
                html += '<a href="' + p.url + '" class="sl-search-result-item">'
                  + img + '<div class="sl-search-result-info">'
                  + (p.product_type ? '<div class="sl-search-result-type">' + p.product_type + '</div>' : '')
                  + '<div class="sl-search-result-title">' + p.title + '</div>'
                  + (price ? '<div class="sl-search-result-price">' + price + '</div>' : '')
                  + '</div></a>';
              });
              html += '<a href="/search?q=' + encodeURIComponent(q) + '&type=product" class="sl-search-result-item" style="justify-content:center;color:var(--rose);font-family:\'Jost\',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;border-bottom:none;">View All Results →</a>';
              searchResults.innerHTML = html;
            })
            .catch(function () {
              searchResults.innerHTML = '<div class="sl-search-no-results">Something went wrong. Try again.</div>';
            });
        }, 280);
      }

      if (searchTrigger)  searchTrigger.addEventListener('click', openSearch);
      if (searchTrigMob)  searchTrigMob.addEventListener('click', openSearch);
      if (searchClose)    searchClose.addEventListener('click', closeSearch);
      searchInput.addEventListener('input', function () { doSearch(this.value); });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.value.trim())
          window.location.href = '/search?q=' + encodeURIComponent(this.value.trim()) + '&type=product';
      });
    }

    /* ── Global Escape ────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllDesktop();
        closeMobile();
        closeSearch();
        document.body.style.overflow = '';
      }
    });

    /* ══════════════════════════════════════════════════════
       NEWSLETTER AJAX
    ══════════════════════════════════════════════════════ */
    var nlForm = document.getElementById('sl-newsletter-form');
    if (nlForm) {
      var nlEmail = nlForm.querySelector('input[type="email"]');
      var nlBtn   = nlForm.querySelector('button[type="submit"]');
      var nlMsg   = document.createElement('p');
      nlMsg.style.cssText = 'font-family:"Jost",sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:14px;';
      nlForm.appendChild(nlMsg);
      nlEmail.addEventListener('input', function () { nlMsg.textContent = ''; });
      nlForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!nlEmail.value.trim()) {
          nlMsg.style.color = 'var(--rose-dark)';
          nlMsg.textContent = '↑ Please enter your email address';
          return;
        }
        var orig = nlBtn.textContent;
        nlBtn.disabled = true; nlBtn.textContent = 'Subscribing...'; nlMsg.textContent = '';
        fetch(window.location.pathname, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
          body: new URLSearchParams(new FormData(nlForm)).toString()
        })
        .then(function () {
          nlEmail.value = '';
          nlMsg.style.color = 'var(--rose-light)';
          nlMsg.textContent = '✦ You\'re subscribed — welcome to the community';
          nlBtn.textContent = orig; nlBtn.disabled = false;
        })
        .catch(function () {
          nlMsg.style.color = 'var(--rose-dark)';
          nlMsg.textContent = 'Something went wrong — please try again';
          nlBtn.textContent = orig; nlBtn.disabled = false;
        });
      });
    }

    /* ══════════════════════════════════════════════════════
   PRODUCT PAGE — Thumbnail switcher + Zoom + Swipe
══════════════════════════════════════════════════════ */
(function () {
  var thumbs  = document.querySelectorAll('.sl-product-thumb');
  var mainImg = document.getElementById('sl-main-product-image');
  if (!mainImg) return;

  /* ── Collect image sources in thumb order ── */
  var imgSrcs = [];
  thumbs.forEach(function (t) {
    var src = t.getAttribute('data-src');
    if (src) imgSrcs.push(src);
  });
  if (!imgSrcs.length) imgSrcs.push(mainImg.src);

  /* ── Active index tracker ── */
  function getActiveIdx() {
    var idx = 0;
    thumbs.forEach(function (t, i) { if (t.classList.contains('active')) idx = i; });
    return idx;
  }

  function setActiveIdx(idx) {
    idx = (idx + imgSrcs.length) % imgSrcs.length;
    mainImg.src = imgSrcs[idx];
    thumbs.forEach(function (t, i) { t.classList.toggle('active', i === idx); });
    return idx;
  }

  /* ── Thumbnail click ── */
  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () {
      setActiveIdx(i);
    });
  });

  /* ── Build lightbox ── */
  var overlay = document.createElement('div');
  overlay.className = 'sl-zoom-overlay';
  overlay.innerHTML =
    '<button class="sl-zoom-close" aria-label="Close">&times;</button>' +
    '<button class="sl-zoom-nav sl-zoom-prev" aria-label="Previous">&#8592;</button>' +
    '<img class="sl-zoom-img" src="" alt="Product image">' +
    '<button class="sl-zoom-nav sl-zoom-next" aria-label="Next">&#8594;</button>' +
    '<span class="sl-zoom-counter"></span>';
  document.body.appendChild(overlay);

  var zoomImg     = overlay.querySelector('.sl-zoom-img');
  var zoomClose   = overlay.querySelector('.sl-zoom-close');
  var zoomPrev    = overlay.querySelector('.sl-zoom-prev');
  var zoomNext    = overlay.querySelector('.sl-zoom-next');
  var zoomCounter = overlay.querySelector('.sl-zoom-counter');
  var zoomIdx     = 0;

  function updateZoomNav() {
    var multi = imgSrcs.length > 1;
    zoomPrev.style.display  = multi ? '' : 'none';
    zoomNext.style.display  = multi ? '' : 'none';
    zoomCounter.textContent = multi ? (zoomIdx + 1) + ' / ' + imgSrcs.length : '';
  }

  function openZoom(idx) {
    zoomIdx = (idx + imgSrcs.length) % imgSrcs.length;
    zoomImg.src = imgSrcs[zoomIdx];
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateZoomNav();
  }

  function closeZoom() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function stepZoom(dir) {
    zoomIdx = (zoomIdx + dir + imgSrcs.length) % imgSrcs.length;
    zoomImg.style.opacity = '0';
    setTimeout(function () {
      zoomImg.src = imgSrcs[zoomIdx];
      zoomImg.style.opacity = '1';
    }, 150);
    updateZoomNav();
  }

  /* Open on main image click */
  mainImg.addEventListener('click', function () { openZoom(getActiveIdx()); });

  zoomClose.addEventListener('click', closeZoom);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeZoom(); });
  zoomPrev.addEventListener('click', function (e) { e.stopPropagation(); stepZoom(-1); });
  zoomNext.addEventListener('click', function (e) { e.stopPropagation(); stepZoom(1); });

  /* Keyboard in lightbox */
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft')  stepZoom(-1);
    if (e.key === 'ArrowRight') stepZoom(1);
  });

  /* ── Swipe on main image (mobile) ── */
  /* ── Mobile prev/next buttons ── */
  var imgWrapper = mainImg.closest('.sl-product-main-image');
  var btnPrev = null, btnNext = null;
  if (imgWrapper) {
    btnPrev = document.createElement('button');
    btnPrev.className = 'sl-img-nav sl-img-nav-prev';
    btnPrev.setAttribute('aria-label', 'Previous image');
    btnPrev.innerHTML = '&#8592;';
    btnNext = document.createElement('button');
    btnNext.className = 'sl-img-nav sl-img-nav-next';
    btnNext.setAttribute('aria-label', 'Next image');
    btnNext.innerHTML = '&#8594;';
    imgWrapper.appendChild(btnPrev);
    imgWrapper.appendChild(btnNext);

    /* Hide if only 1 image */
    if (imgSrcs.length <= 1) {
      btnPrev.classList.add('sl-hidden');
      btnNext.classList.add('sl-hidden');
    }

    btnPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      setActiveIdx(getActiveIdx() - 1);
    });
    btnNext.addEventListener('click', function (e) {
      e.stopPropagation();
      setActiveIdx(getActiveIdx() + 1);
    });
  }

  /* ── Swipe on main image — pinch-safe ── */
  var tx = 0, ty = 0, isPinch = false;
  mainImg.addEventListener('touchstart', function (e) {
    isPinch = e.touches.length > 1; /* multi-finger = pinch, ignore */
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  mainImg.addEventListener('touchend', function (e) {
    if (isPinch) return; /* skip if it was a pinch gesture */
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    setActiveIdx(getActiveIdx() + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ── Swipe inside lightbox ── */
  var lx = 0, ly = 0;
  overlay.addEventListener('touchstart', function (e) {
    lx = e.touches[0].clientX;
    ly = e.touches[0].clientY;
  }, { passive: true });
  overlay.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - lx;
    var dy = e.changedTouches[0].clientY - ly;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    stepZoom(dx < 0 ? 1 : -1);
  }, { passive: true });

})();

    /* ══════════════════════════════════════════════════════
       AJAX ADD TO CART
    ══════════════════════════════════════════════════════ */
    var VIEW_CART_HTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> View Cart';

    function showToast(msg) {
      var toast = document.getElementById('sl-stock-toast');
      if (!toast) return;
      toast.innerHTML = msg;
      toast.style.display = 'block';
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(function () { toast.style.display = 'none'; }, 3000);
    }

    function updateCartBadge(cart) {
      document.querySelectorAll('.sl-cart-count').forEach(function (b) {
        b.textContent = cart.item_count;
        b.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    }

    function setViewCart(btn) {
      btn.innerHTML = VIEW_CART_HTML;
      btn.disabled = false;
      btn.style.background = 'var(--rose-dark)';
      btn.style.color = 'var(--text)';
      btn.style.borderColor = 'var(--rose-dark)';
      btn.setAttribute('data-in-cart', 'true');
    }

    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        updateCartBadge(cart);
        if (!cart.items || !cart.items.length) return;
        var ids = cart.items.map(function (i) { return String(i.variant_id); });
        document.querySelectorAll('.sl-atc-form').forEach(function (form) {
          var id = form.querySelector('input[name="id"]');
          if (id && ids.indexOf(id.value) !== -1) {
            var btn = form.querySelector('.sl-atc-btn');
            if (btn) setViewCart(btn);
          }
        });
      });

    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form.classList.contains('sl-atc-form')) return;
      e.preventDefault();
      var btn = form.querySelector('.sl-atc-btn');
      if (btn.getAttribute('data-in-cart') === 'true') { window.location.href = '/cart'; return; }
      var orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Adding...';
      btn.style.background = 'var(--rose-dark)'; btn.style.color = 'var(--text)';
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form))
      })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (err) {
          btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; btn.style.color = '';
          showToast(err.description || 'Maximum stock limit reached');
          throw new Error('stock_limit');
        });
        return res.json();
      })
      .then(function () {
        fetch('/cart.js').then(function (r) { return r.json(); }).then(updateCartBadge);
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added!';
        btn.disabled = false;
        setTimeout(function () { setViewCart(btn); }, 1000);
      })
      .catch(function (err) {
        if (err.message === 'stock_limit') return;
        btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; btn.style.color = '';
      });
    });

    /* ══════════════════════════════════════════════════════
       WISHLIST SCROLL LOCK
    ══════════════════════════════════════════════════════ */
    var bodyScrollLocked = false;
    function lockScroll()   { if (!bodyScrollLocked) { document.body.style.overflow = 'hidden'; bodyScrollLocked = true; } }
    function unlockScroll() { if (bodyScrollLocked)  { document.body.style.overflow = ''; bodyScrollLocked = false; } }

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && /wishlist|modal|popup|overlay/i.test((node.className || '') + (node.id || ''))) lockScroll();
        });
        mutation.removedNodes.forEach(function (node) {
          if (node.nodeType === 1 && /wishlist|modal|popup|overlay/i.test((node.className || '') + (node.id || ''))) {
            if (!mobileMenu || !mobileMenu.classList.contains('is-open')) unlockScroll();
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: false });

    /* ══════════════════════════════════════════════════════
       CART QTY BUTTONS
    ══════════════════════════════════════════════════════ */
    // document.querySelectorAll('.sl-cart-qty:not([data-cart-handled])').forEach(function (widget) {
    //   widget.setAttribute('data-cart-handled', 'true');
    //   var input = widget.querySelector('input');
    //   widget.querySelectorAll('button').forEach(function (btn) {
    //     btn.addEventListener('click', function () {
    //       var delta = btn.getAttribute('data-action') === 'minus' ? -1 : 1;
    //       input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
    //     });
    //   });
    // });
    

  }); // end DOMContentLoaded
})();

