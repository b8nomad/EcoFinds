# EcoFinds

Eco-friendly marketplace with separate Admin and User portals.

## 1) Clone

```bash
git clone https://github.com/b8nomad/EcoFinds.git .
```

## 2) Backend

```bash
cd backend
npm i
npx prisma generate
# If you have migrations, apply them:
# npx prisma migrate deploy
npm run dev
```

Create a .env file (backend/.env):

```env
DATABASE_URL=
JWT_SECRET=
```

Sample values (for local/dev):

```env
DATABASE_URL="postgres://avnadmin:AVNS_dQelciNNArcZ-7d5Ekk@pg-a7e512-sogcf-9673.d.aivencloud.com:21780/defaultdb?sslmode=require"
JWT_SECRET="123ahsud9a8IUH"
```

API base (default): http://localhost:3000/api/v1  
Uploads (default): http://localhost:3000/uploads

## 3) Frontend

```bash
cd frontend
npm i
npm run dev
```

Create a .env file (frontend/.env):

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_IMAGE_URL=http://localhost:3000/uploads
```

## 4) Project Structure

- backend: Express + Prisma + JWT auth
- frontend: React + Vite + shadcn/ui, role-based routing

## 5) Notes

- Run backend first so the frontend can call the API.
- Ensure your PostgreSQL DATABASE_URL is reachable and SSL-mode matches your host.
- If schema changes: use npx prisma generate and migrate commands accordingly.
