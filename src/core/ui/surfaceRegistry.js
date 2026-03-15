export const surfaceRegistry = [
  {match: (p) => p === "/", surface: "composer"},
  {match: (p) => p.startsWith("/chat"), surface: "composer"},
  {match: (p) => p.startsWith("/assistance"), surface: "composer"},
  {match: (p) => p.startsWith("/tools"), surface: "nav"},
  {match: (p) => p.startsWith("/recovery"), surface: "nav"},
  {match: (p) => p.startsWith("/daily"), surface: "nav"},
  {match: (p) => p.startsWith("/explore"), surface: "nav"},
  {match: (p) => p.startsWith("/directory"), surface: "nav"},
  {match: (p) => p.startsWith("/account"), surface: "nav"},
];

export const getSurfaceOwner = (pathname) => {
  for (const r of surfaceRegistry) {
    try {
      if (r.match(pathname)) return r.surface;
    } catch (e) {}
  }
  return "none";
};
