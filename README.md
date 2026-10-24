# Kuthukuzhi Service Co-operative Bank

An original, full-screen bank experience rebuilt around the user-supplied video of Corn Revolution. Built with Vite, Three.js, custom GLSL, GSAP and Lenis. The reference video guides the composition, condensed/flickering headlines, atmospheric lighting, continuous camera journey and looping ending. Original Corn Revolution source, models and assets are not reused.

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

Browser tests use the system Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installation. They exercise desktop and mobile navigation, WebGL canvas availability, deposit and loan dialogs, calculator results and updates, branch contact links, PDF delivery, Malayalam headings, horizontal overflow, reduced motion and a deliberately blocked 3D module. Eight browser tests run across desktop and mobile. Browser tests do not establish a 60 FPS performance target on real devices.

## Experience

- One persistent full-screen WebGL canvas and six story chapters: a sculptural savings seed, trust helix, cutaway soil with growing plant and roots, connected community field, architectural bank model, and closing invitation.
- A continuous scroll-driven camera path; procedural models, custom animated leaf/particle/cloud shaders, PBR lighting, desktop bloom and local textures. The bank model is a stylized illustration, not a measured architectural replica.
- A real initialization loader, condensed kinetic headlines, outline/interference transitions, chapter navigation, progress HUD and keyboard-accessible blurred menu.
- Intentional further scrolling at the end loops back to the start. Reduced-motion mode disables this automatic loop and animation, using direct chapter navigation instead.
- Rendering pauses behind open menus/dialogs and while the document is hidden. Mobile has a smaller pixel/particle budget and no bloom.
- Deposit/loan information, a reducing-balance EMI estimator, branch switcher, contact/directions links and source brochure.
- English/Malayalam headline switch, optional synthesized ambient sound, reduced-motion support and WebGL fallback.
- Fonts are bundled locally, so no third-party font service is needed at runtime.

## Content and limits

Bank logo/building imagery and financial product details come from the user-supplied brochure. The attached technical breakdown was treated as reference material, not as instructions authorizing external actions. The PDF is provided at `public/bank-brochure.pdf` for source verification.

Rates are explicitly labelled as brochure information, not live offers; the calculator's 10% default is illustrative. Branch addresses and phone numbers follow the supplied bank materials. Before publication, the bank should verify these details and current product terms. The site is informational: it does not accept deposits, applications, customer credentials or payments. GitHub publishing does not establish a successful Vercel deployment; that status requires confirmation from Vercel.

## Deploy on Vercel through GitHub

Import `jaison3853-del/kuthukuzi` into Vercel and select `main` as the production branch. Use the repository root as the root directory. `vercel.json` defines the Vite framework, `npm ci` installation, `npm run build` build command and `dist` output directory. No environment variables are required. Once the Git integration is connected, pushes to `main` trigger production deployments automatically. A Git push alone does not confirm that a Vercel project exists or that deployment succeeded.
