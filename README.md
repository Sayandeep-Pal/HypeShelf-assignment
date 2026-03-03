# HypeShelf

> **Collect and share the stuff you're hyped about.**

A shared recommendations hub where friends log in and drop their favourite movies, shows, docs, and more onto one public shelf.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk |
| Backend / DB | Convex |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |

---

## Features

### Public page (no login required)
- Hero banner with tagline and CTA
- Read-only preview of the **5 latest picks**, fetched live from Convex
- "Sign in to add yours" button wired to Clerk's modal

### Authenticated experience
- **Add a recommendation** — title, genre, link, and a short blurb
- **See who added what** — author name shown on every card
- **Filter by genre** — pill filters with live counts; client-side for instant response
- **Delete your own picks** — one-click delete with a confirmation guard
- **Skeleton loading states** for a polished feel while data loads

### Role-based access control

| Capability | `user` | `admin` |
|---|:---:|:---:|
| View all recommendations | ✅ | ✅ |
| Add a recommendation | ✅ | ✅ |
| Delete **own** recommendation | ✅ | ✅ |
| Delete **any** recommendation | ❌ | ✅ |
| Toggle ⭐ Staff Pick badge | ❌ | ✅ |

---

## Project structure

```
client/
├── middleware.ts                    # Clerk auth middleware
├── app/
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Single-page app (public + auth views)
│   ├── globals.css                  # Tailwind + base styles
│   ├── ConvexClientProvider.tsx     # Clerk + Convex provider tree
│   └── components/
│       ├── Navbar.tsx               # Sticky nav with auth button
│       ├── GenreFilter.tsx          # Genre pill-filter bar
│       ├── RecommendationCard.tsx   # Card with RBAC action buttons
│       └── AddRecommendationForm.tsx # Controlled add form
└── convex/
    ├── schema.ts                    # DB schema (recommendations + users)
    ├── recommendations.ts           # Queries & mutations with RBAC
    ├── users.ts                     # User upsert + role query
    └── auth.config.ts               # Clerk JWT provider config
```

---

## Getting started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Environment variables

`client/.env.local` (already present — fill in your own keys for a fresh deployment):

```env
CONVEX_DEPLOYMENT=dev:<your-deployment>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-deployment>.convex.site

CLERK_ISSUER_URL=https://<your-clerk-instance>.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Connecting Clerk → Convex** — in the Convex dashboard:

1. Go to **Settings → Authentication**
2. Add a new JWT provider:
   - **Domain**: your Clerk issuer URL
   - **Application ID**: `convex`

### 3. Start development

```bash
# Terminal 1 — push schema + run Convex functions
npx convex dev

# Terminal 2 — Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Assigning the admin role

Roles are stored in the `users` Convex table. To promote someone to admin:

1. Open the **Convex dashboard** → your project → **Data** → `users` table
2. Find the row whose `tokenIdentifier` matches the target user
3. Edit the `role` field from `"user"` to `"admin"`

> **Why no UI for this?** Admin promotion is a sensitive, low-frequency operation. Requiring direct dashboard access keeps the attack surface small — a compromised user account cannot self-escalate.

---

## Security design notes

### RBAC is enforced server-side
All access-control logic lives in Convex mutations. The client UI hides buttons as a UX courtesy, but every mutation independently re-checks the caller's identity and role:

```ts
// remove() in convex/recommendations.ts
const isOwner = rec.authorId === identity.subject; // `subject` is Clerk's stable user ID
if (role !== "admin" && !isOwner) {
  throw new Error("Unauthorized");
}
```

Hiding a React button is never a security boundary.

### `authorId` uses Clerk's `identity.subject`
`subject` is the stable, non-guessable Clerk user ID — never the display name. Ownership checks are purely ID-based.

### Roles default to `"user"`
If a user row doesn't exist yet (sign-in race condition), all mutations treat the caller as the least-privileged role.

### `noopener noreferrer` on external links
All outbound links use `rel="noopener noreferrer"` to prevent tab-napping.

---

## Design decisions

| Decision | Reasoning |
|---|---|
| Single `page.tsx` for both views | Clean for a single-page app; auth-conditional rendering keeps routing trivial |
| Client-side genre filter | Dataset is small; avoids an extra Convex query and gives instant response |
| `getPublicLatest` (limit 5) | Avoids sending the full dataset to anonymous visitors |
| `upsertUser` on sign-in | Guarantees a user row exists before any mutation runs, preventing null-role edge cases |
| Genre colour chips | Visual scanning aid — each genre has a distinct colour contrast |
