// Static build: prerender every route; fallback page enables SPA behavior
// for uncached deep links behind simple static hosts.
export const prerender = true;
export const ssr = false;
export const csr = true;
