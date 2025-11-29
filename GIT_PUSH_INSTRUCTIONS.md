# How to Push to GitHub

## Current Status
✅ Git repository initialized
✅ All files committed
✅ Remote origin added: https://github.com/nohinsijo345-max/morgen.git
✅ Branch set to `main`

## ⚠️ Authentication Required

GitHub no longer accepts password authentication. You need a **Personal Access Token**.

## Step-by-Step Guide

### Option 1: Using Personal Access Token (Recommended)

#### 1. Create a Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `Morgen Project`
4. Set expiration: `90 days` or `No expiration`
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

#### 2. Push to GitHub
Open your terminal and run:

```bash
cd "/Users/nohinsijo/Documents/College files/MAIN PROJ/OG Project/Morgen"

git push -u origin main
```

When prompted:
- **Username**: `nohinsijo345-max`
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

### Option 2: Using GitHub CLI (Easiest)

#### 1. Install GitHub CLI
```bash
brew install gh
```

#### 2. Authenticate
```bash
gh auth login
```

Follow the prompts to authenticate via browser.

#### 3. Push
```bash
git push -u origin main
```

### Option 3: Using SSH (Most Secure)

#### 1. Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### 2. Add SSH Key to GitHub
```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to GitHub:
- Go to: https://github.com/settings/keys
- Click "New SSH key"
- Paste your key

#### 3. Change Remote URL
```bash
git remote set-url origin git@github.com:nohinsijo345-max/morgen.git
```

#### 4. Push
```bash
git push -u origin main
```

## Quick One-Liner (With Token)

Replace `YOUR_TOKEN` with your actual token:

```bash
git push https://YOUR_TOKEN@github.com/nohinsijo345-max/morgen.git main
```

## Verify Push Success

After pushing, visit:
https://github.com/nohinsijo345-max/morgen

You should see all your files!

## Common Issues

### Issue 1: "Authentication failed"
**Solution**: You're using your GitHub password instead of a token. Create a Personal Access Token (see above).

### Issue 2: "Permission denied"
**Solution**: Your token doesn't have the right permissions. Create a new token with `repo` scope.

### Issue 3: "Repository not found"
**Solution**: Make sure the repository exists on GitHub. Create it first if needed.

### Issue 4: "Failed to push some refs"
**Solution**: Pull first, then push:
```bash
git pull origin main --rebase
git push -u origin main
```

## After Successful Push

1. ✅ Visit your repository: https://github.com/nohinsijo345-max/morgen
2. ✅ Check all files are there
3. ✅ Update repository description
4. ✅ Add topics/tags
5. ✅ Enable GitHub Pages (if needed)
6. ✅ Set up GitHub Actions (optional)

## Future Pushes

After the first push, you can simply use:

```bash
git add .
git commit -m "Your commit message"
git push
```

## Protecting Sensitive Data

Make sure these files are in `.gitignore`:
- ✅ `server/.env`
- ✅ `client/.env`
- ✅ `node_modules/`
- ✅ `.DS_Store`

Check with:
```bash
git status
```

If you see `.env` files, they should NOT be listed!

## Need Help?

If you're still having issues:
1. Check GitHub's documentation: https://docs.github.com/en/authentication
2. Try GitHub CLI (easiest method)
3. Contact GitHub support

---

**Remember**: Never share your Personal Access Token publicly!
