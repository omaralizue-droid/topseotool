# TOPSEOTOOL — Netlify Production Deployment Guide

This guide details the step-by-step instructions for deploying TOPSEOTOOL to Netlify.

---

## 1. Prerequisites

- A [GitHub](https://github.com) repository containing the TOPSEOTOOL codebase.
- A [Netlify](https://www.netlify.com) account.
- A production PostgreSQL database connection URL (e.g. from [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
- Stripe API keys & Resend API key (if using email notifications).

---

## 2. Step-by-Step Netlify Setup

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Netlify production deployment"
git push origin main
```

### Step 2: Connect Repository to Netlify
1. Log into your **Netlify Dashboard**.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** as your Git provider and select your `topseotool` repository.

### Step 3: Configure Build & Deploy Settings
Netlify will auto-detect Next.js via `@netlify/plugin-nextjs`. Verify the build parameters:

- **Build command**: `npm run build` *(runs `prisma generate && next build`)*
- **Publish directory**: `.next`
- **Functions directory**: Netlify Next.js Runtime handles serverless functions automatically.
- **Node.js Version**: `20.x` (configured in `netlify.toml`).

---

## 3. Environment Variables Configuration

In Netlify Dashboard, navigate to **Site configuration** → **Environment variables** → **Add variables**.

Add the following environment variables:

| Variable Name | Required | Description / Example |
|---|---|---|
| `DATABASE_URL` | **Yes** | Neon/Supabase PostgreSQL connection string with `?sslmode=require` |
| `AUTH_SECRET` | **Yes** | 32+ character random secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Production domain (`https://topseotool.net` or your `.netlify.app` URL) |
| `GEMINI_API_KEY` | Optional | Google Gemini AI API key |
| `STRIPE_SECRET_KEY` | Optional | Stripe Secret Key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe Publishable Key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe Webhook Secret (`whsec_...`) |
| `STRIPE_PRICE_PRO` | Optional | Stripe Price ID for Pro plan |
| `STRIPE_PRICE_AGENCY` | Optional | Stripe Price ID for Agency plan |
| `STRIPE_PRICE_BUSINESS` | Optional | Stripe Price ID for Business plan |
| `RESEND_API_KEY` | Optional | Resend Email API Key |
| `USE_MOCK_AI` | Optional | Set to `"false"` in production to use live Gemini AI API |

---

## 4. Production Database Setup

Run database migrations against your production database **before** first deployment:

```bash
# Push schema to production database (Neon / Supabase)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/topseotool?sslmode=require" npx prisma db push
```

---

## 5. Custom Domain & SSL Setup

1. In Netlify Dashboard, go to **Domain management** → **Add custom domain**.
2. Enter `topseotool.net`.
3. Add DNS records at your domain registrar pointing to Netlify:
   - **Apex (`topseotool.net`)**: ALIAS / ANAME or A Record pointing to Netlify load balancer IP.
   - **Subdomain (`www.topseotool.net`)**: CNAME pointing to `<your-site-name>.netlify.app`.
4. Provision free SSL certificate via Netlify's automated Let's Encrypt integration.

---

## 6. Verification Checklist Post-Deployment

- [ ] Visit `https://topseotool.net` (or your Netlify URL).
- [ ] Test User Registration & Login.
- [ ] Create a Project and trigger a live SEO Audit.
- [ ] Trigger an AI Search Visibility Scan.
- [ ] Test `/pricing` and `/billing` upgrade flows.
- [ ] Verify `https://topseotool.net/robots.txt` and `https://topseotool.net/sitemap.xml`.
