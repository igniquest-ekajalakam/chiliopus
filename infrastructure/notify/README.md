# Chiliopus Platform Monorepo

This repository uses an `apps/ + services/` layout:
- `apps/` for user-facing UI applications
- `services/` for backend microservices

## Structure

```text
.
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

## Quick Start

### Work on notify service

```bash
cd services/notify
npm install
npm run dev
```

### Sparse checkout (single service)

```bash
git clone --filter=blob:none --sparse https://github.com/<org>/chiliopus-platform.git
cd chiliopus-platform
git sparse-checkout init --cone
git sparse-checkout set services/notify
```

### Sparse checkout (UI + gateway)

```bash
git sparse-checkout set apps/admin-ui services/gateway
```

For detailed Git commands and workflows, see `docs/monorepo-usage.md`.

