/* ============================================================
   AFTERLINE — Main Script ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add('loaded');
      // Jalankan semua animasi hero pertama kali
      playHeroAnimations();
    }, 400);
  });

  /* ---------- Service Card Flip ---------- */
  document.querySelectorAll('.flip-card').forEach((card) => {
    const inner = card.querySelector('.flip-card-inner');
    const front = card.querySelector('.flip-front');
    const back = card.querySelector('.flip-back');
    const openBtn = card.querySelector('.flip-trigger');
    const closeBtn = card.querySelector('.flip-close');

    inner.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'transform') return;
      const flipped = inner.classList.contains('is-flipped');
      front.style.display = flipped ? 'none' : '';
      back.style.display = flipped ? '' : 'none';

      // Cleanup GSAP artifacts on back when returning to front
      if (!flipped && window.gsap) {
        const backContent = back.querySelector('.service-card') || back;
        gsap.set(backContent, { clearProps: 'all' });
      }

      if (flipped) {
        // Tidak perlu override transform ke 'none' di sini karena akan
        // memicu CSS transition kedua (rotateY(180°) → none = flip balik).
        // Biarkan CSS class is-flipped yang mempertahankan posisi 180°.
      }
    });

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        back.style.display = '';
        // Bersihkan override idle sebelum transisi buka dimulai
        inner.style.transform = '';
        back.style.transform = '';
        inner.classList.add('is-flipped');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (window.gsap) {
          const backContent = back.querySelector('.service-card') || back;
          // Animasi close: back content mengecil + fade out, lalu flip balik
          gsap.to(backContent, {
            scale: 0.85,
            opacity: 0,
            duration: 0.18,
            ease: 'power3.in',
            onComplete() {
              gsap.set(backContent, { clearProps: 'all' });
              front.style.display = '';
              inner.style.transform = '';
              back.style.transform = '';
              inner.classList.remove('is-flipped');
            },
          });
        } else {
          front.style.display = '';
          inner.style.transform = '';
          back.style.transform = '';
          inner.classList.remove('is-flipped');
        }
      });
    }
  });

  /* ---------- Floating Action Menu (Toggle) ---------- */
  const floatMenu = document.getElementById('afFloatMenu');
  const floatToggle = document.getElementById('afFloatToggle');

  if (floatToggle && floatMenu) {
    floatToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      floatMenu.classList.toggle('open');
      const isOpen = floatMenu.classList.contains('open');
      floatToggle.setAttribute(
        'aria-label',
        isOpen ? 'Tutup menu' : 'Buka menu',
      );
      floatToggle.setAttribute('title', isOpen ? 'Tutup menu' : 'Buka menu');
    });

    // Tutup menu saat klik di luar
    document.addEventListener('click', (e) => {
      if (
        !floatMenu.contains(e.target) &&
        floatMenu.classList.contains('open')
      ) {
        floatMenu.classList.remove('open');
        floatToggle.setAttribute('aria-label', 'Buka menu');
        floatToggle.setAttribute('title', 'Buka menu');
      }
    });
  }

  /* ---------- Theme Toggle (Dark/Light) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('af-theme');

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('af-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('af-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      }
    });
  }

  /* ---------- Entrance sound ---------- */
  const enterSound = document.getElementById('enterSound');
  const soundToggle = document.getElementById('soundToggle');
  let soundEnabled = true;
  let soundFallbackAttached = false;

  function playEnterSound() {
    if (!enterSound || !soundEnabled) return;
    // Reset audio ke awal agar bisa diputar ulang
    enterSound.currentTime = 0;
    const playPromise = enterSound.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with sound was blocked by the browser.
        // Play it on the visitor's very first interaction instead (hanya sekali)
        if (!soundFallbackAttached) {
          soundFallbackAttached = true;
          const playOnFirstInteraction = () => {
            if (soundEnabled) {
              enterSound.currentTime = 0;
              enterSound.play().catch(() => {});
            }
            ['click', 'touchstart', 'keydown'].forEach((evt) =>
              document.removeEventListener(evt, playOnFirstInteraction),
            );
            soundFallbackAttached = false;
          };
          ['click', 'touchstart', 'keydown'].forEach((evt) =>
            document.addEventListener(evt, playOnFirstInteraction, {
              once: true,
            }),
          );
        }
      });
    }
  }

  if (soundToggle && enterSound) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      enterSound.muted = !soundEnabled;
      soundToggle.classList.toggle('muted', !soundEnabled);
      soundToggle.innerHTML = soundEnabled
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark"></i>';
    });
  }

  /* ---------- 3D Depth / Extrusion — volume/ketebalan 3D pada logo ---------- */
  function add3DExtrusion() {
    const stage = document.getElementById('logo3dStage');
    if (!stage) return;
    const origSvg = stage.querySelector('svg');
    if (!origSvg) return;

    // Hapus depth layer lama (jika ada)
    stage.querySelectorAll('.logo-depth-layer').forEach((el) => el.remove());

    const depth = 18; // total ketebalan 3D (pixel)
    const layers = 16; // jumlah lapisan
    const step = depth / layers;

    for (let i = 1; i <= layers; i++) {
      const z = -i * step; // mundur ke sumbu Z negatif (ke belakang)
      const clone = origSvg.cloneNode(true);
      clone.classList.add('logo-depth-layer');
      // opacity menurun semakin ke belakang
      const opacity = 1 - (i / layers) * 0.7;
      clone.style.opacity = opacity;
      clone.style.transform = `translateZ(${z}px)`;
      // semakin ke belakang semakin gelap
      const brightness = 1 - (i / layers) * 0.4;
      clone.style.filter = `brightness(${brightness})`;
      stage.appendChild(clone);
    }
  }

  /* ---------- Logo draw-on animation + drag rotate 3D ---------- */
  let logo3DInitialized = false;

  function runLogoDrawAnimation() {
    const leftPath = document.getElementById('logoLeftPath');
    const rightPath = document.getElementById('logoRightPath');
    const arcPath = document.getElementById('logoArcPath');
    const logoWrap = document.getElementById('heroLogoSvgWrap');
    const hint = document.getElementById('heroLogoHint');

    if (!leftPath || !rightPath || !arcPath) return;

    [leftPath, rightPath, arcPath].forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    });

    const enableInteraction = () => {
      if (logoWrap) logoWrap.classList.add('draggable-active');
      if (hint) hint.classList.add('show');
      // Tambahkan extrusion 3D setelah draw animation selesai
      add3DExtrusion();
      // Init 3D drag hanya sekali untuk menghindari duplikasi event listener
      if (!logo3DInitialized) {
        initLogo3D(logoWrap);
        logo3DInitialized = true;
      }
    };

    if (window.gsap) {
      const tl = gsap.timeline({ delay: 0.15, onComplete: enableInteraction });
      tl.to([leftPath, rightPath], {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      }).to(
        arcPath,
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.2',
      );
    } else {
      // Fallback without GSAP: simple CSS transition draw
      [leftPath, rightPath, arcPath].forEach((path) => {
        path.style.transition = 'stroke-dashoffset 1.1s ease';
      });
      requestAnimationFrame(() => {
        leftPath.style.strokeDashoffset = 0;
        rightPath.style.strokeDashoffset = 0;
        setTimeout(() => {
          arcPath.style.strokeDashoffset = 0;
        }, 300);
      });
      setTimeout(enableInteraction, 1500);
    }
  }

  /* ---------- 3D Drag Rotation (X & Y axis) ---------- */
  function initLogo3D(wrap) {
    if (!wrap) return;
    const stage = document.getElementById('logo3dStage');
    if (!stage) return;

    // Store current 3D rotation
    let rotX = 0;
    let rotY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velX = 0;
    let velY = 0;
    let inertiaFrame = null;
    let resetTimer = null;

    function apply3D() {
      stage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function stopInertia() {
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
      inertiaFrame = null;
    }

    function resetLogoPosition() {
      if (!window.gsap) {
        rotX = 0;
        rotY = 0;
        apply3D();
        return;
      }
      // Set starting position dari current rotX/rotY
      gsap.set(stage, { rotationX: rotX, rotationY: rotY });
      // Animasi kembali ke posisi awal (0,0) — smooth dan pelan
      gsap.to(stage, {
        rotationX: 0,
        rotationY: 0,
        duration: 2.5,
        ease: 'power3.out',
        onUpdate: () => {
          const rx = gsap.getProperty(stage, 'rotationX');
          const ry = gsap.getProperty(stage, 'rotationY');
          stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        },
        onComplete: () => {
          rotX = 0;
          rotY = 0;
        },
      });
    }

    function scheduleReset() {
      if (resetTimer) clearTimeout(resetTimer);
      // Tunggu 1.5 detik setelah interaksi berhenti, lalu reset ke posisi semula
      resetTimer = setTimeout(() => {
        resetLogoPosition();
      }, 1500);
    }

    function cancelReset() {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    }

    function runInertia() {
      stopInertia();
      function step() {
        velX *= 0.92;
        velY *= 0.92;
        rotX += velX;
        rotY += velY;
        apply3D();
        if (Math.abs(velX) > 0.05 || Math.abs(velY) > 0.05) {
          inertiaFrame = requestAnimationFrame(step);
        } else {
          // Inertia selesai, schedule reset ke posisi semula
          scheduleReset();
        }
      }
      inertiaFrame = requestAnimationFrame(step);
    }

    function onPointerDown(e) {
      stopInertia();
      cancelReset();
      // Kill GSAP animation yang sedang running (reset position)
      if (window.gsap) {
        gsap.killTweensOf(stage);
        // Baca current rotation dari GSAP setelah kill
        rotX = gsap.getProperty(stage, 'rotationX') || 0;
        rotY = gsap.getProperty(stage, 'rotationY') || 0;
        // Sync style.transform dengan GSAP properties
        stage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      isDragging = true;
      wrap.classList.add('grabbing');
      const point = e.touches ? e.touches[0] : e;
      lastX = point.clientX;
      lastY = point.clientY;
      lastTime = performance.now();
      velX = 0;
      velY = 0;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const point = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dx = point.clientX - lastX;
      const dy = point.clientY - lastY;
      const dt = Math.max(now - lastTime, 1);
      const factor = 0.3;

      rotY += dx * factor;
      rotX -= dy * factor;

      apply3D();

      velX = (-dy * factor) / (dt / 16.7);
      velY = (dx * factor) / (dt / 16.7);

      lastX = point.clientX;
      lastY = point.clientY;
      lastTime = now;
      e.preventDefault();
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      wrap.classList.remove('grabbing');
      if (Math.abs(velX) > 0.3 || Math.abs(velY) > 0.3) {
        runInertia();
      } else {
        // Tidak ada inertia, langsung schedule reset
        scheduleReset();
      }
    }

    wrap.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    wrap.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }

  /* ---------- Navbar scroll + active link ---------- */
  const navbar = document.querySelector('.af-navbar');
  const navLinks = document.querySelectorAll('.af-nav-links a[data-section]');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section highlight + aria-current untuk aksesibilitas
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach((link) => {
      const isActive = link.dataset.section === current;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // Collapse mobile menu after clicking a link
  const navCollapse = document.getElementById('afNavMenu');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
        bsCollapse.hide();
      }
    });
  });

  /* ---------- Back to top click ---------- */
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Typed.js — hero subtitle rotator ---------- */
  const typedEl = document.getElementById('typed-text');
  if (typedEl && window.Typed) {
    new Typed('#typed-text', {
      strings: [
        'Website Development',
        'Video Editing',
        'Logo & Branding',
        'Graphic Design',
        'Data Scraping',
        'Preprocessing Data',
        'Konveksi & Sablon',
        'Iklan Aplikasi',
        'Pembuatan Aplikasi',
        'Sistem Computer Vision',
        'Edit Foto',
        'Konsultasi Custom',
      ],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1400,
      loop: true,
      smartBackspace: true,
    });
  }

  /* ---------- Hero Mini Cards Rotating (Popup Bergantian) ---------- */
  const serviceCards = document.querySelectorAll('.hero-mini-card');
  let currentCardIndex = 0;
  let rotationTimers = [];
  let excludedIndices = new Set(); // index card yang baru diklik, di-skip 1 putaran

  function getRandomCardCount() {
    return Math.floor(Math.random() * 4) + 2; // 2, 3, 4, atau 5
  }

  function clearRotationTimers() {
    rotationTimers.forEach((t) => clearTimeout(t));
    rotationTimers = [];
  }

  function rotateServiceCards() {
    clearRotationTimers();

    const showCount = getRandomCardCount();

    serviceCards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.pointerEvents = 'none';
    });

    let indices = Array.from(
      { length: serviceCards.length },
      (_, i) => i,
    ).filter((i) => !excludedIndices.has(i));

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const selectedIndices = indices.slice(
      0,
      Math.min(showCount, indices.length),
    );

    excludedIndices.clear();

    selectedIndices.forEach((idx, i) => {
      const card = serviceCards[idx];
      if (!card) return;
      const t = setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.pointerEvents = 'auto';
        const t2 = setTimeout(() => {
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
        }, 550);
        rotationTimers.push(t2);
      }, i * 200);
      rotationTimers.push(t);
    });

    currentCardIndex = (currentCardIndex + 1) % serviceCards.length;
  }

  // Inisialisasi
  if (serviceCards.length > 0) {
    serviceCards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    rotateServiceCards();
    setInterval(rotateServiceCards, 7000);
  }

  /* ---------- Klik Mini Card: efek "pop bubble" hilang duluan ---------- */
  serviceCards.forEach((card, cardIndex) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();

      const targetHref = card.getAttribute('href');
      const serviceName = card.dataset.service;

      if (serviceName) {
        sessionStorage.setItem('af-selected-service', serviceName);
      }

      excludedIndices.add(cardIndex);

      card.style.transition = 'transform 0.15s ease, opacity 0.25s ease';
      card.style.transform = 'scale(1.15)';

      requestAnimationFrame(() => {
        setTimeout(() => {
          card.style.transform = 'scale(0)';
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
        }, 100);
      });

      setTimeout(() => {
        if (targetHref) window.location.hash = targetHref;

        // Tetap sembunyikan (JANGAN dikosongkan ke '') sampai rotasi berikutnya
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          card.style.pointerEvents = 'none';
        }, 200);
      }, 350);
    });
  });

  /* ---------- Hero Replay — IntersectionObserver for scroll-back ---------- */
  let hasHeroReplayed = false;
  const heroSection = document.querySelector('.hero');

  function resetHeroState() {
    // Reset logo SVG paths for draw animation
    const leftPath = document.getElementById('logoLeftPath');
    const rightPath = document.getElementById('logoRightPath');
    const arcPath = document.getElementById('logoArcPath');
    if (leftPath && rightPath && arcPath) {
      [leftPath, rightPath, arcPath].forEach((path) => {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.transition = 'none';
      });
    }

    // Hapus depth layer 3D (akan dibuat ulang saat draw animation selesai)
    const stage = document.getElementById('logo3dStage');
    if (stage) {
      stage.querySelectorAll('.logo-depth-layer').forEach((el) => el.remove());
    }

    // Reset posisi 3D logo ke 0,0
    if (stage && window.gsap) {
      gsap.killTweensOf(stage);
      stage.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    // Reset hint
    const hint = document.getElementById('heroLogoHint');
    if (hint) hint.classList.remove('show');

    // Reset logo wrap draggable
    const logoWrap = document.getElementById('heroLogoSvgWrap');
    if (logoWrap) logoWrap.classList.remove('draggable-active');

    // Reset GSAP entrance — set ke posisi awal
    if (window.gsap) {
      gsap.set('.hero-badge-row', { y: 20, opacity: 0 });
      gsap.set('.hero-title', { y: 30, opacity: 0 });
      gsap.set('.hero-desc', { y: 20, opacity: 0 });
      gsap.set('.hero-cta-row', { y: 20, opacity: 0 });
      gsap.set('.hero-clients', { y: 20, opacity: 0 });
      gsap.set('.hero-visual', { scale: 0.85, opacity: 0 });
    }

    // Refresh AOS agar elemen hero siap dianimasi ulang
    if (window.AOS) {
      AOS.refresh();
    }

    // Reset mini cards — sembunyikan semua
    document.querySelectorAll('.hero-mini-card').forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.pointerEvents = 'none';
    });

    // Reset counters ke 0 agar replay dari awal
    resetCounters();
  }

  function playHeroAnimations() {
    // GSAP hero entrance
    if (window.gsap) {
      gsap.to('.hero-badge-row', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
      });
      gsap.to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.35,
      });
      gsap.to('.hero-desc', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.5,
      });
      gsap.to('.hero-cta-row', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.65,
      });
      gsap.to('.hero-clients', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.8,
      });
      gsap.to('.hero-visual', {
        scale: 1,
        opacity: 1,
        duration: 1.1,
        delay: 0.4,
        ease: 'back.out(1.6)',
      });
    }

    // Logo draw animation
    runLogoDrawAnimation();

    // Play sound
    playEnterSound();

    // Reset mini cards rotation index
    currentCardIndex = 0;
    rotateServiceCards();
  }

  // Observer untuk mendeteksi saat hero masuk viewport
  if (heroSection) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (hasHeroReplayed) {
              // User scroll balik ke hero — replay animasi
              resetHeroState();
              setTimeout(() => {
                playHeroAnimations();
              }, 100);
            }
            hasHeroReplayed = true;
          }
        });
      },
      { threshold: 0.3 },
    );
    heroObserver.observe(heroSection);
  }

  /* ---------- GSAP — hero entrance (initial run) + parallax ---------- */
  if (window.gsap) {
    // Initial hero entrance sudah dijalankan via preloader → playHeroAnimations()
    // Jadi kita hanya perlu parallax mousemove di sini

    // Mouse parallax on hero visual
    const heroVisual = document.querySelector('.hero-visual');
    if (
      heroVisual &&
      heroSection &&
      window.matchMedia('(min-width: 992px)').matches
    ) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        gsap.to('.hero-logo-parallax', {
          x: x * 26,
          y: y * 22,
          duration: 0.6,
          ease: 'power2.out',
        });
        gsap.to('.hero-orbit-ring.r1', {
          x: x * 14,
          y: y * 10,
          duration: 0.8,
          ease: 'power2.out',
        });
        gsap.to('.hero-orbit-ring.r2', {
          x: x * -10,
          y: y * -8,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    }
  }

  /* ---------- Cursor glow ---------- */
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Button Ripple Effect ---------- */
  document.querySelectorAll('.btn-af').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.classList.add('ripple');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Counter Animation (replayable) ---------- */
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent =
        (target % 1 === 0 ? Math.floor(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function resetCounters() {
    counters.forEach((el) => {
      // Reset ke nilai awal (0)
      el.textContent = '0';
    });
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.4 },
  );

  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Process line fill animation (replayable) — Hover-aware ---------- */
  const processTrack = document.querySelector('.process-track');
  const processLineFill = document.querySelector('.process-line-fill');
  const processSteps = document.querySelectorAll('.process-step');

  if (processTrack && processLineFill && processSteps.length > 0) {
    function setLineWidth(percent) {
      processLineFill.style.width = percent + '%';
    }

    // Hitung persentase posisi step relatif terhadap process-track
    function calculateStepPosition(step) {
      const trackRect = processTrack.getBoundingClientRect();
      const stepRect = step.getBoundingClientRect();
      const stepCenterX = stepRect.left + stepRect.width / 2;
      const relativeX = stepCenterX - trackRect.left;
      return (relativeX / trackRect.width) * 100;
    }

    // Cek apakah process-line visible (desktop, bukan mobile)
    function isLineVisible() {
      const line = document.querySelector('.process-line');
      return line && line.offsetParent !== null;
    }

    // Hover pada step → isi garis sampai posisi step tersebut
    processSteps.forEach((step) => {
      step.addEventListener('mouseenter', () => {
        if (!isLineVisible()) return;
        // Hapus class is-entering agar transisi cepat (0.45s)
        processLineFill.classList.remove('is-entering');
        const pos = calculateStepPosition(step);
        setLineWidth(pos);
      });
    });

    // Mouse leave dari track → garis penuh lagi
    processTrack.addEventListener('mouseleave', () => {
      if (!isLineVisible()) return;
      // Hapus class is-entering agar transisi cepat
      processLineFill.classList.remove('is-entering');
      setLineWidth(100);
    });

    // IntersectionObserver: reset ke 0% saat keluar viewport
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Tambah class is-entering untuk animasi slow-mo (2.5s)
            processLineFill.classList.add('is-entering');
            setLineWidth(100);
          } else {
            // Reset width ke 0 saat section keluar viewport
            processLineFill.classList.remove('is-entering');
            setLineWidth(0);
          }
        });
      },
      { threshold: 0.2 },
    );
    lineObserver.observe(processTrack);
  }

  /* ---------- Portfolio Filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      portfolioItems.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.style.display = '';
          if (window.gsap) {
            gsap.fromTo(
              item,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5 },
            );
          } else {
            item.style.opacity = '1';
          }
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ---------- Portfolio Modal (with Google Drive Video via <video> tag) ---------- */
  const portfolioModalEl = document.getElementById('portfolioModal');
  if (portfolioModalEl) {
    const modal = new bootstrap.Modal(portfolioModalEl);
    const modalImg = document.getElementById('modalImg');
    const modalVideoWrap = document.getElementById('modalVideoWrap');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');
    const videoFallbackLink = document.getElementById('videoFallbackLink');
    const videoLoadingSpinner = document.getElementById('videoLoadingSpinner');

    let currentVideoId = '';

    // Show/hide loading spinner
    function showVideoLoading(show) {
      if (videoLoadingSpinner) {
        videoLoadingSpinner.style.display = show ? 'block' : 'none';
      }
      if (modalVideoPlayer) {
        modalVideoPlayer.style.opacity = show ? '0.3' : '1';
      }
    }

    // Clean up video when modal is hidden (stop playback + unload)
    portfolioModalEl.addEventListener('hidden.bs.modal', () => {
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.removeAttribute('src');
        modalVideoPlayer.load();
        modalVideoPlayer.style.opacity = '1';
      }
      if (videoFallbackLink) {
        videoFallbackLink.style.display = 'none';
      }
      showVideoLoading(false);
      currentVideoId = '';
      modalVideoWrap.style.display = 'none';
      modalImg.style.display = '';
    });

    // Clean up on modal dismiss
    portfolioModalEl.addEventListener('hide.bs.modal', () => {
      if (modalVideoPlayer && !modalVideoPlayer.paused) {
        modalVideoPlayer.pause();
      }
    });

    // When video can play, hide spinner
    if (modalVideoPlayer) {
      modalVideoPlayer.addEventListener('canplay', () => {
        showVideoLoading(false);
      });
      modalVideoPlayer.addEventListener('waiting', () => {
        showVideoLoading(true);
      });
      modalVideoPlayer.addEventListener('playing', () => {
        showVideoLoading(false);
      });
      // If video errors out, show fallback link
      modalVideoPlayer.addEventListener('error', () => {
        showVideoLoading(false);
        if (videoFallbackLink && currentVideoId) {
          videoFallbackLink.href = getGDriveEmbedUrl(currentVideoId);
          videoFallbackLink.style.display = 'inline-flex';
        }
      });
    }

    document.querySelectorAll('.portfolio-item').forEach((item) => {
      item.addEventListener('click', () => {
        const title = item.dataset.title;
        const desc = item.dataset.desc;
        const cat = item.dataset.categoryLabel;
        const videoIndex = item.dataset.videoIndex;

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDesc').textContent = desc;
        document.getElementById('modalCat').textContent = cat;

        // Hide fallback link initially
        if (videoFallbackLink) {
          videoFallbackLink.style.display = 'none';
        }

        // Cek apakah ini item video
        if (videoIndex !== undefined && window.portfolioVideos) {
          const videoData = window.portfolioVideos[videoIndex];
          if (videoData && videoData.videoId) {
            // Tampilkan video player dengan direct download URL dari Google Drive
            modalImg.style.display = 'none';
            modalVideoWrap.style.display = '';

            // Store current video ID for fallback
            currentVideoId = videoData.videoId;

            // Google Drive direct download URL
            const directUrl = getGDriveDirectUrl(videoData.videoId);

            // Set fallback link URL
            if (videoFallbackLink) {
              videoFallbackLink.href = getGDriveEmbedUrl(videoData.videoId);
            }

            // Set poster (thumbnail) on video element
            modalVideoPlayer.setAttribute('poster', videoData.thumbnail);

            // Show loading spinner
            showVideoLoading(true);

            // Set the video source
            modalVideoPlayer.src = directUrl;
            modalVideoPlayer.load();

            // Try to play automatically
            setTimeout(() => {
              modalVideoPlayer.play().catch(() => {
                // Autoplay might be blocked, user can click play
              });
            }, 500);
          } else {
            // Video ID belum diisi — fallback ke gambar thumbnail
            modalImg.style.display = '';
            modalVideoWrap.style.display = 'none';
            currentVideoId = '';
            if (modalVideoPlayer) {
              modalVideoPlayer.pause();
              modalVideoPlayer.removeAttribute('src');
              modalVideoPlayer.load();
              modalVideoPlayer.style.opacity = '1';
            }
            showVideoLoading(false);
            if (videoFallbackLink) {
              videoFallbackLink.style.display = 'none';
            }
            if (videoData) {
              modalImg.src = videoData.thumbnail;
            } else {
              modalImg.src = item.querySelector('img')?.src || '';
            }
          }
        } else {
          // Item non-video: tampilkan gambar
          modalImg.style.display = '';
          modalVideoWrap.style.display = 'none';
          currentVideoId = '';
          if (modalVideoPlayer) {
            modalVideoPlayer.pause();
            modalVideoPlayer.removeAttribute('src');
            modalVideoPlayer.load();
            modalVideoPlayer.style.opacity = '1';
          }
          showVideoLoading(false);
          if (videoFallbackLink) {
            videoFallbackLink.style.display = 'none';
          }
          modalImg.src = item.querySelector('img')?.src || '';
        }

        modal.show();
      });
    });
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-question').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isActive = item.classList.contains('active');
      document
        .querySelectorAll('.faq-item')
        .forEach((el) => el.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  /* ---------- Swiper — Testimonials (centered + blur effect) ---------- */
  function initTestimonialSwiper() {
    if (!window.Swiper) return false;
    new Swiper('.testimonial-swiper', {
      loop: true,
      centeredSlides: true,
      slidesPerView: 1.3,
      spaceBetween: 24,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: {
        el: '.testimonial-swiper .swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.testimonial-next',
        prevEl: '.testimonial-prev',
      },
      speed: 700,
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: false,
        },
        768: {
          slidesPerView: 1.3,
          spaceBetween: 24,
          centeredSlides: true,
        },
      },
    });
    return true;
  }

  // Coba init sekarang, jika Swiper belum tersedia (lazy load), retry beberapa kali
  if (!initTestimonialSwiper()) {
    var _swiperRetry = 0;
    var _swiperTimer = setInterval(function () {
      _swiperRetry++;
      if (initTestimonialSwiper() || _swiperRetry > 20) {
        clearInterval(_swiperTimer);
      }
    }, 250);
  }

  /* ---------- Contact Form — Auto-Send via Telegram Bot API + Animations ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // ================================================================
    // KONFIGURASI TELEGRAM BOT — AfterlineBot ✅ AKTIF
    // ================================================================
    // Bot: @AfterlineBot (t.me/AfterlineBot)
    // PENTING: Buka t.me/AfterlineBot di Telegram & klik START/Mulai!
    // ================================================================
    const TELEGRAM_BOT_TOKEN = '8984975008:AAEzwfKN2lOue_tbFfLV1oMmL0uJVTZCov4';
    const TELEGRAM_CHAT_ID = '1720907551';
    // ================================================================

    // Auto-pilih layanan dari sessionStorage (dari klik mini-card)
    const savedService = sessionStorage.getItem('af-selected-service');
    if (savedService) {
      const serviceSelect = document.getElementById('serviceType');
      if (serviceSelect) {
        const option = Array.from(serviceSelect.options).find(
          (opt) => opt.value === savedService || opt.text === savedService,
        );
        if (option) option.selected = true;
      }
      sessionStorage.removeItem('af-selected-service');
    }

    // Success Toast elements
    const successToast = document.getElementById('successToast');
    const toastClose = document.getElementById('toastClose');

    // Paper plane elements
    const paperPlane = document.getElementById('paperPlane');
    const planeTrail = document.getElementById('planeTrail');

    // Function to show toast
    let toastTimer = null;
    function showSuccessToast() {
      if (!successToast) return;

      // Reset any existing animation
      clearTimeout(toastTimer);
      successToast.classList.remove('hiding', 'show');

      // Trigger reflow
      void successToast.offsetWidth;

      // Show with entrance animation
      successToast.classList.add('show');

      // Auto hide after 6 seconds
      toastTimer = setTimeout(() => {
        hideSuccessToast();
      }, 6000);
    }

    function showErrorToast(msg) {
      if (!successToast) return;
      clearTimeout(toastTimer);
      successToast.classList.remove('hiding', 'show');
      void successToast.offsetWidth;

      // Ubah icon jadi merah untuk error
      const icon = successToast.querySelector('.toast-icon i');
      const strong = successToast.querySelector('.toast-content strong');
      const span = successToast.querySelector('.toast-content span');
      const originalIconClass = icon.className;
      const originalStrong = strong.textContent;
      const originalSpan = span.textContent;

      icon.className = 'fa-solid fa-circle-xmark';
      icon.style.color = '#fff';
      successToast.querySelector('.toast-icon').style.background =
        'linear-gradient(135deg, #DC2626, #EF4444)';
      strong.textContent = 'Pesan Gagal Dikirim!';
      span.textContent =
        msg || 'Silakan coba lagi atau hubungi kami langsung via WhatsApp.';

      successToast.classList.add('show');

      toastTimer = setTimeout(() => {
        hideSuccessToast();
        // Restore original
        setTimeout(() => {
          icon.className = originalIconClass;
          icon.style.color = '';
          successToast.querySelector('.toast-icon').style.background = '';
          strong.textContent = originalStrong;
          span.textContent = originalSpan;
        }, 500);
      }, 6000);
    }

    function hideSuccessToast() {
      if (!successToast) return;
      successToast.classList.add('hiding');
      successToast.classList.remove('show');
      setTimeout(() => {
        successToast.classList.remove('hiding');
      }, 500);
    }

    // Toast close button
    if (toastClose) {
      toastClose.addEventListener('click', hideSuccessToast);
    }

    // Function to play paper plane animation
    function playPlaneAnimation() {
      if (!paperPlane || !planeTrail) return;

      // Reset
      paperPlane.classList.remove('flying', 'arrived');
      planeTrail.classList.remove('active');

      // Trigger reflow
      void paperPlane.offsetWidth;

      // Start animation
      paperPlane.classList.add('flying');
      planeTrail.classList.add('active');

      // Clean up after animation completes
      setTimeout(() => {
        paperPlane.classList.remove('flying');
        paperPlane.classList.add('arrived');
        planeTrail.classList.remove('active');
        setTimeout(() => {
          paperPlane.classList.remove('arrived');
        }, 400);
      }, 1900);
    }

    // ---------------------------------------------------------------
    // KIRIM PESAN KE TELEGRAM — Otomatis, tanpa buka halaman lain
    // ---------------------------------------------------------------
    async function sendToTelegram(fullName, email, phone, service, message) {
      const text =
        `📌 *Konsultasi Baru — Afterline*\n\n` +
        `👤 *Nama:* ${escapeMarkdown(fullName)}\n` +
        `📧 *Email:* ${escapeMarkdown(email)}\n` +
        `📞 *Telepon:* ${escapeMarkdown(phone || '-')}\n` +
        `🔧 *Layanan:* ${escapeMarkdown(service)}\n` +
        `💬 *Pesan:* ${escapeMarkdown(message)}\n\n` +
        `🕐 _${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}_`;

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Gagal mengirim ke Telegram');
      }
      return data;
    }

    function escapeMarkdown(text) {
      // Escape karakter khusus Markdown Telegram
      // Note: dots (.) are NOT escaped — they don't need escaping in Telegram Markdown
      return text
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/`/g, '\\`');
    }

    // Fungsi validasi format email
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Fungsi validasi format nomor telepon (Indonesia: 08xx atau +62xx)
    function isValidPhone(phone) {
      if (!phone) return true; // optional field
      return /^(\+62|62|0)[0-9]{8,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Helper: tampilkan error inline di bawah field tertentu
    function showFieldError(fieldId, message) {
      const field = document.getElementById(fieldId);
      // Hapus error lama jika ada
      const existing = field.parentElement.querySelector('.field-error-msg');
      if (existing) existing.remove();

      field.classList.add('field-error');

      const errEl = document.createElement('span');
      errEl.className = 'field-error-msg';
      errEl.textContent = message;
      errEl.style.color = '#DC2626';
      errEl.style.fontSize = '13px';
      errEl.style.marginTop = '-14px';
      errEl.style.marginBottom = '8px';
      errEl.style.display = 'block';
      errEl.style.fontWeight = '500';

      field.parentElement.appendChild(errEl);
    }

    function clearFieldErrors() {
      document
        .querySelectorAll('.field-error-msg')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('.field-error')
        .forEach((el) => el.classList.remove('field-error'));
    }

    // WhatsApp number (fallback jika Telegram gagal)
    const WA_NUMBER = '6282289331347';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();

      // Get form values
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('emailAddr').value.trim();
      const phone = document.getElementById('phoneNum').value.trim();
      const service = document.getElementById('serviceType').value;
      const message = document.getElementById('messageBody').value.trim();

      // ── Validasi ──
      let hasError = false;

      if (!fullName) {
        showFieldError('fullName', 'Nama lengkap wajib diisi.');
        hasError = true;
      }

      if (!email) {
        showFieldError('emailAddr', 'Email wajib diisi.');
        hasError = true;
      } else if (!isValidEmail(email)) {
        showFieldError(
          'emailAddr',
          'Format email tidak valid. Contoh: nama@email.com',
        );
        hasError = true;
      }

      if (!service) {
        showFieldError('serviceType', 'Silakan pilih layanan.');
        hasError = true;
      }

      if (!message) {
        showFieldError('messageBody', 'Pesan wajib diisi.');
        hasError = true;
      }

      if (phone && !isValidPhone(phone)) {
        showFieldError(
          'phoneNum',
          'Format nomor tidak valid. Contoh: 08xxxxxxxxxx',
        );
        hasError = true;
      }

      if (hasError) return;

      const btn = document.getElementById('sendMessageBtn');
      const originalBtnText = btn.innerHTML;

      // Disable button & show spinner
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

      try {
        // Coba kirim ke Telegram
        await sendToTelegram(fullName, email, phone, service, message);

        // Animasi pesawat
        playPlaneAnimation();

        // Toast sukses
        showSuccessToast();

        // Reset form
        contactForm.reset();
      } catch (error) {
        console.error('Gagal mengirim:', error);

        // Fallback ke WhatsApp jika Telegram gagal
        const waMessage =
          `📌 *Konsultasi Afterline*%0A%0A` +
          `👤 *Nama:* ${fullName}%0A` +
          `📧 *Email:* ${email}%0A` +
          `📞 *Telepon:* ${phone || '-'}%0A` +
          `🔧 *Layanan:* ${service}%0A` +
          `💬 *Pesan:* ${message}`;

        const waURL = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;
        window.open(waURL, '_blank', 'noopener,noreferrer');

        playPlaneAnimation();
        showSuccessToast();
        contactForm.reset();
      }

      // Restore button
      setTimeout(() => {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
      }, 800);
    });
  }

  /* ---------- NEWSLETTER — Kirim ke Telegram + validasi email ---------- */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    const emailInput = document.getElementById('newsletterEmail');
    const newsBtn = newsletterForm.querySelector('button');

    // Fungsi kirim newsletter email ke Telegram
    async function sendNewsletterToTelegram(email) {
      const TELEGRAM_BOT_TOKEN =
        '8984975008:AAEzwfKN2lOue_tbFfLV1oMmL0uJVTZCov4';
      const TELEGRAM_CHAT_ID = '1720907551';

      const text =
        `📬 *Langganan Newsletter Baru*\n\n` +
        `📧 *Email:* ${escapeMarkdown(email)}\n\n` +
        `🕐 _${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}_`;

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (!data.ok)
        throw new Error(data.description || 'Gagal kirim newsletter');
      return data;
    }

    // Helper: tampilkan pesan di bawah form newsletter
    function showNewsletterMsg(msg, isError) {
      // Hapus pesan lama
      const old = newsletterForm.parentElement.querySelector('.newsletter-msg');
      if (old) old.remove();

      const el = document.createElement('span');
      el.className = 'newsletter-msg';
      el.textContent = msg;
      el.style.cssText = `
        display: block;
        margin-top: 10px;
        font-size: 13px;
        font-weight: 500;
        color: ${isError ? '#DC2626' : '#16A34A'};
        transition: opacity 0.3s ease;
      `;
      newsletterForm.parentElement.appendChild(el);

      setTimeout(() => el.remove(), 4000);
    }

    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();

      // Validasi format email
      if (!email) {
        showNewsletterMsg('Silakan masukkan alamat email Anda.', true);
        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showNewsletterMsg(
          'Format email tidak valid. Contoh: nama@email.com',
          true,
        );
        emailInput.focus();
        return;
      }

      // Disable & loading state
      const originalHtml = newsBtn.innerHTML;
      newsBtn.disabled = true;
      newsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      try {
        await sendNewsletterToTelegram(email);

        // Success
        showNewsletterMsg(
          '✅ Email berhasil didaftarkan! Terima kasih.',
          false,
        );
        emailInput.value = '';
      } catch (error) {
        console.error('Newsletter gagal:', error);
        showNewsletterMsg('Gagal mendaftarkan email. Silakan coba lagi.', true);
      }

      newsBtn.disabled = false;
      newsBtn.innerHTML = originalHtml;
    });
  }

  /* ---------- Dekoratif SVG Line Draw (Tentang Section) — replay setiap scroll masuk ---------- */
  (function initDecoLineDraw() {
    const decoLines = document.querySelectorAll('.why-decor-line path');
    if (!decoLines.length) return;

    let animTimers = [];

    function clearAnimTimers() {
      animTimers.forEach((t) => clearTimeout(t));
      animTimers = [];
    }

    function resetDecoLines() {
      clearAnimTimers();
      document.querySelectorAll('.why-decor-line').forEach((el) => {
        el.classList.remove('drawn', 'pulse');
      });
      decoLines.forEach((path) => {
        const len = path.getTotalLength();
        path.style.transition = 'none';
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.opacity = '0';
      });
    }

    function playDecoLines() {
      resetDecoLines();
      void decoLines[0].offsetWidth; // force reflow

      const delays = {
        'line-top': 0,
        'line-left': 200,
        'line-right': 400,
        'line-bottom': 600,
      };

      decoLines.forEach((path) => {
        const lineEl = path.closest('.why-decor-line');
        const cls = lineEl?.className?.baseVal || '';
        const delay = delays[cls] || 0;

        path.style.transition = `stroke-dashoffset 6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 3s ease ${delay}ms`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            path.style.strokeDashoffset = 0;
            path.style.opacity = '1';
          });
        });

        const totalDuration = delay + 6000;
        const t1 = setTimeout(() => {
          if (lineEl) {
            lineEl.classList.add('drawn');
            if (cls === 'line-bottom') {
              const t2 = setTimeout(() => {
                document
                  .querySelectorAll('.why-decor-line.drawn')
                  .forEach((el) => {
                    el.classList.add('pulse');
                  });
              }, 300);
              animTimers.push(t2);
            }
          }
        }, totalDuration + 100);
        animTimers.push(t1);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            resetDecoLines();
            return;
          }
          playDecoLines();
        });
      },
      { threshold: 0.3 },
    );

    const container = document.querySelector('.why-illustration');
    if (container) {
      observer.observe(container);
    }
  })();

  /* ---------- Generate floating particles in hero background ---------- */
  const particleContainer = document.querySelector('.hero .bg-decor');
  if (particleContainer) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.classList.add('floating-particle');
      p.style.top = Math.random() * 100 + '%';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 6 + 's';
      p.style.animationDuration = 6 + Math.random() * 6 + 's';
      particleContainer.appendChild(p);
    }
  }

  /* ---------- GSAP ScrollTrigger (disabled on .services-cta / .process-cta — AOS already handles them) ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
});
