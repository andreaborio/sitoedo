/* ============================================================
   EDOARDO MUNARI — LIGHT DESIGNER
   v3 — Aceternity-inspired effects
   ============================================================ */

(function () {
  'use strict';

  /* ── Force scroll to top on every load/refresh ── */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ── Reduced-motion check ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Utilities ── */
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  function splitWords(el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map(w => `<span class="word"><span class="word-inner">${w}</span></span>`)
      .join('');
    return el.querySelectorAll('.word-inner');
  }

  /* ── Lenis Smooth Scroll ── */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ── Scroll Progress ── */
  const progressBar = document.querySelector('.scroll-progress');
  lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = (progress * 100) + '%';
  });

  /* ── Custom Cursor ── */
  if (!isTouch) {
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const glow = cursor.querySelector('.cursor__glow');

    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let gx = 0, gy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    (function tick() {
      dx += (mx - dx) * 0.18;
      dy += (my - dy) * 0.18;
      dot.style.transform = `translate(${dx - 4}px, ${dy - 4}px)`;

      gx += (mx - gx) * 0.07;
      gy += (my - gy) * 0.07;
      glow.style.transform = `translate(${gx - 70}px, ${gy - 70}px)`;

      requestAnimationFrame(tick);
    })();

    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });
  }

  /* ── Magnetic Effect ── */
  if (!isTouch) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power2.out' });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ── Navigation ── */
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  let lastScrollY = 0;

  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('nav--scrolled', scroll > 80);
    if (scroll > lastScrollY && scroll > 300) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastScrollY = scroll;
  });

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');
    hamburger.classList.toggle('nav__hamburger--open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    isOpen ? lenis.stop() : lenis.start();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      hamburger.classList.remove('nav__hamburger--open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      lenis.start();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: 0 });
    });
  });


  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  const slit = preloader.querySelector('.preloader__slit');

  if (prefersReducedMotion) {
    preloader.style.display = 'none';
    document.querySelector('.hero__bg-img').classList.add('revealed');
    document.querySelectorAll('.hero__word').forEach(w => w.style.transform = 'translateY(0)');
    document.querySelector('.hero__subtitle').style.opacity = '1';
    document.querySelector('.hero__subtitle').style.transform = 'translateY(0)';
    document.querySelector('.hero__scroll').style.opacity = '1';
    document.querySelectorAll('.hero__beam').forEach(b => b.style.opacity = '1');
    initScrollAnimations();
    ScrollTrigger.refresh();
  } else {
    const preloaderTL = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        initScrollAnimations();
        ScrollTrigger.refresh();
      }
    });

    preloaderTL
      .to(slit, { width: '50%', duration: 0.7, ease: 'power2.inOut' })
      .to(slit, { duration: 0.25 })
      .to(slit, { height: '110vh', width: '110vw', borderRadius: 0, duration: 0.6, ease: 'power3.inOut' })
      .to(preloader, { opacity: 0, duration: 0.35, ease: 'power2.out' })
      .add(heroReveal(), '-=0.15');
  }

  /* ── Hero Reveal (with Spotlight activation) ── */
  function heroReveal() {
    const tl = gsap.timeline();
    const heroBg = document.querySelector('.hero__bg-img');
    const spotlight = document.querySelector('.hero__spotlight');

    tl.add(() => heroBg.classList.add('revealed'));

    // Activate the Spotlight cone
    tl.add(() => { if (spotlight) spotlight.classList.add('is-active'); }, 0.2);

    tl.to('.hero__word', {
      y: 0,
      duration: 1.1,
      stagger: 0.14,
      ease: 'power3.out'
    }, 0.1);

    tl.to('.hero__subtitle', {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=0.5');

    tl.to('.hero__scroll', {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.3');

    tl.to('.hero__beam', {
      opacity: 1,
      duration: 1.8,
      stagger: 0.3,
      ease: 'power1.out'
    }, '-=1.2');

    return tl;
  }

  /* ── Scroll-triggered Animations ── */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    // ─── About: word reveal with blur-to-clear (Text Generate Effect) ───
    const aboutText = document.querySelector('.about__text');
    if (aboutText) {
      const wordInners = splitWords(aboutText);
      gsap.to(wordInners, {
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        stagger: 0.03,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.about', start: 'top 72%' }
      });
    }

    gsap.from('.about__label', {
      y: 20, opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about', start: 'top 75%' }
    });

    // ─── Services: stagger reveal ───
    document.querySelectorAll('.services__item').forEach((item, i) => {
      gsap.to(item, {
        opacity: 1, y: 0,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 85%' }
      });
    });

    // ─── Work: full-screen stacked cards ───
    initWorkStack();

    // ─── Contact ───
    gsap.from('.contact__info', {
      y: 50, opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.contact', start: 'top 70%' }
    });

    const portrait = document.querySelector('.contact__portrait-inner');
    if (portrait) {
      gsap.fromTo(portrait,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.contact__portrait', start: 'top 75%' }
        }
      );
    }

    // ─── Hero parallax ───
    gsap.to('.hero__title', {
      y: 140, opacity: 0.2,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });

    gsap.to('.hero__subtitle', {
      y: 70, opacity: 0,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '55% top', scrub: 0.8 }
    });

    gsap.to('.hero__bg-img', {
      y: 100,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    gsap.to('.hero__beam--1', {
      y: -120,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    // Spotlight parallax
    gsap.to('.hero__spotlight', {
      y: -80, opacity: 0,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: 0.8 }
    });
  }

  /* ── Work: Stacked Fullscreen Cards ── */
  function initWorkStack() {
    const cards = gsap.utils.toArray('.work__card');
    const counter = document.querySelector('.work__counter');
    const counterCurrent = document.querySelector('.work__counter-current');

    if (!cards.length) return;

    // Show counter & label while in work section
    ScrollTrigger.create({
      trigger: '.work',
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => { gsap.to(counter, { opacity: 1, duration: 0.4 }); },
      onLeave: () => { gsap.to(counter, { opacity: 0, duration: 0.4 }); },
      onEnterBack: () => { gsap.to(counter, { opacity: 1, duration: 0.4 }); },
      onLeaveBack: () => { gsap.to(counter, { opacity: 0, duration: 0.4 }); },
    });

    cards.forEach((card, i) => {
      const title = card.querySelector('.work__card-title');
      const year = card.querySelector('.work__card-year');
      const img = card.querySelector('.work__card-img img');
      const overlay = card.querySelector('.work__card-overlay');

      // ─ First card: title visible immediately ─
      if (i === 0) {
        gsap.set(title, { opacity: 1, y: 0 });
        gsap.set(year, { opacity: 0.6, y: 0 });
      }

      // ─ Title + year reveal on enter (cards 2+) ─
      if (i > 0) {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 50%',
          onEnter: () => {
            gsap.to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
            gsap.to(year, { opacity: 0.6, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' });
          },
          onLeaveBack: () => {
            gsap.to(title, { opacity: 0, y: 40, duration: 0.4 });
            gsap.to(year, { opacity: 0, y: 20, duration: 0.3 });
          },
        });
      }

      // ─ Image parallax — scale(1.15) compensates movement ─
      gsap.fromTo(img,
        { y: 30, scale: 1.15 },
        {
          y: -30,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4,
          }
        }
      );

      // ─ Recede effect: darken overlay + scale IMAGE (not card) ─
      if (i < cards.length - 1) {
        // Darken the card via its overlay
        gsap.to(overlay, {
          opacity: 1,
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top 20%',
            scrub: 0.4,
          }
        });

        // Scale image down inside overflow:hidden card — no black gaps
        gsap.to(img, {
          scale: 0.96,
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top 20%',
            scrub: 0.4,
          }
        });
      }

      // ─ Counter update ─
      ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateCounter(i + 1),
        onEnterBack: () => updateCounter(i + 1),
      });
    });

    function updateCounter(n) {
      if (!counterCurrent) return;
      gsap.to(counterCurrent, {
        y: -10, opacity: 0, duration: 0.15,
        onComplete: () => {
          counterCurrent.textContent = String(n).padStart(2, '0');
          gsap.fromTo(counterCurrent, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 });
        }
      });
    }
  }

  /* ── Footer year ── */
  const fc = document.querySelector('.footer__copy');
  if (fc) fc.textContent = `\u00A9 ${new Date().getFullYear()} Edoardo Munari`;

})();
