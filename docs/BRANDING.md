# Velist Brand Guidelines

> Features-first fullstack framework.

---

## 1. Etimologi Nama

**Velist** = **Velocity** + **List**

> Kumpulan tools berkecepatan tinggi untuk membangun aplikasi modern.

### Cara Pengucapan
- **Phonetic**: /ˈveɪ.lɪst/
- **Suku kata**: Ve-list

### Detail Etimologi

| Bagian | Arti | Signifikansi |
|--------|------|--------------|
| **Ve** | **Velocity** | Kecepatan — powered by Bun runtime |
| **li** | **Li**st / **Li**near | Organisasi kode yang terstruktur & predictable |
| **st** | **S**velte + **T**ypeScript | Teknologi utama yang membentuk fondasi |

### Secondary Meaning
**Ve** juga merepresentasikan **Vertical** slicing architecture — core philosophy framework ini.

---

## 2. Core Values (Nilai Inti)

```
╔═══════════════════════════════════════════╗
║  V — Vertical (Slice over Layer)          ║
║  E — Expressive (Type-safe by default)    ║
║  L — Lean (Minimal abstraction)           ║
║  I — Intuitive (Developer experience)     ║
║  S — Swift (Bun-powered speed)            ║
║  T — TypeScript (End-to-end types)        ║
╚═══════════════════════════════════════════╝
```

### Prinsip Fundamental
1. **Features First, Boilerplate Never** — Kode dimulai dari fitur, bukan dari template berlapis
2. **One Folder, One Feature** — Setiap fitur mandiri dan lengkap
3. **Inline by Design** — Tailwind langsung di komponen, tanpa abstraksi tidak perlu
4. **Type Safety End-to-End** — Dari database schema sampai UI props

---

## 3. Brand Persona

### Karakter Brand
| Aspek | Deskripsi |
|-------|-----------|
| **Kepribadian** | Praktis, percaya diri, welcoming |
| **Suara** | Jelas, tidak bertele-tele, profesional tapi santai |
| **Sikap** | "Ini cara yang benar" tanpa merendahkan |
| **Energi** | Cepat, modern, efisien |

### Tone of Voice

**✅ Do:**
- "Build features, not folder structures"
- "Type-safe from day one"
- "Everything you need, nothing you don't"

**❌ Don't:**
- "Revolutionary paradigm-shifting framework" (terlalu marketing)
- "You must use this pattern" (terlalu memaksa)
- "The best framework ever" (terlalu klaim)

---

## 4. Visual Identity

### Color Palette

Velist menggunakan palet warna yang mencerminkan **struktur vertikal** dan **kecepatan runtime**. Kombinasi unik ini membedakan dari boilerplate/framework lain.

| Token | Hex | RGB | Makna |
|-------|-----|-----|-------|
| **Primary** | `#6366F1` | 99, 102, 241 | **Iris** — Feature layers, struktur, trust |
| **Primary Dark** | `#4F46E5` | 79, 70, 229 | **Deep Indigo** — Hover, depth |
| **Accent** | `#14B8A6` | 20, 184, 166 | **Teal** — Type safety, success states |
| **Energy** | `#F97316` | 249, 115, 22 | **Vivid Orange** — Bun speed, call-to-action |
| **Energy Glow** | `#FDBA74` | 253, 186, 116 | **Soft Orange** — Highlights, badges |
| **Background** | `#0B0F19` | 11, 15, 25 | **Obsidian** — True dark, developer-focused |
| **Surface** | `#151B2B` | 21, 27, 43 | **Deep Slate** — Cards, panels |
| **Surface Elevated** | `#1E2740` | 30, 39, 64 | **Elevated** — Modals, dropdowns |
| **Text Primary** | `#F1F5F9` | 241, 245, 249 | **Off White** — Headings |
| **Text Secondary** | `#94A3B8` | 148, 163, 184 | **Slate** — Body text |
| **Text Muted** | `#64748B` | 100, 116, 139 | **Muted** — Captions, metadata |

### Gradient Patterns

```css
/* Primary Gradient - Hero sections, branding */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #14B8A6 100%);

/* Energy Gradient - CTAs, highlights */
--gradient-energy: linear-gradient(135deg, #F97316 0%, #FDBA74 100%);

/* Dark Surface - Cards, containers */
--gradient-surface: linear-gradient(180deg, #151B2B 0%, #0B0F19 100%);

/* Feature Slice - Vertical representation */
--gradient-slice: linear-gradient(180deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%);
```

### Color Usage Guidelines

| Konteks | Warna | Catatan |
|---------|-------|---------|
| **Logo** | `#6366F1` (Iris) | Primary brand color |
| **Primary Button** | `#6366F1` → `#4F46E5` (hover) | Solid, tidak gradient |
| **CTA Button** | `#F97316` (Energy) | "Get Started", "Install" — warna kontras |
| **Success States** | `#14B8A6` (Teal) | Type check passed, build success |
| **Code Blocks** | `#0B0F19` (Obsidian) | True dark untuk syntax highlighting |
| **Inline Code** | `#14B8A6` background 10% | Teal dengan opacity rendah |
| **Links** | `#6366F1` → `#14B8A6` (hover) | Transition iris ke teal |
| **Borders** | `#1E2740` (Surface Elevated) | Subtle separation |

### Dark Mode Philosophy

Velist menganut **"true dark"** — bukan dark gray, melainkan obsidian yang nyaris hitam. Ini:
- Mengurangi eye strain untuk developer yang lama di layar
- Membuat syntax highlighting lebih pop
- Memberikan feel premium dan developer-centric

### Light Mode (Optional)

| Token | Hex | Usage |
|-------|-----|-------|
| **Background** | `#FAFAFA` | Soft white |
| **Surface** | `#FFFFFF` | Cards |
| **Text Primary** | `#0F172A` | Near black |
| **Primary** | `#4F46E5` | Slightly deeper untuk contrast |

> **Note**: Light mode adalah secondary. Dark mode adalah identitas visual utama Velist.

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| **Headings** | Inter / Geist | 600-700 |
| **Body** | Inter / Geist | 400-500 |
| **Code** | JetBrains Mono / Fira Code | 400 |

### Logo Concepts

```
Concept 1: Vertical Stack (Recommended)
   ┌───┐
   │ V │  ← Feature Layer
   ├───┤
   │ E │  ← API Layer
   ├───┤
   │ L │  ← Data Layer
   └───┘

Concept 2: Geometric V
      /\
     /  \
    │ VL │   ← VELIST in V-shape
    \  /
     \/

Concept 3: Minimal Wordmark
   velist.
   ───────
   lowercase, clean, modern
```

---

## 5. Taglines

### Primary Taglines

| Tagline | Use Case |
|---------|----------|
| **"Features first. Boilerplate never."** | Default, most contexts |
| **"Stack vertically. Ship horizontally."** | Conference, keynote |
| **"Fullstack, sliced right."** | Social media, short form |

### Secondary Taglines

| Tagline | Konteks |
|---------|---------|
| "From feature to production. Fast." | Performance marketing |
| "Where features live together." | Community building |
| "Type-safe from database to UI." | Technical audience |
| "One folder = One feature" | Documentation |

---

## 6. Brand Story (Manifesto)

> Legacy frameworks force you to think in layers—controllers here, models there, views somewhere else. But applications aren't built in layers; they're built in **features**.
>
> Velist inverts the pyramid. Every feature is self-contained, type-safe, and production-ready. No more jumping between folders. No more wondering where to put code. Just build.
>
> Powered by Bun. Typed by TypeScript. Rendered by Svelte. Connected by Inertia. Organized by vertical slices.
>
> **This is how modern teams actually build software.**

---

## 7. Positioning Statement

**For:** Fullstack TypeScript developers yang frustrasi dengan boilerplate berlebihan dan arsitektur yang membingungkan.

**Who need:** Cara cepat membangun aplikasi production-ready tanpa memikirkan struktur folder atau wiring antar layer.

**Velist is:** Feature framework yang menggabungkan Elysia + Inertia + Svelte + Kysely dalam vertical slice architecture.

**That provides:** End-to-end type safety, minimal abstraction, dan developer experience yang intuitif.

**Unlike:** Boilerplate projects yang hanya mengumpulkan teknologi tanpa opini arsitektur.

**We:** Menyediakan filosofi feature-first yang terbukti, lengkap dengan tooling dan pola yang konsisten.

---

## 8. Messaging Guidelines

### Value Propositions

| Audience | Key Message |
|----------|-------------|
| **Solo Developers** | "Bangun MVP dalam hitungan jam, scale tanpa rewrite" |
| **Startup Teams** | "Onboard engineer baru dalam satu folder" |
| **Agencies** | "Duplikasi fitur antar project tanpa copy-paste berantakan" |
| **Enterprise** | "Type safety yang mengurangi bug production" |

### Feature vs. Benefit Mapping

| Feature | Benefit |
|---------|---------|
| Vertical slice architecture | Tidak perlu pindah-pindah folder saat coding |
| End-to-end TypeScript | Bug ketahuan di compile, bukan di production |
| Bun runtime | Dev server nyala dalam <100ms |
| No atomic components | UI lebih cepat tanpa abstraksi tidak perlu |
| Inertia.js | SPA experience tanpa membuat API terpisah |

---

## 9. Communication Style

### Vocabulary Guidelines

| Jangan Katakan | Katakan |
|----------------|---------|
| "Boilerplate" | "Starting point" / "Foundation" |
| "Architecture pattern" | "How features should live" |
| "No components" | "Inline by design" |
| "Fullstack framework" | "Feature framework" |
| "Best practice" | "Recommended pattern" |
| "You should" | "We recommend" / "Consider" |

### Code-First Communication
- Tunjukkan kode nyata, bukan diagram abstrak
- Contoh minimal yang works, bukan teori lengkap
- Error messages yang helpful dan actionable

---

## 10. Digital Presence

### Domain & Handles

| Platform | Handle | Status |
|----------|--------|--------|
| Website | `velist.dev` | ✅ Active |
| GitHub | `github.com/velist-framework/velist` | Repo utama |
| NPM Scope | `@velist/*` | Packages |
| Twitter/X | `@veliststack` | Announcements |
| Discord | `discord.gg/velist` | Community |
| YouTube | `Velist` | Tutorials |

### Content Pillars

```
📦 #FeatureFriday    → Showcase fitur yang dibangun dengan Velist
🧠 #SliceTip        → Tips vertical slicing dan best practices
🔒 #TypeSafe        → TypeScript tips spesifik Velist
⚡ #SpeedRun        → Build sesuatu dalam waktu singkat
🛠️ #UnderTheHood   → Deep dive teknis
```

---

## 11. Documentation Voice

### Opening Line (README.md)

```markdown
# Velist

**Features-first fullstack framework.**

Velist is not another boilerplate. It's a philosophy:
- One folder = One complete feature
- Type safety from database to UI
- Zero abstraction overhead
- Built for Bun, designed for speed.

Start building features, not folder structures.
```

### Documentation Principles
1. **Show, don't tell** — Contoh kode > penjelasan panjang
2. **Progressive disclosure** — Quick start dulu, detail kemudian
3. **Opinionated defaults** — Rekomendasikan satu cara, explain alternatif
4. **Real-world examples** — Invoices, auth, dashboard (bukan foo/bar)

---

## 12. Launch Strategy (Optional)

### Platforms

| Platform | Approach |
|----------|----------|
| **Product Hunt** | Emphasize "feature framework" differentiation |
| **Hacker News** | Technical deep dive on vertical slicing + Bun |
| **Reddit (r/sveltejs)** | Show Svelte 5 runes integration |
| **Dev.to / Hashnode** | Tutorial series: "Building X with Velist" |

### Launch Tagline
> "Meet Velist — the first framework that organizes code by features, not layers. Built on Bun + Svelte 5 + Elysia. Type-safe end-to-end."

---

## Appendix: Quick Reference

### One-Liner
> Velist is a features-first fullstack framework combining Elysia, Inertia, Svelte, and Kysely with vertical slice architecture.

### Elevator Pitch (30 detik)
> "Velist solves the 'where should I put this code' problem. Instead of organizing by technical layers—controllers, models, views—you organize by features. Each feature is a self-contained folder with its own API, business logic, database queries, and UI components. Everything is type-safe from database to browser. And because it runs on Bun, it's blazing fast."

### Three Words
> **Vertical. Typed. Fast.**

---

*Last updated: 2026-02-17*
*Version: 1.0*
