const ARROW_SVG = `<svg class="service-panels-arrow" xmlns="http://www.w3.org/2000/svg" width="89" height="88" viewBox="0 0 89 88" fill="none" aria-hidden="true" focusable="false">
  <path d="M15.4883 44.1885L74.1549 44.1885" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52.1562 22.4365L74.1562 44.1865L52.1563 65.9365" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function decorate(block) {
  // Block-variant structure: each direct child row is one service panel,
  // containing a single cell wrapper with the panel content.
  const panels = [...block.children];
  block.classList.add(`service-panels-${panels.length}-cols`);

  panels.forEach((panel) => {
    panel.classList.add('service-panels-panel');
    // Unwrap the single cell so the heading/list are direct panel children.
    if (panel.children.length === 1 && !panel.firstElementChild.matches('h1, h2, h3, h4, h5, h6, ul')) {
      const cell = panel.firstElementChild;
      cell.replaceWith(...cell.childNodes);
    }

    // Build a header row: heading + arrow icon
    const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const header = document.createElement('div');
      header.className = 'service-panels-header';
      heading.before(header);
      header.append(heading);
      header.insertAdjacentHTML('beforeend', ARROW_SVG);
    }
  });
}
