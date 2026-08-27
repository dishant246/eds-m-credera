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
