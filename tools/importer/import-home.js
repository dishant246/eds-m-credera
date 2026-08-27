/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import columnsServicesParser from './parsers/columns-services.js';
import marqueeParser from './parsers/marquee.js';
import cardsCaseStudyParser from './parsers/cards-case-study.js';
import cardsPartnerParser from './parsers/cards-partner.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import cardsInsightParser from './parsers/cards-insight.js';
import heroCtaParser from './parsers/hero-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/credera-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'columns-services': columnsServicesParser,
  'marquee': marqueeParser,
  'cards-case-study': cardsCaseStudyParser,
  'cards-partner': cardsPartnerParser,
  'cards-industry': cardsIndustryParser,
  'cards-insight': cardsInsightParser,
  'hero-cta': heroCtaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Credera homepage: hero, service columns, marquee, case studies, partners, industries, insights, and closing CTA banner',
  urls: [
    'https://credera.com/en-us',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ["div[class*='hero-section__HeroSectionWrapper-sc-3sq6vd-11']"],
    },
    {
      name: 'columns-services',
      instances: ["div[class*='service-area-section__ServiceSectionWrapper-sc-12cthmn-0']"],
    },
    {
      name: 'marquee',
      instances: ["div[class*='ticker-section__TickerSectionWrapper-sc-1z011le-0']"],
    },
    {
      name: 'cards-case-study',
      instances: [
        "a[class*='video-background__CaseStudyContent-sc-2dfmhx-14']",
        "div[class*='case-study-section__CaseStudySectionWrapper-sc-khm5cf-0']",
      ],
    },
    {
      name: 'cards-partner',
      instances: ["div[class*='partner-section__PartnerSectionWrapper-sc-gmccoy-2']"],
    },
    {
      name: 'cards-industry',
      instances: ["div[class*='industry-section__IndustrySectionWrapper-sc-zjmgb9-2']"],
    },
    {
      name: 'cards-insight',
      instances: ["div[class*='insights-section__InsightsSectionWrapper-sc-1wde3jh-0']"],
    },
    {
      name: 'hero-cta',
      instances: ["div[class*='footer-cta__FooterCtaWrapper-sc-1dcaamq-0']"],
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

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
