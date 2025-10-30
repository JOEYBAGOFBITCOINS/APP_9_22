# FuelTrakr Quick Start Guide

Get FuelTrakr up and running in minutes!

## Prerequisites

- Node.js 18+
- Supabase account
- Elasticsearch instance (Elastic Cloud recommended)

---

## 1. Clone and Install

```bash
cd APP_9_22
npm install
```

---

## 2. Configure Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials from **Settings → API**:
   - Project URL
   - Anon key

---

## 3. Configure Elasticsearch

### Elastic Cloud (Recommended)

1. Create deployment at [cloud.elastic.co](https://cloud.elastic.co)
2. Save the deployment credentials
3. Copy **Cloud ID** and create an **API Key**

### Self-Hosted

1. Install and start Elasticsearch 8.x
2. Note the URL (default: `http://localhost:9200`)
3. Create API key or use username/password

---

## 4. Set Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Elasticsearch (Cloud)
VITE_ELASTICSEARCH_CLOUD_ID=your-cloud-id
VITE_ELASTICSEARCH_API_KEY=your-api-key
VITE_ELASTICSEARCH_INDEX_PREFIX=fueltrakr

# OR Elasticsearch (Self-hosted)
# VITE_ELASTICSEARCH_NODE=http://localhost:9200
# VITE_ELASTICSEARCH_API_KEY=your-api-key
```

---

## 5. Deploy Backend

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Set secrets
supabase secrets set ELASTICSEARCH_CLOUD_ID="your-cloud-id"
supabase secrets set ELASTICSEARCH_API_KEY="your-api-key"
supabase secrets set ELASTICSEARCH_INDEX_PREFIX="fueltrakr"

# Deploy
supabase functions deploy make-server-218dc5b7
```

---

## 6. Initialize Database

```bash
npm run init-elasticsearch
```

---

## 7. Run Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Login

**Admin:**
- Email: `admin@napleton.com`
- Password: `admin123`

**Porter:**
- Email: `porter@napleton.com`
- Password: `porter123`

---

## Verify Setup

Test health endpoint:

```bash
curl https://your-project.supabase.co/functions/v1/make-server-218dc5b7/health
```

Expected response:

```json
{
  "status": "healthy",
  "services": {
    "supabase": "connected",
    "elasticsearch": "connected"
  }
}
```

---

## Need Help?

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

---

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Auth**: Supabase Auth (JWT)
- **Data**: Elasticsearch
- **Files**: Supabase Storage
- **Backend**: Supabase Edge Functions (Deno + Hono)

---

**Ready to go!** 🚀
