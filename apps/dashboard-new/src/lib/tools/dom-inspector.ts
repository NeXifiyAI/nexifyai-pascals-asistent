"use client";

/**
 * DOM Inspection Tool - Allows the agent to inspect the current page structure
 */

export interface DOMInspectionResult {
  html?: string;
  text?: string;
  attributes?: Record<string, string>;
  computedStyles?: Record<string, string>;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  children?: number;
  exists: boolean;
}

/**
 * Inspect a DOM element by selector
 */
export function inspectElement(
  selector: string,
  options: {
    includeHTML?: boolean;
    includeText?: boolean;
    includeAttributes?: boolean;
    includeStyles?: boolean;
    includeBoundingBox?: boolean;
  } = {},
): DOMInspectionResult {
  const {
    includeHTML = true,
    includeText = true,
    includeAttributes = true,
    includeStyles = false,
    includeBoundingBox = true,
  } = options;

  const element = document.querySelector(selector);

  if (!element) {
    return { exists: false };
  }

  const result: DOMInspectionResult = { exists: true };

  // HTML content
  if (includeHTML) {
    result.html = element.innerHTML;
  }

  // Text content
  if (includeText) {
    result.text = element.textContent?.trim() || "";
  }

  // Attributes
  if (includeAttributes && element.attributes) {
    result.attributes = {};
    const attrs = Array.from(element.attributes);
    attrs.forEach((attr) => {
      if (result.attributes) {
        result.attributes[attr.name] = attr.value;
      }
    });
  }

  // Computed styles
  if (includeStyles) {
    const computedStyle = window.getComputedStyle(element);
    result.computedStyles = {};
    // Get most relevant styles
    const relevantStyles = [
      "display",
      "visibility",
      "opacity",
      "width",
      "height",
      "color",
      "backgroundColor",
      "fontSize",
      "fontWeight",
      "position",
      "zIndex",
    ];
    relevantStyles.forEach((prop) => {
      if (result.computedStyles) {
        result.computedStyles[prop] = computedStyle.getPropertyValue(prop);
      }
    });
  }

  // Bounding box
  if (includeBoundingBox) {
    const rect = element.getBoundingClientRect();
    result.boundingBox = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    };
  }

  // Children count
  result.children = element.children.length;

  return result;
}

/**
 * Get page structure overview
 */
export function getPageStructure(): {
  title: string;
  url: string;
  headings: Array<{ level: number; text: string }>;
  forms: number;
  inputs: number;
  buttons: number;
  links: number;
  images: number;
  scripts: number;
} {
  const headings: Array<{ level: number; text: string }> = [];
  const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];

  tags.forEach((tag, index) => {
    const elements = Array.from(document.querySelectorAll(tag));
    elements.forEach((el) => {
      headings.push({
        level: index + 1,
        text: el.textContent?.trim() || "",
      });
    });
  });

  return {
    title: document.title,
    url: window.location.href,
    headings,
    forms: document.querySelectorAll("form").length,
    inputs: document.querySelectorAll("input").length,
    buttons: document.querySelectorAll("button").length,
    links: document.querySelectorAll("a").length,
    images: document.querySelectorAll("img").length,
    scripts: document.querySelectorAll("script").length,
  };
}

/**
 * Find elements by text content
 */
export function findElementsByText(
  text: string,
  options: { caseSensitive?: boolean; exact?: boolean } = {},
): Array<{ selector: string; text: string; tagName: string }> {
  const { caseSensitive = false, exact = false } = options;
  const results: Array<{ selector: string; text: string; tagName: string }> =
    [];

  const searchText = caseSensitive ? text : text.toLowerCase();
  const allElements = Array.from(document.querySelectorAll("*"));

  allElements.forEach((element, index) => {
    const elementText = element.textContent?.trim() || "";
    const compareText = caseSensitive ? elementText : elementText.toLowerCase();

    const matches = exact
      ? compareText === searchText
      : compareText.includes(searchText);

    if (matches && elementText.length > 0) {
      const htmlElement = element as HTMLElement;
      // Generate a simple selector
      const selector = htmlElement.id
        ? `#${htmlElement.id}`
        : htmlElement.className
          ? `.${htmlElement.className.split(" ")[0]}`
          : `${element.tagName.toLowerCase()}:nth-of-type(${index})`;

      results.push({
        selector,
        text: elementText.substring(0, 100), // Limit text length
        tagName: element.tagName,
      });
    }
  });

  return results.slice(0, 50); // Limit to 50 results
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(selector: string): boolean {
  const element = document.querySelector(selector);
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.right <= viewportWidth
  );
}

/**
 * Get all interactive elements on the page
 */
export function getInteractiveElements(): Array<{
  type: string;
  selector: string;
  text: string;
  visible: boolean;
}> {
  const interactiveSelectors = [
    "button",
    "a[href]",
    "input",
    "select",
    "textarea",
    "[onclick]",
    "[role='button']",
  ];

  const elements: Array<{
    type: string;
    selector: string;
    text: string;
    visible: boolean;
  }> = [];

  interactiveSelectors.forEach((selector) => {
    const found = Array.from(document.querySelectorAll(selector));
    found.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const id = htmlElement.id ? `#${htmlElement.id}` : "";
      const className = htmlElement.className
        ? `.${htmlElement.className.split(" ")[0]}`
        : "";
      const elementSelector = id || className || selector;

      elements.push({
        type: element.tagName,
        selector: elementSelector,
        text: (element.textContent?.trim() || "").substring(0, 50),
        visible: isElementVisible(elementSelector),
      });
    });
  });

  return elements.slice(0, 100); // Limit results
}
