# Monorepo Checkout Guide (Sparse-Checkout)

This guide explains how developers can clone the Chiliopus monorepo once, but only checkout the `apps/` and/or `services/` folders they are working on.

## When to use sparse-checkout
- You want faster `clone` times and less local disk usage.
- You only need a subset of the repository locally (example: `services/notify` and `shared/`).

## Prerequisites
- Git installed (sparse-checkout support)
- Access to the monorepo GitHub repository URL

---

## Option A (Recommended): `git clone --filter=blob:none --sparse`

### 1) Clone sparsely (faster + minimal downloads)
```powershell
git clone --filter=blob:none --sparse https://github.com/<org>/<repo>.git
cd <repo>
```

### 2) Enable sparse-checkout (cone mode)
```powershell
git sparse-checkout init --cone
```

### 3) Select the folders you want
#### Example: Notify developer
```powershell
git sparse-checkout set `
  services/notify `
  shared
```

#### Example: Gateway + Notify developer
```powershell
git sparse-checkout set `
  services/gateway `
  services/notify
```

#### Example: Admin UI + Gateway developer
```powershell
git sparse-checkout set `
  apps/admin-ui `
  services/gateway `
  shared
```

#### Example: Shared code only
```powershell
git sparse-checkout set shared
```

### 4) Checkout your branch (usually `main`)
```powershell
git checkout main
```

---

## Option B: Clone normally, then enable sparse-checkout

### 1) Clone
```powershell
git clone https://github.com/<org>/<repo>.git
cd <repo>
```

### 2) Enable sparse-checkout (cone mode)
```powershell
git sparse-checkout init --cone
```

### 3) Select folders
```powershell
git sparse-checkout set services/notify shared
```

### 4) Checkout your branch
```powershell
git checkout main
```

---

## Updating what you checkout later
You can change the local subset without recloning.

### Add folders
```powershell
git sparse-checkout add services/jobs
```

### Remove folders
```powershell
git sparse-checkout remove services/jobs
```

### View selected paths
```powershell
git sparse-checkout list
```

---

## Day-to-day tips
- Pull updates as usual:
```powershell
git checkout main
git pull origin main
```
- If your work moves to a different component, update sparse paths (`set` / `add` / `remove`) and keep working.

