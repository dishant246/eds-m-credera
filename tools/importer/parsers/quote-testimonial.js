/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-testimonial. Base: quote (xwalk simple block).
 * Source: https://credera.com/en-us/about-us (#featuredContent elevated content).
 * Simple block, 1 column, 1 row per field:
 *   row 1 = field:quotation (the quote text),
 *   row 2 = field:attribution (person / source of the quote).
 * Model fields: quotation (richtext), attribution (richtext).
 */
export default function parse(element, { document }) {
  // Quote text: the rich paragraph inside the text container
  const quoteEl = element.querySelector(
    '[class*="ElevatedContentTextContainer"] p[class*="StyledText"], [class*="TextContainer"] p, blockquote p, p',
  );
  // Attribution: heading / person name associated with the quote
  const attrEl = element.querySelector(
    '[class*="ElevatedContentHeaderContainer"] h5, [class*="HeaderContainer"] h1, [class*="HeaderContainer"] h2, [class*="HeaderContainer"] h3, h5, h4, h3',
  );

  const cells = [];

  // Quotation row
  const quotationCell = [document.createComment(' field:quotation ')];
  if (quoteEl && quoteEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = quoteEl.textContent.trim();
    quotationCell.push(p);
  }

  // Attribution row (wrapped in <em> so the block JS renders a <cite>)
  const attributionCell = [document.createComment(' field:attribution ')];
  if (attrEl && attrEl.textContent.trim()) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = attrEl.textContent.trim();
    p.appendChild(em);
    attributionCell.push(p);
  }

  // Empty-block guard
  if (quotationCell.length === 1 && attributionCell.length === 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([quotationCell]);
  if (attributionCell.length > 1) cells.push([attributionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-testimonial', cells });
  element.replaceWith(block);
}
