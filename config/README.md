# Configuration Files

This directory contains configuration files for the Hostio backend. Some files contain sensitive credentials and should **NEVER** be committed to version control.

## 📁 Files Overview

### Protected Files (Not in Git)

These files contain sensitive credentials and are ignored by `.gitignore`:

- **`config.json`** - Database connection credentials
- **`google-calendar.json`** - Google Calendar API service account credentials

### Template Files (Safe to Commit)

- **`config.json.example`** - Template for database configuration
- **`google-calendar.json.example`** - Template for Google Calendar service account

## 🔧 Setup Instructions

### 1. Database Configuration

Copy the example file and update with your credentials:

```bash
cp config.json.example config.json
```

Then edit `config.json` with your PostgreSQL credentials:

```json
{
  "development": {
    "username": "postgres",
    "password": "YOUR_ACTUAL_PASSWORD",
    "database": "hostio",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

### 2. Google Calendar Service Account

1. **Create a service account** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Calendar API
   - Create a service account
   - Download the JSON key file

2. **Copy the downloaded file**:
```bash
cp ~/Downloads/your-service-account-key.json config/google-calendar.json
```

Or manually create `config/google-calendar.json` using the template:
```bash
cp config/google-calendar.json.example config/google-calendar.json
```

Then paste your actual service account credentials.

## ⚠️ Security Warning

**NEVER commit these files to Git:**
- ❌ `config.json`
- ❌ `google-calendar.json`

**Always commit these files:**
- ✅ `config.json.example`
- ✅ `google-calendar.json.example`

If you accidentally commit sensitive files, immediately:
1. Remove them from Git history
2. Rotate all exposed credentials
3. Revoke and regenerate API keys

## 📚 Additional Resources

- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Sequelize Configuration](https://sequelize.org/docs/v6/other-topics/migrations/#configuration)
