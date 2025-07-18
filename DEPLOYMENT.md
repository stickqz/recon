# Railway Deployment Guide

## Best Free Hosting Options

### 1. 🚂 Railway (Recommended)
**Best for: MySQL apps like yours**
- ✅ Free $5/month credit 
- ✅ Built-in MySQL database
- ✅ Auto-deploys from GitHub
- ✅ Custom domains

### 2. 🎯 Render
**Good alternative with PostgreSQL**
- ✅ Free tier available
- ✅ Auto-sleep after 15min (free plan)
- ⚠️ PostgreSQL only (would need code changes)

### 3. 🌍 PlanetScale + Vercel
**Serverless option**
- ✅ PlanetScale: Free MySQL database
- ✅ Vercel: Free hosting for APIs
- ✅ Great performance

### 4. 🐳 Docker Options
- **Fly.io**: Free tier with Docker
- **Railway**: Also supports Docker
- **Render**: Docker deployments

---

## 🚂 Deploy to Railway (Easiest)

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your account

### Step 2: Deploy from GitHub
1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/identity-reconciliation-api.git
   git push -u origin master
   ```

2. **Create Railway Project**:
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

3. **Add MySQL Database**:
   - In Railway dashboard: "Add Service" → "Database" → "MySQL"
   - Railway automatically sets DATABASE_URL

4. **Environment Variables**:
   Railway auto-configures DATABASE_URL, but you can add:
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **Initialize Database**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and connect to your project
   railway login
   railway link
   
   # Run database initialization
   railway run npm run init-db
   ```

### Step 3: Test Your API
```bash
# Replace with your Railway URL
curl -X POST https://your-app-name.railway.app/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

---

## 🌍 PlanetScale + Vercel Alternative

### PlanetScale Setup (Free MySQL)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Create the Contact table using their console

### Vercel Setup (Free Hosting)
1. Sign up at [vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Add environment variable: `DATABASE_URL=your_planetscale_url`
4. Deploy!

---

## 🎯 Deploy to Render

**Note**: Render uses PostgreSQL, so you'd need to:
1. Replace `mysql2` with `pg` in package.json
2. Update database.ts for PostgreSQL
3. Modify SQL queries for PostgreSQL syntax

If you want to try this option, I can help convert the code!

---

## 🐳 Docker Deployment

### Build and Test Locally
```bash
# Build image
docker build -t identity-api .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  identity-api
```

### Deploy to Fly.io
```bash
# Install Fly CLI
npm install -g @flydotio/flyctl

# Login and initialize
fly auth login
fly launch

# Deploy
fly deploy
```

---

## 💰 Cost Comparison

| Platform | Database | Hosting | Monthly Cost |
|----------|----------|---------|--------------|
| Railway | MySQL (included) | Free tier | $0-5 |
| PlanetScale + Vercel | MySQL | Free | $0 |
| Render | PostgreSQL | Free* | $0 |
| Fly.io | External required | Free tier | $0-5 |

*Free tier sleeps after 15min inactivity

---

## 🚀 Quick Start Recommendation

**For beginners**: Use Railway
1. Push to GitHub
2. Connect Railway to your repo  
3. Add MySQL service
4. Run `railway run npm run init-db`
5. Done! ✨

**For advanced users**: PlanetScale + Vercel gives best performance
