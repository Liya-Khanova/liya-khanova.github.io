/* =====================================================================
   Liya profile (multipage) — minimal interactivity:
   - theme toggle (light/dark, system aware)
   - sticky header shadow on scroll
   - mobile menu
   - scroll reveal
   - Telegram embeds: read assets/data/posts.json (no backend, no token).
     Each entry is a public Telegram post URL. We mount the official
     widget script (https://telegram.org/js/telegram-widget.js) which
     produces a sandboxed iframe — safe for GitHub Pages.
   ===================================================================== */

/* ---------- Theme toggle ---------- */
(function () {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');

  const SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
  const MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  apply(theme);

  function apply(t) {
    root.setAttribute('data-theme', t);
    if (toggle) {
      toggle.innerHTML = t === 'dark' ? SUN : MOON;
      toggle.setAttribute(
        'aria-label',
        t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
      );
    }
  }
  toggle &&
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      apply(theme);
    });
})();

/* ---------- Sticky header shadow ---------- */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Mobile menu ---------- */
(function () {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
    if (open) nav.setAttribute('hidden', '');
    else nav.removeAttribute('hidden');
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Открыть меню');
      nav.setAttribute('hidden', '');
    })
  );
})();

/* ---------- Scroll reveal ---------- */
(function () {
  const targets = document.querySelectorAll(
    '.section, .principle, .project-card, .thought-post, .timeline li, .contact-card, .pullquote, .manifesto, .highlight, .tg-card, .tg-block'
  );
  targets.forEach((el) => el.setAttribute('data-reveal', ''));

  if (
    !('IntersectionObserver' in window) ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach((el) => io.observe(el));
})();

/* =====================================================================
   Telegram feed mount — safe, GitHub-Pages compatible.

   Architecture decisions:
   - No Bot API tokens in the browser. (Forbidden.)
   - No third-party scrapers. We rely on Telegram's own widget script.
   - Source of truth: a static file `assets/data/posts.json` of the form
     {
       "channel": "liya_khanova",
       "posts": [
         { "url": "https://t.me/liya_khanova/12", "caption": "опционально" },
         ...
       ]
     }
   - When `posts` is non-empty, each entry is rendered using Telegram's
     official embed widget (telegram-widget.js with data-telegram-post).
     This produces a sandboxed iframe — no secrets, no CORS issues.
   - When `posts` is empty (or the file is absent / hasn't been updated
     yet), we render fallback "open in Telegram" cards instead — so the
     section never looks broken.
   - Optional automation: a GitHub Actions workflow can update posts.json
     on a schedule (a maintainer-friendly path that requires a PAT in
     repository secrets — strictly server-side, never shipped to the
     browser).
   ===================================================================== */
(function () {
  const grid = document.getElementById('tg-feed-grid');
  if (!grid) return; // not on /thoughts.html

  const channel = 'liya_khanova';

  // Render fallback "open in Telegram" cards
  function renderFallback(reason) {
    const messages = [
      {
        kicker: 'о команде',
        text: 'Команда чувствует то, что лидер прячет. Невысказанная тревога руководителя становится культурой.',
      },
      {
        kicker: 'о росте',
        text: 'Если ты не замечаешь, чем платишь за рост, — ты, скорее всего, платишь людьми.',
      },
      {
        kicker: 'о наставничестве',
        text: 'Хороший наставник не спасает. Он стоит рядом, пока ты сам решаешь.',
      },
    ];
    grid.innerHTML = messages
      .map(
        (m) => `
        <article class="tg-card">
          <div class="tg-card__placeholder">
            <span>${m.kicker} · в Telegram</span>
            <p>«${m.text}»</p>
            <a href="https://t.me/${channel}" target="_blank" rel="noopener">Читать в Telegram →</a>
          </div>
        </article>`
      )
      .join('');
    if (reason) console.info('[tg-feed] fallback:', reason);
  }

  // Mount Telegram official widget for a single post.
  // Format expected: https://t.me/<channel>/<message_id>
  function mountEmbed(card, postUrl) {
    try {
      const m = String(postUrl).match(/t\.me\/([^/]+)\/(\d+)/);
      if (!m) return false;
      const handle = m[1];
      const id = m[2];

      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://telegram.org/js/telegram-widget.js?22';
      s.setAttribute('data-telegram-post', `${handle}/${id}`);
      s.setAttribute('data-width', '100%');
      s.setAttribute('data-dark', document.documentElement.dataset.theme === 'dark' ? '1' : '0');
      card.appendChild(s);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Attempt to fetch posts.json. If unavailable / empty / invalid → fallback.
  fetch('assets/data/posts.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
    .then((data) => {
      const posts = (data && Array.isArray(data.posts) ? data.posts : []).filter(
        (p) => p && typeof p.url === 'string' && p.url.includes('t.me/')
      );
      if (!posts.length) return renderFallback('no posts in posts.json');

      grid.innerHTML = '';
      posts.slice(0, 6).forEach((p) => {
        const card = document.createElement('article');
        card.className = 'tg-card';
        const ok = mountEmbed(card, p.url);
        if (!ok) {
          card.innerHTML = `
            <div class="tg-card__placeholder">
              <span>Telegram</span>
              <p>${(p.caption || 'Пост в канале').replace(/</g, '&lt;')}</p>
              <a href="${p.url}" target="_blank" rel="noopener">Открыть пост →</a>
            </div>`;
        }
        grid.appendChild(card);
      });
    })
    .catch((err) => renderFallback(err && err.message));
})();
