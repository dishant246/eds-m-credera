/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-services. Base: columns.
 * Source: https://credera.com/en-us (service areas)
 * Structure (xwalk columns): first data row = N columns (one cell per column).
 * Columns blocks do NOT use field hints; cells contain default content only.
 * Each service area becomes one column: title + list of service links.
 * Note: the source markup nests anchors irregularly, so titles and their
 * button groups are extracted as parallel lists and zipped by index.
 * Instance selector targets the stable ServiceSectionWrapper component id.
 */
export default function parse(element, { document }) {
  const titleEls = Array.from(
    element.querySelectorAll('[class*="ServiceTitle"]'),
  );
  const buttonGroups = Array.from(
    element.querySelectorAll('[class*="ServiceButtons"]'),
  );

  const columns = [];
  const count = Math.max(titleEls.length, buttonGroups.length);

  for (let i = 0; i < count; i += 1) {
    const cellContent = [];

    const titleEl = titleEls[i];
    if (titleEl && titleEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      cellContent.push(h3);
    }

    const group = buttonGroups[i];
    if (group) {
      const links = Array.from(group.querySelectorAll('a[class*="ServiceButton"], a'));
      const ul = document.createElement('ul');
      const seen = new Set();
      links.forEach((link) => {
        const label = link.textContent.trim();
        const href = link.getAttribute('href') || '';
        if (!label || seen.has(label)) return;
        seen.add(label);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', href || '#');
        a.textContent = label;
        li.appendChild(a);
        ul.appendChild(li);
      });
      if (ul.childNodes.length) cellContent.push(ul);
    }

    if (cellContent.length) columns.push(cellContent);
  }

  // Empty-block guard
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single row with one cell per column
  const cells = [columns];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-services', cells });
  element.replaceWith(block);
}
