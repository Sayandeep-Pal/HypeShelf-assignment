// convex/auth.config.ts
// The domain MUST be hardcoded (or set via `npx convex env set`).
// Convex backend functions have no access to .env.local; only vars pushed to
// the Convex deployment are visible here via process.env.
export default {
  providers: [
    {
      domain: 'https://premium-pheasant-17.clerk.accounts.dev', // e.g., "https://noble-panther-123.clerk.accounts.dev"
      applicationID: "convex",
    },
  ],
};