/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-careers-overview.js
  var import_careers_overview_exports = {};
  __export(import_careers_overview_exports, {
    default: () => import_careers_overview_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document: document2 }) {
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
    const contentCell = [document2.createComment(" field:text ")];
    if (subtitleText) {
      const p = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = subtitleText;
      p.appendChild(em);
      contentCell.push(p);
    }
    if (titleText) {
      const h1 = document2.createElement("h1");
      h1.textContent = titleText;
      contentCell.push(h1);
    }
    if (bodyText) {
      const p = document2.createElement("p");
      if (bodyAccents.length) {
        let remaining = bodyText;
        bodyAccents.forEach((phrase) => {
          const idx = remaining.indexOf(phrase);
          if (idx === -1) return;
          if (idx > 0) p.appendChild(document2.createTextNode(remaining.slice(0, idx)));
          const strong = document2.createElement("strong");
          strong.textContent = phrase;
          p.appendChild(strong);
          remaining = remaining.slice(idx + phrase.length);
        });
        if (remaining) p.appendChild(document2.createTextNode(remaining));
      } else {
        p.textContent = bodyText;
      }
      contentCell.push(p);
    }
    if (ctaSource) {
      const a = document2.createElement("a");
      a.setAttribute("href", ctaSource.getAttribute("href") || "#");
      a.textContent = ctaSource.textContent.trim();
      const p = document2.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    const cells = [];
    cells.push([""]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-home", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document: document2 }) {
    const clean = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const labelEl = element.querySelector('[class*="TitleSetLabel"], [class*="StyledLabel"]');
    const headingEl = element.querySelector(
      'h2, h3, h4, h5, [class*="TitleSetHeading"], [class*="HeaderContainer"] h1'
    );
    let bodyText = "";
    const bodyEl = element.querySelector('[class*="TitleSetText"], p[class*="StyledText"]');
    if (bodyEl) {
      bodyText = clean(bodyEl);
    } else {
      const textContainer = element.querySelector('[class*="TextContainer"], [class*="ContentContainer"]');
      if (textContainer) {
        const cloneC = textContainer.cloneNode(true);
        cloneC.querySelectorAll("h1, h2, h3, h4, h5, h6, a").forEach((n) => n.remove());
        bodyText = clean(cloneC);
      }
    }
    const ctaEl = element.querySelector('[class*="CTALinkInternal"], a[class*="StyledLink"], a[linkstyle]');
    const firstSrcsetUrl = (node) => {
      const set = node && node.getAttribute("srcset");
      if (!set) return "";
      const first = set.split(",")[0].trim().split(/\s+/)[0];
      return first && !first.startsWith("data:") ? first : "";
    };
    let realSrc = "";
    let realImg = null;
    const imgCandidates = Array.from(
      element.querySelectorAll('[class*="ImageContainer"] img, [class*="Person"] picture img, picture img, img')
    );
    for (const candidate of imgCandidates) {
      const src = candidate.getAttribute("src") || "";
      if (src && !src.startsWith("data:")) {
        realImg = candidate;
        realSrc = src;
        break;
      }
      let fromSet = firstSrcsetUrl(candidate);
      if (!fromSet) {
        const pic = candidate.closest("picture");
        if (pic) {
          for (const source of pic.querySelectorAll("source")) {
            fromSet = firstSrcsetUrl(source);
            if (fromSet) break;
          }
        }
      }
      if (fromSet) {
        realImg = candidate;
        realSrc = fromSet;
        break;
      }
    }
    if (!clean(headingEl) && !bodyText && !realImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    const labelText = clean(labelEl);
    if (labelText) {
      const p = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = labelText;
      p.appendChild(em);
      textCell.push(p);
    }
    const headingText = clean(headingEl);
    if (headingText) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingText;
      textCell.push(h2);
    }
    if (bodyText) {
      const p = document2.createElement("p");
      p.textContent = bodyText;
      textCell.push(p);
    }
    if (ctaEl) {
      const a = document2.createElement("a");
      a.setAttribute("href", ctaEl.getAttribute("href") || "#");
      a.textContent = clean(ctaEl);
      const p = document2.createElement("p");
      p.appendChild(a);
      textCell.push(p);
    }
    let mediaCell = "";
    if (realImg) {
      const image = document2.createElement("img");
      image.setAttribute("src", realImg.getAttribute("src"));
      if (realImg.getAttribute("alt")) image.setAttribute("alt", realImg.getAttribute("alt"));
      mediaCell = image;
    }
    const cells = [];
    cells.push([textCell.length ? textCell : "", mediaCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insight.js
  function parse3(element, { document: document2 }) {
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
        const image = document2.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
        imageCell = [document2.createComment(" field:image "), image];
      }
      const textCell = [document2.createComment(" field:text ")];
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        textCell.push(h3);
      }
      if (categoryEl && categoryEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = categoryEl.textContent.trim();
        textCell.push(p);
      }
      const linkLabel = linkLabelEl ? linkLabelEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (href && linkLabel) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-insight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-case-study.js
  function parse4(element, { document: document2 }) {
    const clean = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const buildCardRow = (img, titleText, categoryText, ctaHref, ctaLabel) => {
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const image = document2.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
        imageCell = [document2.createComment(" field:image "), image];
      }
      const textCell = [document2.createComment(" field:text ")];
      if (titleText) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleText;
        textCell.push(h3);
      }
      if (categoryText) {
        const p = document2.createElement("p");
        p.textContent = categoryText;
        textCell.push(p);
      }
      if (ctaHref && ctaLabel) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
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
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-case-study",
        cells: [row]
      });
      element.replaceWith(block2);
      const footer = scope.querySelector('[class*="CaseStudyFooter"]');
      if (footer) footer.remove();
      return;
    }
    const povCards = Array.from(element.querySelectorAll('[class*="ContentWrapper"]')).filter((c) => c.querySelector("img") && c.querySelector("h1, h2, h3, h4"));
    if (povCards.length) {
      const povCells = [];
      povCards.forEach((card) => {
        const img = card.querySelector("img");
        const titleEl = card.querySelector('h1, h2, h3, h4, [class*="TitleSetHeading"]');
        const descEl = card.querySelector('p[class*="TitleSetText"], p[class*="StyledText"], p');
        const linkEl = card.querySelector('a[class*="ReadMoreLink"], a[class*="StyledLink"], a[href]');
        const ctaHref = linkEl && linkEl.getAttribute("href") || "";
        const ctaLabel = linkEl ? clean(linkEl) : "";
        const row = buildCardRow(img, clean(titleEl), clean(descEl), ctaHref, ctaLabel);
        if (row) povCells.push(row);
      });
      if (povCells.length) {
        const block2 = WebImporter.Blocks.createBlock(document2, {
          name: "cards-case-study",
          cells: povCells
        });
        element.replaceWith(block2);
        return;
      }
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-case-study", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse5(element, { document: document2 }) {
    const imgs = Array.from(
      element.querySelectorAll('[class*="GridImageContainer"] img, .slide picture img, picture img')
    );
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    imgs.forEach((img) => {
      let src = img.getAttribute("src") || "";
      if (!src || src.startsWith("data:")) {
        const set = img.getAttribute("srcset");
        if (set) {
          const first = set.split(",")[0].trim().split(/\s+/)[0];
          if (first && !first.startsWith("data:")) src = first;
        }
      }
      if (!src || src.startsWith("data:") || seen.has(src)) return;
      seen.add(src);
      const image = document2.createElement("img");
      image.setAttribute("src", src);
      if (img.getAttribute("alt")) image.setAttribute("alt", img.getAttribute("alt"));
      cells.push([[document2.createComment(" field:image "), image]]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-office.js
  function parse6(element, { document: document2 }) {
    const clean = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    let cards = Array.from(element.querySelectorAll('[class*="CardWrapper"]'));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll('[class*="OfficeCardContainer"]'));
    }
    cards = cards.filter((c) => c.querySelector('[class*="OfficeInfo"], [class*="OfficeAddress"], h4'));
    const cells = [];
    cards.forEach((card) => {
      let imageCell = "";
      const firstSrcsetUrl = (node) => {
        const set = node && node.getAttribute("srcset");
        if (!set) return "";
        const first = set.split(",")[0].trim().split(/\s+/)[0];
        return first && !first.startsWith("data:") ? first : "";
      };
      let iconSrc = "";
      let iconImg = null;
      const iconCandidates = Array.from(
        card.querySelectorAll('[class*="OfficeIllustration"] img, picture img, img')
      );
      for (const candidate of iconCandidates) {
        const src = candidate.getAttribute("src") || "";
        if (src && !src.startsWith("data:")) {
          iconImg = candidate;
          iconSrc = src;
          break;
        }
        let fromSet = firstSrcsetUrl(candidate);
        if (!fromSet) {
          const pic = candidate.closest("picture");
          if (pic) {
            for (const source of pic.querySelectorAll("source")) {
              fromSet = firstSrcsetUrl(source);
              if (fromSet) break;
            }
          }
        }
        if (fromSet) {
          iconImg = candidate;
          iconSrc = fromSet;
          break;
        }
      }
      if (iconSrc) {
        const image = document2.createElement("img");
        image.setAttribute("src", iconSrc);
        const alt = iconImg && iconImg.getAttribute("alt");
        if (alt) image.setAttribute("alt", alt);
        imageCell = [document2.createComment(" field:image "), image];
      }
      const textCell = [document2.createComment(" field:text ")];
      const nameEl = card.querySelector('[class*="OfficeInfo"] [class*="OfficeTitle"], [class*="OfficeInfo"] h4, [class*="OfficeTitle"], h4');
      const nameText = clean(nameEl);
      if (nameText) {
        const h4 = document2.createElement("h4");
        h4.textContent = nameText;
        textCell.push(h4);
      }
      const addressEl = card.querySelector('[class*="OfficeAddress"]');
      if (addressEl) {
        const p = document2.createElement("p");
        Array.from(addressEl.childNodes).forEach((node) => {
          if (node.nodeType === 3) {
            const t = node.textContent.replace(/\s+/g, " ").trim();
            if (t) p.appendChild(document2.createTextNode(t));
          } else if (node.nodeName === "BR") {
            p.appendChild(document2.createElement("br"));
          }
        });
        if (p.childNodes.length) textCell.push(p);
      }
      const phoneEl = card.querySelector('[class*="OfficePhoneNumber"]');
      const phoneText = clean(phoneEl);
      if (phoneText) {
        const p = document2.createElement("p");
        p.textContent = phoneText;
        textCell.push(p);
      }
      const linkEl = card.querySelector('a[class*="OfficeLink"], a[linkstyle]');
      if (linkEl) {
        let label = Array.from(linkEl.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent.replace(/\s+/g, " ").trim()).join(" ").trim();
        if (!label || label.length > 40) label = "View Office";
        const a = document2.createElement("a");
        a.setAttribute("href", linkEl.getAttribute("href") || "#");
        a.textContent = label;
        const p = document2.createElement("p");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-office", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-cta.js
  function parse7(element, { document: document2 }) {
    const titleEl = element.querySelector('h1, h2, [class*="MainTitle"]');
    const bodyEl = element.querySelector('[class*="BodyText"] p, [class*="BodyText"]');
    const ctaSource = element.querySelector('[class*="ButtonContainer"] a, a[class*="StyledLink"]');
    const titleText = titleEl ? titleEl.textContent.trim() : "";
    const bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (!titleText && !bodyText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [document2.createComment(" field:text ")];
    if (titleText) {
      const h2 = document2.createElement("h2");
      h2.textContent = titleText;
      contentCell.push(h2);
    }
    if (bodyText) {
      const p = document2.createElement("p");
      p.textContent = bodyText;
      contentCell.push(p);
    }
    if (ctaSource) {
      const a = document2.createElement("a");
      a.setAttribute("href", ctaSource.getAttribute("href") || "#");
      a.textContent = ctaSource.textContent.trim();
      const p = document2.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    const cells = [];
    cells.push([""]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-cta", cells });
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
        "#onetrust-consent-sdk",
        // Responsive DUPLICATES: the careers page renders both a desktop AND a
        // mobile variant of the office and awards carousels in the DOM (one hidden
        // via CSS). The block parsers target the Desktop variants; the Mobile
        // variants carry the same office/award content and would otherwise fall
        // through as raw default content (duplicated office cards / award badges).
        // Remove them before parsing so each block's content appears exactly once.
        '[class*="office-carousel__MobileColumnContainer"]',
        '[class*="award-carousel__MobileCarousel"]'
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

  // tools/importer/transformers/credera-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-careers-overview.js
  var parsers = {
    "hero-home": parse,
    "columns-feature": parse2,
    "cards-insight": parse3,
    "cards-case-study": parse4,
    "carousel-awards": parse5,
    "cards-office": parse6,
    "hero-cta": parse7
  };
  var PAGE_TEMPLATE = {
    name: "careers-overview",
    description: "Careers overview page: intro, value props, and open-roles CTA",
    urls: [
      "https://credera.com/en-us/careers",
      "https://credera.com/en-us/careers/experienced-professionals",
      "https://credera.com/en-us/careers/students",
      "https://credera.com/en-us/pegaworld-2025-forrester-roundtable",
      "https://credera.com/en-us/salesforce-dreamforce-2024",
      "https://credera.com/en-us/salesforce-world-tour-2024"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: ["div[class*='careers__OverviewHeroSection']"]
      },
      {
        name: "columns-feature",
        instances: [
          // Only the "Life at Credera" instance has an image; the section-1
          // "Leaving a legacy" statement uses the same class but is default content
          // (no image), so scope with :has(img) to exclude it.
          "div[class*='image-with-titleset__SectionContainer']:has(img)",
          "#featuredContent"
        ]
      },
      {
        name: "cards-insight",
        instances: ["div[class*='video-carousel__CarouselContainer']"]
      },
      {
        name: "cards-case-study",
        // Target just the two-card POV wrapper; the preceding intro title-set
        // ("Careers at Credera" / "Start your Credera journey.") stays as default content.
        instances: ["div[class*='our-impact__POVWrapper']"]
      },
      {
        name: "carousel-awards",
        instances: ["div[class*='award-carousel__CarouselContainer']"]
      },
      {
        name: "cards-office",
        instances: ["div[class*='office-carousel__DesktopCarousel']"]
      },
      {
        name: "hero-cta",
        instances: ["div[class*='footer-cta__FooterCtaWrapper']"]
      }
    ],
    sections: [
      { id: "rc1", name: "hero", selector: ["div[class*='paper__PaperWrapper']:nth-of-type(1)"], style: null, blocks: ["hero-home"], defaultContent: [] },
      { id: "rc2", name: "life-at-credera-feature", selector: ["div[class*='animate-in__Fade']:nth-of-type(2)"], style: null, blocks: ["columns-feature"], defaultContent: [] },
      { id: "rc3", name: "featured-content-callout", selector: ["#featuredContent"], style: null, blocks: ["columns-feature"], defaultContent: [] },
      { id: "rc4", name: "video-gallery", selector: ["div[class*='paper__PaperWrapper']:nth-of-type(5)"], style: null, blocks: ["cards-insight"], defaultContent: [] },
      { id: "rc5", name: "divider-spacer", selector: ["div[class*='paper__PaperWrapper']:nth-of-type(6)"], style: null, blocks: [], defaultContent: [] },
      { id: "rc6", name: "journey-teasers", selector: ["div[class*='animate-in__Fade']:nth-of-type(7)"], style: null, blocks: ["cards-case-study"], defaultContent: [] },
      { id: "rc7", name: "awards-offices-cta", selector: ["div[class*='paper__PaperWrapper']:nth-of-type(8)"], style: null, blocks: ["carousel-awards", "cards-office", "hero-cta"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_careers_overview_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
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
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_careers_overview_exports);
})();
