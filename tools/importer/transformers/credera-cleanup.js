/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Credera site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html (Credera homepage).
 * Removes non-authorable site chrome and third-party widgets so the import
 * contains only page-level authorable content.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent / overlay widget (blocks parsing) — OneTrust.
    // Found in cleaned.html: <div id="onetrust-consent-sdk"> (line 714),
    // which also contains <iframe class="ot-text-resize"> (line 964).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      // Responsive DUPLICATES: the careers page renders both a desktop AND a
      // mobile variant of the office and awards carousels in the DOM (one hidden
      // via CSS). The block parsers target the Desktop variants; the Mobile
      // variants carry the same office/award content and would otherwise fall
      // through as raw default content (duplicated office cards / award badges).
      // Remove them before parsing so each block's content appears exactly once.
      '[class*="office-carousel__MobileColumnContainer"]',
      '[class*="award-carousel__MobileCarousel"]',
      // Bailey Dunn "featured content" callout: the mobile variant duplicates the
      // desktop #featuredContent callout and would otherwise import as a second,
      // raw copy below the columns-feature block.
      '[class*="elevated-content__ElevatedContentMobile"]',
      // Breadcrumb band above the careers sub-page heroes (Careers / Students).
      // It's site chrome, not authorable content — without removing it, it (and
      // the adjacent stray "Careers" back-link) leak into the hero section as
      // loose default content above the hero-home block.
      '[class*="breadcrumbs__BandWrapper"]',
      'nav[aria-label="Breadcrumb"]',
      // Students / experienced-professionals testimonial quote carousel: the
      // MobileSlider duplicates the 7 (or 5) desktop QuoteWrapper cards. The
      // cards-testimonial parser reads the DesktopSlider; remove the mobile copy
      // so the same testimonials don't fall through as raw default content below
      // the block.
      '[class*="quote-carousel-level-one__MobileSlider"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome.
    WebImporter.DOMUtils.remove(element, [
      // Site header + top/desktop/mobile navigation.
      // Found in cleaned.html: <header class="header__HeaderWrapper..."> (line 5).
      'header',
      // Site footer (rendered as a div, not a <footer> tag).
      // Found in cleaned.html: <div class="footer__FooterWrapper-sc-la73ad-0 iyVUCf"> (line 641).
      '[class*="footer__FooterWrapper"]',
      // Empty screen-reader announcer injected by Gatsby.
      // Found in cleaned.html: <div id="gatsby-announcer"> (line 707).
      '#gatsby-announcer',
      // Safe non-authorable leftovers.
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
