import { moveInstrumentation } from '../../scripts/scripts.js';

const SPARK_ICON = new URL('./spark.png', import.meta.url).href;

/**
 * loads and decorates the marquee (auto-scrolling text ribbon)
 * Each repeated unit is a spark icon followed by the ribbon text.
 * @param {Element} block The marquee block element
 */
export default function decorate(block) {
  // The authored content lives in the block's first cell as one or more
  // paragraphs, all repeating the same ribbon phrase. Use the first one.
  const cell = block.firstElementChild?.firstElementChild || block.firstElementChild;
  const firstParagraph = cell?.querySelector('p');
  const text = (firstParagraph?.textContent || cell?.textContent || '').trim();

  // Builds a single ribbon unit: spark icon + ribbon text.
  const buildUnit = () => {
    const unit = document.createElement('div');
    unit.className = 'marquee-item';

    const icon = document.createElement('img');
    icon.className = 'marquee-spark';
    icon.src = SPARK_ICON;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    icon.width = 80;
    icon.height = 80;
    icon.loading = 'lazy';
    icon.decoding = 'async';

    const label = document.createElement('span');
    label.className = 'marquee-label';
    label.textContent = text;

    unit.append(icon, label);
    return unit;
  };

  const track = document.createElement('div');
  track.className = 'marquee-track';

  // One visible sequence of units, then a duplicate sequence so the
  // translateX(-50%) loop is seamless.
  const UNITS_PER_SEQUENCE = 8;
  const sequence = document.createDocumentFragment();
  for (let i = 0; i < UNITS_PER_SEQUENCE; i += 1) {
    sequence.append(buildUnit());
  }

  const firstSequence = sequence.cloneNode(true);
  const secondSequence = sequence.cloneNode(true);
  // Duplicated half is decorative only.
  secondSequence.querySelectorAll('.marquee-item').forEach((el) => el.setAttribute('aria-hidden', 'true'));

  track.append(firstSequence, secondSequence);

  // Preserve authoring instrumentation on the block wrapper if present.
  if (firstParagraph) moveInstrumentation(firstParagraph, block);

  block.textContent = '';
  block.append(track);
}
