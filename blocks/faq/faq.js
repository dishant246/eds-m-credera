/**
 * loads and decorates the faq block
 *
 * Authored structure (from the FAQ import transformer): the block holds one row
 * per Q&A pair, each row a single cell containing an <h3> question followed by
 * one or more answer <p>s.
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
    const cell = row.firstElementChild || row;
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    const answers = [...cell.querySelectorAll('p')];

    const item = document.createElement('div');
    item.className = 'faq-item';

    const button = document.createElement('button');
    button.className = 'faq-question';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.className = 'faq-question-text';
    label.textContent = heading ? heading.textContent : cell.textContent.trim();
    const caret = document.createElement('span');
    caret.className = 'faq-caret';
    caret.setAttribute('aria-hidden', 'true');
    button.append(label, caret);

    const panel = document.createElement('div');
    panel.className = 'faq-answer';
    panel.hidden = true;
    answers.forEach((p) => panel.append(p));

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
