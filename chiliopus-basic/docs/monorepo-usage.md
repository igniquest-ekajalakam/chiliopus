# Chiliopus Platform Monorepo Usage

This guide explains how to create and work with an `apps/ + services/` monorepo structure for Chiliopus.

## Target Structure

```text
chiliopus-platform/
├── .github/workflows/
├── apps/
│   └── admin-ui/
├── services/
│   ├── gateway/
│   ├── notify/
│   ├── jobs/
│   ├── crm/
│   ├── accounts/
│   └── inventory/
├── shared/
│   ├── types/
│   ├── utils/
│   └── config/
├── docker/
└── docs/
```

## 1) Create Repository and Initial Structure

```bash
# Create empty repo on GitHub first, then:
git clone https://github.com/<org>/chiliopus-platform.git
cd chiliopus-platform

mkdir -p apps/admin-ui
mkdir -p services/{gateway,notify,jobs,crm,accounts,inventory}
mkdir -p shared/{types,utils,config}
mkdir -p .github/workflows docs docker
```

## 2) Migrate Existing Notify Service

If your existing project is at `D:\igniquest-ekajalaka\chiliopus\infrastructure\notify`:

```bash
# Run from inside the monorepo root (chiliopus-platform)
robocopy D:\igniquest-ekajalaka\chiliopus\infrastructure\notify services\notify /E
```

If you are restructuring in-place:

```bash
# Move current service contents into services/notify
mkdir services\notify
move src services\notify\
move templates services\notify\
move docker services\notify\
move package.json services\notify\
move package-lock.json services\notify\
move tsconfig.json services\notify\
move README.md services\notify\
```

## 3) Commit and Push

```bash
git add .
git commit -m "chore(monorepo): adopt services-first structure with gateway"
git push origin main
```

## 4) Sparse Checkout (Service or UI)

Clone only what you need:

```bash
git clone --filter=blob:none --sparse https://github.com/<org>/chiliopus-platform.git
cd chiliopus-platform
git sparse-checkout init --cone
git sparse-checkout set services/notify
```

For gateway + notify:

```bash
git sparse-checkout set services/gateway services/notify
```

For UI + gateway:

```bash
git sparse-checkout set apps/admin-ui services/gateway
```

## 5) Day-to-Day Workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/notify-add-webhook-retry

# make changes in services/notify
git add services/notify
git commit -m "[notify] add webhook retry handling"
git push -u origin feature/notify-add-webhook-retry
```

Gateway example:

```bash
git checkout -b feature/gateway-rate-limit
git add services/gateway
git commit -m "[gateway] add per-route rate limiting"
git push -u origin feature/gateway-rate-limit
```

## 6) Pull Request Conventions

- Use service tags in commit/PR titles: `[gateway]`, `[notify]`, `[crm]`, `[shared]`
- Keep PR scope service-focused when possible
- For cross-service changes, include impacted paths in description

## 7) Path-Based CI Notes

Each workflow should trigger only when relevant paths change, for example:

- `services/gateway/**` -> gateway workflow
- `services/notify/**` -> notify workflow
- `services/crm/**` -> crm workflow
- `apps/admin-ui/**` -> admin-ui workflow

## 8) Optional: Pull Latest and Expand Sparse Paths

```bash
git pull origin main
git sparse-checkout add services/crm shared/types
```

