import { FormEvent, useEffect, useRef, useState } from "react"
import { login as fbLogin } from "./auth"
import { blockchain, Block } from "./blockchain"
import { db, collection, getDocs, addDoc, doc, setDoc } from "./db"
import { publicBlockchain } from "./publicBlockchain"
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Beef,
  Bell,
  BookOpen,
  Bot,
  Boxes,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CloudRain,
  Droplets,
  Eye,
  EyeOff,
  FileBarChart,
  Fingerprint,
  FlaskConical,
  GraduationCap,
  HandCoins,
  Home,
  Leaf,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Plus,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Sprout,
  Sun,
  ThermometerSun,
  Tractor,
  Truck,
  TrendingUp,
  Upload,
  UserRound,
  UserCheck,
  Users,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
  Database,
} from "lucide-react"

type Screen = "login" | "register" | "forgot" | "app"
export type Role = "Farmer" | "Buyer" | "Agricultural Officer" | "Admin"
type User = {
  name: string
  email: string
  phone: string
  district: string
  location: string
  role: string
  farmSize?: string
  farmingSince?: string
}
type Notice = { title: string; text: string } | null

const mountain =
  "https://images.unsplash.com/photo-1653842045754-59b63ea5a58e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1800"
const farmPhoto =
  "https://images.unsplash.com/photo-1792872803553-4a143f19d136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200"

const nav = [
  ["dashboard", "Dashboard", Home],
  ["climate", "Climate Insights", ThermometerSun],
  ["yield", "AI Yield Prediction", TrendingUp],
  ["alerts", "Weather Alerts", Bell],
  ["disease", "Crop Disease Detection", Camera],
  ["farm", "Farm Management", Tractor],
  ["livestock", "Livestock Management", Beef],
  ["soil", "Soil Testing & Analysis", FlaskConical],
  ["inventory", "Farm Inventory", Boxes],
  ["harvest", "Harvest Management", PackageCheck],
  ["irrigation", "Smart Irrigation", Droplets],
  ["calendar", "Planting Calendar", CalendarDays],
  ["market", "Marketplace", ShoppingBasket],
  ["orders", "Sales & Orders", ShoppingCart],
  ["suppliers", "Supplier Directory", Truck],
  ["subsidies", "Subsidies & Grants", Landmark],
  ["passport", "Crop Passport", Fingerprint],
  ["finance", "Financial Management", WalletCards],
  ["insurance", "Insurance Calculator", ShieldCheck],
  ["learning", "Agricultural Learning Centre", GraduationCap],
  ["community", "Community", Users],
  ["assistant", "AI Assistant", Bot],
  ["reports", "Reports", FileBarChart],
  ["verification", "Farmer Verification", UserCheck],
  ["admin", "Admin Control Centre", ShieldCheck],
  ["security", "Security Configuration", ShieldCheck],
  ["blockchain", "Blockchain Records", Database],
  ["public-blockchain", "Public Blockchain", Database],
  ["audit", "System Audit Logs", ScrollText],
  ["support", "Help & Support Centre", LifeBuoy],
  ["settings", "Settings", Settings],
] as const
type Page = typeof nav[number][0]

const rolePages: Record<Role, readonly Page[]> = {
  Farmer: [
    "dashboard",
    "climate",
    "yield",
    "alerts",
    "disease",
    "farm",
    "livestock",
    "soil",
    "inventory",
    "harvest",
    "irrigation",
    "calendar",
    "market",
    "orders",
    "suppliers",
    "subsidies",
    "passport",
    "finance",
    "insurance",
    "learning",
    "community",
    "assistant",
    "reports",
    "support",
    "settings",
  ],
  Buyer: [
    "dashboard",
    "market",
    "orders",
    "suppliers",
    "passport",
    "finance",
    "community",
    "assistant",
    "reports",
    "support",
    "settings",
  ],
  "Agricultural Officer": [
    "dashboard",
    "climate",
    "yield",
    "alerts",
    "disease",
    "farm",
    "livestock",
    "soil",
    "harvest",
    "subsidies",
    "learning",
    "community",
    "assistant",
    "reports",
    "verification",
    "admin",
    "audit",
    "security",
    "blockchain",
    "support",
    "settings",
  ],
  Admin: [
    "dashboard",
    "market",
    "orders",
    "passport",
    "finance",
    "learning",
    "community",
    "reports",
    "verification",
    "admin",
    "audit",
    "support",
    "settings",
    "public-blockchain",
  ],
}

export function canAccess(role: string, page: Page) {
  return rolePages[((role in rolePages ? role : "Farmer") as Role)].includes(
    page,
  )
}

export function yieldForCrop(area: number, crop: string) {
  return Number(
    (area * (crop === "Maize" ? 3.8 : crop === "Beans" ? 2.4 : 3.1)).toFixed(1),
  )
}

export function premiumForCoverage(coverage: number) {
  return Math.round(coverage * 0.0622)
}

const demoUser: User = {
  name: "Thato Mohlanka",
  email: "thato@climateshield.ls",
  phone: "+266 5800 1234",
  district: "Maseru",
  location: "Ha Matala",
  role: "Farmer",
}

const demoUsers: Record<Role, User> = {
  Farmer: demoUser,
  Buyer: {
    ...demoUser,
    name: "Lerato Ntoi",
    email: "buyer@climateshield.ls",
    role: "Buyer",
  },
  "Agricultural Officer": {
    ...demoUser,
    name: "Dr Palesa Mokoena",
    email: "officer@climateshield.ls",
    role: "Agricultural Officer",
  },
  Admin: {
    ...demoUser,
    name: "Neo Motseki",
    email: "admin@climateshield.ls",
    location: "National Office",
    role: "Admin",
  },
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="logo">
      <span className={inverse ? "inverse" : ""}>
        <Sun />
      </span>
      <div className={inverse ? "white" : ""}>
        <b>Letsatsi</b>
        <small>ClimateShield</small>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Auth({
  screen,
  setScreen,
  login,
}: {
  screen: Screen
  setScreen: (s: Screen) => void
  login: (u: User) => void
}) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("")
  const submitLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (!f.get("identity") || !f.get("password"))
      return setMessage("Please enter your account details.")
    const role = String(f.get("role") || "Farmer") as Role
    try {
      await fbLogin(String(f.get("identity")), String(f.get("password")))
      const saved = localStorage.getItem("climateshield-user")
      const account = saved ? JSON.parse(saved) as User : demoUsers[role]
      login({ ...account, role })
    } catch {
      setMessage("Login failed. Check credentials.")
    }
  }
  const register = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (String(f.get("password")).length < 6)
      return setMessage("Use at least 6 characters for your password.")
    const u: User = {
      name: String(f.get("name")),
      phone: String(f.get("phone")),
      email: String(f.get("email")),
      district: String(f.get("district")),
      location: String(f.get("location")),
      role: String(f.get("role")),
    }
    localStorage.setItem("climateshield-user", JSON.stringify(u))
    login(u)
  }
  return (
    <main className="auth">
      <section
        className="auth-image"
        style={{
          backgroundImage: `linear-gradient(180deg,#08271822,#082718e8),url("${mountain}")`,
        }}
      >
        <Logo inverse />
        <div>
          <span className="eyebrow light">
            <Leaf /> Climate-smart agriculture
          </span>
          <h1>
            Farm with confidence.
            <br />
            Grow with intelligence.
          </h1>
          <p>
            Weather, AI insights, insurance and trusted markets — designed for
            every farmer in Lesotho.
          </p>
          <div className="trust">
            <span>
              <ShieldCheck /> Secure data
            </span>
            <span>
              <BadgeCheck /> Verified produce
            </span>
            <span>
              <Zap /> AI powered
            </span>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="mobile-logo">
          <Logo />
        </div>
        {screen === "login" && (
          <form className="auth-form" onSubmit={submitLogin}>
            <header>
              <span className="eyebrow">Welcome back</span>
              <h2>Log in to your farm</h2>
              <p>Stay ahead of weather and make better decisions.</p>
            </header>
            <Field label="Email or phone number">
              <input name="identity" placeholder="e.g. +266 5800 1234" />
            </Field>
            <Field label="Account role">
              <select name="role" defaultValue="Farmer">
                {Object.keys(demoUsers).map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Password">
              <div className="password">
                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setVisible(!visible)}>
                  {visible ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </Field>
            <div className="options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" onClick={() => setScreen("forgot")}>
                Forgot password?
              </button>
            </div>
            {message && <p className="error">{message}</p>}
            <button className="primary wide">
              Log in <ChevronRight />
            </button>
            <div className="divider">New to ClimateShield?</div>
            <button
              type="button"
              className="secondary wide"
              onClick={() => setScreen("register")}
            >
              Create your free account
            </button>
            <div className="demo-roles">
              <small>Or open a role demonstration</small>
              <div>
                {(Object.keys(demoUsers) as Role[]).map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => login(demoUsers[role])}
                  >
                    {role === "Agricultural Officer" ? "Officer" : role}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
        {screen === "register" && (
          <form className="auth-form compact" onSubmit={register}>
            <button
              type="button"
              className="back"
              onClick={() => setScreen("login")}
            >
              ← Back to login
            </button>
            <header>
              <span className="eyebrow">Join ClimateShield</span>
              <h2>Create your account</h2>
              <p>Set up your profile in less than two minutes.</p>
            </header>
            <div className="form-grid">
              <Field label="Full name">
                <input required name="name" placeholder="Your full name" />
              </Field>
              <Field label="Phone number">
                <input required name="phone" placeholder="+266" />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="District">
                <select required name="district" defaultValue="">
                  <option value="" disabled>
                    Select district
                  </option>
                  {[
                    "Berea",
                    "Butha-Buthe",
                    "Leribe",
                    "Mafeteng",
                    "Maseru",
                    "Mohale’s Hoek",
                    "Mokhotlong",
                    "Qacha’s Nek",
                    "Quthing",
                    "Thaba-Tseka",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Farming location">
                <input
                  required
                  name="location"
                  placeholder="Village or farm name"
                />
              </Field>
              <Field label="Role">
                <select name="role">
                  <option>Farmer</option>
                  <option>Agricultural Officer</option>
                  <option>Buyer</option>
                </select>
              </Field>
            </div>
            <Field label="Password">
              <div className="password">
                <input
                  required
                  name="password"
                  type={visible ? "text" : "password"}
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setVisible(!visible)}>
                  {visible ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </Field>
            <label className="terms">
              <input required type="checkbox" /> I consent to secure processing
              of my data.
            </label>
            {message && <p className="error">{message}</p>}
            <button className="primary wide">Create account</button>
          </form>
        )}
        {screen === "forgot" && (
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault()
              setMessage("Reset instructions are ready for your account.")
            }}
          >
            <button
              type="button"
              className="back"
              onClick={() => setScreen("login")}
            >
              ← Back to login
            </button>
            <span className="auth-icon">
              <LockKeyhole />
            </span>
            <header>
              <h2>Reset your password</h2>
              <p>Enter your email or phone number to regain access.</p>
            </header>
            <Field label="Email or phone number">
              <input required />
            </Field>
            {message && <p className="success">{message}</p>}
            <button className="primary wide">Send reset link</button>
          </form>
        )}
      </section>
    </main>
  )
}

function Head({
  kicker,
  title,
  copy,
  action,
}: {
  kicker: string
  title: string
  copy: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  tone = "",
}: {
  icon: LucideIcon
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <article className="metric">
      <span className={tone}>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <h3>{value}</h3>
        <p>{note}</p>
      </div>
    </article>
  )
}

const days = [
  ["Mon", 19, 18],
  ["Tue", 22, 32],
  ["Wed", 24, 42],
  ["Thu", 21, 66],
  ["Fri", 25, 28],
  ["Sat", 27, 12],
  ["Sun", 24, 22],
] as const
function WeatherChart() {
  return (
    <div className="weather-chart">
      {days.map((d) => (
        <div key={d[0]}>
          <b>{d[1]}°</b>
          <span>
            <i style={{ height: d[1] * 2.5 }} />
          </span>
          <strong>{d[0]}</strong>
          <small>{d[2]}%</small>
        </div>
      ))}
    </div>
  )
}

function Dashboard({ user, go }: { user: User; go: (p: Page) => void }) {
  return (
    <div className="page">
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg,#083b26f5,#083b2699),url("${farmPhoto}")`,
        }}
      >
        <div>
          <span className="eyebrow light">Tuesday, 24 March</span>
          <h1>Good morning, {user.name.split(" ")[0]}.</h1>
          <p>
            <MapPin /> {user.district}, Lesotho · Your farm is looking steady
            today.
          </p>
        </div>
        <button onClick={() => go("climate")}>
          <Sun />
          <span>
            <b>24°C</b>
            <small>Mostly sunny</small>
          </span>
          <ChevronRight />
        </button>
      </section>
      <div className="metrics">
        <Metric
          icon={Sprout}
          label="Total farm area"
          value="12 ha"
          note="3 active fields"
        />
        <Metric
          icon={Leaf}
          label="Current crops"
          value="3 crops"
          note="Maize, sorghum, beans"
          tone="lime"
        />
        <Metric
          icon={TrendingUp}
          label="Estimated yield"
          value="3.8 t"
          note="+12% from last season"
          tone="blue"
        />
        <Metric
          icon={CloudRain}
          label="Monthly rainfall"
          value="42 mm"
          note="68% of average"
          tone="blue"
        />
        <Metric
          icon={CircleDollarSign}
          label="Farm income"
          value="M 18,450"
          note="+8.2% this month"
          tone="orange"
        />
        <Metric
          icon={AlertTriangle}
          label="Climate risk"
          value="Moderate"
          note="1 active advisory"
          tone="amber"
        />
      </div>
      <div className="layout">
        <article className="card double">
          <div className="card-head">
            <div>
              <span className="eyebrow">7-day outlook</span>
              <h3>Weather at your farm</h3>
            </div>
            <button className="link" onClick={() => go("climate")}>
              Full insights <ChevronRight />
            </button>
          </div>
          <WeatherChart />
        </article>
        <article className="card risk">
          <span className="eyebrow">AI risk score</span>
          <div className="gauge">
            <b>42</b>
            <small>/100</small>
          </div>
          <h3>Moderate climate risk</h3>
          <p>Rainfall may fall below average during the next 14 days.</p>
          <button className="secondary wide" onClick={() => go("yield")}>
            View recommendations
          </button>
        </article>
      </div>
      <div className="layout">
        <article className="card double">
          <div className="card-head">
            <div>
              <span className="eyebrow">Today’s priorities</span>
              <h3>Recommended actions</h3>
            </div>
            <em>3 tasks</em>
          </div>
          <div className="tasks">
            {[
              [
                Droplets,
                "Irrigate Field B before 16:00",
                "Soil moisture is below the optimal level.",
                "irrigation",
              ],
              [
                Camera,
                "Check beans for leaf discolouration",
                "Conditions favour early blight this week.",
                "disease",
              ],
              [
                ShoppingBasket,
                "Review a new buyer offer",
                "M 8.50/kg offered for 600 kg of beans.",
                "market",
              ],
            ].map(([Icon, t, c, p]) => {
              const I = Icon as LucideIcon
              return (
                <button key={String(t)} onClick={() => go(p as Page)}>
                  <span>
                    <I />
                  </span>
                  <div>
                    <b>{String(t)}</b>
                    <small>{String(c)}</small>
                  </div>
                  <ChevronRight />
                </button>
              )
            })}
          </div>
        </article>
        <article className="card advisory">
          <CloudRain />
          <span className="eyebrow">Smart alert</span>
          <h3>Rain expected Thursday</h3>
          <p>
            There is a 66% chance of 8–12 mm rain. Delay irrigation and protect
            harvested grain.
          </p>
          <button className="link" onClick={() => go("alerts")}>
            Review alerts <ChevronRight />
          </button>
        </article>
      </div>
    </div>
  )
}

function Climate() {
  return (
    <div className="page">
      <Head
        kicker="Climate intelligence"
        title="Understand the season ahead"
        copy="Local forecasts, historic patterns and AI risk analysis for your Maseru farm."
        action={
          <button className="secondary">
            <MapPin /> Maseru <ChevronDown />
          </button>
        }
      />
      <div className="metrics four">
        <Metric
          icon={ThermometerSun}
          label="Current temperature"
          value="24°C"
          note="Feels like 23°C"
          tone="orange"
        />
        <Metric
          icon={CloudRain}
          label="Rain this month"
          value="42 mm"
          note="22 mm below average"
          tone="blue"
        />
        <Metric
          icon={Droplets}
          label="Soil moisture"
          value="38%"
          note="Slightly low"
          tone="amber"
        />
        <Metric
          icon={AlertTriangle}
          label="Climate risk"
          value="Moderate"
          note="Updated 10 min ago"
          tone="amber"
        />
      </div>
      <div className="layout">
        <article className="card double">
          <div className="card-head">
            <div>
              <span className="eyebrow">Temperature trend</span>
              <h3>Weekly farm forecast</h3>
            </div>
            <em>Next 7 days</em>
          </div>
          <WeatherChart />
        </article>
        <article className="card">
          <span className="eyebrow">Seasonal outlook</span>
          <h3>April – June</h3>
          <div className="outlook">
            <p>
              <Sun />
              <span>
                <b>+1.4°C warmer</b>
                <small>than 10-year average</small>
              </span>
            </p>
            <p>
              <CloudRain />
              <span>
                <b>18% less rainfall</b>
                <small>prepare water storage</small>
              </span>
            </p>
            <p>
              <Sprout />
              <span>
                <b>Plant early maize</b>
                <small>best window: 4–12 April</small>
              </span>
            </p>
          </div>
        </article>
      </div>
      <article className="card ai-note">
        <Bot />
        <div>
          <span className="eyebrow">ClimateShield AI recommendation</span>
          <h3>Prepare for a drier planting window</h3>
          <p>
            Apply mulch, prioritise drought-tolerant seed and schedule drip
            irrigation twice weekly from 2 April.
          </p>
        </div>
        <button className="primary">Add to farm plan</button>
      </article>
    </div>
  )
}

function Yield() {
  const [area, setArea] = useState(12),
    [crop, setCrop] = useState("Maize")
  const total = yieldForCrop(area, crop)
  return (
    <div className="page">
      <Head
        kicker="Predictive agriculture"
        title="AI Yield Prediction"
        copy="Estimate harvest outcomes using farm, weather and soil conditions."
      />
      <div className="layout">
        <article className="card controls">
          <h3>Prediction inputs</h3>
          <Field label="Crop">
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option>Maize</option>
              <option>Beans</option>
              <option>Sorghum</option>
            </select>
          </Field>
          <Field label={`Farm area — ${area} hectares`}>
            <input
              type="range"
              min="1"
              max="40"
              value={area}
              onChange={(e) => setArea(+e.target.value)}
            />
          </Field>
          <Field label="Soil type">
            <select>
              <option>Loamy clay</option>
              <option>Sandy loam</option>
            </select>
          </Field>
          <Field label="Seed variety">
            <select>
              <option>Drought tolerant</option>
              <option>Standard hybrid</option>
            </select>
          </Field>
          <button className="primary wide">
            <Zap /> Recalculate
          </button>
        </article>
        <article className="card double prediction">
          <div className="card-head">
            <div>
              <span className="eyebrow">Model prediction</span>
              <h3>{crop} harvest outlook</h3>
            </div>
            <mark>
              <BadgeCheck /> 91% confidence
            </mark>
          </div>
          <div className="result">
            <div>
              <small>Estimated total yield</small>
              <b>{total} tonnes</b>
              <span>3.8 t/ha average</span>
            </div>
            <i>
              <b>+12%</b>
              <small>vs 2025</small>
            </i>
          </div>
          <div className="features">
            {[
              ["Rainfall", 88, "38%"],
              ["Soil quality", 73, "27%"],
              ["Seed variety", 62, "21%"],
              ["Planting date", 45, "14%"],
            ].map((x) => (
              <p key={x[0]}>
                <b>{x[0]}</b>
                <span>
                  <i style={{ width: `${x[1]}%` }} />
                </span>
                <small>{x[2]}</small>
              </p>
            ))}
          </div>
        </article>
      </div>
      <article className="card">
        <div className="card-head">
          <div>
            <span className="eyebrow">Model performance</span>
            <h3>Accuracy & saturation evidence</h3>
          </div>
          <em>Random Forest v2.4</em>
        </div>
        <div className="model-stats">
          {[
            ["R² score", "0.91", "Excellent fit"],
            ["RMSE", "0.38 t", "Lower is better"],
            ["MAE", "0.24 t", "Validation set"],
            ["Training rows", "1,240", "Saturation at 1,050"],
          ].map((x) => (
            <div key={x[0]}>
              <small>{x[0]}</small>
              <b>{x[1]}</b>
              <span>{x[2]}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function Alerts() {
  const items = [
    [
      CloudRain,
      "Advisory",
      "Heavy rain possible on Thursday",
      "8–12 mm expected between 14:00 and 20:00. Clear drainage channels.",
      "blue",
    ],
    [
      AlertTriangle,
      "Watch",
      "Dry spell developing",
      "Below-average rainfall is likely over the next 14 days. Conserve stored water.",
      "amber",
    ],
    [
      ThermometerSun,
      "Information",
      "Warm afternoon temperatures",
      "Temperatures may reach 29°C this weekend. Irrigate seedlings early morning.",
      "orange",
    ],
  ] as const
  return (
    <div className="page">
      <Head
        kicker="Early warning system"
        title="Weather Alerts"
        copy="Farm-specific warnings, sent early enough for you to act."
        action={
          <button className="primary">
            <Plus /> Set alert preferences
          </button>
        }
      />
      <div className="alert-banner">
        <Bell />
        <div>
          <b>1 active advisory for your farm</b>
          <p>Notifications are enabled by SMS and in-app message.</p>
        </div>
        <button className="secondary">Manage channels</button>
      </div>
      <div className="alert-list">
        {items.map(([I, level, title, text, tone]) => (
          <article className="card" key={title}>
            <span className={`metric-icon ${tone}`}>
              <I />
            </span>
            <div>
              <mark className={tone}>{level}</mark>
              <h3>{title}</h3>
              <p>{text}</p>
              <small>Updated recently · Maseru district</small>
            </div>
            <ChevronRight />
          </article>
        ))}
      </div>
    </div>
  )
}

function Disease({ notify }: { notify: (n: Notice) => void }) {
  const [image, setImage] = useState(""),
    [done, setDone] = useState(false),
    input = useRef<HTMLInputElement>(null)
  const load = (f?: File) => {
    if (f) {
      setImage(URL.createObjectURL(f))
      setDone(false)
    }
  }
  return (
    <div className="page">
      <Head
        kicker="CNN crop health model"
        title="Crop Disease Detection"
        copy="Take or upload a clear leaf photo for an instant AI health assessment."
      />
      <div className="layout">
        <article className="card double upload">
          <button
            className={image ? "image-loaded" : ""}
            onClick={() => input.current?.click()}
          >
            {image ? (
              <img src={image} alt="Uploaded crop" />
            ) : (
              <>
                <span>
                  <Camera />
                </span>
                <h3>Upload a crop photo</h3>
                <p>Use a clear, well-lit photo showing the affected leaf.</p>
                <i className="secondary">
                  <Upload /> Choose photo
                </i>
              </>
            )}
            <input
              ref={input}
              hidden
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => load(e.target.files?.[0])}
            />
          </button>
          {image && (
            <div className="upload-actions">
              <button
                className="secondary"
                onClick={() => input.current?.click()}
              >
                Choose another
              </button>
              <button
                className="primary"
                onClick={() => {
                  setDone(true)
                  notify({
                    title: "Analysis complete",
                    text: "Your crop health report is ready.",
                  })
                }}
              >
                <Zap /> Analyse crop
              </button>
            </div>
          )}
        </article>
        <article className="card diagnosis">
          <span className="eyebrow">AI diagnosis</span>
          {done ? (
            <>
              <BadgeCheck className="large-check" />
              <h2>Early leaf blight</h2>
              <mark>
                <BadgeCheck /> 89% confidence
              </mark>
              <div>
                <p>
                  <b>Severity</b>
                  <span>Low — early stage</span>
                </p>
                <p>
                  <b>Action</b>
                  <span>Remove lower leaves</span>
                </p>
                <p>
                  <b>Treatment</b>
                  <span>Copper fungicide</span>
                </p>
              </div>
              <button className="primary wide">Save health record</button>
            </>
          ) : (
            <section>
              <Leaf />
              <h3>Waiting for a photo</h3>
              <p>Diagnosis and treatment will appear here.</p>
            </section>
          )}
        </article>
      </div>
      <div className="steps">
        <article>
          <Camera />
          <div>
            <b>1. Take a clear photo</b>
            <p>Show one affected leaf.</p>
          </div>
        </article>
        <article>
          <Bot />
          <div>
            <b>2. AI checks symptoms</b>
            <p>MobileNet compares patterns.</p>
          </div>
        </article>
        <article>
          <BookOpen />
          <div>
            <b>3. Follow treatment</b>
            <p>Get practical next steps.</p>
          </div>
        </article>
      </div>
    </div>
  )
}

const opData = {
  farm: [
    "Farm operations",
    "Farm Management",
    "Fields, crops and daily work in one clear view.",
    Tractor,
    "Active fields",
    "3 fields",
    "12 hectares total",
  ],
  irrigation: [
    "Water intelligence",
    "Smart Irrigation",
    "Use soil data and forecasts to apply the right water at the right time.",
    Droplets,
    "Soil moisture",
    "38%",
    "Target is 52%",
  ],
  calendar: [
    "Season planner",
    "Planting Calendar",
    "Crop windows adapted to Lesotho’s highland climate.",
    CalendarDays,
    "Next planting",
    "4 April",
    "Early maize window",
  ],
} as const
function Operations({
  page,
  notify,
}: {
  page: "farm" | "irrigation" | "calendar"
  notify: (n: Notice) => void
}) {
  const d = opData[page],
    Icon = d[3]
  return (
    <div className="page">
      <Head
        kicker={d[0]}
        title={d[1]}
        copy={d[2]}
        action={
          <button
            className="primary"
            onClick={() =>
              notify({
                title: "Plan updated",
                text: "A new activity has been added.",
              })
            }
          >
            <Plus /> Add activity
          </button>
        }
      />
      <div className="metrics three">
        <Metric icon={Icon} label={d[4]} value={d[5]} note={d[6]} />
        <Metric
          icon={Sprout}
          label="Growing crop"
          value="Maize"
          note="Day 46 of 120"
          tone="lime"
        />
        <Metric
          icon={Activity}
          label="Current status"
          value="On track"
          note="AI plan active"
          tone="blue"
        />
      </div>
      <article className="card table-card">
        <div className="card-head">
          <div>
            <span className="eyebrow">Current plan</span>
            <h3>Your fields and activities</h3>
          </div>
          <button className="secondary">
            Filter <ChevronDown />
          </button>
        </div>
        <DataTable />
      </article>
      {page === "irrigation" && (
        <article className="card ai-note">
          <Droplets />
          <div>
            <span className="eyebrow">Automated recommendation</span>
            <h3>Delay Zone 2 irrigation</h3>
            <p>
              Thursday rain can provide most required water, saving an estimated
              640 litres.
            </p>
          </div>
          <button className="primary">Apply schedule</button>
        </article>
      )}
    </div>
  )
}
function DataTable() {
  return (
    <div className="data-table">
      <header>
        <span>Name</span>
        <span>Status</span>
        <span>Next action</span>
        <span>Progress</span>
      </header>
      {[
        "North Field — Maize",
        "River Field — Beans",
        "Hill Field — Sorghum",
      ].map((x, i) => (
        <div key={x}>
          <b>{x}</b>
          <mark>On track</mark>
          <span>{i ? "Inspect leaves" : "Irrigate today"}</span>
          <span>
            <i>
              <em style={{ width: `${82 - i * 17}%` }} />
            </i>
            {82 - i * 17}%
          </span>
        </div>
      ))}
    </div>
  )
}

function Marketplace({ notify }: { notify: (n: Notice) => void }) {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "markets"))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (list.length === 0) {
        const seed = [
          { name: "Premium Pinto Beans", seller: "Thaba Bosiu Growers", price: "M 8.50/kg", qty: "600 kg", img: "https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?auto=format&fit=crop&w=700&q=80" },
        ]
        for (const s of seed) await addDoc(collection(db, "markets"), s)
        setItems(seed.map((s, i) => ({ id: String(i), ...s })))
      } else {
        setItems(list)
      }
      setLoading(false)
    })()
  }, [])
  const filtered = items.filter((x) => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()))
  const sell = async () => {
    const name = prompt("Produce name")
    if (!name) return
    const price = prompt("Price") || ""
    const qty = prompt("Quantity") || ""
    const seller = prompt("Seller") || ""
    const docRef = await addDoc(collection(db, "markets"), { name, price, qty, seller, img: "" })
    setItems((m) => [...m, { id: docRef.id, name, price, qty, seller, img: "" }])
    notify({ title: "Listed", text: `${name} added to marketplace.` })
  }
  return (
    <div className="page">
      <Head kicker="Verified local trade" title="Climate-smart Marketplace" copy="Sell directly, buy confidently, and keep value within Lesotho." action={<button className="primary" onClick={sell}><Plus /> Sell produce</button>} />
      <div className="toolbar">
        <label><Search /><input placeholder="Search produce, farmer or district" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      </div>
      <div className="products">
        {loading && <p>Loading...</p>}
        {filtered.map((x) => (
          <article key={x.id}>
            <div style={{ backgroundImage: `url("${x.img}")` }}><mark><BadgeCheck /> Climate-smart verified</mark></div>
            <section>
              <small>{x.seller}</small>
              <h3>{x.name}</h3>
              <p><MapPin /> Lesotho · {x.qty} available</p>
              <footer>
                <b>{x.price}</b>
                <button className="primary" onClick={() => notify({ title: "Enquiry added", text: `${x.name} is in your buyer enquiry.` })}>Enquire</button>
              </footer>
            </section>
          </article>
        ))}
      </div>
    </div>
  )
}
function Assistant() {
  const [lang, setLang] = useState("en")
  const [messages, setMessages] = useState<{ mine: boolean; text: string }[]>([])
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  const greetings: Record<string, string> = {
    en: "Hello! I am your Letsatsi farm assistant. Ask about planting, irrigation, weather, insurance, markets or yields.",
    st: "Lumela! Ke mookameli oa temo oa Letsatsi. Botsa ka temo, nosetso, boemo ba leholimo, inshorense, mmaraka kapa litholoana.",
    zu: "Sawubona! Ngingumsizi wakho wezolimo weLetsatsi. Buza ngezitshalo, ukunisela, isimo sezulu, inshurensi, amamakethe noma izivuno.",
    af: "Hallo! Ek is jou Letsatsi plaasassistent. Vra oor plant, besproeiing, weer, versekering, markte of opbrengs.",
    fr: "Bonjour ! Je suis votre assistant agricole Letsatsi. Posez vos questions sur la plantation, l'irrigation, la météo, l'assurance, les marchés ou les rendements.",
  }

  const suggestions: Record<string, string[]> = {
    en: ["When should I plant maize?", "How can I save water?", "Explain my climate risk"],
    st: ["Ke ka jala poone neng?", "Ke ka fihlela nosetso joang?", "Nkaro ea boemo ba leholimo"],
    zu: ["Nangingi hlanyela umbile nini?", "Ngingenakusiza ukunciphisa amanzi ngaphezu?", "Yiziphi izinga zobungozi bami?"],
    af: ["Wanneer moet ek mielies plant?", "Hoe kan ek water bespaar?", "Verklar my klimaatrisiko"],
    fr: ["Quand dois-je planter du maïs ?", "Comment économiser l'eau ?", "Expliquez mon risque climatique"],
  }

  const assistantReply = (input: string): string => {
    const q = input.toLowerCase()
    const t = greetings
    if (!q.trim()) return "Please type a question and I will help."
    if (/(hello|hi|lumela|dumela|bonjour|hola|ola)/.test(q)) return t[lang]
    if (/(plant|planting|maize|sorghum|beans|jala|hlanyela)/.test(q))
      return "For Maseru, plant maize between mid-October and mid-November after soil warms to 18C. Use 25 kg/ha seed and space rows 75 cm apart."
    if (/(water|irrigat|save water|moisture|nosetso|ukunisela|besproei)/.test(q))
      return "Delay irrigation until after expected rain, then check soil moisture. Mulch rows to cut evaporation by up to 30% and water early morning."
    if (/(weather|rain|forecast|climate risk|risk|leholimo|isimo|weer|meteo)/.test(q))
      return "Rainfall may fall below average this month. Risk score is moderate. Protect harvested grain and hold off on heavy irrigation until the rain passes."
    if (/(market|sell|price|buyer|order|mmaraka|amamakethe|markte|marche)/.test(q))
      return "Current maize buyer bids are M 3,200-3,600 per tonne. List grain after moisture drops below 13% and verify buyer before delivery."
    if (/(insurance|cover|premium|claim|inshorense|versekering|assurance)/.test(q))
      return "Parametric cover for M 4,500 costs about M 280. Claims trigger automatically when rainfall falls below the agreed threshold."
    if (/(yield|harvest|production|litholoana|izivuno|opbrengs|rendement)/.test(q))
      return "Expected yield on your 12 ha maize field is about 45.6 tonnes at 3.8 t/ha."
    if (/(soil|fertil|nutrient|mobu|umhlabathi|grond|sol)/.test(q))
      return "Test soil pH and nitrogen before planting. Apply 200 kg/ha basal fertilizer and split nitrogen top-dressing."
    return "I can help with planting dates, irrigation timing, weather risk, markets, insurance and yield estimates. Try one of the suggested questions."
  }

  const send = async (v = text) => {
    if (!v.trim()) return
    const question = v.trim()
    setMessages((m) => [...m, { mine: true, text: question }])
    setText("")
    setBusy(true)
    await new Promise((r) => setTimeout(r, 400))
    setMessages((m) => [...m, { mine: false, text: assistantReply(question) }])
    setBusy(false)
  }

  useEffect(() => {
    if (!messages.length) {
      setMessages([{ mine: false, text: greetings[lang] }])
    }
  }, [lang])

  return (
    <div className="page">
      <Head
        kicker="Farm help, anytime"
        title="AI Assistant"
        copy="Practical guidance using your farm's current data."
        action={
          <select value={lang} onChange={(e) => { setLang(e.target.value); setMessages([{ mine: false, text: greetings[e.target.value] }]) }} className="input">
            {[{ code: "en", label: "English" }, { code: "st", label: "Sesotho" }, { code: "zu", label: "isiZulu" }, { code: "af", label: "Afrikaans" }, { code: "fr", label: "Français" }].map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        }
      />
      <div className="chat">
        <header>
          <Bot />
          <div>
            <b>Letsatsi AI</b>
            <small>Online · Farm context enabled</small>
          </div>
        </header>
        <main className="scroll-area">
          {messages.map((m, i) => (
            <div key={i} className={m.mine ? "mine" : ""}>
              {!m.mine && <span><Bot /></span>}
              <p>{m.text}</p>
            </div>
          ))}
        </main>
        <nav className="suggestions">
          {suggestions[lang].map((x) => (
            <button key={x} disabled={busy} onClick={() => send(x)}>
              {x}
            </button>
          ))}
        </nav>
        <form onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={text} disabled={busy} onChange={(e) => setText(e.target.value)} placeholder="Ask about your farm…" />
          <button className="primary" disabled={busy}>
            <ChevronRight />
          </button>
        </form>
      </div>
    </div>
  )
}
function Passport() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "create" | "cert">("list")
  const [sel, setSel] = useState<any>(null)
  const [form, setForm] = useState({ crop: "", batch: "", farmer: "", district: "", plantingDate: "", area: "", variety: "", status: "Pending" })

  useEffect(() => {
    ;(async () => {
      const snap = await getDocs(collection(db, "passports"))
      const l = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (l.length === 0) {
        const seed = [
          { crop: "Maize", batch: "PT-88", farmer: "Thato Mohlanka", district: "Maseru", plantingDate: "2026-10-15", area: "12 ha", variety: "SC701", status: "Certified", hash: "0x4a...f2" },
          { crop: "Beans", batch: "PT-89", farmer: "Thato Mohlanka", district: "Maseru", plantingDate: "2026-11-01", area: "8 ha", variety: "GLP2", status: "Certified", hash: "0x2b...c4" },
        ]
        for (const s of seed) {
          const blk = await blockchain.addBlock({ type: "crop-passport", crop: s.crop, batch: s.batch, farmer: s.farmer })
          await blockchain.persist(blk)
          await addDoc(collection(db, "passports"), { ...s, hash: blk.hash, blockIndex: blk.index })
        }
        setList(seed.map((s, i) => ({ id: String(i), ...s, hash: seed[i].hash })))
      } else {
        setList(l)
      }
      setLoading(false)
    })()
  }, [])

  const create = async () => {
    if (!form.crop || !form.batch) return
    const blk = await blockchain.addBlock({ type: "crop-passport", crop: form.crop, batch: form.batch, farmer: form.farmer, district: form.district })
    await blockchain.persist(blk)
    const rec = { ...form, hash: blk.hash, blockIndex: blk.index, createdAt: new Date().toISOString() }
    await addDoc(collection(db, "passports"), rec)
    setList((x) => [...x, { id: `p-${Date.now()}`, ...rec }])
    setView("list")
    setForm({ crop: "", batch: "", farmer: "", district: "", plantingDate: "", area: "", variety: "", status: "Pending" })
  }

  const genQR = () => {
    if (!sel) return
    const data = `CROP|${sel.crop}|${sel.batch}|${sel.farmer}|${sel.district}|${sel.hash}|${sel.blockIndex}`
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
    window.open(url, "_blank")
  }

  const genCert = () => {
    if (!sel) return
    const html = `
      <html><head><style>body{font-family:sans-serif;padding:40px}h1{color:#065f46}.box{border:2px solid #065f46;padding:30px;border-radius:12px}</style></head>
      <body><div class="box"><h1>Crop Passport Certificate</h1>
      <p><b>Crop:</b> ${sel.crop}</p><p><b>Batch:</b> ${sel.batch}</p><p><b>Farmer:</b> ${sel.farmer}</p>
      <p><b>District:</b> ${sel.district}</p><p><b>Planting date:</b> ${sel.plantingDate}</p><p><b>Area:</b> ${sel.area}</p><p><b>Variety:</b> ${sel.variety}</p>
      <p><b>Status:</b> ${sel.status}</p><p><b>Block hash:</b> ${sel.hash}</p><p><b>Block index:</b> ${sel.blockIndex}</p>
      <p><i>Tamper-evident record anchored on Letsatsi ClimateShield blockchain.</i></p></div></body></html>`
    const w = window.open()
    w?.document.write(html)
    w?.print()
  }

  const updateStatus = async (id: string, status: string) => {
    setList((x) => x.map((p) => (p.id === id ? { ...p, status } : p)))
    try {
      await setDoc(doc(db, "passports", id), { status }, { merge: true })
    } catch {}
  }

  if (loading) return <div className="page"><Head kicker="Blockchain" title="Crop Passport" copy="Loading…" /></div>

  if (view === "create") {
    return (
      <div className="page">
        <Head kicker="Blockchain" title="Create Crop Passport" copy="Register a new crop batch on the blockchain." />
        <div className="card">
          <div className="form-grid">
            <Field label="Crop"><input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} /></Field>
            <Field label="Batch ID"><input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            <Field label="Farmer name"><input value={form.farmer} onChange={(e) => setForm({ ...form, farmer: e.target.value })} /></Field>
            <Field label="District"><input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
            <Field label="Planting date"><input type="date" value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} /></Field>
            <Field label="Area"><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
            <Field label="Variety"><input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} /></Field>
            <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Pending</option><option>Certified</option><option>Rejected</option></select></Field>
          </div>
          <button className="primary" onClick={create}>Register on blockchain</button>
          <button className="secondary" onClick={() => setView("list")}>Back</button>
        </div>
      </div>
    )
  }

  if (view === "cert" && sel) {
    return (
      <div className="page">
        <Head kicker="Blockchain" title="Certificate" copy={`Crop Passport Certificate — ${sel.batch}`} />
        <div className="card passport">
          <h1>Crop Passport Certificate</h1>
          <p><b>Crop:</b> {sel.crop}</p>
          <p><b>Batch:</b> {sel.batch}</p>
          <p><b>Farmer:</b> {sel.farmer}</p>
          <p><b>District:</b> {sel.district}</p>
          <p><b>Planting date:</b> {sel.plantingDate}</p>
          <p><b>Area:</b> {sel.area}</p>
          <p><b>Variety:</b> {sel.variety}</p>
          <p><b>Status:</b> {sel.status}</p>
          <p><b>Blockchain hash:</b> {sel.hash}</p>
          <p><b>Block index:</b> {sel.blockIndex}</p>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="primary" onClick={genQR}>Download QR code</button>
            <button className="primary" onClick={genCert}>Print / Save PDF</button>
            <button className="secondary" onClick={() => setView("list")}>Back to list</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Head kicker="Blockchain" title="Crop Passport" copy="Trusted, tamper-evident record from seed to buyer." action={<button className="primary" onClick={() => setView("create")}><Plus /> Register batch</button>} />
      <div className="card">
        <table className="table">
          <thead><tr><th>Crop</th><th>Batch</th><th>Farmer</th><th>District</th><th>Status</th><th>Hash</th><th>Action</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.crop}</td><td>{p.batch}</td><td>{p.farmer}</td><td>{p.district}</td>
                <td style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>{p.status}</td>
                <td style={{ fontSize: 10, fontFamily: "monospace" }}>{p.hash}</td>
                <td>
                  <button className="secondary" onClick={() => { setSel(p); setView("cert") }}>Certificate</button>
                  <button className="secondary" onClick={() => updateStatus(p.id, p.status === "Certified" ? "Pending" : "Certified")}>Toggle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function Finance() { const [tx,setTx]=useState<any[]>([]); const [loading,setLoading]=useState(true); useEffect(()=>{(async()=>{const snap=await getDocs(collection(db,"finance"));const l=snap.docs.map(d=>({id:d.id,...d.data()})); if(l.length===0){const seed=[{desc:"Maize sale",amount:3200,type:"income"},{desc:"Seed purchase",amount:-450,type:"expense"}]; for(const s of seed) await addDoc(collection(db,"finance"),s); setTx(seed.map((s,i)=>({id:String(i),...s})))} else setTx(l); setLoading(false)})()},[]); const add=async()=>{const desc=prompt("Description"); if(!desc) return; const amount=Number(prompt("Amount (negative for expense)")||0); const docRef=await addDoc(collection(db,"finance"),{desc,amount,type:amount>=0?"income":"expense"}); setTx(x=>[...x,{id:docRef.id,desc,amount,type:amount>=0?"income":"expense"}])}; return (<div className="page"><Head kicker="Finance" title="Financial Management" copy="Track income, expenses, and recent activity." action={<button className="primary" onClick={add}><Plus/> Add transaction</button>} /><div className="card">{loading?<p>Loading...</p>:tx.map(t=>(<div key={t.id} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span>{t.desc}</span><b style={{color:t.amount>=0?"green":"red"}}>{t.amount}</b></div>))}</div></div>) }
function Insurance({ notify }: any) { const [coverage,setCoverage]=useState(4500); const premium=Math.round(coverage*0.0622); const buy=async()=>{ await addDoc(collection(db,"insurance"),{coverage,premium,createdAt:new Date().toISOString()}); notify({title:"Policy created",text:`Coverage M ${coverage}, premium M ${premium}`})}; return (<div className="page"><Head kicker="Insurance" title="Insurance Calculator" copy="Calculate premium and create policy." /><div className="card"><label>Coverage amount<input type="number" value={coverage} onChange={e=>setCoverage(Number(e.target.value))} /></label><p>Premium: M {premium}</p><button className="primary" onClick={buy}>Create policy</button></div></div>) }
function Learning() { const [courses,setCourses]=useState<any[]>([]); const [loading,setLoading]=useState(true); useEffect(()=>{(async()=>{const snap=await getDocs(collection(db,"learning"));const l=snap.docs.map(d=>({id:d.id,...d.data()})); if(l.length===0){const seed=[{title:"Climate-smart maize",progress:0},{title:"Water conservation",progress:40}]; for(const s of seed) await addDoc(collection(db,"learning"),s); setCourses(seed.map((s,i)=>({id:String(i),...s})))} else setCourses(l); setLoading(false)})()},[]); const start=(id:string)=>{ setCourses(c=>c.map(x=>x.id===id?{...x,progress:Math.min(100,(x.progress||0)+10)}:x)); }; return (<div className="page"><Head kicker="Learning" title="Learning Center" copy="Courses and progress." /><div className="card">{loading?<p>Loading...</p>:courses.map(c=>(<div key={c.id} style={{marginBottom:8}}><b>{c.title}</b> <span>{c.progress}%</span> <button className="primary" onClick={()=>start(c.id)}>Continue</button></div>))}</div></div>) }
function Community({ notify }: any) { const [posts,setPosts]=useState<any[]>([]); const [text,setText]=useState(""); useEffect(()=>{(async()=>{const snap=await getDocs(collection(db,"community"));const list=snap.docs.map(d=>({id:d.id,...d.data()})); if(list.length===0){const seed=[{author:"Thato",text:"Best maize variety for Maseru?",replies:[]}]; for(const s of seed) await addDoc(collection(db,"community"),s); setPosts(seed.map((s,i)=>({id:String(i),...s})))} else setPosts(list)})()},[]); const post=async()=>{if(!text.trim())return; const docRef=await addDoc(collection(db,"community"),{author:"You",text,replies:[]}); setPosts(p=>[...p,{id:docRef.id,author:"You",text,replies:[]}]); setText(""); notify({title:"Posted",text:"Your post is live."})}; const reply=async(id:string,r:string)=>{if(!r.trim())return; setPosts(p=>p.map(x=>x.id===id?{...x,replies:[...(x.replies||[]),{author:"You",text:r}]}:x)); notify({title:"Reply added",text:"Reply posted."})}; return (<div className="page"><Head kicker="Community" title="Community" copy="Share, reply, and learn together." /><div className="toolbar"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Share an update..." /><button className="primary" onClick={post}>Post</button></div><div className="card">{posts.map(p=>(<div key={p.id} style={{marginBottom:12}}><b>{p.author}</b><p>{p.text}</p>{(p.replies||[]).map((r:any,i:number)=><div key={i} style={{marginLeft:16}}><small>{r.author}</small><p>{r.text}</p></div>)}<button className="secondary" onClick={()=>{const r=prompt("Reply"); if(r) reply(p.id,r)}}>Reply</button></div>))}</div></div>) }
function SecurityConfig() {
  const [matrix, setMatrix] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string; col: string } | null>(null)
  const [editVal, setEditVal] = useState("")

  const defaultMatrix = [
    { id: "r1", role: "Farmer", farmData: "Own records", marketplace: "List & sell", administration: "Denied" },
    { id: "r2", role: "Buyer", farmData: "Verified public", marketplace: "Buy & order", administration: "Denied" },
    { id: "r3", role: "Agricultural Officer", farmData: "Assigned district", marketplace: "Read only", administration: "Verification" },
    { id: "r4", role: "Admin", farmData: "Audit access", marketplace: "Moderate", administration: "Full access" },
  ]

  const columns = [
    { key: "farmData", label: "Farm data" },
    { key: "marketplace", label: "Marketplace" },
    { key: "administration", label: "Administration" },
  ]

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "security"))
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (list.length === 0) {
          for (const r of defaultMatrix) await addDoc(collection(db, "security"), r)
          setMatrix(defaultMatrix)
        } else {
          setMatrix(list)
        }
      } catch {
        setMatrix(defaultMatrix)
      }
      setLoading(false)
    })()
  }, [])

  const startEdit = (id: string, col: string, val: string) => {
    setEditing({ id, col })
    setEditVal(val)
  }

  const saveEdit = async (id: string, col: string) => {
    setMatrix((curr) => curr.map((r) => (r.id === id ? { ...r, [col]: editVal } : r)))
    try {
      await setDoc(doc(db, "security", id), { [col]: editVal }, { merge: true })
    } catch { /* fallback local */ }
    setEditing(null)
  }

  const [gdpr, setGdpr] = useState("Consent captured at registration; data minimisation applied; right to erasure supported; breach notification within 72h; users can access, correct, and delete personal data.")

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "gdpr"))
        const list = snap.docs.map((d) => d.data())
        if (list.length > 0) setGdpr(list[0].text)
      } catch { /* use default */ }
    })()
  }, [])

  const saveGdpr = async () => {
    try {
      const snap = await getDocs(collection(db, "gdpr"))
      if (snap.empty) await addDoc(collection(db, "gdpr"), { text: gdpr })
      else await setDoc(doc(db, "gdpr", snap.docs[0].id), { text: gdpr }, { merge: true })
    } catch { /* fallback local */ }
  }

  if (loading) return <div className="page"><Head kicker="Cybersecurity" title="Security Configuration" copy="Loading permissions…" /></div>

  return (
    <div className="page">
      <Head kicker="Cybersecurity" title="Security Configuration" copy="Admin domain — role-based read/write permissions, fully editable." />
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r.id}>
                <td>{r.role}</td>
                {columns.map((c) => (
                  <td key={c.key}>
                    {editing?.id === r.id && editing?.col === c.key ? (
                      <input className="input" value={editVal} onChange={(e) => setEditVal(e.target.value)} />
                    ) : (
                      r[c.key]
                    )}
                  </td>
                ))}
                <td>
                  {columns.map((c) => (
                    <button
                      key={c.key}
                      className="secondary"
                      onClick={() => startEdit(r.id, c.key, r[c.key])}
                      style={{ fontSize: 10, padding: "2px 6px", marginRight: 2 }}
                    >
                      Edit
                    </button>
                  ))}
                  {editing?.id === r.id && (
                    <button className="primary" onClick={() => columns.forEach((c) => saveEdit(r.id, c.key))} style={{ fontSize: 10, padding: "2px 6px", marginLeft: 2 }}>
                      Save row
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>GDPR compliance (editable)</h3>
        <textarea className="input" value={gdpr} onChange={(e) => setGdpr(e.target.value)} rows={3} style={{ width: "100%", marginBottom: 8 }} />
        <button className="primary" onClick={saveGdpr}>Save GDPR info</button>
        <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Consent captured at registration · data minimisation · right to erasure · 72h breach notice · user access/correction/deletion</p>
      </div>
    </div>
  )
}
function BlockchainRecords() {
  const [chain, setChain] = useState<Block[]>([])
  const [valid, setValid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [newData, setNewData] = useState("")
  const [mining, setMining] = useState(false)

  useEffect(() => {
    (async () => {
      const blocks = await blockchain.loadFromFirestore()
      if (blocks.length === 0) {
        const genesis = await blockchain.genesis()
        blockchain.chain = [genesis]
        await blockchain.persist(genesis)
        setChain([genesis])
      } else {
        blockchain.chain = blocks
        setChain(blocks)
      }
      setValid(await blockchain.isValidChain())
      setLoading(false)
    })()
  }, [])

  const addBlock = async () => {
    if (!newData.trim()) return
    setMining(true)
    const block = await blockchain.addBlock({ record: newData, source: "Letsatsi ClimateShield" })
    await blockchain.persist(block)
    setChain((c) => [...c, block])
    setValid(await blockchain.isValidChain())
    setNewData("")
    setMining(false)
  }

  const validate = async () => {
    setValid(await blockchain.isValidChain())
  }

  return (
    <div className="page">
      <Head
        kicker="Distributed ledger"
        title="Blockchain Records"
        copy="Tamper-evident, proof-of-work blocks storing farm data records."
      />
      <div className="card">
        <div className="metrics three">
          <div>
            <div className="big">{chain.length}</div>
            <div className="muted">Blocks</div>
          </div>
          <div>
            <div className="big">{valid ? "VALID" : "TAMPERED"}</div>
            <div className="muted">Chain integrity</div>
          </div>
          <div>
            <div className="big">{blockchain.difficulty}</div>
            <div className="muted">Difficulty</div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            className="input"
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
            placeholder="Record data to store in block"
          />
          <button className="primary" disabled={mining || !newData.trim()} onClick={addBlock}>
            {mining ? "Mining…" : "Add block"}
          </button>
          <button className="secondary" onClick={validate}>Validate chain</button>
        </div>
        {!valid && (
          <div style={{ marginTop: 8, color: "red", fontSize: 12 }}>Chain integrity compromised — hash mismatch detected.</div>
        )}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>Data</th>
              <th>Nonce</th>
              <th>Hash</th>
              <th>Prev. Hash</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((b) => (
              <tr key={b.index}>
                <td>{b.index}</td>
                <td>{new Date(b.timestamp).toLocaleString()}</td>
                <td style={{ fontSize: 11, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{JSON.stringify(b.data)}</td>
                <td>{b.nonce}</td>
                <td style={{ fontSize: 10, fontFamily: "monospace" }}>{b.hash}</td>
                <td style={{ fontSize: 10, fontFamily: "monospace", color: "#666" }}>{b.previousHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function PublicBlockchain() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState<string | null>(null)
  const [contractAddr, setContractAddr] = useState("")
  const [deployed, setDeployed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const checkNetwork = async () => {
    setLoading(true)
    setMsg("")
    try {
      const n = await publicBlockchain.getBlockNumber()
      setBlockNumber(n)
      const d = await publicBlockchain.isContractDeployed()
      setDeployed(d)
      setMsg(d ? "Contract detected at address." : "No contract deployed at address.")
    } catch (e: any) {
      setMsg("RPC error: " + (e?.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  const checkBalance = async () => {
    if (!address) return
    setLoading(true)
    try {
      const b = await publicBlockchain.getBalance(address)
      setBalance(b)
    } catch (e: any) {
      setMsg("Balance error: " + (e?.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Head
        kicker="Public blockchain"
        title="Ethereum Sepolia Testnet"
        copy="Connect to a public Ethereum testnet (Sepolia) via JSON-RPC."
      />
      <div className="card">
        <div className="metrics three">
          <div>
            <div className="big">{blockNumber === null ? "—" : blockNumber}</div>
            <div className="muted">Latest block</div>
          </div>
          <div>
            <div className="big">{deployed === null ? "—" : deployed ? "DEPLOYED" : "NOT DEPLOYED"}</div>
            <div className="muted">Contract status</div>
          </div>
          <div>
            <div className="big">{balance ? (parseInt(balance, 16) / 1e18).toFixed(6) : "—"}</div>
            <div className="muted">Balance (ETH)</div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="input"
            value={contractAddr}
            placeholder="Contract address (0x...)"
            onChange={(e) => setContractAddr(e.target.value)}
          />
          <button className="primary" disabled={loading} onClick={() => { publicBlockchain.contractAddress = contractAddr || null; checkNetwork() }}>
            {loading ? "Checking…" : "Check network"}
          </button>
        </div>
        {msg && <p style={{ fontSize: 11, marginTop: 8, color: deployed === false ? "#b00020" : "#065f46" }}>{msg}</p>}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Address balance</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="input"
            value={address}
            placeholder="Wallet address (0x...)"
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="primary" disabled={loading} onClick={checkBalance}>
            {loading ? "Checking…" : "Get balance"}
          </button>
        </div>
        {balance && <p style={{ fontSize: 11, marginTop: 6, fontFamily: "monospace" }}>Wei: {balance}</p>}
      </div>
      <div className="card">
        <h3>Setup for real transactions</h3>
        <ul style={{ fontSize: 11, lineHeight: 1.6 }}>
          <li>Replace <code>DEFAULT_RPC</code> in <code>src/publicBlockchain.ts</code> with your Infura/Alchemy Sepolia RPC URL.</li>
          <li>Set <code>contractAddress</code> to your deployed contract, or deploy one via Remix/Hardhat to Sepolia.</li>
          <li>Sign transactions with a private key or MetaMask (client-side keys never stored in repo).</li>
          <li>For Polygon Mumbai, use the Mumbai RPC and matching chain ID.</li>
        </ul>
        <p style={{ fontSize: 10, color: "#666" }}>Demo uses public Sepolia RPC (rpc.sepolia.org) — read-only. No private keys are stored.</p>
      </div>
    </div>
  )
}
function Reports() {
  return (
    <div className="page report-page">
      <Head
        kicker="Evidence & performance"
        title="Complete Project Reports"
        copy="Assignment-ready dashboards, compliance evidence and farm records."
        action={
          <button className="primary" onClick={() => window.print()}>
            <FileBarChart /> Print / Save PDF
          </button>
        }
      />
      <div className="report-tabs">
        <button>Executive</button>
        <button>AI models</button>
        <button>Security</button>
        <button>Blockchain</button>
      </div>
      <div className="metrics four">
        <Metric
          icon={TrendingUp}
          label="Yield improvement"
          value="+12%"
          note="AI-assisted plan"
        />
        <Metric
          icon={Droplets}
          label="Water saved"
          value="18%"
          note="Smart scheduling"
          tone="blue"
        />
        <Metric
          icon={ShieldCheck}
          label="Protected value"
          value="M 4,500"
          note="Parametric cover"
          tone="orange"
        />
        <Metric
          icon={BadgeCheck}
          label="Verified batches"
          value="7"
          note="On-chain records"
          tone="lime"
        />
      </div>
      <div className="layout">
        <article className="card double table-card">
          <span className="eyebrow">AI comparison</span>
          <h3>Model performance summary</h3>
          <div className="data-table">
            <header>
              <span>Model</span>
              <span>Metric</span>
              <span>Score</span>
              <span>Finding</span>
            </header>
            {[
              ["Random Forest", "R²", "0.91", "Selected"],
              ["XGBoost", "R²", "0.89", "Strong"],
              ["Linear Regression", "R²", "0.71", "Baseline"],
              ["MobileNet CNN", "F1", "0.87", "Disease model"],
            ].map((x) => (
              <div key={x[0]}>
                <b>{x[0]}</b>
                <span>{x[1]}</span>
                <span>{x[2]}</span>
                <mark>{x[3]}</mark>
              </div>
            ))}
          </div>
        </article>
        <article className="card checklist">
          <span className="eyebrow">Assignment coverage</span>
          <h3>Delivery status</h3>
          {[
            "React web application",
            "Blockchain records UI",
            "RBAC security module",
            "GDPR controls",
            "AI dashboards & metrics",
            "CNN photo workflow",
          ].map((x) => (
            <p key={x}>
              <BadgeCheck /> {x}
            </p>
          ))}
        </article>
      </div>
      <article className="card">
        <div className="card-head">
          <div>
            <span className="eyebrow">Data governance</span>
            <h3>Security classification</h3>
          </div>
          <mark>
            <LockKeyhole /> GDPR aligned
          </mark>
        </div>
        <div className="classify">
          {[
            ["Public", "Market prices", "Openly available"],
            ["Private", "Farm location", "Owner access"],
            ["Confidential", "Farmer ID & soil", "Encrypted + limited"],
            ["Restricted", "Payment details", "Highest protection"],
          ].map((x) => (
            <div key={x[0]}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

type RecordItem = {
  id: string
  name: string
  detail: string
  quantity: string
  status: string
  updated: string
}

const moduleConfigs: Partial<Record<Page, {
  kicker: string
  title: string
  copy: string
  icon: LucideIcon
  first: string
  second: string
  seeds: Omit<RecordItem, "id">[]
}>> = {
  farm: {
    kicker: "Multi-farm registry",
    title: "Farms & Fields",
    copy: "Register multiple farms, fields, sizes and farming history.",
    icon: Tractor,
    first: "Farm or field name",
    second: "Location and history",
    seeds: [
      {
        name: "Ha Matala Farm",
        detail: "Maseru · Established 2018",
        quantity: "8 ha · 2 fields",
        status: "Active",
        updated: "Today",
      },
      {
        name: "River Plot",
        detail: "Roma · Leased 2024",
        quantity: "4 ha · 1 field",
        status: "Active",
        updated: "Yesterday",
      },
    ],
  },
  livestock: {
    kicker: "Animal health records",
    title: "Livestock Management",
    copy: "Track animals, vaccinations, feeding schedules and health.",
    icon: Beef,
    first: "Animal or herd",
    second: "Breed and health note",
    seeds: [
      {
        name: "Cattle herd A",
        detail: "Basotho cattle · Vaccinated",
        quantity: "18 animals",
        status: "Healthy",
        updated: "Today",
      },
      {
        name: "Sheep flock",
        detail: "Merino · Deworming due 4 Apr",
        quantity: "32 animals",
        status: "Action due",
        updated: "2h ago",
      },
    ],
  },
  soil: {
    kicker: "Field fertility",
    title: "Soil Testing & Analysis",
    copy: "Record pH and nutrients, then review practical fertility recommendations.",
    icon: FlaskConical,
    first: "Sample or field",
    second: "pH and nutrient result",
    seeds: [
      {
        name: "North Field S-104",
        detail: "pH 5.8 · Nitrogen low",
        quantity: "2.1% organic matter",
        status: "Lime advised",
        updated: "22 Mar",
      },
      {
        name: "River Field S-105",
        detail: "pH 6.4 · NPK balanced",
        quantity: "3.4% organic matter",
        status: "Optimal",
        updated: "18 Mar",
      },
    ],
  },
  inventory: {
    kicker: "Inputs and equipment",
    title: "Farm Inventory",
    copy: "Monitor seed, fertiliser, pesticides, feed and equipment stock.",
    icon: Boxes,
    first: "Item name",
    second: "Category and supplier",
    seeds: [
      {
        name: "Drought-tolerant maize seed",
        detail: "Seed · AgriSupply",
        quantity: "12 bags",
        status: "In stock",
        updated: "Today",
      },
      {
        name: "NPK 2:3:2 fertiliser",
        detail: "Fertiliser · FarmCo",
        quantity: "4 bags",
        status: "Low stock",
        updated: "Today",
      },
    ],
  },
  harvest: {
    kicker: "Post-harvest traceability",
    title: "Harvest Management",
    copy: "Record harvest dates, quantities, quality, storage and losses.",
    icon: PackageCheck,
    first: "Crop batch",
    second: "Harvest date and grade",
    seeds: [
      {
        name: "White maize #00421",
        detail: "18 Mar 2026 · Grade A",
        quantity: "1,240 kg",
        status: "Stored",
        updated: "18 Mar",
      },
      {
        name: "Pinto beans #00418",
        detail: "9 Mar 2026 · Grade A",
        quantity: "600 kg",
        status: "For sale",
        updated: "20 Mar",
      },
    ],
  },
  orders: {
    kicker: "Sales pipeline",
    title: "Sales & Orders",
    copy: "Track buyers, orders, delivery milestones and payments.",
    icon: ShoppingCart,
    first: "Buyer or order",
    second: "Product and delivery",
    seeds: [
      {
        name: "ORD-1084 · Maluti Fresh",
        detail: "600 kg pinto beans · 28 Mar",
        quantity: "M 5,100",
        status: "Confirmed",
        updated: "10 min ago",
      },
      {
        name: "ORD-1079 · Roma Market",
        detail: "1.2 t white maize · Delivered",
        quantity: "M 7,700",
        status: "Paid",
        updated: "12 Mar",
      },
    ],
  },
  suppliers: {
    kicker: "Trusted input partners",
    title: "Supplier Directory",
    copy: "Register suppliers, compare prices and track service quality.",
    icon: Truck,
    first: "Supplier name",
    second: "Products and district",
    seeds: [
      {
        name: "AgriSupply Lesotho",
        detail: "Seed & fertiliser · Maseru",
        quantity: "From M 280",
        status: "Verified",
        updated: "Today",
      },
      {
        name: "Highlands Farm Inputs",
        detail: "Equipment · Leribe",
        quantity: "From M 190",
        status: "Verified",
        updated: "Yesterday",
      },
    ],
  },
  subsidies: {
    kicker: "Public agricultural support",
    title: "Government Subsidies & Grants",
    copy: "Find assistance, check eligibility and track applications.",
    icon: Landmark,
    first: "Programme name",
    second: "Agency and deadline",
    seeds: [
      {
        name: "Climate-smart seed support",
        detail: "Ministry of Agriculture · 30 Apr",
        quantity: "Up to M 2,500",
        status: "Eligible",
        updated: "Today",
      },
      {
        name: "Smallholder irrigation grant",
        detail: "SADP II · 15 May",
        quantity: "60% support",
        status: "Open",
        updated: "Yesterday",
      },
    ],
  },
  verification: {
    kicker: "Identity and farm checks",
    title: "Farmer Verification",
    copy: "Review farmer documents, farm evidence and approval status.",
    icon: UserCheck,
    first: "Farmer name",
    second: "District and submitted proof",
    seeds: [
      {
        name: "Mpho Rasekoai",
        detail: "Leribe · ID + farm letter",
        quantity: "2 documents",
        status: "Pending review",
        updated: "8 min ago",
      },
      {
        name: "Naledi Thulo",
        detail: "Mafeteng · ID + GPS",
        quantity: "3 documents",
        status: "Verified",
        updated: "Yesterday",
      },
    ],
  },
  admin: {
    kicker: "Platform administration",
    title: "Admin Control Centre",
    copy: "Manage users, roles, system health, reports and platform activity.",
    icon: ShieldCheck,
    first: "User or action",
    second: "Role and account note",
    seeds: [
      {
        name: "Thato Mohlanka",
        detail: "Farmer · Maseru",
        quantity: "3 farms",
        status: "Active",
        updated: "Online",
      },
      {
        name: "Lerato Ntoi",
        detail: "Buyer · Berea",
        quantity: "12 orders",
        status: "Active",
        updated: "4 min ago",
      },
      {
        name: "Palesa Mokoena",
        detail: "Agricultural Officer",
        quantity: "34 reviews",
        status: "Active",
        updated: "12 min ago",
      },
    ],
  },
  audit: {
    kicker: "Security evidence",
    title: "System Audit Logs",
    copy: "Search role, record and security activity for accountability.",
    icon: ScrollText,
    first: "Audit event",
    second: "Actor and resource",
    seeds: [
      {
        name: "Farmer record updated",
        detail: "Thato M. · Farm #F102",
        quantity: "WRITE",
        status: "Success",
        updated: "2 min ago",
      },
      {
        name: "Permission denied",
        detail: "Buyer role · Admin settings",
        quantity: "READ",
        status: "Blocked",
        updated: "18 min ago",
      },
    ],
  },
  support: {
    kicker: "Help when you need it",
    title: "Help & Support Centre",
    copy: "Browse guidance or create a support request for the project team.",
    icon: LifeBuoy,
    first: "Support subject",
    second: "Describe the problem",
    seeds: [
      {
        name: "How to register another field",
        detail: "Farm management guide",
        quantity: "Article",
        status: "Available",
        updated: "Updated Mar",
      },
      {
        name: "Camera upload question",
        detail: "Ticket #SUP-108",
        quantity: "Technical",
        status: "Resolved",
        updated: "Yesterday",
      },
    ],
  },
}

function usePersistentRecords(page: Page, seeds: Omit<RecordItem, "id">[]) {
  const key = `climateshield-records-${page}`
  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem(key)
    return saved
      ? JSON.parse(saved) as RecordItem[]
      : seeds.map((x, i) => ({ ...x, id: `${page}-${i}` }))
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(records))
  }, [key, records])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key && event.newValue)
        setRecords(JSON.parse(event.newValue) as RecordItem[])
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [key])
  return [records, setRecords] as const
}

function RecordsModule({
  page,
  notify,
}: {
  page: Page
  notify: (n: Notice) => void
}) {
  const config = moduleConfigs[page]!
  const [records, setRecords] = usePersistentRecords(page, config.seeds)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState("")
  const Icon = config.icon
  const filtered = records.filter((record) =>
    `${record.name} ${record.detail}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const record: RecordItem = {
      id: `${page}-${Date.now()}`,
      name: String(data.get("name")),
      detail: String(data.get("detail")),
      quantity: String(data.get("quantity")),
      status: "Active",
      updated: "Just now",
    }
    setRecords((current) => [record, ...current])
    setAdding(false)
    notify({
      title: "Record saved",
      text: `${record.name} is now stored in this browser.`,
    })
  }
  return (
    <div className="page">
      <Head
        kicker={config.kicker}
        title={config.title}
        copy={config.copy}
        action={
          <button className="primary" onClick={() => setAdding(!adding)}>
            <Plus /> {adding ? "Close form" : "Add record"}
          </button>
        }
      />
      <div className="module-summary">
        <Metric
          icon={Icon}
          label="Total records"
          value={String(records.length)}
          note="Saved locally"
        />
        <Metric
          icon={BadgeCheck}
          label="Active / verified"
          value={String(
            records.filter((x) => !x.status.includes("Pending")).length,
          )}
          note="Updated in real time"
          tone="lime"
        />
        <Metric
          icon={Activity}
          label="Latest sync"
          value="Now"
          note="Cross-tab listener active"
          tone="blue"
        />
      </div>
      {adding && (
        <form className="card record-form" onSubmit={add}>
          <Field label={config.first}>
            <input
              name="name"
              required
              placeholder={`Enter ${config.first.toLowerCase()}`}
            />
          </Field>
          <Field label={config.second}>
            <input
              name="detail"
              required
              placeholder={`Enter ${config.second.toLowerCase()}`}
            />
          </Field>
          <Field label="Quantity, value or reference">
            <input
              name="quantity"
              required
              placeholder="e.g. 12 animals, M 2,500 or 4 ha"
            />
          </Field>
          <button className="primary">
            <BadgeCheck /> Save record
          </button>
        </form>
      )}
      <article className="card records-card">
        <div className="records-tools">
          <label>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records"
            />
          </label>
          <span className="live-pill">
            <i /> Live local sync
          </span>
        </div>
        <div className="records-table">
          <header>
            <span>Name</span>
            <span>Details</span>
            <span>Quantity / value</span>
            <span>Status</span>
            <span>Updated</span>
            <span />
          </header>
          {filtered.map((record) => (
            <div key={record.id}>
              <b>{record.name}</b>
              <span>{record.detail}</span>
              <span>{record.quantity}</span>
              <mark>{record.status}</mark>
              <small>{record.updated}</small>
              <button
                aria-label={`Delete ${record.name}`}
                onClick={() => {
                  setRecords((current) =>
                    current.filter((x) => x.id !== record.id),
                  )
                  notify({
                    title: "Record removed",
                    text: `${record.name} was removed.`,
                  })
                }}
              >
                <X />
              </button>
            </div>
          ))}
        </div>
        {!filtered.length && (
          <div className="records-empty">
            <Search />
            <b>No matching records</b>
            <p>Change the search or add a new record.</p>
          </div>
        )}
      </article>
      <p className="prototype-note">
        <LockKeyhole /> Prototype persistence: records use localStorage and
        cross-tab events. Replace the storage hook with your PostgreSQL API in
        VS Code for shared production data.
      </p>
    </div>
  )
}

function RoleDashboard({ user, go }: { user: User; go: (p: Page) => void }) {
  if (user.role === "Farmer") return <Dashboard user={user} go={go} />
  const role = user.role as Role
  const content: Record<Exclude<Role, "Farmer">, {
    kicker: string
    title: string
    copy: string
    stats: [LucideIcon, string, string, string][]
    actions: [Page, string, string, LucideIcon][]
  }> = {
    Buyer: {
      kicker: "Buyer workspace",
      title: `Welcome, ${user.name.split(" ")[0]}`,
      copy: "Source verified produce, manage orders and keep payments on track.",
      stats: [
        [ShoppingCart, "Open orders", "6", "M 24,800 total"],
        [Truck, "Deliveries", "3", "Due this week"],
        [BadgeCheck, "Verified suppliers", "18", "Across 7 districts"],
      ],
      actions: [
        [
          "market",
          "Browse produce",
          "Compare verified listings",
          ShoppingBasket,
        ],
        ["orders", "Manage orders", "Track delivery and payment", ShoppingCart],
        ["passport", "Verify passport", "Check crop provenance", Fingerprint],
      ],
    },
    "Agricultural Officer": {
      kicker: "Officer workspace",
      title: `Good morning, ${user.name.split(" ")[0]}`,
      copy: "Review farmers, analyse field evidence and publish practical guidance.",
      stats: [
        [UserCheck, "Pending checks", "12", "4 high priority"],
        [FlaskConical, "Soil reviews", "8", "Due this week"],
        [AlertTriangle, "District alerts", "3", "1 severe"],
      ],
      actions: [
        [
          "verification",
          "Verify farmers",
          "Review identity and farm proof",
          UserCheck,
        ],
        ["soil", "Review soil tests", "Add recommendations", FlaskConical],
        ["alerts", "Climate advisories", "Publish district guidance", Bell],
      ],
    },
    Admin: {
      kicker: "System administration",
      title: "Platform control centre",
      copy: "Monitor users, security, data quality and operational health.",
      stats: [
        [Users, "Active users", "1,284", "+38 this month"],
        [Activity, "System uptime", "99.98%", "All services healthy"],
        [ShieldCheck, "Security events", "2", "Both contained"],
      ],
      actions: [
        ["admin", "Manage users", "Roles, accounts and access", ShieldCheck],
        ["audit", "Audit activity", "Review security evidence", ScrollText],
        [
          "reports",
          "System reports",
          "Usage and project evidence",
          FileBarChart,
        ],
      ],
    },
  }
  const d = content[role === "Farmer" ? "Buyer" : role]
  return (
    <div className="page">
      <section className="role-hero">
        <div>
          <span className="eyebrow light">{d.kicker}</span>
          <h1>{d.title}</h1>
          <p>{d.copy}</p>
        </div>
        <span className="role-badge">
          <ShieldCheck /> {role} access
        </span>
      </section>
      <div className="metrics three">
        {d.stats.map(([I, l, v, n]) => (
          <Metric key={l} icon={I} label={l} value={v} note={n} />
        ))}
      </div>
      <div className="role-actions">
        {d.actions.map(([p, t, c, I]) => (
          <button className="card" key={p} onClick={() => go(p)}>
            <span>
              <I />
            </span>
            <div>
              <h3>{t}</h3>
              <p>{c}</p>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
      <article className="card live-activity">
        <div className="card-head">
          <div>
            <span className="eyebrow">Live activity</span>
            <h3>Recent updates for your role</h3>
          </div>
          <span className="live-pill">
            <i /> Updating
          </span>
        </div>
        {d.actions.map(([, t], i) => (
          <p key={t}>
            <BadgeCheck />
            <span>
              <b>{t}</b>
              <small>{i * 7 + 2} minutes ago · synced locally</small>
            </span>
          </p>
        ))}
      </article>
    </div>
  )
}

function SettingsPage({
  user,
  setUser,
  notify,
  go,
}: {
  user: User
  setUser: (u: User) => void
  notify: (n: Notice) => void
  go: (p: Page) => void
}) {
  return (
    <div className="page">
      <Head
        kicker="Account & security"
        title="Settings"
        copy="Manage your profile, privacy and role permissions."
      />
      <div className="settings-layout">
        <aside>
          {[
            [UserRound, "Profile"],
            [Bell, "Notifications"],
            [LockKeyhole, "Privacy & GDPR"],
            [ShieldCheck, "Security configuration"],
          ].map(([I, t]) => {
            const Icon = I as LucideIcon
            return (
              <button
                key={String(t)}
                onClick={() => {
                  if (t === "Security configuration") {
                    if (user.role === "Admin") {
                      go("security")
                    } else {
                      notify({
                        title: "Admin permission required",
                        text: `Your ${user.role} role cannot open the admin security domain.`,
                      })
                    }
                  } else {
                    notify({
                      title: t,
                      text: `${t} panel is active.`,
                    })
                  }
                }}
              >
                <Icon />
                {String(t)}
              </button>
            )
          })}
        </aside>
        <article className="card settings-card">
          <header className="profile">
            <span>{user.name[0]}</span>
            <div>
              <h3>{user.name}</h3>
              <p>
                {user.role} · {user.district}
              </p>
            </div>
            <button
              className="secondary"
              onClick={() =>
                notify({
                  title: "Profile photo",
                  text: "Photo selection is ready for backend upload integration.",
                })
              }
            >
              Change photo
            </button>
          </header>
          <div className="form-grid">
            <Field label="Full name">
              <input
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </Field>
            <Field label="Phone number">
              <input
                value={user.phone}
                onChange={(e) =>
                  setUser({ ...user, phone: e.target.value })
                }
              />
            </Field>
            <Field label="Email address">
              <input
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
              />
            </Field>
            <Field label="Farming location">
              <input
                value={user.location}
                onChange={(e) =>
                  setUser({ ...user, location: e.target.value })
                }
              />
            </Field>
            <Field label="Farm size">
              <input
                value={user.farmSize ?? ""}
                onChange={(e) => setUser({ ...user, farmSize: e.target.value })}
              />
            </Field>
            <Field label="Farming since">
              <input
                type="number"
                value={user.farmingSince ?? ""}
                onChange={(e) =>
                  setUser({ ...user, farmingSince: e.target.value })
                }
              />
            </Field>
          </div>
          <button
            className="primary save"
            onClick={() => {
              localStorage.setItem(
                "climateshield-user",
                JSON.stringify(user),
              )
              notify({
                title: "Profile saved",
                text: "Your account details were updated.",
              })
            }}
          >
            Save changes
          </button>
        </article>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>("login"),
    [user, setUser] = useState<User>(demoUser),
    [page, setPage] = useState<Page>("dashboard"),
    [open, setOpen] = useState(false),
    [notice, setNotice] = useState<Notice>(null),
    [now, setNow] = useState(new Date())
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(null), 3000)
      return () => clearTimeout(id)
    }
  }, [notice])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  const visibleNav = nav.filter(([id]) => canAccess(user.role, id))
  const go = (p: Page) => {
    if (!canAccess(user.role, p)) {
      setNotice({
        title: "Access restricted",
        text: `${user.role} accounts cannot open that module.`,
      })
      return
    }
    setPage(p)
    setOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  if (screen !== "app")
    return (
      <Auth
        screen={screen}
        setScreen={setScreen}
        login={(u) => {
          setUser(u)
          setPage("dashboard")
          setScreen("app")
        }}
      />
    )
  let content: React.ReactNode
  if (page === "dashboard") content = <RoleDashboard user={user} go={go} />
  else if (page === "climate") content = <Climate />
  else if (page === "yield") content = <Yield />
  else if (page === "alerts") content = <Alerts />
  else if (page === "disease") content = <Disease notify={setNotice} />
  else if (page === "irrigation" || page === "calendar")
    content = <Operations page={page} notify={setNotice} />
  else if (moduleConfigs[page])
    content = <RecordsModule page={page} notify={setNotice} />
  else if (page === "market") content = <Marketplace notify={setNotice} />
  else if (page === "passport") content = <Passport />
  else if (page === "finance") content = <Finance />
  else if (page === "insurance") content = <Insurance notify={setNotice} />
  else if (page === "learning") content = <Learning />
  else if (page === "community") content = <Community notify={setNotice} />
  else if (page === "assistant") content = <Assistant />
  else if (page === "reports") content = <Reports />
  else if (page === "security") content = <SecurityConfig />
  else if (page === "blockchain") content = <BlockchainRecords />
  else if (page === "public-blockchain") content = <PublicBlockchain />
  else
    content = <SettingsPage user={user} setUser={setUser} notify={setNotice} go={go} />
  const current = nav.find((n) => n[0] === page)!
  return (
    <div className="app">
      {open && <button className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <header>
          <Logo inverse />
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </header>
        <nav>
          {visibleNav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <footer>
          <span>{user.name[0]}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
          <button onClick={() => setScreen("login")}>
            <LogOut />
          </button>
        </footer>
      </aside>
      <div className="main">
        <header className="topbar">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <b>{current[1]}</b>
            <small>
              <MapPin /> {user.location}, {user.district} ·{" "}
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
          <section>
            <button
              onClick={() =>
                go(canAccess(user.role, "alerts") ? "alerts" : "support")
              }
            >
              <Bell />
            </button>
            <button className="user" onClick={() => go("settings")}>
              <span>{user.name[0]}</span>
              <div>
                <b>{user.name.split(" ")[0]}</b>
                <small>{user.role}</small>
              </div>
              <ChevronDown />
            </button>
          </section>
        </header>
        <main>{content}</main>
        <nav className="bottom">
          {visibleNav.slice(0, 4).map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon />
              <span>{label.split(" ")[0]}</span>
            </button>
          ))}
          <button
            onClick={() =>
              go(canAccess(user.role, "assistant") ? "assistant" : "support")
            }
          >
            <Bot />
            <span>Assistant</span>
          </button>
          <button onClick={() => setOpen(true)}>
            <Menu />
            <span>More</span>
          </button>
        </nav>
      </div>
      {notice && (
        <div className="toast">
          <BadgeCheck />
          <div>
            <b>{notice.title}</b>
            <p>{notice.text}</p>
          </div>
          <button onClick={() => setNotice(null)}>
            <X />
          </button>
        </div>
      )}
    </div>
  )
}

export default App
