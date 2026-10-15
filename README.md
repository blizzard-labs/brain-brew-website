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

Production images are built in **GitHub Actions**, then downloaded and started
on the Google Cloud VM. The VM does not install npm dependencies or compile
Next.js. This keeps deployments practical on a small VM.

The [Publish website image workflow](.github/workflows/publish-image.yml) runs
on every push to `main`, runs `npm test` inside the Docker build, and publishes
an image to `ghcr.io/blizzard-labs/brain-brew-website:sha-FULL_COMMIT_SHA` only
if the build succeeds. Docker build layers are cached in GitHub Actions.
Publishing an image does not automatically update the VM.

The expected VM layout is:

```text
~/site/
├── Caddyfile
├── docker-compose.yml
├── .env.image              # selected production image; kept on the VM
└── brain-brew/             # this GitHub repository
```

### One-time setup

1. Push the workflow and deployment changes to `main`. In the repository's
   **Actions** tab, enable Actions if needed and wait for **Publish website
   image** to succeed. The workflow uses GitHub's built-in `GITHUB_TOKEN` with
   `packages: write`; no registry password secret is needed for CI. Organization
   policy must allow Actions and package creation. If the package already
   exists, grant this repository Actions access in its package settings.
2. The workflow builds `linux/amd64` images for an Intel/AMD VM. Run `uname -m`
   on the VM and confirm it reports `x86_64`. An ARM VM needs a `linux/arm64`
   build on an ARM runner before using this procedure.
3. New GHCR packages are private by default. On the VM, authenticate with a
   GitHub account that can read the package:

   ```bash
   docker login ghcr.io -u YOUR_GITHUB_USERNAME
   ```

   At the password prompt, paste a personal access token **(classic)** with
   `read:packages`, authorized for the organization if it uses SSO. Use the same
   VM user for login and deployment. If the package is deliberately made public
   in GitHub package settings, authentication is unnecessary. See GitHub's
   [Container registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

For the first migration, finish or cancel any old VM build before proceeding.
The backup step below also supports rolling back to the existing locally built
image. Keep that image until the new deployment is verified.

### 1. Validate, push, and wait for the image

On the development computer, from the repository root:

```bash
cd /Users/krishna/Projects/brain-brew-website
npm ci
npm test
git status
```

`npm test` must finish successfully. The external social-feed image lint
warning is non-blocking. Review and publish the changes:

```bash
git add -A
git diff --cached --stat
git commit -m "Describe the website update"
git push origin main
git rev-parse HEAD
git status
```

Replace the example commit message with a description of the change. Wait for
**Publish website image** in the
[Actions tab](https://github.com/blizzard-labs/brain-brew-website/actions/workflows/publish-image.yml)
to succeed **for this exact commit** before continuing. The run summary includes
both the commit tag and an immutable image digest. A failed run leaves the
running website unchanged; fix the failure and push again.

### 2. Back up the current deployment on the VM

Connect using SSH. Before changing any deployment files, preserve the current
application image and configuration:

```bash
cd ~/site
docker image tag "$(docker inspect --format '{{.Image}}' brain_brew_app)" \
  brain-brew-rollback:previous
cp Caddyfile Caddyfile.previous
cp docker-compose.yml docker-compose.previous.yml
if [ -f .env.image ]; then cp .env.image .env.image.previous; fi
cat > docker-compose.rollback.yml <<'YAML'
services:
  app:
    image: brain-brew-rollback:previous
YAML
```

These backups represent one previous deployment; do this once per update and
retain them until verification succeeds. Do not prune the rollback image.

### 3. Pull the source and select its published image

The source checkout supplies the matching deployment configuration. It is not
used to build on the VM.

```bash
cd ~/site/brain-brew
git status --short
```

The output should be empty. Preserve or resolve VM-only changes before pulling.
Then run:

```bash
git switch main
git pull --ff-only origin main
git rev-parse HEAD
```

Confirm this full commit SHA has a successful image-publishing run. If another
push arrived since step 1, wait for its run as well before deploying that commit.
Then select the image and copy the configuration:

```bash
cd ~/site
printf 'BRAIN_BREW_IMAGE=ghcr.io/blizzard-labs/brain-brew-website:sha-%s\n' \
  "$(git -C brain-brew rev-parse HEAD)" > .env.image
cp brain-brew/deploy/gcloud/Caddyfile ./Caddyfile
cp brain-brew/deploy/gcloud/docker-compose.yml ./docker-compose.yml
docker compose --env-file .env.image config
```

The app service must show an `image:` reference and no `build:` section. For an
immutable selection, replace the value in `.env.image` with the
`ghcr.io/...@sha256:...` reference from the matching Actions run summary. This
file stores only the image selection; it contains no registry credentials.

Validate Caddy before changing running services:

```bash
docker run --rm \
  --volume "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2 \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Both configuration checks must succeed.

### 4. Download and deploy the image

From `~/site`:

```bash
docker compose --env-file .env.image pull app
```

Continue only if the pull succeeds. `unauthorized` or `denied` usually means the
VM needs registry login or package access. `manifest unknown` usually means the
selected commit's workflow has not published an image. Resolve the pull error
before starting the update.

```bash
docker compose --env-file .env.image up -d --no-build
docker compose --env-file .env.image exec web \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

The VM downloads image layers and starts the prebuilt standalone Next.js server.
No `npm ci`, `npm test`, or `docker compose up --build` is needed on the VM.
Keep using `--env-file .env.image` in future Compose commands so the selected
image is available even in a new SSH session. `--no-build` explicitly prevents
local compilation. See the [Compose command reference](https://docs.docker.com/reference/cli/docker/compose/up/).

### 5. Verify the deployment

```bash
docker compose --env-file .env.image ps
docker compose --env-file .env.image logs --tail=100 app web
docker inspect --format '{{.Config.Image}}' brain_brew_app
```

Confirm both containers are running and the app uses the image you selected.
Test Next.js from inside its container:

```bash
docker compose --env-file .env.image exec app node -e \
  "fetch('http://127.0.0.1:3000/').then(r => { console.log('Homepage:', r.status); if (!r.ok) process.exit(1) }).catch(e => { console.error(e); process.exit(1) })"

docker compose --env-file .env.image exec app node -e \
  "fetch('http://127.0.0.1:3000/api/social-feed').then(async r => { console.log('API:', r.status, (await r.text()).slice(0, 300)); if (!r.ok) process.exit(1) }).catch(e => { console.error(e); process.exit(1) })"
```

Both should report status `200`. Then test the public endpoints:

```bash
curl --fail --silent --show-error --head https://brainbrewsf.org
curl --silent --show-error --head https://www.brainbrewsf.org
curl --fail --silent --show-error \
  https://brainbrewsf.org/api/social-feed | head -c 500
```

The apex domain should return `200`, `www` should permanently redirect to the
apex domain, and the API should return JSON with an `items` array.

If a check fails, inspect logs before attempting another deployment:

```bash
docker compose --env-file .env.image logs --tail=200 app web
```

### 6. Roll back without rebuilding

The image saved in step 2 works even for the first migration from VM builds.
Restore the saved configuration and override its app image with that local copy:

```bash
cd ~/site
cp Caddyfile.previous Caddyfile
cp docker-compose.previous.yml docker-compose.yml
if [ -f .env.image.previous ]; then cp .env.image.previous .env.image; fi
docker run --rm \
  --volume "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2 \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose --env-file .env.image \
  -f docker-compose.yml -f docker-compose.rollback.yml config
```

Continue only if both configuration checks succeed:

```bash
docker compose --env-file .env.image \
  -f docker-compose.yml -f docker-compose.rollback.yml up -d --no-build --pull never
docker compose --env-file .env.image \
  -f docker-compose.yml -f docker-compose.rollback.yml exec web \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

Repeat the verification checks, adding `-f docker-compose.yml
-f docker-compose.rollback.yml` to Compose commands while rolled back. The
rollback uses local images, so it needs neither a registry download nor a
compilation. It does not change Git history or delete Caddy's certificate data.

For the next fixed release, repeat steps 1–5, selecting the newly published
image and copying the current templates. If already rolled back, retain the
existing backups instead of overwriting them in step 2.

## Other commands

- `npm run lint` checks the source for common issues.
- `npm test` runs the Instagram pagination tests, lint, and a complete production build.

Static assets live in `public/`. No database or authentication provider is
required. The social feed reads public YouTube, Instagram, and Strava pages at
runtime. Strava API credentials listed in `.env.example` are optional and add
authenticated club-event updates.


## Donation progress

The hero shows two bars, one each for the Brain Brew Alzheimer’s Association
(purple) and Michael J. Fox Foundation (orange) team pages, each toward a $2,500
goal. The browser polls
`/api/donation-progress` every five minutes; the server caches complete totals for
five minutes. No API credentials are required.

If either source fails, the last complete totals are shown with a notice. That
fallback is held in server memory and resets on restart. If no complete totals
are available, the bars show an unavailable message rather than partial totals.

Visitors can also report an employer match, and which charity it went to, from
the donate dialog. Each match is added to that charity’s bar and stored in `data/matched-gifts.json` (set
`MATCHED_GIFTS_FILE` to change the path). In production this lives on the
`matched_gifts` Docker volume, so it survives redeploys. The form is public, so
each entry is capped at $1,000 and limited to three per visitor per hour. Every
entry is timestamped; to remove a bad one, edit the file on the volume and
restart the app container.

Changes to either fundraising page’s markup may require updating its parser in
`lib/donation-progress.ts`.

## Complete Instagram feed setup

The public Instagram profile embed returns a limited sample. To load all available
published posts, reels, and carousel posts, configure Instagram API with Instagram
Login. Each carousel is represented by one card linking to the original post.
Stories and private/archived content are not part of this feed.

1. Use a Business or Creator Instagram account for `@brainbrewsf`.
2. Create a Meta developer app and add **Instagram API with Instagram Login**.
   Connect/authorize `@brainbrewsf` in the app's Instagram setup, with the read
   permission `instagram_business_basic`. Follow the app dashboard's tester/account
   authorization steps if the app is in development mode.
3. Generate/exchange a long-lived Instagram access token using Meta's setup flow.
   Record the Instagram user ID and the API version selected in the dashboard.
4. Put `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`, and `INSTAGRAM_API_VERSION`
   in `.env.local` for local development, and in the server's secret environment
   configuration for production. Use a version such as `v22.0` only if supported
   by your app; copy the version from Meta's dashboard. Never use `NEXT_PUBLIC_`
   names, commit tokens, or paste them into chat.
5. Restart the local server. Check `/api/social-feed`: `instagramStatus` should
   be `complete`, with the expected number of Instagram items (currently 10 in
   the supplied profile screenshot). Deploy the code and configure the same
   credentials on the production server separately.

The server follows all media cursors, deduplicates IDs, and caches only completed
syncs for five minutes. Failed later pages never replace a complete cached result.
This cache is in memory per server process: it does not survive restarts. Without
credentials, the limited public embed remains available. The response reports
`not_connected`, `complete`, `stale`, or `unavailable`; the page links visitors to
Instagram when full freshness cannot be confirmed.

Tokens expire or may be revoked. Renew/rotate the long-lived token using Meta's
supported flow before expiry, update the server secret, and restart the service.
Automatic durable token rotation is not implemented. The browser refreshes every
five minutes while the page is open; this is not an independent background job.

References: [Meta Instagram Login collection](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login)
and [Meta setup guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started).

Run pagination regression tests with `node --experimental-strip-types --test tests/instagram-feed.test.mjs`.


## Image organization

Keep original uploads in `assets/source/`, outside the public web directory:

- `assets/source/gallery/`: original event and City Hall photos (formerly `frame-pics/`).
- `assets/source/sponsors/`: original partner artwork (formerly `sponsor-logos/`).
- `assets/source/team/`: original crew portraits (formerly `team-photos/`).

The site uses the optimized, named assets in `public/gallery/`, `public/sponsors/`,
and `public/team/`. Existing hero artwork remains in `public/`; local fonts and
licenses live in `public/fonts/`. Moving the originals does not change site URLs.
Original uploads are excluded from the Docker build context. When adding an image,
keep its original in `assets/source/`, export a web-sized version into the matching
`public/` folder, and update the relevant gallery, sponsor, or crew component.

### Optional social credentials on the deployment server

The Compose app passes through the optional variables in `.env.example`. Store
these in the VM shell environment or the private `.env.image` file used by the
existing deployment commands. Do not commit credentials. Recreate the app after
changing them. Without Instagram credentials, the site uses the limited public
feed; complete syncing requires the authorized connection described above.

Production builds use Next.js’s supported Webpack mode (`next build --webpack`)
to avoid the local Turbopack CSS worker permission failure. Docker and CI use the
same build command through `npm test`.

## Dependency security checks

Run `npm ci`, `npm audit`, and `npm audit --omit=dev` before deployment.
The October 9, 2026 update moves Next.js and its ESLint configuration to 16.4.0
and refreshes compatible transitive security patches. The production dependency
audit reports zero vulnerabilities.

The full audit still reports five high-severity package entries for one unpatched
`braces` advisory (GHSA-vfj7-8cjw-p6xm), through Next.js's development-only ESLint
plugin → fast-glob → micromatch chain. No patched braces release is currently
published. Do not use `npm audit fix --force` to silence this: its proposed
eslint-config-next 14 downgrade mismatches the installed framework. Recheck for
an upstream fix before future dependency updates. No audit suppression is applied.
