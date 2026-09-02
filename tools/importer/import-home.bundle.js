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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
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

  // tools/importer/parsers/service-panels.js
  function parse2(element, { document }) {
    const titleEls = Array.from(
      element.querySelectorAll('[class*="ServiceTitle"]')
    );
    const buttonGroups = Array.from(
      element.querySelectorAll('[class*="ServiceButtons"]')
    );
    const cells = [];
    const count = Math.max(titleEls.length, buttonGroups.length);
    for (let i = 0; i < count; i += 1) {
      const cellContent = [];
      const titleEl = titleEls[i];
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        cellContent.push(h3);
      }
      const group = buttonGroups[i];
      if (group) {
        const links = Array.from(group.querySelectorAll('a[class*="ServiceButton"], a'));
        const ul = document.createElement("ul");
        const seen = /* @__PURE__ */ new Set();
        links.forEach((link) => {
          const label = link.textContent.trim();
          const href = link.getAttribute("href") || "";
          if (!label || seen.has(label)) return;
          seen.add(label);
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.setAttribute("href", href || "#");
          a.textContent = label;
          li.appendChild(a);
          ul.appendChild(li);
        });
        if (ul.childNodes.length) cellContent.push(ul);
      }
      if (cellContent.length) cells.push([cellContent]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "service-panels", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/marquee.js
  function parse3(element, { document }) {
    const items = Array.from(
      element.querySelectorAll('[class*="TickerText"]')
    );
    const phrases = items.map((item) => item.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (phrases.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [document.createComment(" field:text ")];
    phrases.forEach((phrase) => {
      const p = document.createElement("p");
      p.textContent = phrase;
      contentCell.push(p);
    });
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "marquee", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-case-study.js
  function parse4(element, { document }) {
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

  // tools/importer/parsers/cards-partner.js
  function parse5(element, { document }) {
    const cards = Array.from(
      element.querySelectorAll('a[class*="PartnerBlockWrapper"]')
    );
    const cells = [];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const nameEl = card.querySelector('[class*="PartnerName"], h2, h3');
      const descEl = card.querySelector('[class*="PartnerDescription"], p');
      const imageCell = "";
      const textCell = [document.createComment(" field:text ")];
      if (nameEl && nameEl.textContent.trim()) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = nameEl.textContent.trim();
          h3.appendChild(a);
        } else {
          h3.textContent = nameEl.textContent.trim();
        }
        textCell.push(h3);
      }
      if (descEl && descEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        textCell.push(p);
      }
      if (textCell.length > 1) {
        cells.push([imageCell, textCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-partner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-industry.js
  var ICON_BY_SLUG = {
    "consumer": "/icons/industry-consumer.svg",
    "energy-and-resources": "/icons/industry-energy-resources.svg",
    "financial-services": "/icons/industry-financial-services.svg",
    "healthcare-life-sciences": "/icons/industry-healthcare-life-sciences.svg",
    "technology-media-telecommunications": "/icons/industry-tech-media-telecom.svg",
    "publicsector": "/icons/industry-public-sector.svg",
    "business-and-industrial-markets": "/icons/industry-business-industrial-markets.svg"
  };
  function slugFromHref(href) {
    const m = (href || "").match(/\/industries\/([^/?#]+)/);
    return m ? m[1] : "";
  }
  function parse6(element, { document }) {
    const links = Array.from(
      element.querySelectorAll('a[class*="IndustryLinkContainer"]')
    );
    const cells = [];
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const nameParts = Array.from(link.querySelectorAll('[class*="IndustryNameText"]')).map((s) => s.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      const name = nameParts.join(" ").replace(/\s+/g, " ").trim();
      const img = link.querySelector("img");
      const slug = slugFromHref(href);
      let src = ICON_BY_SLUG[slug] || "";
      if (!src && img) {
        const liveSrc = img.getAttribute("src") || "";
        if (liveSrc && !liveSrc.startsWith("blob:")) src = liveSrc;
      }
      const alt = img && img.getAttribute("alt") || (name ? name + " icon" : "");
      let imageCell = "";
      if (src) {
        const picture = document.createElement("img");
        picture.setAttribute("src", src);
        if (alt) picture.setAttribute("alt", alt);
        imageCell = [document.createComment(" field:image "), picture];
      }
      const textCell = [document.createComment(" field:text ")];
      if (name) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = name;
          h3.appendChild(a);
        } else {
          h3.textContent = name;
        }
        textCell.push(h3);
      }
      if (textCell.length > 1 || Array.isArray(imageCell)) {
        cells.push([imageCell, textCell.length > 1 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-industry", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insight.js
  function parse7(element, { document }) {
    const cards = Array.from(
      element.querySelectorAll('a[class*="InsightCard"]')
    );
    const cells = [];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const img = card.querySelector('img[class*="CardImage"], [class*="CardImageWrapper"] img');
      const titleEl = card.querySelector('[class*="CardTitle"], h3, h2');
      const categoryEl = card.querySelector('[class*="CardCategory"]');
      const linkLabelEl = card.querySelector('[class*="CardLink"]');
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
        imageCell = [document.createComment(" field:image "), image];
      }
      const textCell = [document.createComment(" field:text ")];
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        textCell.push(h3);
      }
      if (categoryEl && categoryEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = categoryEl.textContent.trim();
        textCell.push(p);
      }
      const linkLabel = linkLabelEl ? linkLabelEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (href && linkLabel) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = linkLabel;
        p.appendChild(a);
        textCell.push(p);
      }
      if (textCell.length > 1 || Array.isArray(imageCell)) {
        cells.push([imageCell, textCell.length > 1 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-insight", cells });
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

  // tools/importer/import-home.js
  var parsers = {
    "hero-home": parse,
    "service-panels": parse2,
    "marquee": parse3,
    "cards-case-study": parse4,
    "cards-partner": parse5,
    "cards-industry": parse6,
    "cards-insight": parse7,
    "hero-cta": parse8
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Credera homepage: hero, service columns, marquee, case studies, partners, industries, insights, and closing CTA banner",
    urls: [
      "https://credera.com/en-us"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: ["div[class*='hero-section__HeroSectionWrapper-sc-3sq6vd-11']"]
      },
      {
        name: "service-panels",
        instances: ["div[class*='service-area-section__ServiceSectionWrapper-sc-12cthmn-0']"]
      },
      {
        name: "marquee",
        instances: ["div[class*='ticker-section__TickerSectionWrapper-sc-1z011le-0']"]
      },
      {
        name: "cards-case-study",
        instances: [
          "a[class*='video-background__CaseStudyContent-sc-2dfmhx-14']",
          "div[class*='case-study-section__CaseStudySectionWrapper-sc-khm5cf-0']"
        ]
      },
      {
        name: "cards-partner",
        instances: ["div[class*='partner-section__PartnerSectionWrapper-sc-gmccoy-2']"]
      },
      {
        name: "cards-industry",
        instances: ["div[class*='industry-section__IndustrySectionWrapper-sc-zjmgb9-2']"]
      },
      {
        name: "cards-insight",
        instances: ["div[class*='insights-section__InsightsSectionWrapper-sc-1wde3jh-0']"]
      },
      {
        name: "hero-cta",
        instances: ["div[class*='footer-cta__FooterCtaWrapper-sc-1dcaamq-0']"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = {
      ...payload,
      template: PAGE_TEMPLATE
    };
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
  var import_home_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
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
  return __toCommonJS(import_home_exports);
})();
