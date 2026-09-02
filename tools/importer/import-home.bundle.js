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

  // tools/importer/parsers/columns-services.js
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
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-services", cells });
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
    let cards;
    const selfIsCard = element.matches && element.matches('a[class*="CaseStudyContent"], a[class*="CaseStudyWrapper"]');
    if (selfIsCard) {
      cards = [element];
    } else {
      cards = Array.from(
        element.querySelectorAll('a[class*="CaseStudyWrapper"], a[class*="CaseStudyContent"]')
      );
    }
    const cells = [];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const img = card.querySelector('img[class*="CaseStudyImage"], [class*="ImageWrapper"] img, img');
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
      const ctaLabel = innerLink ? innerLink.textContent.replace(/\s+/g, " ").trim() : "";
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
        h3.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        textCell.push(h3);
      }
      if (category) {
        const p = document.createElement("p");
        p.textContent = category;
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
        cells.push([imageCell, textCell.length > 1 ? textCell : ""]);
      }
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
    "consumer": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRkY1MzJDIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMDg3MV8xMDg4OCkiPgo8cGF0aCBkPSJNNzUgMTVIMTVWNzVINzVWMTVaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTA4NzFfMTA4ODgpIi8+CjxwYXRoIGQ9Ik02MS42NTYyIDYxLjY1NjRWMjguMzQ0N0wyOC4zNDQ2IDI4LjM0NDdWNjEuNjU2NEg2MS42NTYyWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzEwODcxXzEwODg4KSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTA4NzFfMTA4ODgiIHgxPSItNC41NjU1OSIgeTE9IjQ1IiB4Mj0iODAuNDUxNyIgeTI9IjQ1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4wMTQyMyIgc3RvcC1jb2xvcj0iI0ZGNTMyQyIvPgo8c3RvcCBvZmZzZXQ9IjAuOTk4NzkiIHN0b3AtY29sb3I9IiNGRjdGRjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzEwODcxXzEwODg4IiB4MT0iNDUuMDAwNCIgeTE9IjE3LjQ4MiIgeDI9IjQ1LjAwMDQiIHkyPSI2NC42ODMxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjUzMkMiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY3RkYwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTA4NzFfMTA4ODgiPgo8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNSAxNSkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
    "financial-services": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRkY3RkYwIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMDg3MV8yMjg0KSI+CjxwYXRoIGQ9Ik00NSAzNS4zODY3QzM5LjQ3NzIgMzUuMzg2NyAzNSAzOS4yMDU3IDM1IDQzLjkxNjdWNzUuMDQ2OUg1NVY0My45MTY3QzU1IDM5LjIwNTcgNTAuNTIyOCAzNS4zODY3IDQ1IDM1LjM4NjdaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTA4NzFfMjI4NCkiLz4KPHBhdGggZD0iTTQ1IDE1LjAwMkMyOC40MzE0IDE1LjAwMiAxNSAyNi40NTkgMTUgNDAuNTkxOVY3NS4wNDYySDI1VjQxLjY5OTlDMjUgMzIuMjc4IDMzLjk1NDMgMjQuNjQgNDUgMjQuNjRDNTYuMDQ1NyAyNC42NCA2NSAzMi4yNzggNjUgNDEuNjk5OVY1NS4yMTYySDc1VjQwLjU5MTlDNzUgMjYuNDU5IDYxLjU2ODYgMTUuMDAyIDQ1IDE1LjAwMloiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xMDg3MV8yMjg0KSIvPgo8cGF0aCBkPSJNNjUgNDEuNjk5NkM2NSAzMi4yNzc2IDU2LjA0NTcgMjQuNjM5NiA0NSAyNC42Mzk2QzMzLjk1NDMgMjQuNjM5NiAyNSAzMi4yNzc2IDI1IDQxLjY5OTZWNzUuMDQ1OUgzNVY0My45MTU3QzM1IDM5LjIwNDcgMzkuNDc3MSAzNS4zODU3IDQ1IDM1LjM4NTdDNTAuNTIyOSAzNS4zODU3IDU1IDM5LjIwNDcgNTUgNDMuOTE1N1Y1NS4yMTU4SDY1VjQxLjY5OTZaIiBmaWxsPSJ1cmwoI3BhaW50Ml9saW5lYXJfMTA4NzFfMjI4NCkiLz4KPHBhdGggZD0iTTY1IDU1LjA0NjlINTVWNzUuMDQ2OUg2NUg3NVY1NS4wNDY5SDY1WiIgZmlsbD0idXJsKCNwYWludDNfbGluZWFyXzEwODcxXzIyODQpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDg3MV8yMjg0IiB4MT0iNDUiIHkxPSIzMy4yMjM2IiB4Mj0iNDUiIHkyPSI4Mi41OTE2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4wMTciIHN0b3AtY29sb3I9IiM2MzJGM0MiLz4KPHN0b3Agb2Zmc2V0PSIwLjQzOTI2IiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAuNDk3NTciLz4KPHN0b3Agb2Zmc2V0PSIwLjc5NzE2IiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAuMTM2NzciLz4KPHN0b3Agb2Zmc2V0PSIwLjk4ODE0IiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzEwODcxXzIyODQiIHgxPSI0NSIgeTE9Ijc5LjQwNyIgeDI9IjQ1IiB5Mj0iNy42OTE5NSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMDQwODQiIHN0b3AtY29sb3I9IiM2MzJGM0MiLz4KPHN0b3Agb2Zmc2V0PSIwLjIzNTk4IiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAuODUzMTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjYwODUiIHN0b3AtY29sb3I9IiM2MzJGM0MiIHN0b3Atb3BhY2l0eT0iMC40NjczNSIvPgo8c3RvcCBvZmZzZXQ9IjAuOTk3NjMiIHN0b3AtY29sb3I9IiM2MzJGM0MiIHN0b3Atb3BhY2l0eT0iMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfMTA4NzFfMjI4NCIgeDE9IjQ1IiB5MT0iMTUuOTU3MiIgeDI9IjQ1IiB5Mj0iNjUuNTAyNiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMDQ2ODIiIHN0b3AtY29sb3I9IiM2MzJGM0MiLz4KPHN0b3Agb2Zmc2V0PSIwLjM2NTkzIiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAuNjUzNzMiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDNfbGluZWFyXzEwODcxXzIyODQiIHgxPSI2NSIgeTE9Ijg0LjYyMDUiIHgyPSI2NSIgeTI9IjQ5LjAwODYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjAxNDIzIiBzdG9wLWNvbG9yPSIjNjMyRjNDIi8+CjxzdG9wIG9mZnNldD0iMC40NDQwNCIgc3RvcC1jb2xvcj0iIzYzMkYzQyIgc3RvcC1vcGFjaXR5PSIwLjQ5MDA1Ii8+CjxzdG9wIG9mZnNldD0iMC43OTkxIiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAuMTM0NjMiLz4KPHN0b3Agb2Zmc2V0PSIwLjk4OTQ0IiBzdG9wLWNvbG9yPSIjNjMyRjNDIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMDg3MV8yMjg0Ij4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwLjA0NDMiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNSAxNS4wMDIpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
    "healthcare-life-sciences": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMDYyNjUwIi8+CjxwYXRoIGQ9Ik0zOC43MDgzIDc1Ljg5NTVINTEuMTkxNFY1MS4xMzcxSDM4LjcwODNWNzUuODk1NVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xMDg3MV8yMjk2KSIvPgo8cGF0aCBkPSJNMTQgMzguNzA3M1Y1MS4xOTA0SDM4Ljc1ODRWMzguNzA3M0gxNFoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xMDg3MV8yMjk2KSIvPgo8cGF0aCBkPSJNNTEuMTkwMiAxNEgzOC43MDdWMzguNzU4NEg1MS4xOTAyVjE0WiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzEwODcxXzIyOTYpIi8+CjxwYXRoIGQ9Ik03NS44OTY1IDUxLjE4ODJWMzguNzA1MUg1MS4xMzgxVjUxLjE4ODJINzUuODk2NVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8xMDg3MV8yMjk2KSIvPgo8cGF0aCBkPSJNMTguNjQ5NyA2Mi40MTkyTDI3LjQ3NjYgNzEuMjQ2MUw0NC45ODM0IDUzLjczOTNMMzYuMTU2NSA0NC45MTI0TDE4LjY0OTcgNjIuNDE5MloiIGZpbGw9InVybCgjcGFpbnQ0X2xpbmVhcl8xMDg3MV8yMjk2KSIvPgo8cGF0aCBkPSJNMjcuNDc3MyAxOC42NTA2TDE4LjY1MDQgMjcuNDc3NUwzNi4xNTcyIDQ0Ljk4NDRMNDQuOTg0MSAzNi4xNTc1TDI3LjQ3NzMgMTguNjUwNloiIGZpbGw9InVybCgjcGFpbnQ1X2xpbmVhcl8xMDg3MV8yMjk2KSIvPgo8cGF0aCBkPSJNNzEuMjQ2OCAyNy40NzczTDYyLjQxOTkgMTguNjUwNEw0NC45MTMxIDM2LjE1NzJMNTMuNzQgNDQuOTg0MUw3MS4yNDY4IDI3LjQ3NzNaIiBmaWxsPSJ1cmwoI3BhaW50Nl9saW5lYXJfMTA4NzFfMjI5NikiLz4KPHBhdGggZD0iTTYyLjQyMTEgNzEuMjQ0OUw3MS4yNDggNjIuNDE4TDUzLjc0MTIgNDQuOTExMUw0NC45MTQzIDUzLjczOEw2Mi40MjExIDcxLjI0NDlaIiBmaWxsPSJ1cmwoI3BhaW50N19saW5lYXJfMTA4NzFfMjI5NikiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDg3MV8yMjk2IiB4MT0iNDQuOTQ5OCIgeTE9Ijg1LjI2NjUiIHgyPSI0NC45NDk4IiB5Mj0iNTEuMDUzMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMTk3MzQiIHN0b3AtY29sb3I9IiMzQjZGRkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjg2MTEiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzEwODcxXzIyOTYiIHgxPSI0LjYyODk5IiB5MT0iNDQuOTQ4OSIgeDI9IjM4Ljg0MjQiIHkyPSI0NC45NDg5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTczNCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuODYxMSIgc3RvcC1jb2xvcj0iIzA2MjY1MCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfMTA4NzFfMjI5NiIgeDE9IjQ0Ljk0ODYiIHkxPSI0LjYyODk5IiB4Mj0iNDQuOTQ4NiIgeTI9IjM4Ljg0MjQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjE5NzM0IiBzdG9wLWNvbG9yPSIjM0I2RkZGIi8+CjxzdG9wIG9mZnNldD0iMC44NjExIiBzdG9wLWNvbG9yPSIjMDYyNjUwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xMDg3MV8yMjk2IiB4MT0iODUuMjY3NSIgeTE9IjQ0Ljk0NjYiIHgyPSI1MS4wNTQxIiB5Mj0iNDQuOTQ2NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMTk3MzQiIHN0b3AtY29sb3I9IiMzQjZGRkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjg2MTEiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDRfbGluZWFyXzEwODcxXzIyOTYiIHgxPSIxNi40MzY4IiB5MT0iNzMuNDU4OSIgeDI9IjQwLjYyOTMiIHkyPSI0OS4yNjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTczNCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuODY3MTQiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDVfbGluZWFyXzEwODcxXzIyOTYiIHgxPSIxNi40Mzc1IiB5MT0iMTYuNDM3OCIgeDI9IjQwLjYzMDEiIHkyPSI0MC42MzAzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTczNCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuODY3MTQiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDZfbGluZWFyXzEwODcxXzIyOTYiIHgxPSI3My40NTk3IiB5MT0iMTYuNDM3NSIgeDI9IjQ5LjI2NzEiIHkyPSI0MC42MzAxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTczNCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuODY3MTQiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDdfbGluZWFyXzEwODcxXzIyOTYiIHgxPSI3My40NjA5IiB5MT0iNzMuNDU3NyIgeDI9IjQ5LjI2ODQiIHkyPSI0OS4yNjUyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTczNCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuODY3MTQiIHN0b3AtY29sb3I9IiMwNjI2NTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "technology-media-telecommunications": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjNjMyRjNDIi8+CjxwYXRoIGQ9Ik0yMy4wOCAyMy4wNzgyQzEwLjk3MzMgMzUuMTg1MSAxMC45NzMzIDU0LjgxNDMgMjMuMDggNjYuOTIxMkwzMC45NzIyIDU5LjAyODlDMjMuMjI0MiA1MS4yODA4IDIzLjIyNDIgMzguNzE4NiAzMC45NzIyIDMwLjk3MDVDMzguNzIwMiAyMy4yMjIzIDUxLjI4MjMgMjMuMjIyNCA1OS4wMzAzIDMwLjk3MDVMNjYuOTIyNCAyMy4wNzgyQzU0LjgxNTcgMTAuOTcxMyAzNS4xODY4IDEwLjk3MTMgMjMuMDggMjMuMDc4MloiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xMDg3MV8yMzE0KSIvPgo8cGF0aCBkPSJNMzUuNTY4MiAzNS41NjczQzMwLjMzNjYgNDAuNzk4OSAzMC4zMzY3IDQ5LjI4MSAzNS41NjgyIDU0LjUxMjZMNTQuNTEzMyAzNS41NjczQzQ5LjI4MTcgMzAuMzM1NyA0MC43OTk3IDMwLjMzNTYgMzUuNTY4MiAzNS41NjczWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzEwODcxXzIzMTQpIi8+CjxwYXRoIGQ9Ik02Ni45MjA1IDY2LjkyMjFDNTQuODEzOCA3OS4wMjkgMzUuMTg0OSA3OS4wMjkgMjMuMDc4MSA2Ni45MjIxTDMwLjk3MDMgNTkuMDI5OEMzOC43MTgzIDY2Ljc3OCA1MS4yODAzIDY2Ljc3OCA1OS4wMjgzIDU5LjAyOThDNjYuNzc2MyA1MS4yODE3IDY2Ljc3NjMgMzguNzE5NSA1OS4wMjgzIDMwLjk3MTRMNjYuOTIwNSAyMy4wNzkxQzc5LjAyNzIgMzUuMTg2IDc5LjAyNzIgNTQuODE1MiA2Ni45MjA1IDY2LjkyMjFaIiBmaWxsPSJ1cmwoI3BhaW50Ml9saW5lYXJfMTA4NzFfMjMxNCkiLz4KPHBhdGggZD0iTTU0LjQzMTQgNTQuNDMyN0M0OS4xOTk5IDU5LjY2NDMgNDAuNzE3OSA1OS42NjQzIDM1LjQ4NjMgNTQuNDMyN0w1NC40MzE0IDM1LjQ4NzNDNTkuNjYyOSA0MC43MTg5IDU5LjY2MjkgNDkuMjAxMSA1NC40MzE0IDU0LjQzMjdaIiBmaWxsPSJ1cmwoI3BhaW50M19saW5lYXJfMTA4NzFfMjMxNCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDg3MV8yMzE0IiB4MT0iMTIuMTE5NSIgeTE9IjU1Ljk2MDUiIHgyPSI1NS45NjI0IiB5Mj0iMTIuMTE4MSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjMyRjNDIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGN0ZGMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMTA4NzFfMjMxNCIgeDE9IjI1LjUwMzEiIHkxPSI1NS4xMDUyIiB4Mj0iNTUuMTA2MyIgeTI9IjI1LjUwMjQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzYzMkYzQyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjdGRjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzEwODcxXzIzMTQiIHgxPSIzNC4wMzg3IiB5MT0iNzcuODgyOCIgeDI9Ijc3Ljg4MTciIHkyPSIzNC4wNDA1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjdGRjAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjMyRjNDIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xMDg3MV8yMzE0IiB4MT0iMzQuODkzNyIgeTE9IjY0LjQ5NzkiIHgyPSI2NC40OTciIHkyPSIzNC44OTUyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjdGRjAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjMyRjNDIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
    "publicsector": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEwODcxXzIxMzMpIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMTczRTJGIi8+CjxwYXRoIGQ9Ik0yNS41Mzc5IDIxLjQ3ODVDMTQuODIwNyAzMi4xOTU3IDE0LjgyMDcgNDkuNTcxOCAyNS41Mzc5IDYwLjI4OTFDMjUuNTg5NSA2MC4zNDA2IDI1LjY0MjIgNjAuMzkwMyAyNS42OTQxIDYwLjQ0MTRMNDUuMDk3NSA0MS4wMzhMMjUuNTM3OSAyMS40Nzg1WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzEwODcxXzIxMzMpIi8+CjxwYXRoIGQ9Ik02NC40NjI5IDIxLjY3MjlMNDUuMDk4MiA0MS4wMzc2TDY0LjM0OTIgNjAuMjg4NkM1My42ODM1IDcwLjk1NDMgMzYuNDI0IDcxLjAwMzkgMjUuNjk0OCA2MC40NDA5TDI1LjY1MjMgNjAuNDgzNEMzNi4zNjk2IDcxLjIwMDYgNTMuNzQ1NiA3MS4yMDA2IDY0LjQ2MjkgNjAuNDgzNEM3NS4xODAxIDQ5Ljc2NjIgNzUuMTgwMSAzMi4zOTAxIDY0LjQ2MjkgMjEuNjcyOVoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xMDg3MV8yMTMzKSIvPgo8cGF0aCBkPSJNNjQuMzQ3NyA2MC4yODkxTDQ1LjA5NjcgNDEuMDM4MUwyNS42OTM0IDYwLjQ0MTRDMzYuNDIyNSA3MS4wMDQ0IDUzLjY4MiA3MC45NTQ4IDY0LjM0NzcgNjAuMjg5MVoiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl8xMDg3MV8yMTMzKSIvPgo8cmVjdCB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIGZpbGw9IiNGRjUzMkMiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxXzEwODcxXzIxMzMpIj4KPHBhdGggZD0iTTIxLjc4MzIgMThDOC43Mzg5OSAzMS4wNDQyIDguNzM4OTQgNTIuMzg5MyAyMS43ODMyIDY1LjQzMzZMNDUuNSA0MS43MTY4TDIxLjc4MzIgMThaIiBmaWxsPSJ1cmwoI3BhaW50M19saW5lYXJfMTA4NzFfMjEzMykiLz4KPHBhdGggZD0iTTY5LjIxNjggNjUuNDMzNkM4Mi4yNjEgNTIuMzg5NCA4Mi4yNjExIDMxLjA0NDMgNjkuMjE2OCAxOEw0NS41IDQxLjcxNjhMNjkuMjE2OCA2NS40MzM2WiIgZmlsbD0idXJsKCNwYWludDRfbGluZWFyXzEwODcxXzIxMzMpIi8+CjxwYXRoIGQ9Ik0yMS43ODMyIDY1LjQzNDZDMzQuODI3NCA3OC40Nzg4IDU2LjE3MjYgNzguNDc4OCA2OS4yMTY4IDY1LjQzNDZMNDUuNSA0MS43MTc4TDIxLjc4MzIgNjUuNDM0NloiIGZpbGw9InVybCgjcGFpbnQ1X2xpbmVhcl8xMDg3MV8yMTMzKSIvPgo8L2c+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDg3MV8yMTMzIiB4MT0iNDcuOTAxMiIgeTE9IjQwLjk1OTkiIHgyPSIxNi41MDQ2IiB5Mj0iNDAuOTU5OSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDAzRjJFIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0YzRkY1OCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMTA4NzFfMjEzMyIgeDE9IjQwLjQyNzQiIHkxPSI0NS4wOTcxIiB4Mj0iNzMuODIxNiIgeTI9IjQ1LjA5NzEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwM0YyRSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGM0ZGNTgiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzEwODcxXzIxMzMiIHgxPSI0NS4wMjA1IiB5MT0iMjEuMTE4OSIgeDI9IjQ1LjAyMDUiIHkyPSI2NS41ODcyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMDNGMkUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjNGRjU4Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xMDg3MV8yMTMzIiB4MT0iLTEuMzU1MjMiIHkxPSI0MS43MTY4IiB4Mj0iNTEuODgzNSIgeTI9IjQxLjcxNjgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzEzMTMxMyIgc3RvcC1vcGFjaXR5PSIwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzEzMTMxMyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50NF9saW5lYXJfMTA4NzFfMjEzMyIgeDE9IjkyLjM1NTIiIHkxPSI0MS43MTY4IiB4Mj0iMzkuMTE2NSIgeTI9IjQxLjcxNjgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzEzMTMxMyIgc3RvcC1vcGFjaXR5PSIwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzEzMTMxMyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50NV9saW5lYXJfMTA4NzFfMjEzMyIgeDE9IjQ1LjUiIHkxPSIxNy4yNjg1IiB4Mj0iNDUuNSIgeTI9Ijc4LjEzODkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzEzMTMxMyIgc3RvcC1vcGFjaXR5PSIwIi8+CjxzdG9wIG9mZnNldD0iMC41MTg3MiIgc3RvcC1jb2xvcj0iIzEzMTMxMyIgc3RvcC1vcGFjaXR5PSIwLjEzNDc4Ii8+CjxzdG9wIG9mZnNldD0iMC44MzYzNyIgc3RvcC1jb2xvcj0iIzEzMTMxMyIgc3RvcC1vcGFjaXR5PSIwLjU3OTUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTMxMzEzIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTA4NzFfMjEzMyI+CjxyZWN0IHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMV8xMDg3MV8yMTMzIj4KPHJlY3Qgd2lkdGg9IjY3IiBoZWlnaHQ9IjU3LjIxNjgiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMiAxOCkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
    "business-and-industrial-markets": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjQjVFOEZEIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMTA0Nl8zOTEpIj4KPHBhdGggZD0iTTE5LjM3NSA1MC45MzY1TDExIDU2LjQ3NjRMNDQuNDg1NiA3OC45NzRMNzggNTYuODA1TDY5LjYyNSA1MS4xNzgyTDQ0LjQ4NTYgNjcuODA3NEwxOS4zNzUgNTAuOTM2NVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xMTA0Nl8zOTEpIi8+CjxwYXRoIGQ9Ik02OS42MjUgNDAuMDEyMkw2MS4yNTAxIDQ1LjU1Mkw0NC40ODU2IDU2LjY0MTNMMjcuNzQ5OSA0NS4zOTczTDE5LjM3NDkgMzkuNzcwNUwxMSA0NS4zMTA0TDE5LjM3NSA1MC45MzcyTDQ0LjQ4NTYgNjcuODA4TDY5LjYyNSA1MS4xNzg4TDc4IDQ1LjYzODlMNjkuNjI1IDQwLjAxMjJaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMTEwNDZfMzkxKSIvPgo8cGF0aCBkPSJNNDQuNTE0MyAxMS45OThMMTEgMzQuMTY3MUwxOS4zNzQ5IDM5Ljc5MzlMMjcuNzQ5OSA0NS40MjA3TDQ0LjQ4NTYgNTYuNjY0N0w2MS4yNTAxIDQ1LjU3NTRMNjkuNjI1IDQwLjAzNTVMNzggMzQuNDk1N0w0NC41MTQzIDExLjk5OFoiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl8xMTA0Nl8zOTEpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTA0Nl8zOTEiIHgxPSI0NC41IiB5MT0iMjIuODY1MSIgeDI9IjQ0LjUiIHkyPSI4Ni44MjY5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4xOTQ0MyIgc3RvcC1jb2xvcj0iIzNCNkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+CjxzdG9wIG9mZnNldD0iMC44MzM0NCIgc3RvcC1jb2xvcj0iIzNCNkZGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMTEwNDZfMzkxIiB4MT0iNDQuNSIgeTE9IjcyLjE5NDciIHgyPSI0NC41IiB5Mj0iLTMuMDYyODIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjE3NDI1IiBzdG9wLWNvbG9yPSIjM0I2RkZGIiBzdG9wLW9wYWNpdHk9IjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjU3NTM1IiBzdG9wLWNvbG9yPSIjM0I2RkZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8xMTA0Nl8zOTEiIHgxPSI0NC41IiB5MT0iLTU1LjU1MzEiIHgyPSI0NC41IiB5Mj0iNzIuMzcwNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMTk3MzQiIHN0b3AtY29sb3I9IiMzQjZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPgo8c3RvcCBvZmZzZXQ9IjAuMzA4NzciIHN0b3AtY29sb3I9IiMzQjZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xMTQyNiIvPgo8c3RvcCBvZmZzZXQ9IjAuNTUxMjciIHN0b3AtY29sb3I9IiMzQjZGRkYiIHN0b3Atb3BhY2l0eT0iMC40MDY3NCIvPgo8c3RvcCBvZmZzZXQ9IjAuOTAzOTciIHN0b3AtY29sb3I9IiMzQjZGRkYiIHN0b3Atb3BhY2l0eT0iMC44NjkzNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzQjZGRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTA0Nl8zOTEiPgo8cmVjdCB3aWR0aD0iNjciIGhlaWdodD0iNjYuOTc2NSIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExIDExLjk5OCkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
    "energy-and-resources": "https://credera.com/static/energyUtilities-c5b2cc76a3c8014c6d89fa5d78e5ec0e.svg"
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
    "columns-services": parse2,
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
        name: "columns-services",
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
