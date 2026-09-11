import { moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-awards-slide');
  if (!slides.length) return;
  let realIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realIndex = 0;
  const activeSlide = slides[realIndex];
  block.dataset.activeSlide = realIndex;
  block.querySelector('.carousel-awards-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function bindEvents(block) {
  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.dataset.activeSlide = entry.target.dataset.slideIndex;
      }
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-awards-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * loads and decorates the carousel-awards block
 *
 * Expected authored structure: one row per award badge, each containing an image.
 * Renders a horizontally scrolling track of award badges with prev/next navigation.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.dataset.activeSlide = 0;

  const container = document.createElement('div');
  container.classList.add('carousel-awards-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-awards-slides');

  rows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.classList.add('carousel-awards-slide');
    slide.dataset.slideIndex = idx;
    [...row.children].forEach((col) => {
      col.classList.add('carousel-awards-slide-image');
      slide.append(col);
    });
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);

  if (!isSingleSlide) {
    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-awards-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous"></button>
      <button type="button" class="slide-next" aria-label="Next"></button>
    `;
    container.append(navButtons);
  }

  block.prepend(container);

  // optimize badge images
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    img.closest('picture').replaceWith(optimized);
  });

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
