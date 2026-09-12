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

## Updating the deployed website

GitHub is the source of truth for production. The Google Cloud VM clones this
repository into `~/site/brain-brew`, while `~/site/Caddyfile` and
`~/site/docker-compose.yml` are copied from `deploy/gcloud/`.

The expected VM layout is:

```text
~/site/
├── Caddyfile
├── docker-compose.yml
├── public/                 # old static demo; no longer served
└── brain-brew/             # this GitHub repository
```

### 1. Validate and push the local version

Run these commands on the development computer from the repository root:

```bash
cd /Users/krishna/Projects/brain-brew-website
npm ci
npm test
git status
```

`npm test` must finish successfully. A lint warning about the external social
feed image is non-blocking, but there should be no errors.

Review and publish the changes:

```bash
git add -A
git diff --cached --stat
git commit -m "Describe the website update"
git push origin main
git status
```

Replace the example commit message with a short description of the actual
change. Do not continue until the push succeeds and `git status` reports a
clean working tree.

### 2. Pull the new version onto the VM

Connect to the VM using SSH, then run:

```bash
cd ~/site/brain-brew
git status --short
git rev-parse --short HEAD
git fetch origin
git log --oneline HEAD..origin/main
git pull --ff-only origin main
git rev-parse --short HEAD
```

The first `git status --short` should print nothing. If it shows VM-only source
changes, stop and preserve or resolve them before pulling. Record the old commit
printed before the pull in case a rollback is needed.

### 3. Synchronize the deployment configuration

Copy the version-controlled templates into the directory used by Docker
Compose:

```bash
cd ~/site
cp brain-brew/deploy/gcloud/Caddyfile ./Caddyfile
cp brain-brew/deploy/gcloud/docker-compose.yml ./docker-compose.yml
```

Validate both configuration files before changing the running services:

```bash
docker compose config
docker run --rm \
  --volume "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2 \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Both commands must complete without errors.

### 4. Build and deploy the update

From `~/site`, rebuild the application image and reconcile both services:

```bash
docker compose up -d --build
```

Reload Caddy explicitly so a Caddyfile-only change is applied even when its
container did not need to be recreated:

```bash
docker compose exec web \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

There is no need to run `npm install`, `npm build`, or `npm start` directly on
the VM. The Docker build runs `npm ci` and `next build`, and the container starts
the generated standalone Next.js server.

### 5. Verify the deployment

Confirm that both containers are running:

```bash
docker compose ps
docker compose logs --tail=100 app
docker compose logs --tail=100 web
```

Test Next.js from inside the application container:

```bash
docker compose exec app node -e \
  "fetch('http://127.0.0.1:3000/').then(r => console.log('Homepage:', r.status)).catch(e => { console.error(e); process.exit(1) })"

docker compose exec app node -e \
  "fetch('http://127.0.0.1:3000/api/social-feed').then(async r => console.log('API:', r.status, (await r.text()).slice(0, 300))).catch(e => { console.error(e); process.exit(1) })"
```

Both commands should report status `200`. Then test the public endpoints:

```bash
curl --fail --silent --show-error --head https://brainbrewsf.org
curl --silent --show-error --head https://www.brainbrewsf.org
curl --fail --silent --show-error \
  https://brainbrewsf.org/api/social-feed | head -c 500
```

The apex domain should return `200`, `www` should return a permanent redirect
to the apex domain, and the API should return JSON containing an `items` array.

If a check fails, inspect the complete recent logs before rebuilding again:

```bash
docker compose logs --tail=200 app web
```

### 6. Roll back if necessary

Use the previous commit recorded before the pull. This temporarily deploys that
exact revision without rewriting Git history:

```bash
cd ~/site/brain-brew
git switch --detach PREVIOUS_COMMIT_SHA

cd ~/site
cp brain-brew/deploy/gcloud/Caddyfile ./Caddyfile
cp brain-brew/deploy/gcloud/docker-compose.yml ./docker-compose.yml
docker compose config
docker compose up -d --build
docker compose exec web \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

Replace `PREVIOUS_COMMIT_SHA` with the recorded commit. After the production
issue is fixed on `main`, return the VM clone to the normal branch and deploy
again:

```bash
cd ~/site/brain-brew
git switch main
git pull --ff-only origin main

cd ~/site
cp brain-brew/deploy/gcloud/Caddyfile ./Caddyfile
cp brain-brew/deploy/gcloud/docker-compose.yml ./docker-compose.yml
docker compose up -d --build
docker compose exec web \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

## Other commands

- `npm run lint` checks the source for common issues.
- `npm test` runs lint and verifies a complete production build.

Static assets live in `public/`. No database or authentication provider is
required. The social feed reads public YouTube, Instagram, and Strava pages at
runtime. Strava API credentials listed in `.env.example` are optional and add
authenticated club-event updates.
