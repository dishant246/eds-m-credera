/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Credera careers-overview section breaks.
 *
 * The careers-overview template defines 7 sections (see tools/importer/page-templates.json).
 * All section styles are null, so no Section Metadata blocks are emitted — only
 * section breaks (<hr>) between consecutive sections (expected: sections.length - 1 = 6).
 *
 * Selectors come straight from the DOM-verified `selector` arrays in page-templates.json
 * (validated against migration-work/cleaned.html). Breaks are inserted in beforeTransform,
 * while every section element still exists (block parsers run between the hooks and call
 * element.replaceWith(block), so a section boundary that is also a parser target would be
 * gone by afterTransform). <hr> is not a <div>, so inserting it never disturbs any parser's
 * :nth-of-type selectors. Sections are iterated in reverse so inserting relative to a live
 * element never shifts a not-yet-processed section.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Emit Section Metadata blocks for any styled section. On careers-overview all
    // styles are null, so this loop is a no-op today, but it keeps the transformer
    // correct if a style is added to the template later.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
