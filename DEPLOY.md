# FlowState — Deployment Guide

## Deploy to Firebase Hosting

### Quick Deploy (if you have Firebase CLI installed)

```bash
# 1. Clone the repo and navigate to the project
cd flowstate

# 2. Install dependencies
bun install

# 3. Log in to Firebase (one-time)
firebase login

# 4. Deploy
firebase deploy --project hoocar-8806f
```

Your app will be live at:
- **https://hoocar-8806f.web.app**
- **https://hoocar-8806f.firebaseapp.com**

---

### Deploy with CI Token (for automated deployments)

```bash
# Generate a CI token (one-time)
firebase login:ci

# Deploy using the token
firebase deploy --project hoocar-8806f --token YOUR_CI_TOKEN
```

---

### Deploy with Service Account (for CI/CD pipelines)

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click "Generate New Private Key" to download the JSON file
3. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
firebase deploy --project hoocar-8806f
```

---

### GitHub Actions (Automatic Deploy on Push)

The project includes a GitHub Actions workflow at `.github/workflows/firebase-deploy.yml`.

**Setup:**
1. Go to your GitHub repo → Settings → Secrets and Variables → Actions
2. Add a new secret named `FIREBASE_SERVICE_ACCOUNT_HOOCAR_8806F`
3. Paste the contents of your Firebase service account JSON key
4. Push to the `main` branch — the workflow will automatically build and deploy

---

### Firebase Console Setup

Make sure the following are enabled in your Firebase project (hoocar-8806f):

1. **Hosting** — Enable in Firebase Console
2. **Authentication** — Enable Email/Password and Google sign-in methods
3. **Firestore** — Create a Firestore database (if using Firestore for data)

To enable these:
1. Go to https://console.firebase.google.com/project/hoocar-8806f
2. Click "Build" → "Hosting" → "Get started"
3. Click "Build" → "Authentication" → "Set up sign-in method" → Enable Email/Password and Google
4. Click "Build" → "Firestore Database" → "Create database"
