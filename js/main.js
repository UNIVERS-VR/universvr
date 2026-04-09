/* ============================================================
   UNIVERS VR – JavaScript principal
   ============================================================ */

'use strict';

/* ---- Navbar scroll effect ---- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Active nav link on scroll ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-60px 0px -60px 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ---- Mobile nav toggle ---- */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  const close = () => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  // Close on nav link click
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

/* ---- Scroll reveal animations ---- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ---- Animated counter for hero stats ---- */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target).toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ---- Particle canvas (hero background) ---- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const COLORS = ['rgba(123,47,190,', 'rgba(0,212,255,', 'rgba(155,79,222,'];
  const COUNT  = window.innerWidth < 600 ? 50 : 110;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const createParticle = () => ({
    x:    rand(0, W),
    y:    rand(0, H),
    r:    rand(0.8, 2.5),
    dx:   rand(-0.25, 0.25),
    dy:   rand(-0.35, -0.05),
    o:    rand(0.15, 0.7),
    c:    COLORS[Math.floor(Math.random() * COLORS.length)],
    life: rand(0.4, 1),
  });

  const init = () => {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.life -= 0.003;

      if (p.life <= 0 || p.y < -10) {
        particles[i] = createParticle();
        particles[i].y = H + 5;
        return;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.c}${(p.o * p.life).toFixed(2)})`;
      ctx.fill();
    });

    // Draw faint connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = ((90 - dist) / 90 * 0.12).toFixed(3);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  };

  const onResize = () => {
    cancelAnimationFrame(animId);
    init();
    draw();
  };

  init();
  draw();

  window.addEventListener('resize', onResize, { passive: true });
})();

/* ---- Contact form handling ---- */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const notice  = document.getElementById('formNotice');
  const submit  = document.getElementById('submitBtn');
  if (!form || !notice || !submit) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ff6b6b';
        valid = false;
      }
    });
    if (!valid) {
      notice.textContent = 'Veuillez remplir tous les champs obligatoires.';
      notice.className = 'form-notice error';
      return;
    }

    // Email validation
    const email = form.querySelector('#email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#ff6b6b';
      notice.textContent = 'Veuillez saisir une adresse email valide.';
      notice.className = 'form-notice error';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Envoi en cours…';
    notice.textContent = '';
    notice.className = 'form-notice';

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        notice.textContent = 'Votre message a bien été envoyé ! Nous vous répondons sous 24h.';
        notice.className = 'form-notice';
        form.reset();
        submit.textContent = 'Message envoyé ✓';
        submit.style.background = 'linear-gradient(135deg, #1a6b3a, #2d9e58)';
      } else {
        throw new Error('Server error');
      }
    } catch {
      notice.textContent = 'Une erreur est survenue. Contactez-nous directement par email.';
      notice.className = 'form-notice error';
      submit.disabled = false;
      submit.innerHTML = '<span class="btn-icon">🚀</span> Envoyer ma demande';
    }
  });
})();

/* ---- Smooth scroll for all anchor links ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
