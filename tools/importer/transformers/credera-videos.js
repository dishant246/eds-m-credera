/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Credera YouTube video embeds.
 *
 * The source renders videos as <iframe> players inside a
 * `video__IframeWrapper` (YouTube / youtube-nocookie embed URLs). The importer's
 * cleanup transformer strips all <iframe> elements, and the video's blur-up
 * placeholder <img> (a data:image/svg+xml) is what otherwise survives — leaving a
 * broken empty image where the video should be.
 *
 * This transformer runs in beforeTransform (BEFORE iframes are removed). For each
 * YouTube iframe it:
 *   - derives the canonical watch URL (https://www.youtube.com/watch?v=<id>),
 *   - replaces the whole iframe wrapper with a paragraph containing a bare link to
 *     that URL.
 * A bare YouTube link on its own line is turned into an embedded player at render
 * time by the youtube auto-block in scripts/scripts.js (buildYouTube).
 * It also removes the leftover blur-up placeholder <img> in the same section so no
 * broken image remains.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

function youtubeIdFromSrc(src) {
  if (!src) return null;
  // https://www.youtube-nocookie.com/embed/<id>?...  |  /embed/<id>  | watch?v=<id> | youtu.be/<id>
  let m = src.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/);
  if (m) return m[1];
  m = src.match(/[?&]v=([\w-]{6,})/);
  return m ? m[1] : null;
}

// Remove data: SVG blur-up placeholders that are the sole content of a paragraph
// (empty alt, one image, no text). Covers both the video placeholders and the
// gatsby hero-image lazy-load placeholder, which only become <p><picture><img>>
// after the importer restructures the DOM (hence also run in afterTransform).
function removeSvgPlaceholders(element) {
  // Gatsby blur-up placeholders are inline data: SVGs with empty alt — never real
  // content. Remove ONLY the image (and its <picture>); do NOT climb into ancestors
  // (that would delete real structural containers). An emptied <p> collapses
  // harmlessly in the markdown output.
  element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => {
    if ((img.getAttribute('alt') || '').trim() !== '') return;
    (img.closest('picture') || img).remove();
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // After restructuring, the gatsby hero placeholder lands as <p><picture><img
    // data:svg alt=""></picture></p>; strip it so no broken empty image renders.
    removeSvgPlaceholders(element);
    return;
  }
  if (hookName !== TransformHook.beforeTransform) return;

  const iframes = element.querySelectorAll('iframe[src*="youtube"], iframe[src*="youtu.be"]');
  iframes.forEach((iframe) => {
    const id = youtubeIdFromSrc(iframe.getAttribute('src'));
    if (!id) return;

    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    const doc = iframe.ownerDocument;
    const p = doc.createElement('p');
    const a = doc.createElement('a');
    a.setAttribute('href', watchUrl);
    a.textContent = watchUrl;
    p.appendChild(a);

    // Replace the closest video wrapper (so the empty description <p> goes too),
    // falling back to the iframe itself.
    const wrapper = iframe.closest('[class*="video__IframeWrapper"], [class*="VideoContainer"], [class*="VideoCarouselEmbed"]') || iframe;
    wrapper.replaceWith(p);
  });

  // Also strip any already-<p>-wrapped placeholders present at this stage.
  removeSvgPlaceholders(element);
}
