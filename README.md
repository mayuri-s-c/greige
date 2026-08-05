# GREIGE

B2B textile marketplace prototype — *From the loom, before the finish.*

## Stack

- **Client:** React + Vite + Tailwind + Zustand + Framer Motion
- **Server:** Node.js + Express + MongoDB + JWT RBAC
- **AI:** Warp assistant via Hugging Face Inference (with offline fallback)

## Setup

1. Install MongoDB locally (or set `MONGODB_URI` in `server/.env` to Atlas).
2. Install dependencies:

```bash
npm run install:all
npm install
```

3. Seed demo data:

```bash
npm run seed
```

4. Run both apps:

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5001  

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Buyer | `buyer@greige.demo` | `password123` |
| Supplier | `mill@greige.demo` | `password123` |

## Hugging Face (optional)

Add to `server/.env`:

```bash
HF_TOKEN=hf_xxx
HF_CHAT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

Without a token, Warp still responds using catalog-grounded fallbacks.
