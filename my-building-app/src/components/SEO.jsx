import { Helmet } from "react-helmet-async";

export const SITE_NAME = "M8BID";
export const SITE_URL = "https://www.matebid.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Props
 * ─────
 * title        string   — page-level title; auto-suffixed with "| M8BID"
 * description  string   — meta description (keep under 160 chars)
 * keywords     string   — comma-separated keyword list
 * canonical    string   — path e.g. "/" or "/how-to-invest" (prefixed with SITE_URL)
 * ogType       string   — Open Graph type (default "website")
 * ogImage      string   — absolute URL to OG image (1200×630px recommended)
 * noIndex      bool     — add noindex,nofollow (use for auth / dashboard pages)
 * jsonLd       object   — any valid JSON-LD schema object; injected as <script type="application/ld+json">
 */
export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null;

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
