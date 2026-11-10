# Letsatsi ClimateShield System Diagrams

These diagrams adapt the supplied UML, frontend/backend, ERD and activity references to the ClimateShield project. Mermaid diagrams render in GitHub and many VS Code Markdown extensions.

## 1. Role and use-case diagram

```mermaid
flowchart LR
  Farmer((Farmer))
  Buyer((Buyer))
  Officer((Agricultural\nOfficer))
  Admin((Admin))

  Auth([Authenticate])
  Farm([Manage farms, fields\nlivestock and inputs])
  AI([Use AI yield and\ndisease tools])
  Market([List and order\nproduce])
  Passport([Verify crop passport])
  Support([Apply for insurance,\ngrants and support])
  Verify([Verify farmers and\nreview soil tests])
  Control([Manage users,\nroles and audit logs])

  Farmer --> Auth
  Farmer --> Farm
  Farmer --> AI
  Farmer --> Market
  Farmer --> Support
  Buyer --> Auth
  Buyer --> Market
  Buyer --> Passport
  Officer --> Auth
  Officer --> Verify
  Officer --> AI
  Admin --> Auth
  Admin --> Control
  Admin --> Passport
```

## 2. Target architecture

```mermaid
flowchart LR
  subgraph Clients
    Web[React Web App]
    PWA[Installable Mobile PWA]
  end
  subgraph Application
    API[Node/Express or Next API]
    Auth[Authentication + RBAC]
    Jobs[Background Jobs]
  end
  subgraph Data
    PG[(PostgreSQL)]
    Files[(Object Storage)]
    Backups[(Encrypted Backups)]
  end
  subgraph Integrations
    Weather[Weather API]
    AI[Yield + Disease Models]
    Chain[Polygon Testnet]
    Pay[Payment Provider]
    Notify[SMS / Email / Push]
  end

  Web <--> API
  PWA <--> API
  API --> Auth
  API <--> PG
  API <--> Files
  Jobs <--> PG
  PG --> Backups
  API <--> Weather
  API <--> AI
  API <--> Chain
  API <--> Pay
  Jobs --> Notify
```

## 3. Core PostgreSQL ERD

```mermaid
erDiagram
  USERS ||--o| FARMER_PROFILES : has
  USERS ||--o{ FARMS : owns
  FARMS ||--o{ FIELDS : contains
  FARMS ||--o{ LIVESTOCK : keeps
  FIELDS ||--o{ SOIL_TESTS : receives
  FARMS ||--o{ INVENTORY_ITEMS : stores
  FIELDS ||--o{ CROP_CYCLES : grows
  CROP_CYCLES ||--o{ HARVESTS : produces
  HARVESTS ||--o{ CROP_PASSPORTS : certifies
  USERS ||--o{ MARKET_LISTINGS : creates
  MARKET_LISTINGS ||--o{ ORDER_ITEMS : ordered_as
  ORDERS ||--o{ ORDER_ITEMS : contains
  USERS ||--o{ ORDERS : places
  USERS ||--o{ EXPENSES : records
  SUPPLIERS ||--o{ INVENTORY_ITEMS : supplies
  USERS ||--o{ GRANT_APPLICATIONS : applies
  GRANTS ||--o{ GRANT_APPLICATIONS : receives
  USERS ||--o{ AUDIT_LOGS : causes
```

## 4. Crop disease analysis activity

```mermaid
flowchart TD
  Start((Start)) --> Login{Authenticated?}
  Login -- No --> SignIn[Sign in]
  SignIn --> Upload
  Login -- Yes --> Upload[Take or upload leaf image]
  Upload --> Validate{Valid image?}
  Validate -- No --> Guidance[Show photo guidance]
  Guidance --> Upload
  Validate -- Yes --> Secure[Secure upload]
  Secure --> Infer[Run disease model]
  Infer --> Confidence{Confidence high enough?}
  Confidence -- No --> Officer[Request officer review]
  Confidence -- Yes --> Result[Show diagnosis and treatment]
  Officer --> Result
  Result --> Save[Save result and audit event]
  Save --> Notify[Send optional notification]
  Notify --> End((End))
```

## 5. Parametric insurance activity

```mermaid
sequenceDiagram
  participant Farmer
  participant App
  participant Weather as Weather Oracle
  participant Contract as Smart Contract
  participant Payment

  Farmer->>App: Select risk and coverage
  App->>App: Calculate premium
  Farmer->>App: Accept policy
  App->>Contract: Create policy hash
  loop Scheduled climate checks
    Weather-->>App: Verified rainfall data
    App->>Contract: Submit oracle reading
  end
  Contract->>Contract: Evaluate payout trigger
  Contract-->>Payment: Authorise payout event
  Payment-->>Farmer: Send funds
  App-->>Farmer: Notify and show transaction proof
```

## Prototype boundary

The current frontend demonstrates these workflows with local data. The database, weather, AI inference, blockchain and payment boxes are target integrations and must not be described as live until the corresponding services are connected and tested.
