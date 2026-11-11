# Run the Alloha resolver safely over HTTPS

Use this setup when Lampa needs to reach your resolver from outside your home
network. Only the HTTPS gateway is exposed. The resolver and Chromium stay
inside Docker and cannot be opened directly from the Internet.

## Before you start

You need:

- a server with Docker Engine and Docker Compose;
- a public domain name pointing to that server;
- a trusted TLS certificate for the domain;
- at least 2 GB of free memory.

The certificate directory must contain these files:

```text
fullchain.pem
privkey.pem
```

## 1. Create your settings file

```bash
cd server/deploy
cp .env.example .env
```

Open `.env` and set:

- `ALLOHA_PUBLIC_HOST` — the domain and public port used by Lampa;
- `ALLOHA_HTTPS_PORT` — the port Docker should open on the server;
- `ALLOHA_CERT_DIR` — the directory containing the certificate files.

For example:

```text
ALLOHA_PUBLIC_HOST=resolver.example.com:18443
ALLOHA_HTTPS_PORT=18443
ALLOHA_CERT_DIR=/etc/letsencrypt/live/resolver.example.com
```

## 2. Create a private access token

```bash
openssl rand -hex 32
```

Copy the result to `ALLOHA_ACCESS_TOKEN` in `.env`. This token becomes part of
the resolver address, so anyone who knows it can use your server. Do not put it
in screenshots, public logs or documentation.

## 3. Check and start the server

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

Both containers should become healthy. If they do not, view the latest logs:

```bash
docker compose logs --tail=100 resolver gateway
```

## 4. Connect Lampa

Open YummyAnime settings and enter the resolver address:

```text
https://resolver.example.com:18443/<your access token>
```

Use the same host, port and token that you placed in `.env`.

## Everyday commands

```bash
docker compose restart
docker compose logs --tail=100 resolver gateway
docker compose down
```

The gateway checks the certificate files every hour. After renewing a
certificate, you can apply it immediately with:

```bash
docker compose restart gateway
```

If the access token becomes public, generate a new one, update `.env`, recreate
the containers and replace the resolver address on every Lampa device.

## Important safety notes

- Never publish port `8790`; it belongs only to the internal Docker network.
- Keep the secret token in `.env` and do not commit that file.
- Do not remove the read-only filesystem, sandbox, seccomp profile or resource
  limits from `compose.yaml`.
- If another reverse proxy already serves HTTPS on port 443, keep this gateway
  private behind it and preserve the secret path in the public URL.

