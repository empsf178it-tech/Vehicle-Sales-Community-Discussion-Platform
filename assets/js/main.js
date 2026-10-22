/**
 * REVVOLT — Vehicle Sales Community & Discussion Platform
 * Main JavaScript Engine (Vanilla ES6)
 * Strict Zero-Framework Native Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndDirection();
  initNavigation();
  initScrollEffects();
  initHeroPrecisionReveal();
  initVehicleInteractions();
  initDiscussionInteractions();
  initChecklist();
  initLeaderboard();
  initForms();
  initModals();
});

/* ==========================================================================
   1. THEME MANAGEMENT (PERSISTED IN LOCALSTORAGE)
   ========================================================================== */

function initThemeAndDirection() {
  const html = document.documentElement;
  
  // Theme Toggle
  const savedTheme = localStorage.getItem('revvolt_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  html.setAttribute('data-theme', savedTheme);
  updateThemeToggleUI(savedTheme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('revvolt_theme', next);
      updateThemeToggleUI(next);
    });
  });
}

function updateThemeToggleUI(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    if (btn.classList.contains('btn-icon')) {
      btn.innerHTML = theme === 'dark' 
        ? '<span aria-hidden="true">☀️</span>' 
        : '<span aria-hidden="true">🌙</span>';
    } else {
      btn.innerHTML = theme === 'dark'
        ? '<span aria-hidden="true">☀️</span> Switch to Light Mode'
        : '<span aria-hidden="true">🌙</span> Switch to Dark Mode';
    }
  });
}

/* ==========================================================================
   2. GLOBAL NAVIGATION & MOBILE DRAWER (320px RIGHT DRAWER)
   ========================================================================== */

function initNavigation() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  const backdrop = document.querySelector('.nav-drawer-backdrop');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('active');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }
  backdrop.addEventListener('click', closeDrawer);

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  // Close when clicking a drawer link
  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   3. SCROLL EFFECTS: PROGRESS BAR & BACK-TO-TOP
   ========================================================================== */

function initScrollEffects() {
  const progressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.querySelector('.back-to-top-btn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   4. PRECISION 3D HERO SHOWCASE ENGINE (SMOOTH TILT PHYSICS & MULTI-LAYER DEPTH)
   ========================================================================== */

function initHeroPrecisionReveal() {
  const stage = document.getElementById('hero-showcase-stage');
  const card = document.getElementById('hero-showcase-card');
  const shadow = document.getElementById('showcase-floor-shadow');
  const glare = document.getElementById('console-glare');
  const viewPills = document.querySelectorAll('.view-pill');

  if (!stage || !card) return;

  // Initial state: Start idle float
  card.classList.add('is-floating');

  let isHovered = false;
  let currentAnglePreset = 'dynamic'; // 'dynamic', 'side', 'flat'

  // Physics state with lerp interpolation
  let currentRotateX = 4.5;
  let currentRotateY = -8;
  let targetRotateX = 4.5;
  let targetRotateY = -8;
  let idleRaf = null;

  function updatePhysics() {
    const ease = isHovered ? 0.12 : 0.08;
    currentRotateX += (targetRotateX - currentRotateX) * ease;
    currentRotateY += (targetRotateY - currentRotateY) * ease;

    if (currentAnglePreset === 'dynamic' && isHovered) {
      card.style.transform = `rotateY(${currentRotateY.toFixed(2)}deg) rotateX(${currentRotateX.toFixed(2)}deg) translateZ(0)`;

      if (shadow) {
        const shadowShiftX = currentRotateY * -1.6;
        const shadowScale = 1 - Math.abs(currentRotateX) * 0.015;
        shadow.style.transform = `rotateX(84deg) translateZ(-50px) translateX(${shadowShiftX.toFixed(1)}px) scale(${shadowScale.toFixed(2)})`;
      }
    }

    idleRaf = requestAnimationFrame(updatePhysics);
  }

  idleRaf = requestAnimationFrame(updatePhysics);

  const heroSection = document.querySelector('.hero-editorial') || stage;

  heroSection.addEventListener('mousemove', (e) => {
    if (currentAnglePreset !== 'dynamic') return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const distanceX = mouseX - centerX;
    const distanceY = mouseY - centerY;
    const stageRadius = Math.max(rect.width, rect.height) * 1.6;
    const distance = Math.hypot(distanceX, distanceY);

    // 3D Parallax shift on background typography watermark
    const watermark = document.getElementById('hero-watermark-3d');
    if (watermark) {
      const pX = (mouseX - window.innerWidth / 2) * -0.025;
      const pY = (mouseY - window.innerHeight / 2) * -0.015;
      watermark.style.transform = `translateZ(-90px) translate3d(${pX.toFixed(1)}px, ${pY.toFixed(1)}px, 0)`;
    }

    if (distance < stageRadius) {
      if (!isHovered) {
        isHovered = true;
        card.classList.remove('is-floating');
      }

      const clampedX = Math.max(-1, Math.min(1, distanceX / (rect.width * 0.75)));
      const clampedY = Math.max(-1, Math.min(1, distanceY / (rect.height * 0.75)));

      targetRotateY = clampedX * 15;
      targetRotateX = -clampedY * 13;

      if (glare) {
        const glarePercentX = Math.round(((mouseX - rect.left) / rect.width) * 100);
        const glarePercentY = Math.round(((mouseY - rect.top) / rect.height) * 100);
        card.style.setProperty('--glare-x', `${glarePercentX}%`);
        card.style.setProperty('--glare-y', `${glarePercentY}%`);
      }
    } else if (isHovered) {
      resetToFloating();
    }
  });

  heroSection.addEventListener('mouseleave', () => {
    resetToFloating();
    const watermark = document.getElementById('hero-watermark-3d');
    if (watermark) {
      watermark.style.transform = 'translateZ(-90px)';
    }
  });

  function resetToFloating() {
    isHovered = false;
    if (currentAnglePreset === 'dynamic') {
      targetRotateX = 4.5;
      targetRotateY = -8;
      setTimeout(() => {
        if (!isHovered && currentAnglePreset === 'dynamic') {
          card.classList.add('is-floating');
          card.style.transform = '';
          if (shadow) shadow.style.transform = '';
        }
      }, 700);
    }
  }

  // 3D Angle Preset Buttons
  viewPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      viewPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const angle = pill.dataset.angle;
      currentAnglePreset = angle;
      card.classList.remove('is-floating');

      if (angle === 'dynamic') {
        targetRotateX = 4.5;
        targetRotateY = -8;
        isHovered = false;
        setTimeout(() => {
          if (currentAnglePreset === 'dynamic' && !isHovered) {
            card.classList.add('is-floating');
            card.style.transform = '';
            if (shadow) shadow.style.transform = '';
          }
        }, 500);
      } else if (angle === 'side') {
        card.style.transform = 'rotateY(-20deg) rotateX(6deg) translateZ(0)';
        if (shadow) shadow.style.transform = 'rotateX(84deg) translateZ(-50px) translateX(28px) scale(0.95)';
      } else if (angle === 'flat') {
        card.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
        if (shadow) shadow.style.transform = 'rotateX(84deg) translateZ(-50px) translateX(0) scale(1)';
      }
    });
  });

  // Interactive Machine Switcher inside 3D Card (911 GT3 vs Ferrari 812)
  const switchPills = document.querySelectorAll('.switch-pill');
  const carImg = document.getElementById('console-car-img');
  const tachRpmVal = document.getElementById('tach-rpm-val');
  const soundSpecText = document.getElementById('sound-spec-text');
  const statHp = document.getElementById('stat-hp');
  const statEngine = document.getElementById('stat-engine');
  const statAccel = document.getElementById('stat-accel');
  const statSpeed = document.getElementById('stat-speed');

  const CAR_PRESETS = {
    gt3: {
      image: 'assets/images/5.jpg',
      alt: 'Porsche 911 GT3 Touring in track-ready stance',
      rpm: '9,000',
      sound: '4.0L Flat-Six NA Exhaust • 118 dB',
      hp: '502 <small>HP</small>',
      engine: '4.0L Boxer NA',
      accel: '3.2 <small>SEC</small>',
      speed: '199 <small>MPH</small>'
    },
    '812': {
      image: 'assets/images/8.jpg',
      alt: 'Ferrari 812 Superfast in studio light',
      rpm: '8,900',
      sound: '6.5L Naturally Aspirated V12 • 124 dB',
      hp: '789 <small>HP</small>',
      engine: '6.5L V12 Superfast',
      accel: '2.9 <small>SEC</small>',
      speed: '211 <small>MPH</small>'
    }
  };

  switchPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      switchPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const carKey = pill.dataset.car;
      const data = CAR_PRESETS[carKey];
      if (!data) return;

      if (carImg) {
        carImg.style.opacity = '0';
        setTimeout(() => {
          carImg.src = data.image;
          carImg.alt = data.alt;
          carImg.style.opacity = '1';
        }, 220);
      }

      if (tachRpmVal) tachRpmVal.textContent = data.rpm;
      if (soundSpecText) soundSpecText.textContent = data.sound;
      if (statHp) statHp.innerHTML = data.hp;
      if (statEngine) statEngine.textContent = data.engine;
      if (statAccel) statAccel.innerHTML = data.accel;
      if (statSpeed) statSpeed.innerHTML = data.speed;
    });
  });

  // Gyroscope tilt on mobile devices
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', (e) => {
      if (currentAnglePreset !== 'dynamic' || isHovered) return;
      if (e.gamma !== null && e.beta !== null) {
        card.classList.remove('is-floating');
        targetRotateY = Math.max(-14, Math.min(14, e.gamma * 0.35));
        targetRotateX = Math.max(-12, Math.min(12, (e.beta - 45) * 0.3));
        card.style.transform = `rotateY(${targetRotateY.toFixed(2)}deg) rotateX(${targetRotateX.toFixed(2)}deg) translateZ(0)`;
      }
    }, { passive: true });
  }
}

/* ==========================================================================
   5. VEHICLE INTERACTIONS: SAVING, FILTERING & MODAL DETAILS
   ========================================================================== */

// Sample Vehicle Master Dataset for dynamic queries and modal inspection
const VEHICLE_CATALOG = [
  {
    id: 'veh-1',
    name: 'Porsche 911 GT3 Touring',
    year: '2023',
    price: '$215,000',
    priceNum: 215000,
    make: 'porsche',
    mileage: '3,100 mi',
    transmission: 'manual',
    fuel: 'gasoline',
    type: 'coupe',
    location: 'Beverly Hills, CA',
    image: 'assets/images/5.jpg',
    power: '502 hp @ 9,000 RPM',
    engine: '4.0L Naturally Aspirated Flat-6',
    topSpeed: '199 mph',
    zeroToSixty: '3.7 sec',
    dealerNote: 'One owner, carbon bucket seats, front axle lift, full paint protection film (PPF). Complete digital PPI log verified.'
  },
  {
    id: 'veh-2',
    name: 'Mercedes-AMG GT R Coupe',
    year: '2022',
    price: '$132,000',
    priceNum: 132000,
    make: 'mercedes-benz',
    mileage: '11,800 mi',
    transmission: 'dual-clutch',
    fuel: 'gasoline',
    type: 'coupe',
    location: 'Austin, TX',
    image: 'assets/images/41.jpg',
    power: '577 hp @ 6,250 RPM',
    engine: '4.0L Handcrafted V8 Biturbo',
    topSpeed: '198 mph',
    zeroToSixty: '3.5 sec',
    dealerNote: 'AMG Track Package, ceramic composite brakes, active aerodynamic carbon underbody flaps. Mint garage kept.'
  },
  {
    id: 'veh-3',
    name: 'BMW M4 Competition xDrive',
    year: '2023',
    price: '$84,500',
    priceNum: 84500,
    make: 'bmw',
    mileage: '8,900 mi',
    transmission: 'automatic',
    fuel: 'gasoline',
    type: 'coupe',
    location: 'Miami, FL',
    image: 'assets/images/33.jpg',
    power: '503 hp @ 6,250 RPM',
    engine: '3.0L Twin-Turbo Inline-6 (S58)',
    topSpeed: '180 mph',
    zeroToSixty: '3.4 sec',
    dealerNote: 'Brooklyn Grey metallic over Kyalami Orange leather. Executive pack, M carbon exterior package, clean title.'
  },
  {
    id: 'veh-4',
    name: 'Audi TT RS Heritage Edition',
    year: '2021',
    price: '$58,900',
    priceNum: 58900,
    make: 'audi',
    mileage: '19,400 mi',
    transmission: 'dual-clutch',
    fuel: 'gasoline',
    type: 'coupe',
    location: 'Seattle, WA',
    image: 'assets/images/46.jpg',
    power: '394 hp @ 7,000 RPM',
    engine: '2.5L Turbocharged 5-Cylinder',
    topSpeed: '174 mph',
    zeroToSixty: '3.6 sec',
    dealerNote: 'Iconic 5-cylinder engine note, Sport exhaust with valve control, OLED taillights. Full dealer service records.'
  },
  {
    id: 'veh-5',
    name: 'Porsche 718 Cayman GTS 4.0',
    year: '2022',
    price: '$94,800',
    priceNum: 94800,
    make: 'porsche',
    mileage: '12,600 mi',
    transmission: 'manual',
    fuel: 'gasoline',
    type: 'coupe',
    location: 'Denver, CO',
    image: 'assets/images/23.jpg',
    power: '394 hp @ 7,000 RPM',
    engine: '4.0L Naturally Aspirated Flat-6',
    topSpeed: '182 mph',
    zeroToSixty: '4.3 sec',
    dealerNote: 'Agate Grey Metallic, Sport Chrono package, PASM sport suspension (-20mm), heated multifunction GT steering wheel.'
  },
  {
    id: 'veh-6',
    name: 'Cadillac Escalade Sport Platinum',
    year: '2023',
    price: '$98,500',
    priceNum: 98500,
    make: 'cadillac',
    mileage: '18,300 mi',
    transmission: 'automatic',
    fuel: 'gasoline',
    type: 'suv',
    location: 'Chicago, IL',
    image: 'assets/images/30.jpg',
    power: '420 hp @ 5,600 RPM',
    engine: '6.2L V8 VVT with Dynamic Fuel Mgmt',
    topSpeed: '130 mph',
    zeroToSixty: '5.9 sec',
    dealerNote: 'Curved 38-inch OLED display, AKG Studio Reference 36-speaker sound, Super Cruise hands-free driving tech.'
  },
  {
    id: 'veh-7',
    name: 'Aston Martin DB11 Volante',
    year: '2024',
    price: '$179,000',
    priceNum: 179000,
    make: 'aston-martin',
    mileage: '5,400 mi',
    transmission: 'automatic',
    fuel: 'gasoline',
    type: 'convertible',
    location: 'Scottsdale, AZ',
    image: 'assets/images/47.jpg',
    power: '528 hp @ 6,000 RPM',
    engine: '4.0L Twin-Turbocharged V8',
    topSpeed: '192 mph',
    zeroToSixty: '4.0 sec',
    dealerNote: 'Morning Frost White, Brogue leather detailing, Bang & Olufsen audio, acoustic 8-layer convertible soft top.'
  },
  {
    id: 'veh-8',
    name: 'Rimac Nevera Time Attack / EV',
    year: '2024',
    price: '$2,100,000',
    priceNum: 2100000,
    make: 'rimac',
    mileage: '850 mi',
    transmission: 'automatic',
    fuel: 'electric',
    type: 'supercar',
    location: 'Greenwich, CT',
    image: 'assets/images/6.jpg',
    power: '1,914 hp Quad Motors',
    engine: '120 kWh Liquid-Cooled Lithium Manganese',
    topSpeed: '258 mph',
    zeroToSixty: '1.74 sec',
    dealerNote: 'Ultra rare bespoke electric hypercar, carbon-fiber monocoque, All-Wheel Torque Vectoring 2. Verified telemetry.'
  }
];

function initVehicleInteractions() {
  // 1. Saved vehicles in localStorage
  let savedVehicles = JSON.parse(localStorage.getItem('revvolt_saved_cars') || '[]');

  function updateSavedBadges() {
    document.querySelectorAll('.vehicle-save-btn').forEach(btn => {
      const id = btn.getAttribute('data-vehicle-id');
      if (savedVehicles.includes(id)) {
        btn.classList.add('is-saved');
        btn.setAttribute('aria-label', 'Remove from saved vehicles');
        btn.innerHTML = '❤️';
      } else {
        btn.classList.remove('is-saved');
        btn.setAttribute('aria-label', 'Save vehicle');
        btn.innerHTML = '🤍';
      }
    });

    const counter = document.getElementById('saved-cars-count');
    if (counter) {
      counter.textContent = savedVehicles.length;
    }
  }

  document.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('.vehicle-save-btn');
    if (saveBtn) {
      e.preventDefault();
      const id = saveBtn.getAttribute('data-vehicle-id');
      if (savedVehicles.includes(id)) {
        savedVehicles = savedVehicles.filter(item => item !== id);
      } else {
        savedVehicles.push(id);
      }
      localStorage.setItem('revvolt_saved_cars', JSON.stringify(savedVehicles));
      updateSavedBadges();
    }
  });

  updateSavedBadges();

  // 2. Filter Controls (On vehicles.html)
  const filterForm = document.getElementById('vehicle-filter-form');
  const vehicleCards = document.querySelectorAll('.vehicle-card[data-vehicle-id]');
  const resultCount = document.getElementById('vehicle-result-count');
  const clearBtn = document.getElementById('clear-vehicle-filters');

  if (filterForm && vehicleCards.length > 0) {
    function applyVehicleFilters() {
      const makeVal = document.getElementById('filter-make')?.value || 'all';
      const typeVal = document.getElementById('filter-type')?.value || 'all';
      const fuelVal = document.getElementById('filter-fuel')?.value || 'all';
      const transVal = document.getElementById('filter-trans')?.value || 'all';
      const priceVal = document.getElementById('filter-price')?.value || 'all';

      let visible = 0;

      vehicleCards.forEach(card => {
        const cMake = card.getAttribute('data-make');
        const cType = card.getAttribute('data-type');
        const cFuel = card.getAttribute('data-fuel');
        const cTrans = card.getAttribute('data-trans');
        const cPrice = parseInt(card.getAttribute('data-price') || '0', 10);

        let matches = true;

        if (makeVal !== 'all' && cMake !== makeVal) matches = false;
        if (typeVal !== 'all' && cType !== typeVal) matches = false;
        if (fuelVal !== 'all' && cFuel !== fuelVal) matches = false;
        if (transVal !== 'all' && cTrans !== transVal) matches = false;

        if (priceVal === 'under-75k' && cPrice >= 75000) matches = false;
        else if (priceVal === '75k-150k' && (cPrice < 75000 || cPrice > 150000)) matches = false;
        else if (priceVal === 'over-150k' && cPrice <= 150000) matches = false;

        if (matches) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (resultCount) {
        resultCount.textContent = `${visible} ${visible === 1 ? 'vehicle' : 'vehicles'} found`;
      }
    }

    // Pre-populate filters from URL query parameters (e.g. from Hero Quick Finder Dock)
    const urlParams = new URLSearchParams(window.location.search);
    let hasUrlFilters = false;
    if (urlParams.has('make')) {
      const makeEl = document.getElementById('filter-make');
      if (makeEl) { makeEl.value = urlParams.get('make'); hasUrlFilters = true; }
    }
    if (urlParams.has('type')) {
      const typeEl = document.getElementById('filter-type');
      if (typeEl) { typeEl.value = urlParams.get('type'); hasUrlFilters = true; }
    }
    if (urlParams.has('price')) {
      const priceEl = document.getElementById('filter-price');
      if (priceEl) { priceEl.value = urlParams.get('price'); hasUrlFilters = true; }
    }
    if (urlParams.has('fuel')) {
      const fuelEl = document.getElementById('filter-fuel');
      if (fuelEl) { fuelEl.value = urlParams.get('fuel'); hasUrlFilters = true; }
    }
    if (hasUrlFilters) {
      applyVehicleFilters();
    }

    filterForm.addEventListener('change', applyVehicleFilters);

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterForm.reset();
        applyVehicleFilters();
      });
    }
  }

  // 3. Vehicle Detail Modal Handler
  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-vehicle-btn');
    if (viewBtn) {
      e.preventDefault();
      const id = viewBtn.getAttribute('data-vehicle-id');
      const veh = VEHICLE_CATALOG.find(v => v.id === id);
      if (veh) {
        openVehicleModal(veh);
      }
    }
  });
}

function openVehicleModal(v) {
  const modalBackdrop = document.getElementById('vehicle-modal');
  if (!modalBackdrop) return;

  const titleEl = document.getElementById('modal-veh-title');
  const priceEl = document.getElementById('modal-veh-price');
  const imgEl = document.getElementById('modal-veh-img');
  const specsEl = document.getElementById('modal-veh-specs');
  const notesEl = document.getElementById('modal-veh-notes');

  if (titleEl) titleEl.textContent = `${v.year} ${v.name}`;
  if (priceEl) priceEl.textContent = v.price;
  if (imgEl) {
    imgEl.src = v.image;
    imgEl.alt = `${v.year} ${v.name}`;
  }
  if (specsEl) {
    specsEl.innerHTML = `
      <div class="spec-item"><span class="spec-key">Power</span><span class="spec-val-sm">${v.power}</span></div>
      <div class="spec-item"><span class="spec-key">Engine</span><span class="spec-val-sm">${v.engine}</span></div>
      <div class="spec-item"><span class="spec-key">0-60 MPH</span><span class="spec-val-sm">${v.zeroToSixty}</span></div>
      <div class="spec-item"><span class="spec-key">Top Speed</span><span class="spec-val-sm">${v.topSpeed}</span></div>
      <div class="spec-item"><span class="spec-key">Mileage</span><span class="spec-val-sm">${v.mileage}</span></div>
      <div class="spec-item"><span class="spec-key">Location</span><span class="spec-val-sm">${v.location}</span></div>
    `;
  }
  if (notesEl) notesEl.textContent = v.dealerNote;

  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   6. DISCUSSION INTERACTIONS (SEARCH, FILTERING, VOTING, ACCORDIONS)
   ========================================================================== */

function initDiscussionInteractions() {
  // Helpful Vote Toggle
  document.addEventListener('click', (e) => {
    const voteBtn = e.target.closest('.thread-vote-btn');
    if (voteBtn) {
      e.preventDefault();
      const countEl = voteBtn.parentElement.querySelector('.vote-count');
      let currentVotes = parseInt(countEl.textContent, 10) || 0;
      const hasVoted = voteBtn.classList.contains('has-voted');

      if (hasVoted) {
        voteBtn.classList.remove('has-voted');
        countEl.textContent = currentVotes - 1;
      } else {
        voteBtn.classList.add('has-voted');
        countEl.textContent = currentVotes + 1;
      }
    }
  });

  // Category Filtering on Discussions Page
  const catButtons = document.querySelectorAll('.cat-btn');
  const threadRows = document.querySelectorAll('.thread-row');
  const searchInput = document.getElementById('discussion-search-input');
  const sortSelect = document.getElementById('discussion-sort-select');
  const threadCountEl = document.getElementById('discussion-count-display');

  if (catButtons.length > 0 && threadRows.length > 0) {
    let currentCategory = 'all';

    function filterDiscussions() {
      const query = (searchInput?.value || '').toLowerCase().trim();
      let visible = 0;

      threadRows.forEach(row => {
        const rowCat = row.getAttribute('data-category');
        const titleText = row.querySelector('.thread-title')?.textContent.toLowerCase() || '';
        const excerptText = row.querySelector('.thread-excerpt')?.textContent.toLowerCase() || '';

        const matchesCat = currentCategory === 'all' || rowCat === currentCategory;
        const matchesSearch = !query || titleText.includes(query) || excerptText.includes(query);

        if (matchesCat && matchesSearch) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });

      if (threadCountEl) {
        threadCountEl.textContent = `${visible} ${visible === 1 ? 'discussion' : 'discussions'}`;
      }
    }

    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-cat') || 'all';
        filterDiscussions();
      });
    });

    // Check URL parameters for pre-selected category (e.g. from footer links ?cat=maintenance)
    const discParams = new URLSearchParams(window.location.search);
    if (discParams.has('cat')) {
      const targetCat = discParams.get('cat');
      const targetBtn = Array.from(catButtons).find(b => b.getAttribute('data-cat') === targetCat);
      if (targetBtn) {
        catButtons.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        currentCategory = targetCat;
        filterDiscussions();
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterDiscussions);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const feed = document.querySelector('.discussion-feed');
        if (!feed) return;
        const rows = Array.from(threadRows);
        const sortMode = sortSelect.value;

        rows.sort((a, b) => {
          if (sortMode === 'popular') {
            const votesA = parseInt(a.querySelector('.vote-count')?.textContent || '0', 10);
            const votesB = parseInt(b.querySelector('.vote-count')?.textContent || '0', 10);
            return votesB - votesA;
          } else if (sortMode === 'unanswered') {
            const repliesA = parseInt(a.getAttribute('data-replies') || '0', 10);
            const repliesB = parseInt(b.getAttribute('data-replies') || '0', 10);
            return repliesA - repliesB;
          } else {
            // Newest
            const timeA = parseInt(a.getAttribute('data-time') || '0', 10);
            const timeB = parseInt(b.getAttribute('data-time') || '0', 10);
            return timeB - timeA;
          }
        });

        rows.forEach(r => feed.appendChild(r));
      });
    }
  }

  // Expert Q&A Accordion
  document.querySelectorAll('.qa-card .qa-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.qa-card');
      card.classList.toggle('open');
    });
  });

  // Load More Discussions Demo Button
  const loadMoreBtn = document.getElementById('load-more-discussions');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.textContent = 'All caught up!';
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.remove('btn-secondary');
      loadMoreBtn.classList.add('btn-ghost');
    });
  }
}

/* ==========================================================================
   7. INTERACTIVE BUYING CHECKLIST (VEHICLES PAGE)
   ========================================================================== */

function initChecklist() {
  const checkItems = document.querySelectorAll('.check-item');
  const meterFill = document.getElementById('checklist-meter-fill');
  const countDisplay = document.getElementById('checklist-count-display');
  const resetBtn = document.getElementById('reset-checklist-btn');

  if (checkItems.length === 0) return;

  function updateChecklistProgress() {
    let completed = 0;
    checkItems.forEach(item => {
      if (item.classList.contains('is-completed')) completed++;
    });

    const percent = Math.round((completed / checkItems.length) * 100);
    if (meterFill) meterFill.style.width = `${percent}%`;
    if (countDisplay) countDisplay.textContent = `${completed} of ${checkItems.length} Verified (${percent}%)`;
  }

  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('is-completed');
      const box = item.querySelector('.check-box');
      if (item.classList.contains('is-completed')) {
        box.innerHTML = '✓';
      } else {
        box.innerHTML = '';
      }
      updateChecklistProgress();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      checkItems.forEach(item => {
        item.classList.remove('is-completed');
        const box = item.querySelector('.check-box');
        if (box) box.innerHTML = '';
      });
      updateChecklistProgress();
    });
  }
}

/* ==========================================================================
   8. COMMUNITY LEADERBOARD (MEMBERS PAGE)
   ========================================================================== */

function initLeaderboard() {
  const sortButtons = document.querySelectorAll('.leaderboard-sort-btn');
  const tbody = document.querySelector('.leaderboard-table tbody');

  if (!tbody || sortButtons.length === 0) return;

  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sortButtons.forEach(b => b.classList.remove('btn-primary'));
      sortButtons.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');

      const sortKey = btn.getAttribute('data-sort');
      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
        const valA = parseInt(a.getAttribute(`data-${sortKey}`) || '0', 10);
        const valB = parseInt(b.getAttribute(`data-${sortKey}`) || '0', 10);
        return valB - valA;
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

/* ==========================================================================
   9. FORMS: VALIDATION, SIMULATED SUBMISSION & START DISCUSSION
   ========================================================================== */

function initForms() {
  // Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const name = document.getElementById('contact-name');
      const email = document.getElementById('contact-email');
      const message = document.getElementById('contact-message');
      const successBanner = document.getElementById('contact-success-banner');

      [name, email, message].forEach(field => {
        if (!field) return;
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          isValid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });

      if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
        email.classList.add('is-invalid');
        isValid = false;
      }

      if (isValid) {
        if (successBanner) {
          successBanner.classList.add('active');
          contactForm.reset();
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });

    // Clear error on input
    contactForm.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    });

    // Auto-fill from URL query or hash (e.g. ?enquiry=sell or #join)
    const contactParams = new URLSearchParams(window.location.search);
    const contactTypeSelect = document.getElementById('contact-type');
    const contactSubInput = document.getElementById('contact-subject');
    if (contactParams.get('enquiry') === 'sell' && contactTypeSelect) {
      contactTypeSelect.value = 'marketplace';
      if (contactSubInput && !contactSubInput.value) {
        contactSubInput.value = 'Vehicle Listing & Marketplace Audit Request';
      }
    } else if (window.location.hash === '#join' && contactTypeSelect) {
      contactTypeSelect.value = 'expert';
      if (contactSubInput && !contactSubInput.value) {
        contactSubInput.value = 'Enthusiast Community Membership Application';
      }
    }
  }

  // Start Discussion Form Demo
  const newDiscForm = document.getElementById('new-discussion-form');
  if (newDiscForm) {
    newDiscForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('disc-title-input');
      const catSelect = document.getElementById('disc-cat-select');
      const bodyInput = document.getElementById('disc-body-input');
      const successNotice = document.getElementById('disc-demo-notice');

      if (!titleInput.value.trim() || !bodyInput.value.trim()) {
        alert('Please complete the discussion title and message.');
        return;
      }

      // Prepend dynamically to discussion list
      const feed = document.querySelector('.discussion-feed');
      if (feed) {
        const newCard = document.createElement('article');
        newCard.className = 'thread-row';
        newCard.setAttribute('data-category', catSelect.value);
        newCard.setAttribute('data-replies', '0');
        newCard.setAttribute('data-time', Date.now().toString());

        newCard.innerHTML = `
          <div class="thread-vote-box">
            <button class="thread-vote-btn" aria-label="Upvote this thread">▲</button>
            <span class="vote-count">1</span>
          </div>
          <div class="thread-main">
            <div class="thread-header-meta">
              <span class="badge badge-lime">${catSelect.options[catSelect.selectedIndex].text}</span>
              <span class="badge badge-coral">Just Now</span>
              <span class="pulse-time">by You (Demo Contributor)</span>
            </div>
            <h3 class="thread-title"><a href="#discussion-detail">${escapeHTML(titleInput.value)}</a></h3>
            <p class="thread-excerpt">${escapeHTML(bodyInput.value)}</p>
          </div>
          <div class="thread-actions">
            <span class="caption">💬 0 replies</span>
            <a href="#thread-read" class="btn btn-sm btn-secondary">Read Thread</a>
          </div>
        `;

        feed.insertBefore(newCard, feed.firstChild);
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      newDiscForm.reset();
      const modal = document.getElementById('new-discussion-modal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';

      if (successNotice) {
        successNotice.style.display = 'block';
        setTimeout(() => { successNotice.style.display = 'none'; }, 6000);
      }
    });
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* ==========================================================================
   10. MODAL DIALOGS (DISMISS ON BACKDROP OR ESCAPE)
   ========================================================================== */

function initModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  });

  // Triggers for New Discussion Modal
  const openNewDiscBtn = document.getElementById('open-new-disc-modal');
  const newDiscModal = document.getElementById('new-discussion-modal');
  if (openNewDiscBtn && newDiscModal) {
    openNewDiscBtn.addEventListener('click', (e) => {
      e.preventDefault();
      newDiscModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
}
