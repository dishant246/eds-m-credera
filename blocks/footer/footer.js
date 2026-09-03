// Credera footer — dark band with a brand column (logo + description + social
// icons + copyright) and a 3-column link grid. All copy, links, and images are
// read from content/footer.plain.html; this script only structures the DOM.

/**
 * Metadata-independent dual fetch: /content first (localhost / aem up), then
 * root (DA/EDS production where the fragment is served at the site root).
 * @returns {Promise<Document|null>} parsed fragment document
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.body.children];
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // First section = brand column; remaining = link columns.
  const [brandSection, ...linkSections] = sections;

  if (brandSection) {
    brandSection.classList.add('footer-brand');
    // The social-icon list gets its own class so CSS can lay it out as a row.
    brandSection.querySelectorAll('ul').forEach((ul) => {
      if (ul.querySelector('a img')) ul.classList.add('footer-social');
    });
    footer.append(brandSection);
  }

  const linkGrid = document.createElement('div');
  linkGrid.className = 'footer-links';
  linkSections.forEach((sec) => {
    sec.classList.add('footer-col');
    // First <p> in each column is its heading.
    const heading = sec.querySelector(':scope > p');
    if (heading) heading.classList.add('footer-col-heading');
    linkGrid.append(sec);
  });
  footer.append(linkGrid);

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-wrapper';
  wrapper.append(footer);
  block.append(wrapper);
}
