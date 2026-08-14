# Implementation Plan: Personal Professional CV

## Overview

This plan implements a static CV renderer that fetches data from `cv.json` and builds a semantic HTML page styled for both screen and print. The implementation is vanilla HTML/CSS/JS with no build tools — files are served from a local static server. Testing uses Vitest with jsdom and fast-check for property-based tests.

## Tasks

- [x] 1. Set up project structure and HTML shell
  - [x] 1.1 Create `index.html` with semantic shell structure
    - Add `<meta charset="UTF-8">` and viewport meta tag
    - Link `styles.css` (screen) and `print.css` (print media)
    - Add empty `<main id="cv-root"></main>` container
    - Add `<div id="error-banner" hidden></div>` for error display
    - Add `<script src="renderer.js" defer></script>`
    - Ensure no personal data is hardcoded in the HTML source
    - _Requirements: 1.1, 13.1, 15.2_

  - [x] 1.2 Create `styles.css` with base layout and typography
    - Single-column layout, max-width 210mm (A4), centered with auto margins
    - Set `Inter` font family at 11pt base size; h1 24pt, h2 16pt, h3 13pt
    - Dark charcoal text `#2d2d2d` on white `#ffffff`; accent `#1a5276` for headings/links
    - Section spacing 1.5rem, entry spacing 0.75rem
    - Validation indicator styles: orange dashed border, warning icon for invalid fields
    - Skill tag styles with border and padding
    - Expired certification styles (greyed-out + "Expired" label)
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.7, 13.2_

  - [x] 1.3 Create `print.css` with print-specific overrides
    - `@page { size: A4; margin: 15mm; }` rule
    - Remove background colours, keep text colour
    - `a[href]::after { content: " (" attr(href) ")"; }` to reveal URLs
    - `break-inside: avoid` on `.work-entry` and `.edu-entry`
    - Hide error banner, profile photo, and any interactive controls
    - `orphans: 2; widows: 2` for proper text flow
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 2. Implement renderer.js core infrastructure
  - [x] 2.1 Implement helper functions (`createElement`, `formatDate`, `wordCount`, `showError`)
    - `createElement(tag, attrs, children)` — utility for building DOM elements
    - `formatDate(dateStr)` — converts "YYYY-MM" to "Mon YYYY", null to "Present"
    - `wordCount(text)` — returns word count of a string
    - `showError(message)` — unhides error banner with given message text
    - _Requirements: 4.5, 5.5, 15.5_

  - [x] 2.2 Implement `fetchCV(url)` and `validateCV(data)` functions
    - Fetch `cv.json` via Fetch API; handle network errors, HTTP errors, empty response, and JSON parse errors
    - On any fetch/parse failure, call `showError()` with descriptive message and abort rendering
    - `validateCV` checks required header fields (fullName, email; phone is optional and never warned), summary word count, work entry bullet counts, missing dates
    - Return `ValidationResult` with warnings array; warnings are non-fatal
    - _Requirements: 15.1, 15.5, 2.10, 2.16, 3.5, 4.6, 4.7_

  - [x] 2.3 Implement `main()` entry point and `renderCV(data, root)` orchestrator
    - `main()` calls `fetchCV`, then `validateCV`, then `renderCV`
    - `renderCV` calls each section builder in order and appends results to `<main id="cv-root">`
    - Section order: Header → Summary → Work Experience → Education → Technical Skills → Projects → Certifications → Languages → Achievements (if present) → References (if present, always last)
    - Attach validation warnings as CSS classes to affected elements
    - _Requirements: 1.1, 1.2, 1.9, 1.10, 15.3_

- [x] 3. Implement section builders — Header and Summary
  - [x] 3.1 Implement `buildHeader(header)` function
    - Display full name at largest font size (h1)
    - Display professional title beneath name (max 100 chars)
    - Render email as clickable `mailto:` link with exact href match
    - Display phone in E.164 format only when provided; when empty or absent, omit the phone line and its icon entirely (no placeholder text, no validation warning)
    - Display city and country (no street address)
    - Render LinkedIn, GitHub, website as clickable links when provided
    - Render profile photo with `onerror` handler for fallback to `assets/photo-placeholder.png`
    - Photo: rectangular, no circular clipping, positioned left of name strip
    - Show orange placeholder text for missing required fields (fullName, email only); phone is optional
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.16_

  - [x] 3.2 Implement `buildSummary(text)` function
    - Render professional summary as a `<section>` with `<p>` content
    - Use `wordCount()` to check if summary exceeds 100 words
    - Apply warning CSS class if over limit
    - _Requirements: 3.1, 3.5_

- [x] 4. Implement section builders — Work Experience and Education
  - [x] 4.1 Implement `buildWorkExperience(entries)` function
    - Sort entries in reverse chronological order by `startDate`
    - Each entry displays job title, company, date range, and location
    - Render `null` endDate as "Present"
    - Render bullets as `<ul>` with `<li>` items
    - Apply validation indicator for missing startDate
    - Apply validation indicator for bullet count outside 3–6 range
    - Use `<article>` with class `work-entry` for print break-inside avoidance
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

  - [x] 4.2 Implement `buildEducation(entries)` function
    - Sort entries in reverse chronological order by `graduationYear`
    - Each entry displays degree, institution, graduation year, optional field of study
    - Render `null` graduationYear as "In Progress"
    - Display grade when meeting threshold criteria
    - Optional description capped at 150 characters
    - Use `<article>` with class `edu-entry` for print break-inside avoidance
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement section builders — Skills, Projects, Certifications
  - [x] 5.1 Implement `buildTechnicalSkills(categories)` function
    - Render each category as a named group
    - Display skills as styled inline tags with border and padding
    - Omit categories with empty `skills` array entirely from output
    - _Requirements: 6.1, 6.2, 6.6_

  - [x] 5.2 Implement `buildProjects(entries)` function
    - Each entry shows project name, description (1–3 sentences), technologies used
    - Render URL as clickable hyperlink when provided
    - Indicate project type (personal/professional) when relevant
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 5.3 Implement `buildCertifications(entries)` function
    - Sort entries in reverse chronological order by year
    - Each entry displays name, issuer, year, optional expiry year
    - Render verification URL or credential ID as clickable link when provided
    - Apply expired styling (greyed-out + "Expired" label) when `expiryYear < currentYear`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Implement section builders — Languages, Achievements, References
  - [x] 6.1 Implement `buildLanguages(entries)` function
    - Display language name and proficiency level (CEFR or equivalent)
    - Sort so that "Native" proficiency entry appears first
    - Ensure at least one entry is present
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 6.2 Implement `buildAchievements(entries)` function
    - Sort entries in reverse chronological order
    - Each entry displays name, organisation, year, and optional impact
    - Only render section if achievements array is non-empty
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 6.3 Implement `buildReferences(refs)` function
    - When `mode` is "available-upon-request", render text "Available upon request"
    - When `mode` is "listed", render each entry with name, title, company, contact
    - Section rendered last in the document when present
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 7. Checkpoint — Core rendering complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Set up test infrastructure and write property-based tests
  - [ ] 8.1 Set up Vitest with jsdom and fast-check
    - Install vitest, jsdom, and fast-check as dev dependencies
    - Configure vitest.config.js with jsdom environment
    - Create test directory structure and helper generators for CVData arbitraries
    - _Requirements: N/A (testing infrastructure)_

  - [ ]* 8.2 Write property test for section ordering (Property 1)
    - **Property 1: Section ordering is correct and complete**
    - Generate random CVData with optional sections toggled on/off
    - Assert rendered DOM sections appear in correct order
    - **Validates: Requirements 1.1, 1.2, 1.9, 1.10, 13.4**

  - [ ]* 8.3 Write property test for reverse chronological order (Property 2)
    - **Property 2: Date-ordered sections maintain reverse chronological order**
    - Generate random date arrays for work, education, certifications, achievements
    - Assert rendered entries are in reverse chronological order
    - **Validates: Requirements 4.1, 5.1, 8.4, 10.3**

  - [ ]* 8.4 Write property test for required fields rendered (Property 3)
    - **Property 3: All required fields of every entry type are rendered**
    - Generate random entries for each section type with all required fields populated
    - Assert every required field value appears as text in rendered output
    - **Validates: Requirements 4.2, 5.2, 7.2, 8.1, 9.1, 10.1, 11.1**

  - [ ]* 8.5 Write property test for hyperlink accuracy (Property 4)
    - **Property 4: Hyperlinks match source URLs exactly**
    - Generate random URL strings for all URL fields
    - Assert each rendered anchor `href` equals source value exactly (with mailto: prefix for email)
    - **Validates: Requirements 2.3, 2.6, 2.7, 2.8, 7.3, 8.3**

  - [ ]* 8.6 Write property test for null date substitution (Property 5)
    - **Property 5: Null dates render as substitution text**
    - Generate work entries with null endDate, education entries with null graduationYear
    - Assert "Present" and "In Progress" appear in rendered output
    - **Validates: Requirements 4.5, 5.5**

  - [ ]* 8.7 Write property test for validation warnings (Property 6)
    - **Property 6: Validation warnings appear for invalid data**
    - Generate CVData with intentionally invalid fields (empty fullName or email, bad bullet counts, long summary); an empty phone must not produce a warning
    - Assert warning CSS classes are applied to affected elements
    - **Validates: Requirements 2.10, 3.5, 4.3, 4.6, 4.7**

  - [ ]* 8.8 Write property test for empty category omission (Property 7)
    - **Property 7: Empty skill categories are omitted from output**
    - Generate skill categories with mix of empty and non-empty arrays
    - Assert no DOM element exists for empty categories
    - **Validates: Requirements 6.6**

  - [ ]* 8.9 Write property test for expired certification styling (Property 8)
    - **Property 8: Expired certifications are visually distinguished**
    - Generate certifications with past and future expiry years
    - Assert expired entries have distinct CSS class
    - **Validates: Requirements 8.5**

  - [ ]* 8.10 Write property test for photo fallback (Property 9)
    - **Property 9: Photo fallback on load failure**
    - Simulate image load failure via onerror
    - Assert img src is set to `assets/photo-placeholder.png`
    - **Validates: Requirements 2.13**

  - [ ]* 8.11 Write property test for semantic HTML structure (Property 10)
    - **Property 10: Semantic HTML structure without tables**
    - Generate random valid CVData
    - Assert output uses semantic elements and contains no `<table>` elements
    - **Validates: Requirements 13.1, 13.2**

  - [ ]* 8.12 Write property test for content round-trip fidelity (Property 11)
    - **Property 11: Content round-trip fidelity**
    - Generate random CVData with various text values
    - Assert every text value appears verbatim in rendered HTML text content
    - **Validates: Requirements 15.3**

  - [ ]* 8.13 Write property test for malformed JSON error (Property 12)
    - **Property 12: Malformed JSON produces error display**
    - Generate random non-JSON strings
    - Assert error banner is displayed and no CV sections are rendered
    - **Validates: Requirements 15.5**

  - [ ]* 8.14 Write property test for references mode (Property 13)
    - **Property 13: References mode determines rendering**
    - Generate references with both modes
    - Assert "available-upon-request" shows text only; "listed" shows all entry details
    - **Validates: Requirements 11.2**

  - [ ]* 8.15 Write property test for native language ordering (Property 14)
    - **Property 14: Native language listed first**
    - Generate language arrays with "Native" entry at various positions
    - Assert "Native" entry is rendered first regardless of source position
    - **Validates: Requirements 9.2**

- [ ] 9. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Optional phone and recruiter-oriented content
  - [ ] 10.1 Make phone optional in `renderer.js`
    - In `validateCV`, remove phone from the required header fields so an empty or absent phone never produces a warning
    - In `buildHeader`, render the phone line and icon only when phone is non-empty (trimmed); otherwise omit both with no placeholder text
    - Keep rendering all other header items
    - To be completed in this change
    - _Requirements: 2.4, 2.10, 2.16_

  - [ ] 10.2 Update `cv.json` per recruiter-oriented content guidelines
    - Set a non-empty target-role title in the header (no mention of AI coding assistants)
    - Remove the phone field from the header
    - Rewrite the summary: starts with role title plus 1 to 5 primary technologies, max 600 characters and 4 sentences, no total years of experience, no filler phrases, no employer or internal product names
    - Rewrite work bullets in result, metric, context order (max 200 characters, 2 to 6 per entry), first bullet carries a number when known, only substantiable metrics
    - Remove MFC and WinForms from technical skills
    - To be completed in this change
    - _Requirements: 2.4, 2.16, 17.1, 17.2, 17.3, 17.4, 17.6, 17.7, 17.8, 17.9, 17.10, 17.11, 17.13_

  - [ ]* 10.3 Write property test for empty phone (Property 15)
    - **Property 15: Empty phone omits the phone line entirely**
    - Generate headers with phone undefined, `""`, or whitespace
    - Assert no phone line, icon, placeholder, or warning is rendered and other header items still render
    - **Validates: Requirements 2.4, 2.10, 2.16**

- [ ] 11. Application-specific content variants
  - [ ] 11.1 Implement `resolveCvPath` and use it in `main()` in `renderer.js`
    - Add pure function `resolveCvPath(search)` that reads the `cv` parameter with `URLSearchParams`
    - Return the value only when it matches `^variants/[A-Za-z0-9._/-]+\.json$` and contains no `..` segment; otherwise (absent, empty, invalid) return `cv.json`
    - Change `main()` to call `fetchCV(resolveCvPath(location.search))`
    - If a valid variant path fails to fetch or parse, show the error banner naming the variant file; do NOT fall back to `cv.json`
    - An invalid `cv` value is ignored and `cv.json` loads normally with no banner
    - To be completed in this change
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ] 11.2 Ignore `variants/` in git and create the Barclays quant developer variant
    - Add `variants/` to `.gitignore`
    - Create `variants/barclays-quant-developer/cv.json` as a complete Content_Model document using the same schema as the base `cv.json` (no merging with the base file)
    - Tailor title, summary and bullets for the quant developer application while following the content authoring guidelines
    - To be completed in this change
    - _Requirements: 18.4, 18.5_

  - [ ] 11.3 Keep the print footer URL free of the `cv` query parameter
    - Build the print-only live-website footer from the default site URL constant, not from `location`
    - Ensure the footer never includes the `cv` parameter, even when a variant is loaded
    - To be completed in this change
    - _Requirements: 18.6_

  - [ ]* 11.4 Write property test for resolved CV path safety (Property 16)
    - **Property 16: Resolved CV path is always safe**
    - Generate arbitrary strings as `search`, plus `?cv=` values built from `..`, `\`, `:`, leading `/` and valid `variants/*.json` paths
    - Assert the result is `cv.json` or starts with `variants/`, ends with `.json`, and contains no `..`, backslash, colon or leading slash
    - **Validates: Requirements 18.1, 18.2**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation is vanilla HTML/CSS/JS — no build tools or frameworks required
- All personal data comes exclusively from `cv.json` — nothing is hardcoded

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["4.1", "4.2"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 7, "tasks": ["8.1", "10.1", "10.2"] },
    { "id": 8, "tasks": ["10.3", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10", "8.11", "8.12", "8.13", "8.14", "8.15", "11.1", "11.2"] },
    { "id": 9, "tasks": ["11.3", "11.4"] }
  ]
}
```
