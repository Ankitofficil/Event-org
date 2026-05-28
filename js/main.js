// Mark JS as ready (enables fade-up hidden initial state)
document.documentElement.classList.add('js-ready');

// Safety net: force-reveal any fade-up still hidden after 4s
setTimeout(() => {
  document.querySelectorAll('.fade-up:not(.in)').forEach(el => el.classList.add('in'));
}, 4000);

// =====================================
// Mobile nav toggle
// =====================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// =====================================
// Fade-up on scroll
// =====================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// =====================================
// Contact form (demo)
// =====================================
const form = document.querySelector('#enquiry-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Enquiry sent! We will WhatsApp you shortly.';
      btn.style.background = 'linear-gradient(135deg, #00ffd1, #6d2bff)';
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
      }, 4000);
    }, 900);
  });
}

// =====================================
// Events page filter
// =====================================
const filterButtons = document.querySelectorAll('[data-filter]');
const eventCards = document.querySelectorAll('[data-tags]');
if (filterButtons.length && eventCards.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      eventCards.forEach(card => {
        const tags = card.dataset.tags.split(',');
        const show = filter === 'all' || tags.includes(filter);
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// =====================================
// HOME PAGE — Word-by-word headline reveal
// =====================================
const headline = document.getElementById('hero-headline');
if (headline) {
  const html = headline.innerHTML;
  // Split on spaces, preserving the gradient-text span as one unit
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const wrapNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      const words = node.textContent.split(/(\s+)/);
      words.forEach(w => {
        if (w.trim()) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        } else if (w) {
          frag.appendChild(document.createTextNode(w));
        }
      });
      return frag;
    } else {
      // Element — wrap each child word inside it
      const clone = node.cloneNode(false);
      clone.classList?.add('word');
      clone.textContent = node.textContent;
      return clone;
    }
  };
  const out = document.createDocumentFragment();
  Array.from(tmp.childNodes).forEach(child => out.appendChild(wrapNode(child)));
  headline.innerHTML = '';
  headline.appendChild(out);
  // Stagger animation
  headline.querySelectorAll('.word').forEach((w, i) => {
    w.style.animationDelay = (0.4 + i * 0.08) + 's';
  });
}

// =====================================
// HOME PAGE — Countdown
// =====================================
const countdownEl = document.getElementById('countdown');
if (countdownEl) {
  const target = new Date(countdownEl.dataset.target).getTime();
  const units = {
    days: countdownEl.querySelector('[data-unit=days]'),
    hours: countdownEl.querySelector('[data-unit=hours]'),
    minutes: countdownEl.querySelector('[data-unit=minutes]'),
    seconds: countdownEl.querySelector('[data-unit=seconds]'),
  };
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(units).forEach(u => u.textContent = '00');
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    units.days.textContent = pad(d);
    units.hours.textContent = pad(h);
    units.minutes.textContent = pad(m);
    units.seconds.textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
}

// =====================================
// HOME PAGE — Stat count-up
// =====================================
const counters = document.querySelectorAll('.stat-value[data-count]');
if (counters.length) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      el.classList.add('counting');
      const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.floor(target * eased);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => statObserver.observe(c));
}

// =====================================
// HOME PAGE — Cursor glow follows pointer (desktop only)
// =====================================
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let raf = null;
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 3;
  let currX = targetX, currY = targetY;
  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  const loop = () => {
    currX += (targetX - currX) * 0.12;
    currY += (targetY - currY) * 0.12;
    cursorGlow.style.transform = `translate(${currX}px, ${currY}px) translate(-50%, -50%)`;
    if (Math.abs(targetX - currX) > 0.5 || Math.abs(targetY - currY) > 0.5) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  };
  loop();
}

// =====================================
// HOME PAGE — 3D tilt on event cards (desktop only)
// =====================================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}
