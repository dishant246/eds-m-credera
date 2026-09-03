// Credera header: two-row header (utility bar + main navbar) with hover
// megamenus, an inline search bar, and a country/locale dropdown.
// ALL copy, links, and images are read from content/nav.plain.html — this
// script only structures the fragment DOM and wires up interactive behavior.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Metadata-independent dual fetch: /content first (localhost / aem up), then
 * root (DA/EDS production where the fragment is served at the site root).
 * @returns {Promise<Document|null>} parsed fragment document
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

/** Close any open megamenu / dropdown and clear active states. */
function closeAll(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => li.setAttribute('aria-expanded', 'false'));
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  const locale = nav.querySelector('.nav-locale');
  if (locale) locale.setAttribute('aria-expanded', 'false');
  const search = nav.querySelector('.nav-search');
  if (search) search.setAttribute('aria-expanded', 'false');
}

/** Open/close a megamenu li, keeping the trigger button's aria-expanded in sync. */
function setDropOpen(li, open) {
  li.setAttribute('aria-expanded', open ? 'true' : 'false');
  const trigger = li.querySelector(':scope > .nav-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/**
 * Build the search control (icon toggle + inline full-width input bar).
 * The input/button are created here per the nav.plain.html contract.
 */
function buildSearch(nav, sourceLink) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';
  wrapper.setAttribute('aria-expanded', 'false');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Search');
  toggle.innerHTML = '<span class="nav-search-icon"></span><span>SEARCH</span>';

  const bar = document.createElement('div');
  bar.className = 'nav-search-bar';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  bar.append(input);

  toggle.addEventListener('click', () => {
    const open = wrapper.getAttribute('aria-expanded') === 'true';
    closeAll(nav);
    wrapper.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (!open) input.focus();
  });

  wrapper.append(toggle, bar);
  if (sourceLink) sourceLink.closest('li')?.replaceWith(wrapper);
  return wrapper;
}

/**
 * Build the locale (country) dropdown from the list of flag links in the
 * fragment. Content (country names + flag images) comes from nav.plain.html.
 */
function buildLocale(nav, localeList) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';
  wrapper.setAttribute('aria-expanded', 'false');

  // Trigger: current locale (first entry = United States) shown as globe + label.
  const current = localeList.querySelector('li a');
  const currentLabel = current ? current.textContent.trim() : 'USA';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-locale-toggle';
  toggle.setAttribute('aria-label', `Current region: ${currentLabel}`);
  toggle.innerHTML = '<span class="nav-locale-globe"></span><span>USA</span>';

  const panel = document.createElement('div');
  panel.className = 'nav-locale-panel';
  const heading = document.createElement('h4');
  heading.textContent = 'Credera is global!';
  const sub = document.createElement('p');
  sub.textContent = 'Select another country below';
  panel.append(heading, sub, localeList);

  toggle.addEventListener('click', () => {
    const open = wrapper.getAttribute('aria-expanded') === 'true';
    closeAll(nav);
    wrapper.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  wrapper.append(toggle, panel);
  return wrapper;
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.body.children];
  const utilitySection = sections[0];
  const menuSection = sections[1];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // ---- Utility bar (row 0): logo + Contact/Search + locale ----
  const utilBar = document.createElement('div');
  utilBar.className = 'nav-utility';

  // Brand (logo) — moved into the main bar; keep reference.
  const brand = utilitySection.querySelector('p > a');
  const navBrand = document.createElement('a');
  navBrand.className = 'nav-brand';
  if (brand) {
    navBrand.href = brand.getAttribute('href');
    navBrand.innerHTML = brand.innerHTML;
  }

  // Utility links (Contact + Search) live in the first <ul>.
  const utilLists = utilitySection.querySelectorAll('ul');
  const utilLinksList = utilLists[0];
  const localeList = utilLists[1];

  const utilCluster = document.createElement('div');
  utilCluster.className = 'nav-util-cluster';
  // Contact link (keep as link); Search becomes the search control.
  let searchSourceLink = null;
  if (utilLinksList) {
    [...utilLinksList.querySelectorAll('a')].forEach((a) => {
      if (a.getAttribute('href') === '#search') searchSourceLink = a;
    });
    // Move the plain Contact link into the cluster.
    const contact = [...utilLinksList.querySelectorAll('a')].find((a) => a.getAttribute('href') !== '#search');
    if (contact) {
      const c = document.createElement('a');
      c.href = contact.getAttribute('href');
      c.textContent = contact.textContent.trim();
      c.className = 'nav-contact';
      utilCluster.append(c);
    }
  }
  const search = buildSearch(nav, searchSourceLink);
  utilCluster.append(search);
  if (localeList) utilCluster.append(buildLocale(nav, localeList));
  utilBar.append(utilCluster);

  // ---- Main bar (row 1): logo + megamenu triggers ----
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main';
  mainBar.append(navBrand);

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  const topUl = menuSection.querySelector(':scope > ul');
  if (topUl) {
    topUl.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.add('nav-drop');
      li.setAttribute('aria-expanded', 'false');
      // The first <p><a> is the trigger label; turn it into a button-like span.
      const triggerP = li.querySelector(':scope > p:first-child');
      const triggerLink = triggerP ? triggerP.querySelector('a') : null;
      if (triggerLink) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-trigger';
        btn.textContent = triggerLink.textContent.trim();
        btn.setAttribute('aria-expanded', 'false');
        triggerP.replaceWith(btn);
      }
      // Panel = everything after the trigger, wrapped for styling.
      const panel = document.createElement('div');
      panel.className = 'nav-panel';
      while (li.children.length > 1) panel.append(li.children[1]);
      // Mobile back button (only visible in the mobile slide-in sub-panel).
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'nav-panel-back';
      back.setAttribute('aria-label', 'Back to menu');
      back.addEventListener('click', (e) => {
        e.stopPropagation();
        setDropOpen(li, false);
      });
      panel.prepend(back);
      // Panel heading = the menu name (matches the source's large left-column
      // title). Label is read from the trigger, so copy stays source-driven.
      if (triggerLink) {
        const heading = document.createElement('h2');
        heading.className = 'nav-panel-title';
        heading.textContent = triggerLink.textContent.trim();
        // place after the back button, before the description
        back.after(heading);
      }
      li.append(panel);

      // hover opens on desktop
      li.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          closeAll(nav);
          setDropOpen(li, true);
        }
      });
      li.addEventListener('mouseleave', () => {
        if (isDesktop.matches) setDropOpen(li, false);
      });
      // click toggles (mobile + keyboard)
      const trigger = li.querySelector('.nav-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const open = li.getAttribute('aria-expanded') === 'true';
          closeAll(nav);
          setDropOpen(li, !open);
        });
      }
    });
    navSections.append(topUl);
  }
  mainBar.append(navSections);

  // ---- Mobile hamburger (☰ ⇄ ×) — shown < 900px, toggles the drawer ----
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    if (open) closeAll(nav);
    nav.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    document.body.style.overflowY = open ? '' : 'hidden';
  });
  mainBar.prepend(hamburger);

  nav.append(utilBar, mainBar);

  // close everything when clicking outside the header (desktop hover panels)
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAll(nav);
  });
  window.addEventListener('keydown', (e) => { if (e.code === 'Escape') closeAll(nav); });

  // Reset state when crossing the desktop/mobile breakpoint (no page reload).
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    nav.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
