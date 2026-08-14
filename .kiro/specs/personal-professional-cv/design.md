# Design Document: Personal Professional CV

## Overview

This feature renders a personal professional CV from a single JSON data source (`cv.json`) into a semantic HTML page styled with CSS. The renderer is a static, client-side application that fetches the JSON at page load, builds the DOM dynamically, and applies both screen and print stylesheets. No build tool or server-side framework is required — the project runs from a local file server or any static host.

Key design goals:
- **ATS compatibility**: Single-column layout using semantic HTML (`<header>`, `<section>`, `<article>`, `<h1>`–`<h3>`, `<ul>`, `<p>`)
- **PDF export**: `@media print` rules that fit A4, suppress chrome, and avoid page-break mid-entry
- **Content separation**: Zero hardcoded personal data in HTML/JS; everything flows from `cv.json`
- **Maintainability**: Editing the JSON and refreshing the browser is the only update workflow

---

## Architecture

```mermaid
graph TD
    A[cv.json] -->|fetch| B[renderer.js]
    B -->|DOM manipulation| C[index.html]
    D[styles.css] -->|link, all media| C
    E[print.css] -->|link media=print, after styles.css, overrides| C
    F[assets/photo-placeholder.png] -->|img src| C
```

### Runtime Flow

1. Browser loads `index.html`, which links `styles.css` for ALL media (no `media` attribute), then links `print.css` with `media="print"` after it so its rules override the base stylesheet when printing, and defers `renderer.js`. Print therefore applies the base stylesheet plus compact print overrides.
2. `renderer.js` fetches `cv.json` via the Fetch API.
3. On success, the renderer parses JSON and calls section-specific builder functions.
4. Each builder creates semantic HTML elements and appends them to a root `<main>` container.
5. On JSON parse error or fetch failure, the renderer displays an error banner instead of partial content.

### Dev Workflow

A lightweight local server (e.g., VS Code Live Server, `npx serve`, or Python `http.server`) serves the files. Editing `cv.json` and refreshing the page shows updates immediately — no build step is needed.

---

## Components and Interfaces

### File Structure

```
cv/
├── index.html              # Shell document with <main id="cv-root">
├── styles.css              # Base layout, typography, colours (linked for all media)
├── print.css               # Compact print overrides (linked with media="print" after styles.css)
├── renderer.js             # Fetch + DOM builder logic
├── cv.json                 # Content model (sole data source)
└── assets/
    └── photo-placeholder.png   # Fallback profile image (200×240 px)
```

### index.html

Minimal shell containing:
- `<meta charset="UTF-8">` and viewport meta
- `<link>` to `styles.css` for all media (no `media` attribute), followed by `<link>` to `print.css` with `media="print"` so it overrides the base stylesheet when printing
- `<main id="cv-root"></main>` — empty container populated by JS
- `<div id="error-banner" hidden></div>` — shown on load failure
- `<script src="renderer.js" defer></script>`

No personal data appears in the HTML source.

### renderer.js — Module API

```
┌─────────────────────────────────────────────────┐
│  renderer.js                                     │
├─────────────────────────────────────────────────┤
│  main()                                          │
│    → resolveCvPath(search: string): string       │
│    → fetchCV(url: string): Promise<CVData>       │
│    → validateCV(data: object): ValidationResult  │
│    → renderCV(data: CVData, root: HTMLElement)    │
├─────────────────────────────────────────────────┤
│  Section Builders (all return HTMLElement)        │
│    buildHeader(header: Header): HTMLElement       │
│    buildSummary(text: string): HTMLElement        │
│    buildWorkExperience(entries: Work[]): HTML     │
│    buildEducation(entries: Edu[]): HTMLElement    │
│    buildTechnicalSkills(cats: Skill[]): HTML      │
│    buildProjects(entries: Project[]): HTMLElement │
│    buildCertifications(entries: Cert[]): HTML     │
│    buildLanguages(entries: Lang[]): HTMLElement   │
│    buildAchievements(entries: Ach[]): HTMLElement │
│    buildReferences(refs: References): HTMLElement │
├─────────────────────────────────────────────────┤
│  Helpers                                         │
│    createElement(tag, attrs, children): Element   │
│    formatDate(dateStr): string                   │
│    wordCount(text): number                       │
│    showError(message): void                      │
└─────────────────────────────────────────────────┘
```

### styles.css — Key Responsibilities

| Concern | Approach |
|---------|----------|
| Layout | Single-column, max-width 210mm (A4), centered |
| Typography | `Inter` (sans-serif) at 11pt base, scale: h1 24pt, h2 16pt, h3 13pt |
| Colour scheme | Dark charcoal text `#2d2d2d` on white `#ffffff`; accent `#1a5276` for headings and links |
| Spacing | 1.5rem between sections, 0.75rem between entries |
| Photo positioning | Flex-start within header; rectangular, object-fit cover; positioned left of the vertical info stack |
| Header layout | Horizontal flex: photo left, vertical stack right (name → title → contact items each on own line with SVG icon) |
| Contact icons | Inline SVG icons (16×16) for phone, email, location, LinkedIn, GitHub, website (globe) |
| Skills | Inline styled tags with border and padding |
| Validation indicators | Orange dashed border + warning icon for missing/invalid fields |

### print.css — Key Responsibilities

| Concern | Approach |
|---------|----------|
| Page size | `@page { size: A4; margin: 15mm; }` |
| Colour | Remove background colours; keep text colour |
| Links | `a[href]::after { content: " (" attr(href) ")"; }` to reveal URLs |
| Page breaks | `break-inside: avoid` on `.work-entry`, `.edu-entry` |
| Hidden elements | Hide error banner, profile photo, any interactive controls |
| Page limit | Rely on compact spacing; `orphans: 2; widows: 2` for text flow |
| Compact print typography | Set `html` font-size to 10pt; remove the `#cv-root` screen padding and `max-width`; reduce heading sizes and section/entry spacing so the CV fits in 2 A4 pages |

---

## Data Models

### CVData (TypeScript-style interface for documentation)

```typescript
interface CVData {
  header: Header;
  professionalSummary: string;
  workExperience: WorkEntry[];
  education: EducationEntry[];
  technicalSkills: SkillCategory[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  achievements: AchievementEntry[];
  references: References;
}

interface Header {
  fullName: string;
  title: string;           // target role title, max 100 chars, non-empty in shipped cv.json
  email: string;
  phone?: string;          // optional; "+" followed by 8-15 digits, single spaces allowed (e.g. +44 7700 900 412). Empty/absent → phone line and icon omitted
  city: string;
  country: string;
  linkedIn?: string;       // URL
  github?: string;         // URL
  website?: string;        // URL
  photo: string;           // relative path to PNG
}

interface WorkEntry {
  jobTitle: string;
  company: string;
  startDate: string;       // "YYYY-MM" or "Month YYYY"
  endDate: string | null;  // null → "Present"
  location: string;        // "City, Country" or "Remote"
  bullets: string[];       // 3–6 items
}

interface EducationEntry {
  degree: string;
  institution: string;
  graduationYear: number | null;  // null → "In Progress"
  fieldOfStudy?: string;
  grade?: string;
  description?: string;    // max 150 chars
}

interface SkillCategory {
  category: string;
  skills: string[];        // at least 1; empty → omit category
  obsoleteSkills?: string[]; // rendered after active skills in smaller/muted style
}

interface ProjectEntry {
  name: string;
  description: string;     // 1–3 sentences
  technologies: string[];
  url?: string;
  type: "personal" | "professional";
}

interface CertificationEntry {
  name: string;
  issuer: string;
  year: number;
  expiryYear?: number | null;
  credentialId?: string;
  verificationUrl?: string;
}

interface LanguageEntry {
  name: string;
  proficiency: "Native" | "C2" | "C1" | "B2" | "B1" | "A2" | "A1"
             | "Fluent" | "Conversational" | "Basic";
}

interface AchievementEntry {
  name: string;
  organisation: string;
  year: number;
  impact?: string;
}

interface References {
  mode: "available-upon-request" | "listed";
  entries: ReferenceEntry[];
}

interface ReferenceEntry {
  name: string;
  title: string;
  company: string;
  contact: string;  // email or phone
}

interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
}

interface ValidationWarning {
  section: string;
  field: string;
  message: string;
}
```

### Validation Rules (enforced at render time)

| Rule | Condition | Visual Indicator |
|------|-----------|-----------------|
| Missing required header field | `fullName` or `email` is empty | Orange placeholder text |
| Phone empty or absent | `phone` is empty/undefined | None: phone line and icon omitted entirely (no placeholder, no warning) |
| Summary too long | Word count > 100 | Warning border on summary section |
| Bullet count out of range | `bullets.length < 3 \|\| > 6` | Warning border on work entry |
| Missing dates | `startDate` is empty | Warning icon beside dates |
| Empty skill category | `skills.length === 0` | Category omitted from render |
| Expired certification | `expiryYear < currentYear` | Greyed-out styling + "Expired" label |
| Photo missing | Image fails to load | Swap `src` to `assets/photo-placeholder.png` |
| All project names empty | Every entry has `name === ""` | Projects section omitted entirely |
| All certification names empty | Every entry has `name === ""` | Certifications section omitted entirely |
| All achievement names empty | Every entry has `name === ""` | Achievements section omitted entirely |
| All reference names empty (listed mode) | Every entry has `name === ""` | References section omitted entirely |
| References mode and entries empty | `mode === ""` and `entries.length === 0` | References section omitted entirely |

---


## Content Authoring Guidelines

These rules come from Requirement 17. They guide whoever edits `cv.json`. The Renderer does NOT enforce them.

- The summary's first sentence leads with the role title and 1 to 5 primary technologies; max 600 characters and 4 sentences.
- No total years of experience (numeric or written out) and no generic filler ("team player", "passionate developer").
- No employer or internal product names in the summary or bullets; the employer appears only in the entry's `company` field.
- Work bullets follow result, then metric, then context (max 200 characters each). The first bullet carries a concrete number when one is known.
- Metrics must be substantiable from the developer's own records; no invented or inflated values.
- Omit entries that ended over 15 years ago, or condense them to one line (title, company, dates).
- Omit obsolete technologies such as MFC and WinForms from skills.
- Skills are plain text labels: no meters, charts, stars, percentages or rating bars.
- The top of the CV (title, headline technologies, summary) stays single-column.
- The header title does not mention AI coding assistants; the summary may mention them in one clause of at most 15 words.

Per-application tailored Content_Model files derived from the base `cv.json` are loaded through the `cv` query parameter (see "Application-Specific Content Variants" below).

---

## Application-Specific Content Variants

This section covers Requirement 18. A tailored CV can be shown by opening `index.html?cv=variants/acme.json`. The base `cv.json` is not changed and employer-specific content stays out of the public repository.

### Path resolution

`renderer.js` exposes a pure function:

```
resolveCvPath(search: string): string
```

- `search` is a query string such as `location.search` (e.g. `?cv=variants/acme.json`).
- The function reads the `cv` parameter with `URLSearchParams`.
- It returns the value only when it matches `^variants/[A-Za-z0-9._/-]+\.json$` AND contains no `..` segment.
- In every other case (parameter absent, empty, or invalid) it returns the default `cv.json`.

The allow-list regex already excludes backslashes, colons (so no protocol), and a leading slash. The explicit `..` check covers the dots the regex permits.

```mermaid
flowchart TD
    A[location.search] --> B[resolveCvPath]
    B -->|valid variants/*.json, no ..| C[variant path]
    B -->|absent or invalid| D[cv.json]
    C --> E[fetchCV]
    D --> E
    E -->|ok| F[renderCV]
    E -->|fail or parse error| G[error banner]
```

### Runtime behaviour

- `main()` calls `fetchCV(resolveCvPath(location.search))`.
- If a valid variant path cannot be fetched or parsed, `main()` shows the existing error banner. It does NOT retry with `cv.json`, so a missing variant is never mistaken for the base CV.
- An invalid `cv` value is ignored and `cv.json` loads normally (no banner).

### Variant files and version control

- `.gitignore` contains `variants/`, so tailored files are not published.
- Each variant is a complete Content_Model document using the same schema as `cv.json`. The Renderer does not merge it with the base file.

### Print footer

The print-only live-website footer is built from the default site URL constant, not from `location`. It therefore never includes the `cv` query parameter, even when a variant is loaded.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Section ordering is correct and complete

*For any* valid CVData object (with any combination of optional sections present or absent), the rendered DOM sections SHALL appear in the order: Header → Professional Summary → Work Experience → Technical Skills → Education → Projects → Certifications → Languages → Achievements (if present) → References (if present) → Driver's Licence (if present, always last). All section headings SHALL use standard recognised labels.

**Validates: Requirements 1.1, 1.2, 1.9, 1.10, 13.4**

### Property 2: Date-ordered sections maintain reverse chronological order

*For any* array of entries in Work Experience, Education, Certifications, or Achievements with varying dates/years, the rendered order SHALL be reverse chronological (most recent first).

**Validates: Requirements 4.1, 5.1, 8.4, 10.3**

### Property 3: All required fields of every entry type are rendered

*For any* entry in any section (work experience, education, project, certification, language, achievement, or reference), every required field defined in the data model SHALL appear as text content in the rendered HTML element for that entry.

**Validates: Requirements 4.2, 5.2, 7.2, 8.1, 9.1, 10.1, 11.1**

### Property 4: Hyperlinks match source URLs exactly

*For any* URL field present in the CVData (email as mailto, LinkedIn, GitHub, website, project URL, verification URL), the rendered anchor element's `href` attribute SHALL equal the source value exactly (with `mailto:` prefix for email).

**Validates: Requirements 2.3, 2.6, 2.7, 2.8, 7.3, 8.3**

### Property 5: Null dates render as substitution text

*For any* Work Experience entry where `endDate` is null, the rendered output SHALL display "Present". *For any* Education entry where `graduationYear` is null, the rendered output SHALL display "In Progress".

**Validates: Requirements 4.5, 5.5**

### Property 6: Validation warnings appear for invalid data

*For any* CVData where a required header field (fullName, email) is empty, OR a work entry has an empty startDate, OR a work entry has fewer than 3 or more than 6 bullet points, OR the professional summary exceeds 100 words, the renderer SHALL apply a visible validation indicator (CSS warning class) to the affected element.

**Validates: Requirements 2.10, 3.5, 4.3, 4.6, 4.7**

### Property 7: Empty skill categories are omitted from output

*For any* SkillCategory where the `skills` array is empty, the renderer SHALL NOT produce any DOM element for that category.

**Validates: Requirements 6.6**

### Property 8: Expired certifications are visually distinguished

*For any* CertificationEntry where `expiryYear` is non-null and less than the current year, the rendered element SHALL have a distinct visual style (e.g., "expired" CSS class) differentiating it from active certifications.

**Validates: Requirements 8.5**

### Property 9: Photo fallback on load failure

*For any* Header where the `photo` path references a file that fails to load, the rendered `<img>` element SHALL have its `src` attribute set to `assets/photo-placeholder.png`.

**Validates: Requirements 2.13**

### Property 10: Semantic HTML structure without tables

*For any* valid CVData, the rendered output SHALL use semantic elements (`<header>`, `<section>`, `<article>`, `<h1>`–`<h3>`, `<ul>`, `<p>`) for structure and SHALL NOT contain `<table>` elements or CSS multi-column layout properties on content sections.

**Validates: Requirements 13.1, 13.2**

### Property 11: Content round-trip fidelity

*For any* valid CVData object, every text value in the data model (names, titles, descriptions, skill names, etc.) SHALL appear verbatim in the rendered HTML text content of the corresponding section.

**Validates: Requirements 15.3**

### Property 12: Malformed JSON produces error display

*For any* string that is not valid JSON, the renderer SHALL display an error banner and SHALL NOT render any CV section content.

**Validates: Requirements 15.5**

### Property 13: References mode determines rendering

*For any* References object, WHEN `mode` is "available-upon-request" the renderer SHALL display the text "Available upon request" and SHALL NOT render individual entries. WHEN `mode` is "listed" the renderer SHALL render each entry with name, title, company, and contact.

**Validates: Requirements 11.2**

### Property 14: Native language listed first

*For any* languages array containing an entry with proficiency "Native", that entry SHALL be rendered first in the languages section regardless of its position in the source array.

**Validates: Requirements 9.2**

### Property 15: Empty phone omits the phone line entirely

*For any* CVData whose `header.phone` is empty or absent, the rendered header SHALL contain no phone line, no phone icon, and no placeholder text or validation warning for the phone, and all other header items SHALL still render.

**Validates: Requirements 2.4, 2.16**

### Property 16: Resolved CV path is always safe

*For any* string passed as the search input, `resolveCvPath` SHALL return either `cv.json` or a path that starts with `variants/`, ends with `.json`, and contains no `..`, no backslash, no colon, and no leading slash.

**Validates: Requirements 18.1, 18.2**

---

## Error Handling

### JSON Fetch Errors

| Scenario | Behaviour |
|----------|-----------|
| Network error / file not found | Display error banner: "Unable to load CV data. Check that cv.json exists and the page is served over HTTP." |
| HTTP 4xx/5xx | Display error banner with status code |
| JSON parse error | Display error banner: "cv.json contains invalid JSON. Please fix syntax errors." |
| Valid variant path fails to fetch or parse | Display the same error banner naming the variant file; no fallback to `cv.json` |
| Empty response | Display error banner: "cv.json is empty." |

### Data Validation Errors (non-fatal)

These do NOT block rendering — the CV renders with visual indicators:

| Scenario | Indicator |
|----------|-----------|
| Missing `fullName` or `email` | Orange placeholder text in header (e.g., "[Full Name Required]"); remaining header items still render |
| Missing or empty `phone` | Phone line and icon omitted; no placeholder, no warning |
| Work entry missing `startDate` | Orange warning icon beside date range |
| Work entry with <3 or >6 bullets | Orange dashed border around entry |
| Professional summary >100 words | Orange dashed border around summary |
| Photo fails to load | `onerror` handler swaps to placeholder PNG |
| Expired certification | Grey text + "Expired" badge |

### Image Load Error

The profile `<img>` element uses an `onerror` handler:
```javascript
imgElement.onerror = () => {
  imgElement.src = 'assets/photo-placeholder.png';
  imgElement.onerror = null; // prevent infinite loop
};
```

---

## Testing Strategy

### Unit Tests (example-based)

Framework: Any lightweight test runner (e.g., Vitest or Jest with jsdom).

| Test Area | Examples |
|-----------|----------|
| `wordCount()` helper | "hello world" → 2, empty string → 0, extra spaces → correct count |
| `formatDate()` helper | "2023-01" → "Jan 2023", null → "Present" |
| CSS contrast ratio | Verify `#2d2d2d` on `#ffffff` ≥ 4.5:1 |
| `@page` rule | A4 size and 15mm margins present |
| `break-inside: avoid` | Applied to work and education entry classes |
| Photo CSS | No `border-radius: 50%`; position rules match spec |
| `a[href]::after` print rule | Present in print.css |
| index.html has no hardcoded data | Source contains no name/email/phone literals |
| Variant load failure | Mock `fetch` to fail for `?cv=variants/x.json`: error banner shown, `cv.json` never requested |
| Print footer URL | With `?cv=variants/x.json`, footer URL equals the default site URL without a query string |
| `.gitignore` | Contains `variants/` |
| Phone omitted | Header rendered with empty/absent `phone` has no phone line, icon, placeholder or warning (also covered by Property 15) |

### Property-Based Tests

Framework: **fast-check** (JavaScript property-based testing library)

Configuration:
- Minimum 100 iterations per property
- Each test tagged with: `Feature: personal-professional-cv, Property {N}: {title}`

| Property # | Test Description | Generator |
|------------|-----------------|-----------|
| 1 | Section ordering | Random CVData with optional sections toggled |
| 2 | Reverse chronological | Random date arrays for each section |
| 3 | Required fields rendered | Random entries for each section type |
| 4 | Hyperlinks match source | Random URL strings |
| 5 | Null date substitution | Work/education entries with null dates |
| 6 | Validation warnings | CVData with intentionally invalid fields |
| 7 | Empty category omitted | Skill categories with empty/non-empty arrays |
| 8 | Expired cert distinction | Certifications with past/future expiry years |
| 9 | Photo fallback | Headers with invalid photo paths |
| 10 | Semantic HTML | Random CVData, inspect DOM tag names |
| 11 | Content round-trip | Random CVData, verify text in rendered output |
| 12 | Malformed JSON error | Random non-JSON strings |
| 13 | References mode | References with both modes |
| 14 | Native language first | Language arrays with various proficiency orderings |
| 15 | Empty phone omitted | Headers with phone undefined, `""`, or whitespace |
| 16 | Resolved CV path is safe | Arbitrary strings as `search`, plus `?cv=` values built from `..`, `\`, `:`, leading `/` and valid `variants/*.json` paths |

### Integration / Manual Tests

| Test | Method |
|------|--------|
| PDF export fits A4 2-page max | Browser print preview with sample data |
| Printed page count | Export the page to PDF with a headless browser and count pages; the result must be at most 2 pages |
| Print hides interactive elements | Visual inspection of print preview |
| Live Server workflow | Edit cv.json → refresh → verify update |
| Placeholder photo displays | Remove referenced photo → reload |
| WCAG contrast | Browser DevTools accessibility audit |

### Test Environment

- **DOM**: jsdom (via Vitest/Jest) for unit and property tests
- **Assertions**: Standard expect/assert
- **Generators**: fast-check arbitraries for CVData, entries, strings, URLs
- **CI**: Property tests run in CI with 100 iterations; no external dependencies needed

---
