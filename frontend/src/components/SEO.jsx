import { useEffect } from 'react';

/**
 * SEO Component to dynamically update document metadata and schema markup.
 */
export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogTitle, 
  ogDescription, 
  ogImage,
  schema 
}) {
  useEffect(() => {
    // 1. Set Title
    if (title) {
      document.title = title;
    }

    // Helper function to create or update meta tags
    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('description', description);
    setMeta('keywords', keywords);

    // 3. Open Graph Metadata
    setMeta('og:title', ogTitle || title, true);
    setMeta('og:description', ogDescription || description, true);
    setMeta('og:image', ogImage || '/logo.png', true);
    setMeta('og:type', 'website', true);

    // 4. Canonical Link
    const canonicalUrl = canonical || window.location.href;
    let linkEl = document.querySelector('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', canonicalUrl);

    // 5. Injected JSON-LD Schema Markup
    let scriptEl = document.getElementById('schema-ld');
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'schema-ld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else {
      if (scriptEl) {
        scriptEl.remove();
      }
    }

    // Cleanup on unmount
    return () => {
      const scriptToClean = document.getElementById('schema-ld');
      if (scriptToClean) {
        scriptToClean.remove();
      }
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, schema]);

  return null;
}
