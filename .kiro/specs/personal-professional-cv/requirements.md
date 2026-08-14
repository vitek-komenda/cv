# Requirements Document

## Introduction

This document specifies the requirements for building a personal professional CV for a corporate software developer. The CV is a well-structured, visually clean document designed to present the developer's profile, experience, skills, and accomplishments to potential employers and recruiters in the software industry. The output format is HTML (with CSS styling) that can be viewed in any browser and printed or exported to PDF. The document follows modern CV best practices and industry standards for software engineering roles.

## Glossary

- **CV**: Curriculum Vitae — the complete document representing the developer's professional profile.
- **Section**: A distinct, labeled block of content within the CV (e.g., Work Experience, Skills).
- **Entry**: A single record within a repeatable section (e.g., one job position, one degree, one project).
- **Renderer**: The HTML/CSS presentation layer responsible for displaying the CV content.
- **Content_Model**: The structured data representation of the CV stored in a single JSON file (e.g., `cv.json`) that serves as the sole source of truth for all rendered content.
- **PDF_Export**: The ability to produce a print-ready PDF from the HTML CV via browser print functionality.
- **ATS**: Applicant Tracking System — automated software used by employers to screen CVs.
- **Stack**: A group of related technologies or tools listed together under a skill category.

---

## Requirements

### Requirement 1: Document Structure and Sections

**User Story:** As a software developer, I want my CV to contain all standard professional sections, so that recruiters and hiring managers can quickly find the information they need.

#### Acceptance Criteria

1. THE CV SHALL render sections in the following top-to-bottom order: (1) Header, (2) Professional Summary, (3) Work Experience, (4) Technical Skills, (5) Education, (6) Projects, (7) Certifications & Courses, (8) Languages; optional sections (Achievements / Awards, References, Driver's Licence) SHALL appear after Languages in the developer's chosen order, with Driver's Licence rendered last when present.
2. THE CV SHALL contain a Professional Summary section immediately following the Header.
3. THE CV SHALL contain a Work Experience section listing professional positions chosen by the developer.
4. THE CV SHALL contain an Education section listing academic qualifications chosen by the developer.
5. THE CV SHALL contain a Technical Skills section listing technologies, languages, and tools.
6. THE CV SHALL contain a Projects section showcasing notable personal or professional projects.
7. THE CV SHALL contain a Certifications & Courses section listing completed credentials.
8. THE CV SHALL contain a Languages section listing spoken and written languages.
9. WHERE an Achievements / Awards section is included, THE CV SHALL display it as a dedicated section after the Languages section.
10. WHERE the References section is present, THE CV SHALL render it as the last section of the document.

---

### Requirement 2: Header / Contact Information

**User Story:** As a recruiter, I want to immediately see the developer's name and contact details, so that I can reach out without searching through the document.

#### Acceptance Criteria

1. THE Header SHALL display the developer's full name at a font size larger than any section heading or body text on the page.
2. THE Header SHALL display a professional title or current role beneath the full name, with a maximum length of 100 characters.
3. THE Header SHALL display an email address formatted as a clickable `mailto:` hyperlink whose `href` attribute matches the provided email address exactly, preceded by an inline SVG envelope icon.
4. THE Header SHALL display a phone number in E.164 international format (e.g., +44 7700 900 412), preceded by an inline SVG phone icon.
5. THE Header SHALL display the developer's location as a single "City, Country" string, preceded by an inline SVG location pin icon.
6. WHERE a LinkedIn profile URL is provided, THE Header SHALL display it as a clickable hyperlink preceded by an inline SVG LinkedIn icon.
7. WHERE a GitHub profile URL is provided, THE Header SHALL display it as a clickable hyperlink preceded by an inline SVG GitHub icon.
8. WHERE a personal website or portfolio URL is provided, THE Header SHALL display it as a clickable hyperlink preceded by an inline SVG globe icon.
9. THE Header SHALL NOT display a full street address to protect personal privacy.
10. IF any required field (full name, email address, or phone number) is absent from the Content_Model, THEN THE Renderer SHALL display a visible placeholder or error indicator for that field.
11. THE Header SHALL display a profile photo (PNG format) on the left side, with the contact information stacked vertically to its right.
12. THE profile photo height SHALL be slightly larger than the name strip height but its width SHALL NOT exceed 200% of the name strip height.
13. THE profile photo SHALL be loaded from a PNG file referenced in the Content_Model; IF the referenced file is absent, THE Renderer SHALL display a placeholder image (`assets/photo-placeholder.png`) at the same dimensions.
14. THE profile photo SHALL be rendered with no circular clipping — it SHALL display as a standard rectangular image preserving its original aspect ratio within the size constraints.
15. THE Header layout SHALL be a horizontal flex container with the photo on the left and a vertical stack on the right containing: full name, professional title, then each contact/link item on its own line with its SVG icon.

---

### Requirement 3: Professional Summary

**User Story:** As a hiring manager, I want to read a concise professional summary at the top of the CV, so that I can quickly assess whether the candidate is a good fit before reading the full document.

#### Acceptance Criteria

1. THE Professional_Summary SHALL consist of 3 to 5 sentences describing the developer's experience, specialisation, and career goals.
2. THE Professional_Summary SHALL use the third-person professional voice (no use of "I" or "my").
3. THE Professional_Summary SHALL include the developer's total years of professional experience.
4. THE Professional_Summary SHALL mention the developer's primary technical domain or specialisation.
5. WHEN the Professional_Summary exceeds 100 words, THE Renderer SHALL apply a visual warning style to indicate the section is too long.

---

### Requirement 4: Work Experience

**User Story:** As a recruiter, I want to see a clear history of the developer's positions and responsibilities, so that I can evaluate their career progression and relevant experience.

#### Acceptance Criteria

1. THE Work_Experience section SHALL list entries in reverse chronological order (most recent first).
2. EACH Work_Experience entry SHALL display the job title, company name, employment dates (month and year), and location as either a city and country or the word "Remote".
3. EACH Work_Experience entry SHALL include a list of 3 to 6 bullet points describing responsibilities and achievements.
4. WHEN a bullet point describes an achievement, THE Content_Model SHALL express it using a numeric quantity (e.g., a percentage improvement, number of team members, requests per second, or monetary value).
5. IF a Work_Experience entry has no end date in the Content_Model, THEN THE Renderer SHALL display "Present" as the end date for that entry.
6. IF employment dates are missing from an entry, THEN THE Renderer SHALL mark the entry with a visible validation indicator.
7. IF a Work_Experience entry contains fewer than 3 or more than 6 bullet points, THEN THE Renderer SHALL apply a visible validation indicator to that entry.

---

### Requirement 5: Education

**User Story:** As a recruiter, I want to see the developer's educational background, so that I can verify academic qualifications for roles that require specific degrees.

#### Acceptance Criteria

1. THE Education section SHALL list entries in reverse chronological order (most recent first).
2. EACH Education entry SHALL display the degree or qualification title, institution name, and graduation year; IF a field of study is associated with the degree, THE entry SHALL also display it.
3. WHERE a grade meets at least one of the following thresholds — first-class honours, distinction, merit, or GPA ≥ 3.5 on a 4.0 scale — THE Education entry SHALL include that grade.
4. WHERE coursework, a thesis title, or academic projects are relevant to software development, THE Education entry MAY include a description of no more than 150 characters.
5. WHEN an Education entry has no graduation year, THE Renderer SHALL display "In Progress" as the completion status.

---

### Requirement 6: Technical Skills

**User Story:** As a hiring manager, I want to see the developer's technical skills organised by category, so that I can quickly determine whether their stack matches our team's requirements.

#### Acceptance Criteria

1. THE Technical_Skills section SHALL organise skills into named categories (e.g., "Programming Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Tools & Practices").
2. EACH skill category SHALL list at least one skill displayed as either comma-separated items or styled tags.
3. THE Technical_Skills section SHALL list only skills whose name the developer can state, describe in one sentence, and answer basic questions about at interview.
4. WHERE a proficiency level is provided for a skill, THE Renderer SHALL display it alongside the skill name using one of the values: "Expert", "Proficient", or "Familiar".
5. THE Technical_Skills section SHALL NOT include soft skills (e.g., "teamwork", "communication") — those belong in the Professional Summary.
6. IF a skill category contains no entries, THEN THE Renderer SHALL omit that category entirely from the rendered output.
7. WHERE a skill category includes an `obsoleteSkills` array, THE Renderer SHALL render those skills after the active skills using a smaller, muted style to indicate they are legacy or deprecated technologies.

---

### Requirement 7: Projects

**User Story:** As a technical interviewer, I want to see notable projects the developer has built, so that I can assess their initiative, technical depth, and practical skills beyond their day job.

#### Acceptance Criteria

1. THE Projects section SHALL list between 2 and 6 entries to maintain focus and relevance.
2. EACH Project entry SHALL include the project name, a brief description (1 to 3 sentences), and the technologies used.
3. WHERE a project has a live URL or repository link, THE Project entry SHALL include it as a clickable hyperlink.
4. WHERE a project was built in a professional context, THE Project entry SHALL indicate whether it is a professional or personal project.
5. EACH Project description SHALL state the problem solved or the value delivered.
6. IF all Project entries have an empty name, THEN THE Renderer SHALL omit the Projects section entirely from the rendered output.

---

### Requirement 8: Certifications & Courses

**User Story:** As a recruiter, I want to see the developer's certifications and completed courses, so that I can verify their commitment to continuous learning and domain expertise.

#### Acceptance Criteria

1. EACH Certification entry SHALL display the certification name, issuing organisation, and year of completion.
2. WHERE a certification has an expiry date, THE Certification entry SHALL display the expiry year.
3. WHERE a verification URL or credential ID is available, THE Certification entry SHALL include it as a clickable hyperlink or visible ID.
4. THE Certifications section SHALL list entries in reverse chronological order (most recent first).
5. WHEN a certification has expired, THE Renderer SHALL visually distinguish it from active certifications (e.g., greyed out or labelled "Expired").
6. IF all Certification entries have an empty name, THEN THE Renderer SHALL omit the Certifications section entirely from the rendered output.

---

### Requirement 9: Languages

**User Story:** As a recruiter hiring for multinational teams, I want to know the developer's language proficiencies, so that I can assess their fit for international environments.

#### Acceptance Criteria

1. EACH Language entry SHALL display the language name and proficiency level using the CEFR scale (A1, A2, B1, B2, C1, C2) or common equivalents (Native, Fluent, Conversational, Basic).
2. THE Languages section SHALL list the developer's native or primary language first.
3. THE Languages section SHALL include at least one entry.

---

### Requirement 10: Achievements / Awards

**User Story:** As a hiring manager, I want to see notable recognitions and accomplishments, so that I can identify high-performing candidates who stand out from the pool.

#### Acceptance Criteria

1. WHERE the Achievements section is included, EACH entry SHALL state the achievement name, the awarding organisation or context, and the year received.
2. WHERE a quantifiable impact is associated with the achievement, THE Achievements entry SHALL include it (e.g., "ranked top 5% out of 500 participants").
3. THE Achievements section SHALL list entries in reverse chronological order; WHEN two or more entries share the same year, THE Achievements section SHALL list them in descending order of significance as determined by the developer.
4. IF all Achievement entries have an empty name, THEN THE Renderer SHALL omit the Achievements section entirely from the rendered output.

---

### Requirement 11: References

**User Story:** As a recruiter, I want to know whether professional references are available, so that I can request them during the later stages of hiring.

#### Acceptance Criteria

1. WHERE the References section is included with named referees, EACH entry SHALL display the referee's name, title, company, and contact method (email or phone).
2. WHERE the developer prefers not to list referees publicly, THE References section SHALL display the text "Available upon request" instead of individual entries.
3. WHERE the References section is present, THE References section SHALL be the last section of the CV.
4. IF the References mode is "listed" AND all entries have an empty name, THEN THE Renderer SHALL omit the References section entirely from the rendered output.
5. IF the References mode property is an empty string AND the entries array is empty, THEN THE Renderer SHALL omit the References section entirely from the rendered output.

---

### Requirement 12: Formatting and Visual Design

**User Story:** As a recruiter, I want the CV to be visually clean, consistently formatted, and easy to scan, so that I can extract key information within 30 seconds.

#### Acceptance Criteria

1. THE Renderer SHALL apply a consistent, single-column or two-column layout across the entire document.
2. THE Renderer SHALL use a professional, legible font family (e.g., Inter, Roboto, or Georgia) at a base size of no less than 11pt for body text.
3. THE Renderer SHALL apply clear visual hierarchy through font size, weight, and spacing to distinguish section headings, entry titles, and body text.
4. THE Renderer SHALL limit the CV to a maximum of 2 printed pages when exported via browser print.
5. THE Renderer SHALL use a colour scheme with sufficient contrast meeting WCAG AA contrast ratio requirements (minimum 4.5:1 for normal text).
6. THE Renderer SHALL NOT use decorative images, clip art, or photos other than the profile photo specified in Requirement 2.
7. THE Renderer SHALL apply consistent spacing (padding and margin) between all sections and entries.
8. THE Renderer SHOULD produce ARIA-ready output by using appropriate ARIA landmarks, roles, and labels to ensure the CV is accessible to users of assistive technologies.
9. THE Renderer SHALL add `aria-label` attributes to each rendered section element identifying the section name for screen readers.
10. THE Renderer SHALL include a small footer at the bottom of the page displaying an accessibility compliance note in a subdued style (small font, grey text).
11. THE Renderer SHALL ensure adequate padding on mobile viewports so that no content is clipped at screen edges.

---

### Requirement 13: ATS Compatibility

**User Story:** As a job applicant, I want my CV to be readable by automated Applicant Tracking Systems, so that it passes initial screening before reaching a human reviewer.

#### Acceptance Criteria

1. THE Renderer SHALL use semantic HTML elements (`<header>`, `<section>`, `<article>`, `<h1>`–`<h3>`, `<ul>`, `<p>`) to structure content.
2. THE CV SHALL NOT rely on tables, text boxes, or multi-column CSS for primary content sections, as these can confuse ATS parsers.
3. THE Content_Model SHALL store all text content as plain readable text, not as images or SVG paths.
4. ALL section headings SHALL use standard, widely recognised labels (e.g., "Work Experience" not "My Journey").

---

### Requirement 14: PDF Export

**User Story:** As a job applicant, I want to export the CV as a PDF from the browser, so that I can attach it to job applications.

#### Acceptance Criteria

1. WHEN the developer triggers the browser print function, THE Renderer SHALL apply a `@media print` CSS stylesheet that removes navigation elements, background colours, and interactive controls.
2. WHEN printed, THE CV SHALL render within standard A4 page dimensions (210mm × 297mm) with margins of at least 15mm on all sides.
3. WHEN printed, THE Renderer SHALL ensure hyperlinks display their URL text so that printed copies remain useful.
4. WHEN printed, THE Renderer SHALL avoid breaking a single Work_Experience or Education entry across two pages where possible.
5. WHEN printed, THE Renderer SHALL hide the profile photo entirely so that it does not appear in the printed or PDF-exported document.
6. WHEN printed, THE Renderer SHALL render each skill tag (in every Technical Skills category) as a distinct rounded-rectangle label with a visible border, padding, and margin — forcing `print-color-adjust: exact` — so that adjacent skills do not visually merge into a single run of text.

---

### Requirement 15: Content Maintenance

**User Story:** As a developer maintaining my own CV, I want to update content in a single source location, so that the rendered CV always reflects my latest information without manual reformatting.

#### Acceptance Criteria

1. THE Content_Model SHALL store all CV data in a single human-editable JSON file (e.g., `cv.json`) that is the sole source of truth for all rendered content.
2. THE Renderer SHALL read content exclusively from the Content_Model JSON file and SHALL NOT contain hardcoded personal data (name, contact details, job or education entries, descriptions, or URLs) as literal strings in HTML or template files.
3. WHEN the Content_Model JSON file is updated and the page is reloaded, THE Renderer SHALL reflect all updated values from the JSON file, with each rendered value matching its corresponding source value exactly.
4. WHERE an automated build step is required (e.g., static site generation or bundling), THE Renderer SHALL trigger it automatically within 5 seconds of a Content_Model change so that no manual build action is needed before the content is visible.
5. IF the Content_Model JSON file is malformed or unparseable, THEN THE Renderer SHALL display a visible error message identifying the file as the source of the problem rather than rendering partial or incorrect content.

---

### Requirement 16: Driver's Licence

**User Story:** As a recruiter, I want to know whether the developer holds a driver's licence, so that I can assess their availability for roles requiring travel or on-site presence.

#### Acceptance Criteria

1. WHERE a `driversLicense` object is present in the Content_Model with a non-empty `category` field, THE Renderer SHALL display a "Driver's Licence" section showing the licence category (e.g., "B").
2. THE Driver's Licence section SHALL be rendered as the last section of the CV (after References if present).
3. THE Driver's Licence section SHALL use a smaller font size than the standard body text to reflect its secondary importance.
4. IF the `driversLicense` object is absent or the `category` field is empty, THEN THE Renderer SHALL omit the Driver's Licence section entirely.
