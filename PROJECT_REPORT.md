# Letsatsi ClimateShield Project Report

## Executive summary

Letsatsi ClimateShield is a mobile-first agricultural decision-support platform for Lesotho. It combines climate intelligence, AI-assisted yield and crop-health workflows, parametric insurance concepts, blockchain provenance, market access, finance and farmer learning.

The delivered application is a complete interactive frontend prototype. It documents simulated integrations instead of representing demo data as live production records.

## Objectives and delivered scope

- Improve decisions using local climate patterns and farm context.
- Reduce losses through warnings, irrigation advice and disease screening.
- Improve trust with crop passports and verified-produce concepts.
- Demonstrate automatic parametric insurance in Maloti.
- Protect personal data with role-aware states and GDPR controls.
- Present AI accuracy, model comparison and saturation evidence.

The app delivers account screens, role-separated Farmer, Buyer, Agricultural Officer and Admin workspaces, dynamic yield and insurance calculations, mobile crop-photo input, marketplace enquiries, profile persistence, report printing, responsive navigation and an installable Progressive Web App shell.

### Completed Stage 1 modules

- Multiple-farm and field registration
- Livestock health, vaccination and feeding records
- Soil test, pH, fertility and recommendation records
- Input and equipment inventory
- Harvest, quality, storage and post-harvest records
- Buyer orders, delivery and payment tracking
- Supplier directory and government grant tracking
- Farmer verification, admin control, audit logs and support requests
- Role-filtered navigation and permission-denied states

These operational modules persist in the browser and synchronize between open tabs for a working demonstration. They are not shared multi-user database records until the PostgreSQL API is connected.

## Artificial intelligence

The interface presents a Random Forest yield model trained on 1,240 rows with R² 0.91, RMSE 0.38 t and MAE 0.24 t. Rainfall, soil, seed variety and planting date are visualised as contributors. XGBoost and linear regression are comparison models.

These are demonstration metrics and should be replaced with final notebook exports. Recommended dataset fields are district, soil type, rainfall, temperature, crop, fertiliser, seed variety, planting date, yield, price and market distance.

The crop-health flow is designed for MobileNet/EfficientNet inference. This package demonstrates capture, upload, confidence and treatment UX; it does not bundle a trained model. Production validation should report per-class precision, recall, F1 and confusion matrices.

## Blockchain

Crop Passport and Insurance demonstrate transaction hashes and smart-contract states. In production, only identity/certificate hashes and essential event metadata should be stored on Polygon or Ethereum Sepolia. Personal data and private keys stay off-chain.

Recommended functions are `registerFarmer`, `createProduceCertificate`, `createInsurancePolicy` and `triggerPayout`. Displayed hashes are samples; real deployment requires audited Solidity contracts, an oracle and explorer evidence.

## Cybersecurity and GDPR

| Data | Classification | Handling |
| --- | --- | --- |
| Market prices | Public | Integrity monitoring |
| General farm location | Private | Owner and approved-role access |
| Farmer ID, phone, soil/GPS | Confidential | Encryption and least privilege |
| Payment details/private keys | Restricted | Isolated storage, strong authentication and audit logs |

Settings demonstrates role-based access control with a separate dark security domain and denied state. GDPR production work should include explicit consent, lawful-basis records, access/rectification/erasure/portability, minimisation, retention rules and breach notification.

## Technical architecture

- React 19, TypeScript and Vite 8
- Tailwind CSS 4 and a responsive design layer
- Lucide icon system
- Browser local storage for prototype profile persistence
- Web app manifest and production service worker
- Automated Vitest coverage for role access and core calculators

Project-specific use-case, architecture, ERD, activity and sequence diagrams are in `docs/DIAGRAMS.md`. A normalized database starter is in `database/schema.sql`, with secure API guidance in `docs/POSTGRESQL_HANDOFF.md`.

Recommended production stack: a secured Node API with PostgreSQL for auth/data, OpenWeatherMap or NASA POWER for weather, secured AI inference or TensorFlow.js, Polygon for provenance, and Firebase Cloud Messaging for alerts.

## Validation and roadmap

The project is formatted with `pnpm format`, tested with `pnpm test`, and production-built with `pnpm build`.

### Delivery stages

| Stage | Status | Scope |
| --- | --- | --- |
| 1 — Complete frontend | Complete | Role dashboards, missing agricultural modules, responsive PWA and local demo persistence |
| 2 — Live integrations | Handoff ready | PostgreSQL schema and API boundary documented; credentials and providers still required |
| 3 — Production hardening | Planned | Server security, end-to-end testing, deployment, backups, live payments and recovery drills |

1. Implement the documented API and connect PostgreSQL authentication and durable records.
2. Enforce RBAC and audit logging server-side.
3. Integrate weather and notification providers.
4. Train, validate and deploy AI models.
5. Deploy audited contracts and real testnet records.
6. Add unit, integration and accessibility tests.
7. Produce an Android App Bundle with Capacitor.
8. Complete privacy policy and Play Store review.
