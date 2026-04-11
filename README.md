# DNR Techno Services – Modern SaaS Site + Admin CMS (Next.js 14 App Router)

## Stack
- Next.js 14 (App Router) + React 18
- TypeScript + Tailwind CSS
- MongoDB + Mongoose
- JWT auth (httpOnly cookie) + middleware-protected admin routes
- SWR for client data fetching in admin

## Setup
1) Copy `.env.example` to `.env.local` and set:
```
MONGODB_URI=mongodb://localhost:27017/dnr-modern
JWT_SECRET=change-me
```
2) Install deps  
```
npm install
```
3) Seed initial content (services, testimonials, hero copy, admin user admin@dnr.com / admin123)  
```
npm run seed
```
4) Run the app  
```
npm run dev
```
5) Admin login at `http://localhost:3000/admin/login`

## Project Structure (key files)
- `app/(site)/*` — public website pages (home, services, about, contact)
- `app/admin/*` — admin dashboard, CRUD UIs
- `app/api/*` — Next.js route handlers (auth, services, testimonials, content, upload)
- `models/*` — Mongoose schemas
- `lib/db.ts` — Mongo connection helper (cached)
- `lib/auth.ts` — JWT helpers + cookie read
- `scripts/seed.ts` — seeds Mongo with starter data
- `public/uploads` — local uploads via `/api/upload`

## Admin Features
- Protected routes via middleware + JWT cookie
- Services CRUD (title, description, image URL)
- Testimonials CRUD (name, feedback, rating)
- Content editor (hero section fields)
- Media upload (stores file under `public/uploads`, returns URL)

## Public Site Features
- Dynamic content pulled from Mongo (services, testimonials, hero copy)
- Modern 2026 SaaS UI with glassmorphism, gradients, responsive layout
- Pages: `/`, `/services`, `/about`, `/contact`

## Notes
- Uploads are stored on disk; for production, point `/api/upload` to cloud storage.
- Update `next.config.mjs` `images.remotePatterns` for any additional external image hosts.
- For production, set a strong `JWT_SECRET` and secure cookies (`secure: true`) behind HTTPS.
