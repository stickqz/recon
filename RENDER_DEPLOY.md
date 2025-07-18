# 🎯 Deploy to Render.com

Complete guide to deploy your Identity Reconciliation API on Render with PostgreSQL.

## 🚀 Quick Deploy (Recommended)

### Option 1: Using render.yaml (Infrastructure as Code)
1. **Push to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/yourusername/identity-reconciliation-api.git
   git push -u origin master
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically create both web service and PostgreSQL database!

### Option 2: Manual Setup
1. **Create PostgreSQL Database**:
   - Go to [render.com](https://render.com) dashboard
   - Click "New" → "PostgreSQL"
   - Choose free plan
   - Note the database URL

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Set Environment Variables**:
   - In web service settings → Environment
   - Add: `DATABASE_URL` (from your PostgreSQL service)
   - Add: `NODE_ENV=production`

## 📋 Configuration Details

### Environment Variables
Render automatically provides `DATABASE_URL` from your PostgreSQL service. No need to set individual DB credentials!

```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 (automatically detected)

## 🗄️ Database Setup

Render will automatically create your PostgreSQL database, but you need to initialize the schema:

### Method 1: Using Render Shell
1. Go to your web service → Shell tab
2. Run: `npm run init-db`

### Method 2: Using Database Console
1. Go to your PostgreSQL service → Connect → External Connection
2. Use provided connection details with any PostgreSQL client
3. Execute the contents of `schema.sql`

### Method 3: Automatic (Recommended)
The app will attempt to initialize the database on first startup.

## 🧪 Testing Your Deployed API

Once deployed, Render provides a URL like: `https://your-app-name.onrender.com`

Test with:
```bash
# Health check
curl https://your-app-name.onrender.com/health

# Identity API
curl -X POST https://your-app-name.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

## 💰 Render Free Tier Limits

### Web Service (Free Plan)
- ✅ 512 MB RAM
- ✅ 0.1 CPU units
- ⚠️ Sleeps after 15 minutes of inactivity
- ✅ Custom domains
- ✅ Automatic SSL

### PostgreSQL (Free Plan)
- ✅ 1 GB storage
- ✅ Expires after 90 days (can extend)
- ✅ External connections
- ✅ Connection pooling

## 🔧 Troubleshooting

### Common Issues

1. **Build fails with "Cannot find module" errors**:
   - ✅ **Fixed**: Updated render.yaml to use `npm run render-build`
   - ✅ **Fixed**: Added explicit Node.js types in tsconfig.json
   - ✅ **Fixed**: Added .nvmrc to specify Node.js 18
   - Check that dependencies are correctly listed in package.json

2. **App won't start**:
   - Check logs in Render dashboard
   - Ensure `npm run build` completes successfully
   - Verify `DATABASE_URL` is set

3. **Database connection fails**:
   - Check PostgreSQL service is running
   - Verify `DATABASE_URL` format
   - Ensure SSL is enabled (automatic on Render)

4. **App sleeps on free plan**:
   - Expected behavior after 15 min inactivity
   - Upgrade to paid plan for always-on
   - Or use uptime monitoring services

### Build Process
The build process now includes:
1. `npm install` (installs all dependencies including devDependencies)
2. `npm run build` (compiles TypeScript)
3. Dependencies are properly resolved with Node.js 18

### Performance Tips
- Use connection pooling (already implemented)
- Monitor with Render's built-in metrics
- Consider upgrading to paid plan for production

## 🔄 Auto-Deployments

Render automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update API"
git push origin master
# ✨ Render automatically deploys!
```

## 📊 Monitoring

Render provides built-in monitoring:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Events**: Deployment history
- **Health Checks**: Automatic via `/health` endpoint

## 🎉 You're Live!

Your Identity Reconciliation API is now:
- ✅ Hosted on Render with PostgreSQL
- ✅ Auto-deploying from GitHub
- ✅ SSL-secured with custom domain support
- ✅ Monitored with built-in tools
- ✅ Free for development use

Perfect for development, prototyping, and small production workloads!
