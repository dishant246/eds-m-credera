/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards.
 * Source: https://credera.com/en-us (Industry-Specific Expertise)
 * Structure (xwalk cards container): each industry = one row with 2 cells:
 *   cell 1 = image/icon (field:image + collapsed field:imageAlt), cell 2 = text (field:text: linked heading).
 * Card model fields: image (reference), text (richtext).
 * Note: industry names are split across multiple text spans around the icon; joined here.
 *
 * ICON RECOVERY: On the live site the industry icons are rendered client-side as
 * throwaway blob: object URLs (URL.createObjectURL), which are not fetchable at
 * import time. We recovered the real SVGs and committed them to /icons/, then
 * map each industry (by its link path slug) to its committed icon file. Repo-
 * served absolute paths survive JCR ingestion cleanly (unlike data: URIs, which
 * AEM drops, and external URLs, which get DAM-rewritten and double-escaped).
 */
const ICON_BY_SLUG = {
  "consumer": "/icons/industry-consumer.svg",
  "energy-and-resources": "/icons/industry-energy-resources.svg",
  "financial-services": "/icons/industry-financial-services.svg",
  "healthcare-life-sciences": "/icons/industry-healthcare-life-sciences.svg",
  "technology-media-telecommunications": "/icons/industry-tech-media-telecom.svg",
  "publicsector": "/icons/industry-public-sector.svg",
  "business-and-industrial-markets": "/icons/industry-business-industrial-markets.svg",
};

function slugFromHref(href) {
  const m = (href || '').match(/\/industries\/([^/?#]+)/);
  return m ? m[1] : '';
}

export default function parse(element, { document }) {
  // Shared helper: first real (non-data/blob) image src within a scope.
  const realSrc = (scope) => {
    for (const i of scope.querySelectorAll('img')) {
      const s = i.getAttribute('src') || '';
      if (s && !s.startsWith('data:') && !s.startsWith('blob:')) return { src: s, alt: i.getAttribute('alt') || '' };
    }
    return null;
  };
  // Shared helper: build a [image, text] card row from icon + title + optional
  // description + optional link. Text cell = h3 (linked if href) + description p.
  const buildIconCard = (hit, title, desc, href) => {
    let imageCell = '';
    if (hit) {
      const img = document.createElement('img');
      img.setAttribute('src', hit.src);
      if (hit.alt || title) img.setAttribute('alt', hit.alt || title);
      imageCell = [document.createComment(' field:image '), img];
    }
    const textCell = [document.createComment(' field:text ')];
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = title;
        h3.appendChild(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      textCell.push(p);
    }
    return (textCell.length > 1 || Array.isArray(imageCell))
      ? [imageCell, textCell.length > 1 ? textCell : ''] : null;
  };

  // ---- Careers "Our Teams" cards (experienced-professionals: offering-card) ----
  // Each card: icon + <h2> title + <p> description (no link). Icons are blob:/data:
  // client-rendered, so no real src survives — cards render text-only (image cell empty).
  const offeringCards = Array.from(element.querySelectorAll('[class*="offering-card__WrapperContainer"]'));
  if (offeringCards.length) {
    const oCells = [];
    offeringCards.forEach((card) => {
      const title = card.querySelector('h1,h2,h3,h4,h5')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const desc = card.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const row = buildIconCard(realSrc(card), title, desc, null);
      if (row) oCells.push(row);
    });
    if (oCells.length) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells: oCells }));
      return;
    }
  }

  // ---- Careers "Find your fit" practice cards (students: internal-link cards) ----
  // Each card: <a href> wrapping an icon + <h5> title + <p> description.
  const practiceCards = Array.from(element.querySelectorAll('a[class*="internal-link__StyledLink"]'))
    .filter((a) => a.querySelector('img') && a.querySelector('h1,h2,h3,h4,h5'));
  if (practiceCards.length) {
    const pCells = [];
    practiceCards.forEach((card) => {
      const title = card.querySelector('h1,h2,h3,h4,h5')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const desc = card.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const row = buildIconCard(realSrc(card), title, desc, card.getAttribute('href') || '');
      if (row) pCells.push(row);
    });
    if (pCells.length) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells: pCells }));
      return;
    }
  }

  // ---- Careers "Recruitment process" steps (experienced: point-of-view Column) ----
  // Each step: a number ("1".."4") + <h4> title + <p> description. No image; the
  // number is prepended to the title so the step order survives as text.
  // Match ONLY the innermost step card (point-of-view-section__Column), not the
  // outer Columns grid or the ColumnWrapper — the [class*=Column] substring hits
  // all three nesting levels, which would capture each step multiple times.
  const stepCards = Array.from(element.querySelectorAll('[class*="point-of-view-section__Column"]'))
    .filter((c) => {
      if (!c.querySelector('h1,h2,h3,h4,h5')) return false;
      const family = (c.className || '').split(' ').find((x) => x.includes('point-of-view-section__Column')) || '';
      // keep leaf "Column-sc-..." only (exclude "Columns" and "ColumnWrapper")
      return /point-of-view-section__Column-/.test(family);
    });
  if (stepCards.length) {
    const sCells = [];
    stepCards.forEach((card) => {
      const title = card.querySelector('h1,h2,h3,h4,h5')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const desc = card.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '';
      // The step number lives as a sibling leaf in the parent ColumnWrapper,
      // not inside the leaf Column — scan the parent for a short numeric leaf.
      let num = '';
      const scope = card.parentElement || card;
      for (const el of scope.querySelectorAll('*')) {
        if (el.children.length === 0) {
          const t = el.textContent.trim();
          if (/^\d{1,2}$/.test(t)) { num = t; break; }
        }
      }
      const titleText = num ? `${num}. ${title}` : title;
      const row = buildIconCard(null, titleText, desc, null);
      if (row) sCells.push(row);
    });
    if (sCells.length) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells: sCells }));
      return;
    }
  }

  const links = Array.from(
    element.querySelectorAll('a[class*="IndustryLinkContainer"]'),
  );

  const cells = [];

  links.forEach((link) => {
    const href = link.getAttribute('href') || '';

    // Industry name: join all name-text spans (name is split around the icon)
    const nameParts = Array.from(link.querySelectorAll('[class*="IndustryNameText"]'))
      .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const name = nameParts.join(' ').replace(/\s+/g, ' ').trim();

    // Icon image
    const img = link.querySelector('img');

    // Prefer a stable recovered icon src over the live blob: URL
    const slug = slugFromHref(href);
    let src = ICON_BY_SLUG[slug] || '';
    if (!src && img) {
      const liveSrc = img.getAttribute('src') || '';
      // Never emit a blob: URL - it will not survive import
      if (liveSrc && !liveSrc.startsWith('blob:')) src = liveSrc;
    }
    const alt = (img && img.getAttribute('alt')) || (name ? name + ' icon' : '');

    // Image cell (field:image; alt collapses into imageAlt attribute)
    let imageCell = '';
    if (src) {
      const picture = document.createElement('img');
      picture.setAttribute('src', src);
      if (alt) picture.setAttribute('alt', alt);
      imageCell = [document.createComment(' field:image '), picture];
    }

    // Text cell (linked heading)
    const textCell = [document.createComment(' field:text ')];
    if (name) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = name;
        h3.appendChild(a);
      } else {
        h3.textContent = name;
      }
      textCell.push(h3);
    }

    if (textCell.length > 1 || Array.isArray(imageCell)) {
      cells.push([imageCell, textCell.length > 1 ? textCell : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
