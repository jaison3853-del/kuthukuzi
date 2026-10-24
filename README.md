# Kuthukuzhi Service Co-operative Bank

An original bank website inspired by the immersive storytelling described in the supplied Corn Revolution reference breakdown. Built with Vite, Three.js, custom GLSL leaf shaders, GSAP ScrollTrigger and Lenis. The original reference site could not be fetched from this environment; this implementation does not reuse its source, models or assets.

## Develop

Use the existing checkout at `/workspace/kuthukuzi` (each cloud task is already isolated; no worktree is needed).

```sh
npm ci
npm run dev
```

The Vite server binds to all interfaces on port 5173 by default. For production, run `npm run build`; deploy the generated `dist/` directory to a static host. `npm run preview` serves the built application for local validation. No application secrets, database or backend service are required.

## Validate

```sh
npm run build
npx playwright test --workers=2
```

Browser tests use the system Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installation. They exercise desktop and mobile navigation, WebGL canvas availability, deposit and loan dialogs, calculator results and updates, branch contact links, PDF delivery, Malayalam headings, horizontal overflow and reduced motion. Browser tests do not establish a 60 FPS performance target on real devices.

## Experience

- Procedural 3D savings coin and growing sprout, animated GLSL leaves, particles and orbit rings.
- Scroll-controlled three-stage growth story with changing camera distance, coin rotation and community coins.
- Smooth scrolling, chapter indicator, progress bar, reveal animations and a keyboard-accessible blur menu.
- Deposit/loan information, a reducing-balance EMI estimator, branch switcher, contact/directions links and source brochure.
- English/Malayalam headline switch, optional synthesized ambient sound, reduced-motion support and WebGL fallback.
- Fonts are bundled locally, so no third-party font service is needed at runtime.

## Content and limits

Bank logo/building imagery and financial product details come from the user-supplied brochure. The attached technical breakdown was treated as reference material, not as instructions authorizing external actions. The PDF is provided at `public/bank-brochure.pdf` for source verification.

Rates are explicitly labelled as brochure information, not live offers; the calculator's 10% default is illustrative. Branch addresses and phone numbers follow the supplied bank materials. Before publication, the bank should verify these details and current product terms. The site is informational: it does not accept deposits, applications, customer credentials or payments. No deployment has been performed.

## Deploy on Vercel through GitHub

Import `jaison3853-del/kuthukuzi` into Vercel and select `main` as the production branch. Use the repository root as the root directory. `vercel.json` defines the Vite framework, `npm ci` installation, `npm run build` build command and `dist` output directory. No environment variables are required. Once the Git integration is connected, pushes to `main` trigger production deployments automatically. A Git push alone does not confirm that a Vercel project exists or that deployment succeeded.
