/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsInsightParser from './parsers/cards-insight.js';
import cardsCaseStudyParser from './parsers/cards-case-study.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import cardsOfficeParser from './parsers/cards-office.js';
import heroCtaParser from './parsers/hero-cta.js';

// TRANSFORMER IMPORTS
import videosTransformer from './transformers/credera-videos.js';
import cleanupTransformer from './transformers/credera-cleanup.js';
import sectionsTransformer from './transformers/credera-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'columns-feature': columnsFeatureParser,
  'cards-insight': cardsInsightParser,
  'cards-case-study': cardsCaseStudyParser,
  'carousel-awards': carouselAwardsParser,
  'cards-office': cardsOfficeParser,
  'hero-cta': heroCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'careers-overview',
  description: 'Careers overview page: intro, value props, and open-roles CTA',
  urls: [
    'https://credera.com/en-us/careers',
    'https://credera.com/en-us/careers/experienced-professionals',
    'https://credera.com/en-us/careers/students',
    'https://credera.com/en-us/pegaworld-2025-forrester-roundtable',
    'https://credera.com/en-us/salesforce-dreamforce-2024',
    'https://credera.com/en-us/salesforce-world-tour-2024',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ["div[class*='careers__OverviewHeroSection']"],
    },
    {
      name: 'columns-feature',
      instances: [
        // Only the "Life at Credera" instance has an image; the section-1
        // "Leaving a legacy" statement uses the same class but is default content
        // (no image), so scope with :has(img) to exclude it.
        "div[class*='image-with-titleset__SectionContainer']:has(img)",
        '#featuredContent',
      ],
    },
    {
      name: 'cards-insight',
      instances: ["div[class*='video-carousel__CarouselContainer']"],
    },
    {
      name: 'cards-case-study',
      // Target just the two-card POV wrapper; the preceding intro title-set
      // ("Careers at Credera" / "Start your Credera journey.") stays as default content.
      instances: ["div[class*='our-impact__POVWrapper']"],
    },
    {
      name: 'carousel-awards',
      instances: ["div[class*='award-carousel__CarouselContainer']"],
    },
    {
      name: 'cards-office',
      instances: ["div[class*='office-carousel__DesktopCarousel']"],
    },
    {
      name: 'hero-cta',
      instances: ["div[class*='footer-cta__FooterCtaWrapper']"],
    },
  ],
  sections: [
    { id: 'rc1', name: 'hero', selector: ["div[class*='paper__PaperWrapper']:nth-of-type(1)"], style: null, blocks: ['hero-home'], defaultContent: [] },
    { id: 'rc2', name: 'life-at-credera-feature', selector: ["div[class*='animate-in__Fade']:nth-of-type(2)"], style: null, blocks: ['columns-feature'], defaultContent: [] },
    { id: 'rc3', name: 'featured-content-callout', selector: ['#featuredContent'], style: null, blocks: ['columns-feature'], defaultContent: [] },
    { id: 'rc4', name: 'video-gallery', selector: ["div[class*='paper__PaperWrapper']:nth-of-type(5)"], style: null, blocks: ['cards-insight'], defaultContent: [] },
    { id: 'rc5', name: 'divider-spacer', selector: ["div[class*='paper__PaperWrapper']:nth-of-type(6)"], style: null, blocks: [], defaultContent: [] },
    { id: 'rc6', name: 'journey-teasers', selector: ["div[class*='animate-in__Fade']:nth-of-type(7)"], style: null, blocks: ['cards-case-study'], defaultContent: [] },
    { id: 'rc7', name: 'awards-offices-cta', selector: ["div[class*='paper__PaperWrapper']:nth-of-type(8)"], style: null, blocks: ['carousel-awards', 'cards-office', 'hero-cta'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
// Section transformer runs after cleanup; include it only when the template has 2+ sections.
const transformers = [
  // videos first: convert YouTube iframes → watch links BEFORE cleanup strips iframes.
  videosTransformer,
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block, skipping any already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Re-relativize repo-committed icons served from this site's /icons/ folder,
    // so JCR packaging doesn't rewrite them into non-existent /content/dam/ paths.
    main.querySelectorAll('img[src], source[srcset]').forEach((el) => {
      ['src', 'srcset'].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        const m = val.match(/^https?:\/\/[^/]+(\/icons\/[^/?#]+\.svg)(?:[?#].*)?$/i);
        if (m) el.setAttribute(attr, m[1]);
      });
    });

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
