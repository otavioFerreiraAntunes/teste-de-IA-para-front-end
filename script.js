/* ============================================================
   ROBSON FERREIRA — script.js
   ============================================================ */

/* ── Loader ─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initReveal();
  }, 2000);
});

/* ── SPA Navigation ─────────────────────────────────────────── */
const pages   = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');
let chartsInitialized = false;

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(l => {
    if (l.dataset.page === pageId) l.classList.add('active');
  });

  if (pageId === 'stats' && !chartsInitialized) {
    chartsInitialized = true;
    setTimeout(() => {
      initCharts();
      animateSkillBars();
      animateKPIs();
    }, 120);
  }

  // Reinitialize reveal for current page
  setTimeout(initReveal, 100);
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    showPage(page);
    // Close mobile menu
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  });
});

/* ── Hamburger Menu ─────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

/* ── Sticky Navbar ──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ── Gallery Filters ────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.style.display = '';
        item.style.animation = 'fadeIn 0.4s ease';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* ── Lightbox ───────────────────────────────────────────────── */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item img').forEach(img => {
  img.parentElement.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Scroll Reveal ──────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* ── KPI Counter Animation ──────────────────────────────────── */
function animateKPIs() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const isFloat = el.dataset.count.includes('.');
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = isFloat
        ? (target * ease).toFixed(1)
        : Math.round(target * ease);

      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

/* ── Skill Bars ─────────────────────────────────────────────── */
function animateSkillBars() {
  document.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = bar.dataset.pct + '%';
    }, i * 100);
  });
}

/* ── Charts ─────────────────────────────────────────────────── */
function initCharts() {
  // Global Chart defaults
  Chart.defaults.color = '#7a9cc4';
  Chart.defaults.font.family = "'Inter', sans-serif";

  /* ---- Bar Chart: Gols por Temporada ---- */
  const ctxBar = document.getElementById('goalsChart').getContext('2d');
  const gradBar = ctxBar.createLinearGradient(0, 0, 0, 280);
  gradBar.addColorStop(0, 'rgba(26, 108, 255, 0.9)');
  gradBar.addColorStop(1, 'rgba(26, 108, 255, 0.15)');

  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ["'15", "'16", "'17", "'18", "'19", "'20", "'21", "'22", "'23", "'24"],
      datasets: [{
        label: 'Gols',
        data: [38, 44, 52, 61, 74, 68, 82, 89, 91, 81],
        backgroundColor: gradBar,
        borderColor: '#1a6cff',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10,22,40,0.95)',
          borderColor: 'rgba(26,108,255,0.4)',
          borderWidth: 1,
          padding: 12,
          titleColor: '#ffffff',
          bodyColor: '#7a9cc4',
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} gols`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#7a9cc4', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#7a9cc4', font: { size: 11 } },
          beginAtZero: true
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });

  /* ---- Radar Chart: Habilidades ---- */
  const ctxRadar = document.getElementById('skillsChart').getContext('2d');
  const gradRadar = ctxRadar.createRadialGradient(
    ctxRadar.canvas.width/2, ctxRadar.canvas.height/2, 10,
    ctxRadar.canvas.width/2, ctxRadar.canvas.height/2, 140
  );
  gradRadar.addColorStop(0, 'rgba(26,108,255,0.35)');
  gradRadar.addColorStop(1, 'rgba(26,108,255,0.05)');

  new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: ['Finalização', 'Velocidade', 'Técnica', 'Visão de Jogo', 'Cabeceio', 'Drible'],
      datasets: [{
        label: 'Robson Ferreira',
        data: [97, 88, 92, 85, 79, 90],
        backgroundColor: gradRadar,
        borderColor: '#1a6cff',
        borderWidth: 2.5,
        pointBackgroundColor: '#1a6cff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10,22,40,0.95)',
          borderColor: 'rgba(26,108,255,0.4)',
          borderWidth: 1,
          padding: 12,
          titleColor: '#ffffff',
          bodyColor: '#7a9cc4',
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          grid: { color: 'rgba(255,255,255,0.07)' },
          angleLines: { color: 'rgba(255,255,255,0.07)' },
          ticks: {
            display: false,
            stepSize: 20,
          },
          pointLabels: {
            color: '#e8edf5',
            font: { size: 12, weight: '600' }
          }
        }
      },
      animation: {
        duration: 1400,
        easing: 'easeOutBack'
      }
    }
  });
}

/* ── Init ───────────────────────────────────────────────────── */
showPage('home');
