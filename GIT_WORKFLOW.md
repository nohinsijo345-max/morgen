# Git Workflow - Morgen Project

## 🌿 Branch Strategy

### Branches
- **`main`** - Production-ready code (stable releases only)
- **`dev`** - Development branch (active development) ✅ **CURRENT**

## 📋 Current Setup

✅ **Active Branch**: `dev`
✅ **Tracking**: `origin/dev`
✅ **Status**: Ready for development

## 🔄 Development Workflow

### Daily Development (You're Here!)

All new features and changes go to `dev` branch:

```bash
# You're already on dev branch
git status                    # Check what changed
git add .                     # Stage all changes
git commit -m "Your message"  # Commit changes
git push origin dev           # Push to dev branch
```

### When Ready for Production

Only merge to `main` when features are tested and stable:

```bash
# Switch to main
git checkout main

# Merge dev into main
git merge dev

# Push to main
git push origin main

# Switch back to dev for continued development
git checkout dev
```

## 🎯 Quick Commands

### Check Current Branch
```bash
git branch
```

### Switch Branches
```bash
git checkout dev    # Switch to dev
git checkout main   # Switch to main
```

### See All Branches
```bash
git branch -a       # Local and remote branches
```

### Push Changes (From Dev)
```bash
git add .
git commit -m "Add new feature"
git push origin dev
```

## 📝 Commit Message Guidelines

Use clear, descriptive commit messages:

**Good Examples:**
- `Add AI plant doctor feature`
- `Fix dashboard loading issue`
- `Update farmer profile UI`
- `Implement real-time bidding`

**Bad Examples:**
- `update`
- `fix`
- `changes`

## 🚀 Typical Development Cycle

1. **Make Changes** - Edit files in your editor
2. **Test Locally** - Run `npm run dev` and test
3. **Stage Changes** - `git add .`
4. **Commit** - `git commit -m "Descriptive message"`
5. **Push to Dev** - `git push origin dev`
6. **Repeat** - Continue development

## 🔒 Branch Protection (Recommended)

On GitHub, you can protect the `main` branch:

1. Go to: https://github.com/nohinsijo345-max/morgen/settings/branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass

This ensures `main` always has stable code.

## 📊 Current Branch Status

```
* dev  (current) → origin/dev  ✅ Active development
  main           → origin/main  🔒 Production stable
```

## 🎨 Workflow Diagram

```
dev branch (active development)
    ↓
  [test]
    ↓
  [review]
    ↓
main branch (production)
    ↓
  [deploy]
```

## ⚡ Quick Reference

| Action | Command |
|--------|---------|
| Check branch | `git branch` |
| Switch to dev | `git checkout dev` |
| Stage all | `git add .` |
| Commit | `git commit -m "message"` |
| Push to dev | `git push origin dev` |
| See status | `git status` |
| See changes | `git diff` |
| See history | `git log --oneline` |

## 🎯 You're All Set!

From now on:
- ✅ All development happens on `dev` branch
- ✅ Push to `dev` with: `git push origin dev`
- ✅ `main` branch stays clean for production
- ✅ Merge to `main` only when ready for release

---

**Current Branch**: `dev` ✅
**Ready for Development**: Yes 🚀
