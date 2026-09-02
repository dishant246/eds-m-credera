/* eslint-disable */
/* global WebImporter */
/**
 * Parser for service-areas. Base: block variant (block/v1/block + item).
 * Source: https://credera.com/en-us (service areas)
 * Structure (xwalk block container): one ROW per service panel, each row is a
 * single cell holding the panel content (heading + list of service links) as
 * rich text. Using the generic block component (not the columns component)
 * preserves the `service-areas` class through JCR authoring so the variant
 * CSS/JS binds on AEM.
 * Note: the source markup nests anchors irregularly, so titles and their
 * button groups are extracted as parallel lists and zipped by index.
 */
export default function parse(element, { document }) {
  const titleEls = Array.from(
    element.querySelectorAll('[class*="ServiceTitle"]'),
  );
  const buttonGroups = Array.from(
    element.querySelectorAll('[class*="ServiceButtons"]'),
  );

  const cells = [];
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

    // One row per panel: a single cell containing the panel content.
    if (cellContent.length) cells.push([cellContent]);
  }

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'service-areas', cells });
  element.replaceWith(block);
}
