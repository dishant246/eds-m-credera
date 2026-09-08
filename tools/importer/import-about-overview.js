/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import cardsCultureParser from './parsers/cards-culture.js';
import columnsMediaParser from './parsers/columns-media.js';
import quoteTestimonialParser from './parsers/quote-testimonial.js';
import cardsCaseStudyParser from './parsers/cards-case-study.js';
import cardsAwardParser from './parsers/cards-award.js';
import cardsOfficeParser from './parsers/cards-office.js';
import heroCtaParser from './parsers/hero-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/credera-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'cards-culture': cardsCultureParser,
  'columns-media': columnsMediaParser,
  'quote-testimonial': quoteTestimonialParser,
  'cards-case-study': cardsCaseStudyParser,
  'cards-award': cardsAwardParser,
  'cards-office': cardsOfficeParser,
  'hero-cta': heroCtaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-overview',
  description: 'About-section overview page with intro heading and content blocks',
  urls: [
    'https://credera.com/en-us/about-us',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ["main > div[class*=paper__PaperWrapper]:first-of-type [class*=paper__Content]"],
    },
    {
      name: 'cards-culture',
      instances: ["main [class*=quote-carousel-level-one__DesktopSlider]"],
    },
    {
      name: 'columns-media',
      instances: [
        "main > div[class*=animate-in__Fade]:nth-of-type(2)",
        "main > div[class*=paper__PaperWrapper]:nth-of-type(5)",
        "main > div[class*=paper__PaperWrapper]:nth-of-type(8)",
      ],
    },
    {
      name: 'quote-testimonial',
      instances: ["#featuredContent"],
    },
    {
      name: 'cards-case-study',
      instances: ["main > div[class*=animate-in__Fade]:nth-of-type(7)"],
    },
    {
      name: 'cards-award',
      instances: ["main [class*=about-us-overview__IconsWrapper]"],
    },
    {
      name: 'cards-office',
      instances: ["main > div[class*=paper__PaperWrapper]:nth-of-type(11)"],
    },
    {
      name: 'hero-cta',
      instances: ["main > div[class*=footer-cta__FooterCtaWrapper]"],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
    const { document, url, params } = payload;
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

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Re-relativize repo-committed icons (see import-home.js for rationale).
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
