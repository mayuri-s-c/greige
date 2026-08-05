# GREIGE — Hackathon Proposal

**B2B Textile Marketplace Prototype**  
**Tagline:** *From the loom, before the finish.*

> **Greige** (pronounced *grayzh*) is unfinished fabric as it leaves the loom — before dyeing or finishing. The name signals mill-true, specification-first sourcing.

---

## 1. Executive summary

Among 1000+ entries, most teams will ship a generic fabric catalog with a bolted-on chatbot. **GREIGE** wins by product thinking: discovery feels like a **mill floor**, AI speaks **textile jargon**, onboarding is **conversational/voice**, buyers shortlist on **collection boards**, and suppliers run a **mill console** — not a CRUD admin panel.

We will deliver a polished, end-to-end MERN prototype covering every required buyer and supplier workflow, with Hugging Face–powered AI that enhances (never blocks) classic browse/search/filter.

---

## 2. Product thesis

B2B textile buying is sensory and specification-heavy. Buyers think in hand-feel, GSM, weave, colorways, MOQ, and lead time — not Amazon-style SKU grids.

**GREIGE** treats each fabric as a **Cloth Passport** and sourcing as building a **Collection Board**, while suppliers manage a live order pipeline from Pending → Ready for Dispatch.

| Typical competitor | GREIGE |
|---|---|
| Product grid marketplace | Greige Floor discovery |
| Generic chatbot | Warp — textile-native AI |
| Keyword search only | NL + semantic search (HF) |
| Long onboarding forms | Chat/voice profile building |
| Cart-only shopping | Boards → Cart → Checkout |
| Generic supplier admin | Mill Console + Kanban orders |
| Open two tabs to compare | Compare Loom + AI brief |

---

## 3. Brand & UX direction

### Brand
- **Name:** GREIGE  
- **Pronunciation:** *grayzh*  
- **Meaning:** Unfinished cloth from the loom — honest material, before the finish  
- **Tagline:** From the loom, before the finish.  
- **Personality:** Mill-true — raw, precise, modern, specification-led  
- **Visual system:** Raw greige/stone linen, warm charcoal ink, indigo dye accent (the “finish” contrast)  
- **Typography:** Expressive serif for the wordmark; clean grotesque for UI  
- **Avoid:** Purple SaaS gradients, cream/terracotta templates, dark neon “AI” chrome, emoji clutter, card-heavy dashboards in the hero

### Signature moments
1. **Greige Floor** — Full-bleed fabric photography, texture zoom, colorway chips as first-class UI  
2. **Warp AI** — Persistent assistant: chat, voice, NL search, recommendations, compare, similar, Q&A  
3. **Cloth Passport** — PDP as a rich fabric identity card (specs visualized, not buried)  
4. **Collection Boards** — Moodboard shortlisting before cart (true B2B sourcing behavior)  
5. **Compare Loom** — Side-by-side fabrics with AI commentary grounded in DB data  
6. **Mill Console** — Supplier dashboard with inventory alerts + Kanban order rail  
7. **Voice/chat onboarding** — For both buyers and suppliers (forms as fallback)

### Motion (2–3 intentional)
- Fabric reveal on homepage scroll  
- Texture hover / cloth focus  
- Warp panel slide-in  
- Kanban status transitions on supplier orders  

---

## 4. Scope coverage (requirements → design)

### Module 1 — Buyer

| Requirement | Implementation |
|---|---|
| Landing, nav, featured, categories | Immersive Greige Floor homepage + category rails |
| Search, filter, grid | Classic filters **and** NL/semantic search |
| AI assistant (chat, voice, NL, recs, compare, similar, Q&A) | **Warp** — HF LLM + retrieval over marketplace data |
| Product details | Cloth Passport (images, name, category, description, colors, specs, stock, price, add to cart/board) |
| Auth | Register / login / logout (JWT); minimal profile |
| Onboarding | Warp-led: business type, industry, categories, fabric prefs, typical qty, budget |
| Cart | Add / update qty / remove / summary |
| Checkout prototype | Shipping → summary → review → place order → confirmation (**no payments**) |
| Buyer dashboard | Profile, previous/current orders, basic status |

### Module 2 — Supplier

| Requirement | Implementation |
|---|---|
| Onboarding | Warp-led: business name/type, contact, address, hours, categories, fabrics, MOQ |
| Dashboard | Total products, active products, pending orders, recent orders, inventory alerts |
| Inventory | Add / edit / delete / update stock / images / available or out of stock |
| Orders | View incoming + details; status: Pending → Accepted → Preparing → Ready for Dispatch → Completed |
| Profile | Business name, contact, address, operating hours |

### Explicitly out of scope
Payments, escrow, logistics/delivery workflows, admin super-dashboards — as specified.

### Creative extras (after core E2E works)
- Collection Boards  
- Compare Loom  
- “Match my sample” (optional HF vision: upload photo → similar fabrics)  
- Personalized Greige Floor from onboarding prefs  
- Accessibility + performance polish (skeleton loaders, optimistic cart)

---

## 5. Technical architecture

### Stack (MERN + AI)
| Layer | Choice |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Framer Motion |
| State | Zustand (or Context) for auth + cart |
| Backend | Node.js + Express REST API |
| Database | MongoDB Atlas |
| Auth | JWT + role-based access (buyer / supplier) |
| Images | Multer (local/cloud URL storage for prototype) |
| AI | Hugging Face Inference — chat LLM + embedding model |
| Voice | Web Speech API (STT/TTS) ↔ Warp |
| Deploy | Frontend: Vercel · API: Railway/Render · DB: Atlas |

### High-level structure
```
/client          React app (buyer + supplier shells)
/server
  /routes        auth, products, cart, orders, boards, ai, profiles
  /controllers
  /models
  /middleware    auth, rbac, validate
  /services      warp (HF), embeddings, recommendations
```

### Core collections
- `users` — credentials, role  
- `buyerProfiles` — onboarding preferences  
- `supplierProfiles` — business profile + MOQ + hours  
- `products` — catalog, specs, stock, image URLs, embedding vector  
- `carts` — buyer line items  
- `boards` — collection boards (differentiator)  
- `orders` — line items + status pipeline + shipping snapshot  
- `aiSessions` — optional Warp continuity  

### API domains (illustrative)
- `POST /auth/register|login` · `POST /auth/logout` (client token clear)  
- `CRUD /products` (supplier-owned) · `GET /products` (public/buyer filters)  
- `GET/POST /cart` · checkout → `POST /orders`  
- `GET/PATCH /orders/:id/status` (supplier)  
- `GET/PUT /profiles/buyer|supplier` + onboarding endpoints  
- `POST /ai/chat` · `POST /ai/search` · `POST /ai/compare` · `POST /ai/similar`

### AI reliability rule
**Traditional browse, search, and filter always work** if HF is slow/down. Demo never depends solely on AI.

---

## 6. Warp AI (Hugging Face) — how it is “real,” not decorative

1. **Grounding:** Retrieve top-N products/profiles from MongoDB (filters + embeddings); pass only that context to the LLM.  
2. **Natural language search:** Parse utterance → structured query (category, GSM range, composition, color, price) + vector similarity.  
3. **Recommendations / similar:** Embedding nearest neighbors on fabric attributes.  
4. **Compare + Q&A:** LLM answers only from selected product documents.  
5. **Voice:** Browser speech in/out; same Warp backend.  
6. **Onboarding:** Multi-turn chat collects required fields; writes structured profile; skippable form fallback.

Preferred HF usage: hosted Inference API with a capable open chat model + a sentence-embedding model for search.

---

## 7. End-to-end happy path (must work in demo)

1. Buyer registers → voice/chat onboarding → personalized Greige Floor.  
2. Browse **or** ask Warp in plain language → open Cloth Passport.  
3. Compare two fabrics → save to Collection Board → add to cart → checkout → confirmation.  
4. Supplier sees incoming order on Mill Console Kanban → Accepted → Preparing → Ready for Dispatch.  
5. Buyer dashboard shows updated status.  
6. Supplier adjusts inventory; low-stock alert appears.  
7. Repeat critical flows on mobile viewport.

---

## 8. Build plan (core first, then dazzle)

| Phase | Focus | Done when |
|---|---|---|
| **1 Foundations** | Auth, RBAC, schema, design tokens, app shells | Both roles enter correct UX |
| **2 Marketplace core** | Catalog, PDP, cart, checkout, orders | Buyer→supplier loop without AI |
| **3 Supplier ops** | Onboarding, dashboard, inventory CRUD, statuses | Mill Console operable |
| **4 Warp AI** | Chat, voice, NL search, recs, compare, Q&A, onboard | AI differentiated & non-blocking |
| **5 Polish + ship** | Boards, motion, a11y, seed data, deploy, demo video | Live URL + walkthrough ready |

### Seed data strategy
Preload 30–50 realistic fabrics across categories (cotton, linen, silk, wool, synthetics, blends) with specs, colorways, and stock so AI and filters feel impressive immediately.

---

## 9. Evaluation alignment (how judges score us)

| Criterion | Our bet |
|---|---|
| Product thinking | Greige Floor + Boards + Mill Console narrative |
| UX quality | Tactile discovery, fewer forms, intentional motion |
| Engineering | Modular MERN, JWT/RBAC, clean API boundaries |
| Scalability posture | Domain routes, profile separation, embedding field ready for scale |
| Creativity | Warp + Compare Loom + Boards — purposeful, not gimmicks |
| Scope discipline | No payments/logistics theater; depth on required flows |

---

## 10. Submission plan

1. **Live deployed web app** (buyer + supplier demo accounts in README/video).  
2. **Demo video** following the narrative in §7 (desktop + mobile snippet).  
3. Source code not required per brief — still keep a clean private repo for the team.

### Suggested demo accounts
- Buyer: `buyer@greige.demo`  
- Supplier: `mill@greige.demo`  

---

## 11. Success definition

The prototype **outshines** when a judge can say:

> “This doesn’t feel like a hackathon CRUD app — it feels like a textile product.”

That means: beautiful material-first UI, a working two-sided order loop, and AI that clearly uses marketplace data — delivered reliably under demo conditions.

---

## 12. Immediate next steps

1. Approve this product direction (name **GREIGE** + pillars).  
2. Scaffold monorepo (`client` + `server`) with auth + product schema.  
3. Design system tokens + Greige Floor homepage mock in React.  
4. Implement buyer→supplier order loop before any AI polish.  
5. Integrate Hugging Face Warp once core E2E is green.

---

*Proposal for Marketplace Hackathon · Product: GREIGE · Stack: MERN + Hugging Face*
