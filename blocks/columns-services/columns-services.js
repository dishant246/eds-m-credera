const ARROW_SVG = `<svg class="columns-services-arrow" xmlns="http://www.w3.org/2000/svg" width="89" height="88" viewBox="0 0 89 88" fill="none" aria-hidden="true" focusable="false">
  <path d="M15.4883 44.1885L74.1549 44.1885" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52.1562 22.4365L74.1562 44.1865L52.1563 65.9365" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function decorate(block) {
  const panels = [...block.firstElementChild.children];
  block.classList.add(`columns-services-${panels.length}-cols`);

  panels.forEach((panel) => {
    panel.classList.add('columns-services-panel');

    // Build a header row: heading + arrow icon
    const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const header = document.createElement('div');
      header.className = 'columns-services-header';
      heading.before(header);
      header.append(heading);
      header.insertAdjacentHTML('beforeend', ARROW_SVG);
    }
  });
}
