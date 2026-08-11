# ==========================================================================
# Frontend (Next.js) — D:\newmetait\frontend me rakhein, naam: Dockerfile
#
# Multi-stage build: teen hisse. Aakhri image chhoti hoti hai kyunke usme
# sirf chalne wali cheezein jati hain, build tools nahi.
# ==========================================================================

# ---- Stage 1: dependencies install ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# ⚠ AHEM: NEXT_PUBLIC_* variables BUILD ke waqt code me "bake" ho jate hain.
# Ye browser me chalte hain, is liye runtime par set karne se kaam nahi hota —
# build ARG ke tor par yahan aane zaroori hain. compose se pass honge.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN npm run build

# ---- Stage 3: run ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# root ke bajaye non-root user — behtar security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next ki "standalone" output — sirf zaroori files. Iske liye next.config me
# output: "standalone" hona chahiye (guide me likha hai).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone build ek server.js banata hai
CMD ["node", "server.js"]
