NextAuth + Prisma setup (local)

1) Add environment variables (create `.env.local` at project root):

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
# Optional OAuth provider credentials:
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
```

2) Install dependencies:

```bash
npm install
```

3) Generate Prisma client and push schema to local SQLite DB:

```bash
npx prisma generate
npx prisma db push
```

4) Start dev server:

```bash
npm run dev
```

Visit `http://localhost:3000/signin` to test sign-in (OAuth providers require their client ids/secrets). The dashboard is at `/dashboard`.
