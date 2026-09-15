/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Credera FAQ flattening.
 *
 * Source FAQ is a two-column masonry accordion. Each item is
 *   div.faq-question__QuestionWrapper
 *     └ button.faq-question__Question  →  <p> question  +  <img> caret
 *     └ div/p                          →  answer text
 * The accordion's interactivity, dividers, carets and two-column split are all
 * presentation. For the migrated page we want a single, sequential column with
 * each question as a heading (<h3>) and its answer as a paragraph, all visible.
 *
 * This runs in beforeTransform (before block parsing) and rewrites the FAQ
 * accordion into a single `div.faq` block whose children are, per item,
 * <h3>question</h3><p>answer</p> — dropping the button, caret image and
 * two-column masonry chrome. Wrapping in `div.faq` (an EDS block) lets the
 * blocks/faq/faq.css control typography, spacing and width without touching
 * other default content on the page. Items keep source (reading) order:
 * left column first, then right column, which is document order.
 */
const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const { document } = payload;
  const wrappers = Array.from(element.querySelectorAll('[class*="faq-question__QuestionWrapper"]'));
  if (!wrappers.length) return;

  // Collect one block row per Q&A pair, in reading order.
  const rows = [];

  wrappers.forEach((wrapper) => {
    // Question: the <p> inside the toggle button (fall back to the button text).
    const button = wrapper.querySelector('[class*="faq-question__Question"]') || wrapper.querySelector('button');
    const qEl = (button && button.querySelector('p')) || button;
    const question = qEl ? qEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Answer: paragraph(s) that live OUTSIDE the question button.
    const answers = [];
    wrapper.childNodes.forEach((node) => {
      if (node.nodeType !== 1) return; // elements only
      if (button && (node === button || button.contains(node))) return; // skip the question button
      node.querySelectorAll ? node.querySelectorAll('p').forEach((p) => {
        const t = p.textContent.replace(/\s+/g, ' ').trim();
        if (t) answers.push(t);
      }) : null;
      // node itself may be a <p>
      if (node.tagName === 'P') {
        const t = node.textContent.replace(/\s+/g, ' ').trim();
        if (t && !answers.includes(t)) answers.push(t);
      }
    });

    if (!question && !answers.length) return;

    // One block row per Q&A pair: a single cell holding the question heading
    // plus its answer paragraph(s).
    const cell = [];
    if (question) {
      const h3 = document.createElement('h3');
      h3.textContent = question;
      cell.push(h3);
    }
    answers.forEach((a) => {
      const p = document.createElement('p');
      p.textContent = a;
      cell.push(p);
    });
    rows.push([cell]);
  });

  if (!rows.length) return;

  // Build a real `faq` block table so it survives the markdown round-trip as an
  // EDS block (a bare wrapper div would be flattened away). blocks/faq/faq.css
  // then styles the questions/answers without touching other default content.
  const block = WebImporter.Blocks.createBlock(document, { name: 'faq', cells: rows });

  const first = wrappers[0];
  const gridRoot = first.closest('[class*="masonry-grid"]') || first.parentElement;
  (gridRoot || first).replaceWith(block);
  // Clean up any stray wrappers not inside the removed grid root.
  wrappers.forEach((w) => { if (w.parentNode) w.remove(); });
}
