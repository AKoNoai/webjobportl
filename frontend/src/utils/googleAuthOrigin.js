const normalizeOrigin = (value) => value?.trim().replace(/\/$/, "") || "";

const deriveVercelProductionOrigin = (origin) => {
  try {
    const url = new URL(origin);

    if (!url.hostname.endsWith(".vercel.app")) {
      return url.origin;
    }

    const baseLabel = url.hostname.replace(/\.vercel\.app$/, "");
    const parts = baseLabel.split("-");

    if (parts.length < 3) {
      return url.origin;
    }

    return `${url.protocol}//${parts.slice(0, 2).join("-")}.vercel.app`;
  } catch {
    return window.location.origin;
  }
};

export const getCanonicalFrontendOrigin = () => {
  const configuredOrigin = normalizeOrigin(
    import.meta.env.VITE_APP_CANONICAL_ORIGIN || import.meta.env.VITE_FRONTEND_URL
  );

  if (configuredOrigin) {
    return configuredOrigin;
  }

  return deriveVercelProductionOrigin(window.location.origin);
};

export const redirectToCanonicalFrontend = (routePath = "/") => {
  const canonicalOrigin = getCanonicalFrontendOrigin();
  const target = new URL(routePath, canonicalOrigin);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.assign(target.toString());
};
