// ============================================================
//  Very Breizh Cup — UI partagé : thème clair/sombre + menu burger
// ============================================================

// ── THEME ──
(function initTheme() {
  const saved = localStorage.getItem('vbc_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vbc_theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
}

// ── NAV ──
const NAV_LINKS = [
  { href: '/',          label: 'Joueur',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>' },
  { href: '/stand',     label: 'Stand',      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="12" rx="2"/><path d="M2 11h20M6 15h4"/></svg>' },
  { href: '/terrain',   label: 'Terrain',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { href: '/resultats', label: 'Résultats',  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 21V3M3 7l9-4 9 4v6a9 9 0 01-18 0V7z"/></svg>' },
  { href: '/admin',     label: 'Admin',      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' },
];

function injectUI() {
  const header = document.querySelector('.app-header');
  if (!header) return;

  // Actions container (theme toggle + burger)
  const actions = document.createElement('div');
  actions.className = 'header-actions';
  actions.innerHTML = `
    <button id="themeToggle" class="theme-toggle" onclick="toggleTheme()" aria-label="Changer de thème"></button>
    <button id="burgerBtn" class="burger-btn" onclick="toggleNav()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  `;

  // Move existing role badge into actions or keep layout
  const badge = header.querySelector('.role-badge, .live-label');
  if (badge) badge.remove();
  header.appendChild(actions);

  // Nav drawer + overlay
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'navOverlay';
  overlay.onclick = toggleNav;

  const drawer = document.createElement('nav');
  drawer.className = 'nav-drawer';
  drawer.id = 'navDrawer';
  drawer.innerHTML = `
    <div class="nav-drawer-title">Navigation</div>
    ${NAV_LINKS.map(l => {
      const active = (l.href === '/' && (path === '/' || path === '/index')) || (l.href !== '/' && path === l.href);
      return `<a href="${l.href}" class="nav-link ${active ? 'active' : ''}">${l.icon}${l.label}</a>`;
    }).join('')}
    <div class="nav-footer">Very Breizh Cup — Club Canin de Bourgbarré</div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  updateThemeIcon();
}

function toggleNav() {
  document.getElementById('navOverlay').classList.toggle('open');
  document.getElementById('navDrawer').classList.toggle('open');
  document.getElementById('burgerBtn').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', injectUI);
