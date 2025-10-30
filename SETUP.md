# FuelTrakr Setup Guide

Complete setup guide for FuelTrakr with Supabase authentication and Elasticsearch data storage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Elasticsearch Setup](#elasticsearch-setup)
4. [Environment Configuration](#environment-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works fine)
- An Elasticsearch instance (Elastic Cloud or self-hosted)

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Create a new project:
   - Enter a project name (e.g., "fueltrakr")
   - Set a strong database password
   - Select a region close to your users
   - Click "Create new project"

### 2. Get Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)
   - **service_role key** (needed for Edge Functions)

3. Note your Project ID from the URL or Settings

### 3. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your frontend URL (e.g., `http://localhost:5173` for development)

### 4. Create Storage Bucket

1. Go to **Storage**
2. Click "Create a new bucket"
3. Name it: `make-218dc5b7-fueltrakr-photos`
4. Set it to **Private**
5. Click "Create bucket"

---

## Elasticsearch Setup

### Option A: Elastic Cloud (Recommended)

1. Go to [https://cloud.elastic.co](https://cloud.elastic.co)
2. Create a free trial account
3. Click "Create deployment"
4. Choose your cloud provider and region
5. Click "Create deployment"
6. **IMPORTANT**: Save the `elastic` user password shown after creation
7. After deployment is ready, click on your deployment name
8. Copy the **Cloud ID**
9. Go to **Management** → **Security** → **API Keys**
10. Create a new API key with full access
11. Copy the **API Key** (you won't be able to see it again)

### Option B: Self-Hosted Elasticsearch

If you're running Elasticsearch locally or on your own server:

1. Install Elasticsearch 8.x following [official documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)
2. Start Elasticsearch
3. Note your Elasticsearch URL (default: `http://localhost:9200`)
4. Create an API key or use username/password authentication

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Frontend Environment Variables

Edit `.env` and add your credentials:

```env
# Application Mode - Set to false for production
VITE_DEMO_MODE=false
VITE_SKIP_AUTH=false
VITE_AUTO_LOGIN=false

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=xxxxx

# Elasticsearch Configuration

# Option A: Using Elastic Cloud
VITE_ELASTICSEARCH_CLOUD_ID=your-cloud-id-here
VITE_ELASTICSEARCH_API_KEY=your-api-key-here
VITE_ELASTICSEARCH_INDEX_PREFIX=fueltrakr

# Option B: Using Self-Hosted Elasticsearch
# VITE_ELASTICSEARCH_NODE=http://localhost:9200
# VITE_ELASTICSEARCH_API_KEY=your-api-key-here
# Or use username/password:
# VITE_ELASTICSEARCH_USERNAME=elastic
# VITE_ELASTICSEARCH_PASSWORD=your-password-here
# VITE_ELASTICSEARCH_INDEX_PREFIX=fueltrakr

# Security Settings
VITE_REQUIRE_NAPLETON_EMAIL=true
```

### 3. Configure Backend Environment Variables

You'll need to set these in Supabase for your Edge Function:

- `SUPABASE_URL` (automatically provided by Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically provided by Supabase)
- `ELASTICSEARCH_NODE` or `ELASTICSEARCH_CLOUD_ID`
- `ELASTICSEARCH_API_KEY` or `ELASTICSEARCH_USERNAME` + `ELASTICSEARCH_PASSWORD`
- `ELASTICSEARCH_INDEX_PREFIX` (default: `fueltrakr`)

---

## Backend Deployment

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-id
```

### 4. Set Environment Variables

Set the Elasticsearch configuration in Supabase:

```bash
# For Elastic Cloud
supabase secrets set ELASTICSEARCH_CLOUD_ID="your-cloud-id"
supabase secrets set ELASTICSEARCH_API_KEY="your-api-key"
supabase secrets set ELASTICSEARCH_INDEX_PREFIX="fueltrakr"

# OR for self-hosted
supabase secrets set ELASTICSEARCH_NODE="http://your-elasticsearch-url:9200"
supabase secrets set ELASTICSEARCH_API_KEY="your-api-key"
supabase secrets set ELASTICSEARCH_INDEX_PREFIX="fueltrakr"
```

### 5. Deploy Edge Function

```bash
supabase functions deploy make-server-218dc5b7
```

### 6. Verify Deployment

Test the health endpoint:

```bash
curl https://your-project.supabase.co/functions/v1/make-server-218dc5b7/health
```

You should see:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T...",
  "services": {
    "supabase": "connected",
    "elasticsearch": "connected"
  }
}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Elasticsearch Indices

This step creates the necessary indices in Elasticsearch:

```bash
npm run init-elasticsearch
```

### 3. Verify Setup

The initialization script will:
- Test Elasticsearch connection
- Create `fueltrakr_users` index
- Create `fueltrakr_fuel_entries` index

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

The production build will be in the `dist` folder.

---

## Demo Users

The backend automatically creates two demo users on first deployment:

**Admin User:**
- Email: `admin@napleton.com`
- Password: `admin123`
- Role: Admin (full access)

**Porter User:**
- Email: `porter@napleton.com`
- Password: `porter123`
- Role: Porter (regular user)

You can use these to test the application initially.

---

## Troubleshooting

### Elasticsearch Connection Issues

**Problem:** "Failed to connect to Elasticsearch"

**Solutions:**
1. Verify Elasticsearch is running
2. Check environment variables are correct
3. Ensure network connectivity (firewall/security groups)
4. For Elastic Cloud, verify Cloud ID and API key

### Supabase Authentication Issues

**Problem:** "Unauthorized" errors

**Solutions:**
1. Verify `VITE_SUPABASE_ANON_KEY` is correct
2. Check Site URL in Supabase Authentication settings
3. Ensure email provider is enabled

### Edge Function Deployment Issues

**Problem:** Edge function not deploying

**Solutions:**
1. Verify Supabase CLI is logged in: `supabase login`
2. Ensure project is linked: `supabase link --project-ref your-project-id`
3. Check function logs: `supabase functions logs make-server-218dc5b7`

### Index Not Created

**Problem:** Elasticsearch indices not created

**Solutions:**
1. Run the initialization script: `npm run init-elasticsearch`
2. Manually create indices using Elasticsearch Dev Tools
3. Check Elasticsearch permissions (API key needs write access)

### CORS Issues

**Problem:** CORS errors in browser console

**Solutions:**
1. Verify Site URL in Supabase settings
2. Check Edge Function CORS configuration
3. Ensure frontend URL matches allowed origins

---

## Architecture Overview

### Authentication Flow

1. User logs in with email/password
2. Supabase Auth validates credentials
3. JWT token is returned to frontend
4. Token is sent with all API requests
5. Backend validates token with Supabase

### Data Storage

- **User Profiles**: Elasticsearch (`fueltrakr_users` index)
- **Fuel Entries**: Elasticsearch (`fueltrakr_fuel_entries` index)
- **Photos**: Supabase Storage (private bucket with signed URLs)
- **Authentication**: Supabase Auth (PostgreSQL)

### Backend Services

- **Supabase Edge Functions** (Deno runtime)
- **Hono** web framework
- **Elasticsearch** for data storage
- **Supabase Storage** for file uploads

---

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for all services
3. **Rotate API keys regularly**
4. **Enable MFA** on Supabase account
5. **Restrict Elasticsearch access** to backend only
6. **Use HTTPS** in production
7. **Review and update security rules** regularly

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase documentation: https://supabase.com/docs
3. Review Elasticsearch documentation: https://www.elastic.co/guide

---

## Next Steps

After setup is complete:

1. Customize the application for your needs
2. Add more users through the signup page
3. Configure email templates in Supabase
4. Set up monitoring and alerts
5. Configure backups for Elasticsearch
6. Deploy to production environment

---

**Last Updated:** October 2025
**Version:** 1.0.0
