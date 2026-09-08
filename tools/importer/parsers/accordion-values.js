/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-values. Base: accordion (xwalk container).
 * Source: https://credera.com/en-us/about-us + sibling about-us pages (values accordion).
 * Convention: 2 columns; each row = one accordion item:
 *   cell 1 = field:summary (mandatory clickable title/label),
 *   cell 2 = field:text (mandatory body content shown when expanded).
 * Item model fields: summary (text), text (richtext).
 */
export default function parse(element, { document }) {
  // Accordion items can appear as <details>/<summary>, or as label+body pairs.
  let items = Array.from(element.querySelectorAll('details'));

  // Fallback: explicit accordion item wrappers
  if (items.length === 0) {
    items = Array.from(
      element.querySelectorAll(
        '[class*="AccordionItem"], [class*="accordion-item"], [class*="ValueItem"], [class*="Accordion__Item"]',
      ),
    );
  }

  const cells = [];

  items.forEach((item) => {
    // Summary / label
    const summaryEl = item.querySelector(
      'summary, [class*="Summary"], [class*="Header"], [class*="Label"], [class*="Title"], h2, h3, h4, h5',
    );
    // Body / expandable content
    let bodyEl = item.querySelector(
      '[class*="Body"], [class*="Content"], [class*="Detail"], [class*="Panel"], [class*="Text"]',
    );
    // Avoid picking a container that also holds the summary
    if (bodyEl && summaryEl && bodyEl.contains(summaryEl)) bodyEl = null;

    const summaryText = summaryEl ? summaryEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const summaryCell = summaryText
      ? [document.createComment(' field:summary '), document.createTextNode(summaryText)]
      : '';

    const textCell = [document.createComment(' field:text ')];
    if (bodyEl) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = bodyEl.innerHTML;
      textCell.push(...wrapper.childNodes);
    }

    if (summaryText || textCell.length > 1) {
      cells.push([summaryCell, textCell.length > 1 ? textCell : '']);
    }
  });

  // Empty-block guard (this page's cached instance has no accordion content)
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-values', cells });
  element.replaceWith(block);
}
