# Brain Brew Participant Guide

A standalone [Next.js](https://nextjs.org/) website for the Brain Brew Ride in
San Francisco. It runs as a conventional Node.js application and does not
require a managed hosting platform.

## Local development

You need Node.js 22.13 or newer and npm.

```bash
npm ci
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

## Docker

The production image uses Next.js standalone output and listens on port 3000.

```bash
docker build -t brain-brew-site .
docker run --rm -p 3000:3000 brain-brew-site
```

Ready-to-copy Caddy and Docker Compose configuration for the Google Cloud VM
lives in `deploy/gcloud/`.

## Other commands

- `npm run lint` checks the source for common issues.
- `npm test` runs lint and verifies a complete production build.

Static assets live in `public/`. No database or authentication provider is
required. The social feed reads public YouTube, Instagram, and Strava pages at
runtime. Strava API credentials listed in `.env.example` are optional and add
authenticated club-event updates.
