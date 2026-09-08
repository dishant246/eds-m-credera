/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-overview.js
  var import_about_overview_exports = {};
  __export(import_about_overview_exports, {
    default: () => import_about_overview_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document }) {
    const subtitleEl = element.querySelector('.hero-section__Subtitle-sc-3sq6vd-2, [class*="Subtitle-sc"]');
    const subtitleText = subtitleEl ? subtitleEl.textContent.trim() : "";
    const titleSpans = Array.from(
      element.querySelectorAll('.hero-section__DesktopTitleLayout-sc-3sq6vd-15 span[class*="TitleTextSpan"], [class*="DesktopTitleLayout"] span[class*="TitleTextSpan"]')
    );
    let titleText = titleSpans.map((s) => s.textContent.trim()).filter(Boolean).join(" ");
    if (!titleText) {
      const h1 = element.querySelector("h1");
      titleText = h1 ? h1.textContent.replace(/\s+/g, " ").trim() : "";
    }
    const bodyEl = element.querySelector('.hero-section__BodyText-sc-3sq6vd-9, [class*="BodyText-sc"]');
    const bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, " ").trim() : "";
    const bodyAccents = bodyEl ? Array.from(bodyEl.querySelectorAll("span")).map((s) => s.textContent.replace(/\s+/g, " ").trim()).filter(Boolean) : [];
    const ctaSource = element.querySelector('.hero-section__ButtonDiv-sc-3sq6vd-10 a, [class*="ButtonDiv"] a, a[class*="StyledLink"]');
    if (!titleText && !bodyText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [document.createComment(" field:text ")];
    if (subtitleText) {
      const p = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = subtitleText;
      p.appendChild(em);
      contentCell.push(p);
    }
    if (titleText) {
      const h1 = document.createElement("h1");
      h1.textContent = titleText;
      contentCell.push(h1);
    }
    if (bodyText) {
      const p = document.createElement("p");
      if (bodyAccents.length) {
        let remaining = bodyText;
        bodyAccents.forEach((phrase) => {
          const idx = remaining.indexOf(phrase);
          if (idx === -1) return;
          if (idx > 0) p.appendChild(document.createTextNode(remaining.slice(0, idx)));
          const strong = document.createElement("strong");
          strong.textContent = phrase;
          p.appendChild(strong);
          remaining = remaining.slice(idx + phrase.length);
        });
        if (remaining) p.appendChild(document.createTextNode(remaining));
      } else {
        p.textContent = bodyText;
      }
      contentCell.push(p);
    }
    if (ctaSource) {
      const a = document.createElement("a");
      a.setAttribute("href", ctaSource.getAttribute("href") || "#");
      a.textContent = ctaSource.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    const cells = [];
    cells.push([""]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-home", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-culture.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll('[class*="ImageDiv"]'));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const srcImg = card.querySelector('picture img[src^="http"], picture img');
      const dedupeKey = srcImg && srcImg.getAttribute("src") || (card.querySelector('[class*="AuthorName"]') || {}).textContent || "";
      if (dedupeKey && seen.has(dedupeKey)) return;
      if (dedupeKey) seen.add(dedupeKey);
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", srcImg.getAttribute("src"));
        if (srcImg.getAttribute("alt")) image.setAttribute("alt", srcImg.getAttribute("alt"));
        imageCell = [document.createComment(" field:image "), image];
      }
      const quoteEl = card.querySelector('[class*="QuoteText"]');
      const nameEl = card.querySelector('[class*="AuthorName"]');
      const titleEl = card.querySelector('[class*="AuthorTitle"]');
      const textCell = [document.createComment(" field:text ")];
      if (quoteEl && quoteEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = quoteEl.textContent.trim();
        textCell.push(p);
      }
      if (nameEl && nameEl.textContent.trim()) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = nameEl.textContent.trim();
        p.appendChild(strong);
        textCell.push(p);
      }
      if (titleEl && titleEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = titleEl.textContent.trim();
        textCell.push(p);
      }
      if (Array.isArray(imageCell) || textCell.length > 1) {
        cells.push([imageCell, textCell.length > 1 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-culture", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse3(element, { document }) {
    const imageContainer = element.querySelector('[class*="ImageContainer"]');
    const textContainer = element.querySelector('[class*="TextSectionContainer"]');
    const buildImageCol = () => {
      if (!imageContainer) return null;
      const srcImg = imageContainer.querySelector('picture img[src^="http"], picture img');
      if (!srcImg || !srcImg.getAttribute("src")) return null;
      const img = document.createElement("img");
      img.setAttribute("src", srcImg.getAttribute("src"));
      if (srcImg.getAttribute("alt")) img.setAttribute("alt", srcImg.getAttribute("alt"));
      return [img];
    };
    const buildTextCol = () => {
      if (!textContainer) return null;
      const parts = [];
      const label = textContainer.querySelector('[class*="TitleSetLabel"], p[class*="Label"]');
      if (label && label.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = label.textContent.trim();
        parts.push(p);
      }
      const heading = textContainer.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading && heading.textContent.trim()) {
        const h = document.createElement("h2");
        h.textContent = heading.textContent.trim();
        parts.push(h);
      }
      const paras = Array.from(textContainer.querySelectorAll('[class*="rich-paragraph"], [class*="TitleSetText"]'));
      const seenText = /* @__PURE__ */ new Set();
      paras.forEach((para) => {
        const t = para.textContent.trim();
        if (t && !seenText.has(t)) {
          seenText.add(t);
          const p = document.createElement("p");
          p.textContent = t;
          parts.push(p);
        }
      });
      const links = Array.from(textContainer.querySelectorAll("a[href]"));
      links.forEach((link) => {
        const href = link.getAttribute("href");
        const text = link.textContent.replace(/\s+/g, " ").trim();
        if (href && text) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = text;
          p.appendChild(a);
          parts.push(p);
        }
      });
      return parts.length ? parts : null;
    };
    const imageCol = buildImageCol();
    const textCol = buildTextCol();
    const cols = [];
    if (imageContainer && textContainer) {
      const imgFirst = imageContainer.compareDocumentPosition(textContainer) & 4;
      if (imgFirst) {
        if (imageCol) cols.push(imageCol);
        if (textCol) cols.push(textCol);
      } else {
        if (textCol) cols.push(textCol);
        if (imageCol) cols.push(imageCol);
      }
    } else {
      if (imageCol) cols.push(imageCol);
      if (textCol) cols.push(textCol);
    }
    if (cols.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [cols];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-testimonial.js
  function parse4(element, { document }) {
    const quoteEl = element.querySelector(
      '[class*="ElevatedContentTextContainer"] p[class*="StyledText"], [class*="TextContainer"] p, blockquote p, p'
    );
    const attrEl = element.querySelector(
      '[class*="ElevatedContentHeaderContainer"] h5, [class*="HeaderContainer"] h1, [class*="HeaderContainer"] h2, [class*="HeaderContainer"] h3, h5, h4, h3'
    );
    const cells = [];
    const quotationCell = [document.createComment(" field:quotation ")];
    if (quoteEl && quoteEl.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = quoteEl.textContent.trim();
      quotationCell.push(p);
    }
    const attributionCell = [document.createComment(" field:attribution ")];
    if (attrEl && attrEl.textContent.trim()) {
      const p = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = attrEl.textContent.trim();
      p.appendChild(em);
      attributionCell.push(p);
    }
    if (quotationCell.length === 1 && attributionCell.length === 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([quotationCell]);
    if (attributionCell.length > 1) cells.push([attributionCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-case-study.js
  function parse5(element, { document }) {
    const clean = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const buildCardRow = (img, titleText, categoryText, ctaHref, ctaLabel) => {
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
        imageCell = [document.createComment(" field:image "), image];
      }
      const textCell = [document.createComment(" field:text ")];
      if (titleText) {
        const h3 = document.createElement("h3");
        h3.textContent = titleText;
        textCell.push(h3);
      }
      if (categoryText) {
        const p = document.createElement("p");
        p.textContent = categoryText;
        textCell.push(p);
      }
      if (ctaHref && ctaLabel) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", ctaHref);
        a.textContent = ctaLabel;
        p.appendChild(a);
        textCell.push(p);
      }
      if (textCell.length > 1 || Array.isArray(imageCell)) {
        return [imageCell, textCell.length > 1 ? textCell : ""];
      }
      return null;
    };
    const isFeaturedAnchor = element.matches && element.matches('a[class*="CaseStudyContent"]');
    if (isFeaturedAnchor) {
      let scope = element.parentElement;
      while (scope && !scope.querySelector('img[class*="PosterImage"]')) {
        scope = scope.parentElement;
      }
      const titleEl = scope && scope.querySelector('[class*="CaseStudyTitle"]');
      if (!scope || !titleEl) {
        element.remove();
        return;
      }
      const categoryEl = scope.querySelector('[class*="CaseStudyCategory"]');
      const linkEl = scope.querySelector('a[class*="CaseStudyLink"]');
      const cardHref = element.getAttribute("href") || "";
      const ctaHref = linkEl && linkEl.getAttribute("href") || cardHref;
      const ctaLabel = linkEl ? clean(linkEl) : "";
      const row = buildCardRow(null, clean(titleEl), clean(categoryEl), ctaHref, ctaLabel);
      if (!row) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document, {
        name: "cards-case-study",
        cells: [row]
      });
      element.replaceWith(block2);
      const footer = scope.querySelector('[class*="CaseStudyFooter"]');
      if (footer) footer.remove();
      return;
    }
    const cards = Array.from(
      element.querySelectorAll('a[class*="CaseStudyWrapper"], a[class*="CaseStudyContent"]')
    );
    const cells = [];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const img = card.querySelector(
        'img[class*="CaseStudyImage"], [class*="ImageContainer"] img, [class*="ImageWrapper"] img'
      );
      const titleEl = card.querySelector('[class*="CaseStudyTitle"], h1, h2, h3, h4');
      let category = "";
      const candidates = card.querySelectorAll('[class*="Category"], [class*="Tag"], div, span, p');
      for (const el of candidates) {
        const t = el.textContent.replace(/\s+/g, " ").trim();
        if (t && t.includes("/") && t.length < 100 && el.children.length === 0) {
          category = t;
          break;
        }
      }
      const innerLink = card.querySelector('a[class*="CaseStudyLink"]');
      const ctaHref = innerLink && innerLink.getAttribute("href") || href;
      const ctaLabel = innerLink ? clean(innerLink) : "";
      const row = buildCardRow(img, clean(titleEl), category, ctaHref, ctaLabel);
      if (row) cells.push(row);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-case-study", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-award.js
  function parse6(element, { document }) {
    const icons = Array.from(
      element.querySelectorAll('[class*="IconContainer"] img, img[class*="Icon"]')
    );
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    icons.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src || seen.has(src)) return;
      seen.add(src);
      const image = document.createElement("img");
      image.setAttribute("src", src);
      if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
      const imageCell = [document.createComment(" field:image "), image];
      cells.push([imageCell, ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-award", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-office.js
  function parse7(element, { document }) {
    const cards = Array.from(element.querySelectorAll('[class*="OfficeCardContainer"]'));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const srcImg = card.querySelector('picture img[src^="http"], picture img');
      const titleEl = card.querySelector('[class*="OfficeTitle"]');
      const dedupeKey = srcImg && srcImg.getAttribute("src") || titleEl && titleEl.textContent.trim() || "";
      if (dedupeKey && seen.has(dedupeKey)) return;
      if (dedupeKey) seen.add(dedupeKey);
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", srcImg.getAttribute("src"));
        if (srcImg.getAttribute("alt")) image.setAttribute("alt", srcImg.getAttribute("alt"));
        imageCell = [document.createComment(" field:image "), image];
      }
      const addressEl = card.querySelector('[class*="OfficeAddress"]');
      const phoneEl = card.querySelector('[class*="OfficePhoneNumber"]');
      const viewLink = card.querySelector('a[class*="OfficeLink"]');
      const textCell = [document.createComment(" field:text ")];
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        textCell.push(h3);
      }
      if (addressEl) {
        const p = document.createElement("p");
        p.innerHTML = addressEl.innerHTML;
        textCell.push(p);
      }
      if (phoneEl && phoneEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = phoneEl.textContent.trim();
        textCell.push(p);
      }
      if (viewLink && viewLink.getAttribute("href")) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", viewLink.getAttribute("href"));
        a.textContent = viewLink.textContent.replace(/\s+/g, " ").trim() || "View Office";
        p.appendChild(a);
        textCell.push(p);
      }
      if (Array.isArray(imageCell) || textCell.length > 1) {
        cells.push([imageCell, textCell.length > 1 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-office", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-cta.js
  function parse8(element, { document }) {
    const titleEl = element.querySelector('h1, h2, [class*="MainTitle"]');
    const bodyEl = element.querySelector('[class*="BodyText"] p, [class*="BodyText"]');
    const ctaSource = element.querySelector('[class*="ButtonContainer"] a, a[class*="StyledLink"]');
    const titleText = titleEl ? titleEl.textContent.trim() : "";
    const bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (!titleText && !bodyText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [document.createComment(" field:text ")];
    if (titleText) {
      const h2 = document.createElement("h2");
      h2.textContent = titleText;
      contentCell.push(h2);
    }
    if (bodyText) {
      const p = document.createElement("p");
      p.textContent = bodyText;
      contentCell.push(p);
    }
    if (ctaSource) {
      const a = document.createElement("a");
      a.setAttribute("href", ctaSource.getAttribute("href") || "#");
      a.textContent = ctaSource.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    const cells = [];
    cells.push([""]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/credera-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Site header + top/desktop/mobile navigation.
        // Found in cleaned.html: <header class="header__HeaderWrapper..."> (line 5).
        "header",
        // Site footer (rendered as a div, not a <footer> tag).
        // Found in cleaned.html: <div class="footer__FooterWrapper-sc-la73ad-0 iyVUCf"> (line 641).
        '[class*="footer__FooterWrapper"]',
        // Empty screen-reader announcer injected by Gatsby.
        // Found in cleaned.html: <div id="gatsby-announcer"> (line 707).
        "#gatsby-announcer",
        // Safe non-authorable leftovers.
        "iframe",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/import-about-overview.js
  var parsers = {
    "hero-home": parse,
    "cards-culture": parse2,
    "columns-media": parse3,
    "quote-testimonial": parse4,
    "cards-case-study": parse5,
    "cards-award": parse6,
    "cards-office": parse7,
    "hero-cta": parse8
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "about-overview",
    description: "About-section overview page with intro heading and content blocks",
    urls: [
      "https://credera.com/en-us/about-us"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: ["main > div[class*=paper__PaperWrapper]:first-of-type [class*=paper__Content]"]
      },
      {
        name: "cards-culture",
        instances: ["main [class*=quote-carousel-level-one__DesktopSlider]"]
      },
      {
        name: "columns-media",
        instances: [
          "main > div[class*=animate-in__Fade]:nth-of-type(2)",
          "main > div[class*=paper__PaperWrapper]:nth-of-type(5)",
          "main > div[class*=paper__PaperWrapper]:nth-of-type(8)"
        ]
      },
      {
        name: "quote-testimonial",
        instances: ["#featuredContent"]
      },
      {
        name: "cards-case-study",
        instances: ["main > div[class*=animate-in__Fade]:nth-of-type(7)"]
      },
      {
        name: "cards-award",
        instances: ["main [class*=about-us-overview__IconsWrapper]"]
      },
      {
        name: "cards-office",
        instances: ["main > div[class*=paper__PaperWrapper]:nth-of-type(11)"]
      },
      {
        name: "hero-cta",
        instances: ["main > div[class*=footer-cta__FooterCtaWrapper]"]
      }
    ]
  };
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_overview_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll("img[src], source[srcset]").forEach((el) => {
        ["src", "srcset"].forEach((attr) => {
          const val = el.getAttribute(attr);
          if (!val) return;
          const m = val.match(/^https?:\/\/[^/]+(\/icons\/[^/?#]+\.svg)(?:[?#].*)?$/i);
          if (m) el.setAttribute(attr, m[1]);
        });
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_overview_exports);
})();
