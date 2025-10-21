This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Deployment (Debian)

You can ship the application as a container built on top of the Debian-based `node:20-bookworm-slim` image. The repository now includes a multi-stage `Dockerfile`, `.dockerignore`, and `docker-compose.yml` to streamline this flow.

1. Provide environment variables: copy any required secrets into a file such as `.env.production`. They are mounted automatically if you uncomment the `env_file` block inside `docker-compose.yml`.
2. Build the production image locally:

   ```bash
   docker build --platform linux/amd64 -t admin-landing:latest .
   ```

3. Run the container (locally or on the Debian host):

   ```bash
   docker run -d --name admin-landing -p 3000:3000 admin-landing:latest
   ```

   Or, use Compose:

   ```bash
   docker compose up -d
   ```

On a Debian server make sure Docker Engine (24.x or newer) and the Compose plugin are installed. The runtime image exposes port `3000`; configure a reverse proxy such as Nginx or Caddy if you need TLS termination or a different public port.
