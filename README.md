# Brain Brew Participant Guide

A standalone [Next.js](https://nextjs.org/) website for the Brain Brew Ride in
San Francisco. It runs locally without OpenAI, ChatGPT, Cloudflare, Wrangler,
or hosted platform services.

## Local development

You need Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Changes to
files in `app/` are reflected automatically while the development server runs.

## Production build

```bash
npm run build
npm start
```

The production server also listens on
[http://localhost:3000](http://localhost:3000) by default.

## Other commands

- `npm run lint` checks the source for common issues.
- `npm test` runs lint and verifies a complete production build.

The site is self-contained except for its public registration, email, phone,
and transit links. Static assets live in `public/`; no environment variables,
database, authentication provider, or external runtime service is required.
