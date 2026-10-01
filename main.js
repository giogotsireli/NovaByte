/**
 * NovaByte Landing Page — main.js
 * Handles: Canvas particles, scroll animations,
 *          header scroll, mobile nav, counter animation,
 *          active nav links, contact form validation.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   1. Particle Canvas (Hero Background)
═══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas  = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d');
  const LIME    = 'rgba(168, 255, 62,';
  const NEON    = 'rgba(57,  255, 20,';
  let   W, H, particles, animFrame;
  const PARTICLE_COUNT = window.innerWidth < 768 ? 50 : 100;

  /** Resize handler — keeps canvas pixel-perfect */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /** Create a single particle with random properties */
  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.5 + 0.3,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.6 + 0.1,
      lime:  Math.random() > 0.4,
    };
  }

  /** Initialise particle pool */
  function initParticlePool() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  /** Draw connecting line between two nearby particles */
  function drawConnection(a, b, dist, maxDist) {
    const opacity = (1 - dist / maxDist) * 0.18;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `${LIME}${opacity})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  /** Main render loop */
  function render() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 120;

    particles.forEach((p, i) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw particle
      const color = p.lime ? LIME : NEON;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${p.alpha})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) drawConnection(p, q, dist, maxDist);
      }
    });

    animFrame = requestAnimationFrame(render);
  }

  // Pause canvas when hero leaves viewport
  const heroSection = document.getElementById('hero');
  const canvasObs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animFrame);
      }
    },
    { threshold: 0 }
  );

  // Bootstrap
  resize();
  initParticlePool();
  canvasObs.observe(heroSection || canvas);
  window.addEventListener('resize', () => { resize(); initParticlePool(); }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════
   2. Scroll-triggered Animations (IntersectionObserver)
═══════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  /** Respect reduced-motion preference */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animatables = document.querySelectorAll('[data-animate]');
  if (!animatables.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);

        setTimeout(() => {
          el.classList.add('is-visible');
          observer.unobserve(el); // fire once
        }, delay);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  animatables.forEach((el) => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   3. Sticky Header on Scroll
═══════════════════════════════════════════════════════ */
(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ═══════════════════════════════════════════════════════
   4. Active Navigation Link (Scroll Spy)
═══════════════════════════════════════════════════════ */
(function initScrollSpy() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => observer.observe(s));
})();


/* ═══════════════════════════════════════════════════════
   5. Mobile Navigation Toggle
═══════════════════════════════════════════════════════ */
(function initMobileNav() {
  const toggle  = document.getElementById('nav-toggle');
  const menu    = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'მენიუს დახურვა' : 'მენიუს გახსნა');

    // Animate hamburger → X
    const lines = toggle.querySelectorAll('.hamburger-line');
    if (open) {
      lines[0].style.transform = 'translateY(7px) rotate(45deg)';
      lines[1].style.opacity   = '0';
      lines[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      lines.forEach((l) => { l.style.transform = ''; l.style.opacity = ''; });
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(!menu.classList.contains('is-open'));
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
})();


/* ═══════════════════════════════════════════════════════
   6. Animated Counter (Hero Stats)
═══════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  /**
   * Easing: ease-out quad
   * @param {number} t - progress [0,1]
   */
  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuad(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   7. Smooth Scroll for Anchor Links
═══════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   8. Contact Form — Validation & Submission
═══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit-btn');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  /** Validate a single field, return error string or '' */
  function validateField(id, errorId, rules) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    if (!input || !errorEl) return '';

    let msg = '';
    const val = input.value.trim();

    if (rules.required && !val) {
      msg = 'ეს ველი სავალდებულოა.';
    } else if (rules.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'გთხოვ, შეიყვანე სწორი ელ-ფოსტა.';
    } else if (rules.minLen && val.length < rules.minLen) {
      msg = `მინიმუმ ${rules.minLen} სიმბოლო.`;
    }

    input.classList.toggle('is-invalid', !!msg);
    errorEl.textContent = msg;
    return msg;
  }

  /** Validate all fields, return true if all pass */
  function validateAll() {
    const e1 = validateField('contact-name',    'name-error',    { required: true, minLen: 2 });
    const e2 = validateField('contact-email',   'email-error',   { required: true, email: true });
    const e3 = validateField('contact-message', 'message-error', { required: true, minLen: 10 });
    return !e1 && !e2 && !e3;
  }

  // Live validation on blur
  ['contact-name', 'contact-email', 'contact-message'].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => {
      const errorId = id.replace('contact-', '') + '-error';
      const rules = {};
      if (id === 'contact-name')    Object.assign(rules, { required: true, minLen: 2 });
      if (id === 'contact-email')   Object.assign(rules, { required: true, email: true });
      if (id === 'contact-message') Object.assign(rules, { required: true, minLen: 10 });
      validateField(id, errorId, rules);
    });
  });

  /** Simulate async form submission */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    // Loading state
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Simulate network delay (replace with real fetch)
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Success
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
    successMsg.removeAttribute('hidden');
    form.reset();

    // Scroll success into view
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide success message after 6 seconds
    setTimeout(() => { successMsg.setAttribute('hidden', ''); }, 6000);
  });
})();


/* ═══════════════════════════════════════════════════════
   9. Feature Card — Tilt Effect (mouse only)
═══════════════════════════════════════════════════════ */
(function initTiltEffect() {
  if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

  const cards = document.querySelectorAll('.feature-card');
  const MAX_TILT = 8; // degrees

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -MAX_TILT;
      const rotY   = ((x - cx) / cx) * MAX_TILT;
      card.style.transform   = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
      card.style.transition  = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 300ms cubic-bezier(0.22,1,0.36,1)';
    });
  });
})();
