/**
 * loads and decorates the faq block
 *
 * Authored structure: the block holds one row per Q&A pair. The row can be
 * authored two ways, both supported here:
 *   1. Two cells (Universal Editor faq-item model): cell 1 = Question text,
 *      cell 2 = Answer richtext (one or more <p>s).
 *   2. A single cell (legacy/imported content): an <h3> question followed by
 *      one or more answer <p>s.
 *
 * Rendered behaviour (matches the source site):
 *  - Two columns on desktop; items fill the left column first, then the right.
 *  - Each question is an accordion: clicking the question toggles its answer.
 *  - The first item is expanded by default; all others start collapsed.
 *  - A caret indicates state and a divider separates consecutive items.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Build an accordion item (button + answer panel) from each row's contents.
  const items = rows.map((row) => {
    const cells = [...row.children];

    // Two-cell (authored) structure: question cell + answer cell.
    // Single-cell (imported) structure: <h3> question + answer <p>s together.
    let questionText;
    let answerNodes;
    if (cells.length >= 2) {
      questionText = cells[0].textContent.trim();
      answerNodes = [...cells[1].childNodes];
    } else {
      const cell = cells[0] || row;
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      questionText = heading ? heading.textContent.trim() : cell.textContent.trim();
      if (heading) heading.remove();
      answerNodes = [...cell.childNodes];
    }

    const item = document.createElement('div');
    item.className = 'faq-item';

    const button = document.createElement('button');
    button.className = 'faq-question';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.className = 'faq-question-text';
    label.textContent = questionText;
    const caret = document.createElement('span');
    caret.className = 'faq-caret';
    caret.setAttribute('aria-hidden', 'true');
    button.append(label, caret);

    const panel = document.createElement('div');
    panel.className = 'faq-answer';
    panel.hidden = true;
    answerNodes.forEach((node) => panel.append(node));

    button.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      panel.hidden = !isOpen;
    });

    item.append(button, panel);
    return item;
  });

  // Distribute items across two columns: left column fills first (source order).
  const left = document.createElement('div');
  left.className = 'faq-column';
  const right = document.createElement('div');
  right.className = 'faq-column';
  const half = Math.ceil(items.length / 2);
  items.forEach((item, i) => (i < half ? left : right).append(item));

  // All items start collapsed on page load.

  block.textContent = '';
  block.append(left, right);
}
