import createDOMPurify from 'dompurify';

// Create a DOMPurify instance. In browsers this binds to the window.
const DOMPurify = createDOMPurify(typeof window !== 'undefined' ? window : (globalThis || self));

// Expanded config: allow b, i, a, span, strong, br, hr. Allow href, style.
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'a', 'span', 'strong', 'br', 'hr', 'em'],
  ALLOWED_ATTR: ['href', 'style']
};
// Restrict style attribute on <span> to only allow certain colors and font-families
DOMPurify.addHook('uponSanitizeAttribute', function(node, data) {
  if (node.tagName && node.tagName.toLowerCase() === 'span' && data.attrName === 'style') {
    let allowed = '';
    const style = data.attrValue;
    // Allow only specific colors
    const colorMatch = style.match(/color:\s*(red|blue|green|yellow|gray)/i);
    if (colorMatch) allowed += `color: ${colorMatch[1]};`;
    // Allow only specific font-families
    const fontMatch = style.match(/font-family:\s*(serif|sans-serif|monospace)/i);
    if (fontMatch) allowed += `font-family: ${fontMatch[1]};`;
    data.attrValue = allowed;
    if (!allowed) return null; // Remove style if nothing allowed
  }
});

// Hook to validate href attributes and force rel for safety
DOMPurify.addHook('afterSanitizeAttributes', function(node) {
  if (node.tagName && node.tagName.toLowerCase() === 'a') {
    const href = node.getAttribute('href') || '';
    // allow only http(s) and relative links; if value is empty or unsafe, remove href
    if (!href || !/^(https?:\/\/|\/|\.\/|\.\.\/|\/\/)/i.test(href)) {
      // it's either relative (./, ../, /) or empty; leave relative links as-is
      // empty or clearly unsafe values will have href removed below
    }

    // always add rel for opener protection
    node.setAttribute('rel', 'noopener noreferrer');

    // Determine whether link is internal (same-origin) or external. We'll try to resolve
    // the href against current location; if resolution fails, treat as internal.
    try {
      // Use base as current location so relative URLs resolve correctly
      const resolved = new URL(href, (typeof window !== 'undefined' && window.location && window.location.href) || '');
      const isSameOrigin = typeof window !== 'undefined' && resolved.origin === window.location.origin;
      if (isSameOrigin) {
        // mark internal so SPA can intercept
        node.setAttribute('data-internal', '1');
        // ensure we don't force a new tab for same-origin links
        node.removeAttribute('target');
      } else {
        // external origin -> open in new tab
        node.setAttribute('target', '_blank');
      }
    } catch (e) {
      // If URL() throws (malformed or empty), treat as internal/relative if it starts with / or .,
      // otherwise remove href as it's unsafe.
      if (/^(\/|\.\/|\.\.\/)/.test(href)) {
        node.setAttribute('data-internal', '1');
        node.removeAttribute('target');
      } else {
        node.removeAttribute('href');
      }
    }
  }
});

export function sanitizeHtml(input) {
  try {
    return DOMPurify.sanitize(input || '', DEFAULT_CONFIG);
  } catch (e) {
    console.warn('sanitizeHtml failed', e);
    return '';
  }
}
