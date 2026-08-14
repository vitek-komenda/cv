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

**Note:** The CV is published on a public website and repository, so personal contact data is minimised to email plus city and country; the phone number is optional.

#### Acceptance Criteria

1. THE Header SHALL display the developer's full name, with a maximum length of 100 characters, at a computed font size strictly larger than the computed font size of every section heading and every body text element on the page.
2. THE Header SHALL display the target role title (for example, "Senior Full-Stack Software Engineer") directly beneath the full name, with a maximum length of 100 characters, and THE title SHALL be non-empty in the shipped `cv.json`.
3. THE Header SHALL display an email address as a clickable `mailto:` hyperlink whose `href` attribute matches the provided email address exactly, preceded by an inline SVG envelope icon.
4. WHERE a phone number is provided, THE Header SHALL display it in E.164 international format with a "+" prefix followed by 8 to 15 digits (optional single spaces permitted between digit groups for readability, e.g., +44 7700 900 412), preceded by an inline SVG phone icon.
5. THE Header SHALL display the developer's location as a single "City, Country" string, with a maximum length of 100 characters, preceded by an inline SVG location pin icon.
6. WHERE a LinkedIn profile URL is provided, THE Header SHALL display it as a clickable hyperlink whose `href` attribute matches the provided URL exactly, preceded by an inline SVG LinkedIn icon.
7. WHERE a GitHub profile URL is provided, THE Header SHALL display it as a clickable hyperlink whose `href` attribute matches the provided URL exactly, preceded by an inline SVG GitHub icon.
8. WHERE a personal website or portfolio URL is provided, THE Header SHALL display it as a clickable hyperlink whose `href` attribute matches the provided URL exactly, preceded by an inline SVG globe icon.
9. THE Header SHALL NOT display a street address, postal code, or any location detail more granular than city and country.
10. IF the full name or the email address is absent or empty in the Content_Model, THEN THE Renderer SHALL display a visible placeholder indicator for each missing field, SHALL continue rendering all remaining Header items, and SHALL NOT discard any other Content_Model data.
11. THE Header SHALL display a profile photo in PNG format on the left side, with the contact information stacked vertically to its right.
12. THE profile photo height SHALL be greater than the name element height and no more than 150% of the name element height, and its width SHALL NOT exceed 200% of the name element height.
13. THE profile photo SHALL be loaded from a PNG file referenced in the Content_Model; IF the referenced file is absent, fails to load, or the Content_Model contains no photo reference, THEN THE Renderer SHALL display the placeholder image (`assets/photo-placeholder.png`) at the same dimensions and SHALL continue rendering the remainder of the Header.
14. THE profile photo SHALL be rendered with no circular clipping, displayed as a rectangular image that preserves its original aspect ratio within the size constraints stated in criterion 12.
15. THE Header layout SHALL be a horizontal flex container with the photo on the left and a vertical stack on the right containing, in order: full name, professional title, then each contact/link item on its own line with its SVG icon.
16. IF the phone number is absent or empty in the Content_Model, THEN THE Renderer SHALL omit the phone line and its icon entirely, with no placeholder text and no validation warning.

---

### Requirement 3: Professional Summary

**User Story:** As a hiring manager, I want to read a concise professional summary at the top of the CV, so that I can quickly assess whether the candidate is a good fit before reading the full document.

#### Acceptance Criteria

1. THE Professional_Summary SHALL consist of 3 to 5 sentences describing the developer's experience, specialisation, and career goals.
2. THE Professional_Summary SHALL use the third-person professional voice (no use of "I" or "my").
3. THE Professional_Summary SHALL describe the developer's experience without stating a total number of years (see Requirement 17).
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
7. WHEN printed, THE Renderer SHALL set the document font to a sans-serif font stack (for example Inter, Segoe UI, Roboto, Helvetica Neue, Arial, then the generic sans-serif family) in the print stylesheet, so that the printed or PDF-exported CV does not fall back to the browser's default serif font.
8. WHEN printed, THE Renderer SHALL apply the base stylesheet used on screen (typography, heading sizes, spacing, icon and label styles) together with the print overrides, and SHALL use compact print spacing so that the printed CV fits within the 2-page limit in Requirement 12 without large vertical gaps between headings and content.

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

---

### Requirement 17: Recruiter-Oriented Content Guidelines

**User Story:** As a developer authoring my CV, I want clear content-writing rules for the Content_Model, so that recruiters can judge my fit within the first seconds and the content stays truthful and free of confidential details.

**Note:** These are authoring rules for the Content_Model. The Renderer does not enforce them.

#### Acceptance Criteria

1. THE Professional_Summary SHALL begin its first sentence with the developer's role title followed by the primary technology stack, listing between 1 and 5 technologies.
2. THE Professional_Summary SHALL omit any statement of total years of experience, including numeric forms (for example, "10+ years") and written-out forms (for example, "a decade of experience").
3. THE Professional_Summary SHALL omit generic filler phrases that contain no named technology, domain, or measurable outcome (for example, "strong commitment to clean code", "team player", "passionate developer").
4. THE Professional_Summary SHALL have a maximum length of 600 characters and a maximum of 4 sentences.
5. WHERE the developer uses AI coding assistants, THE Professional_Summary MAY mention it in one clause of at most 15 words.
6. THE header title SHALL omit any mention of AI coding assistants.
7. THE Work_Experience bullet points SHALL follow the order result, then metric, then context within each bullet, where each bullet has a maximum length of 200 characters.
8. THE Work_Experience entry SHALL contain between 2 and 6 bullet points.
9. WHERE a concrete number or measurable outcome is known for a Work_Experience entry, THE first bullet point of that entry SHALL contain it.
10. THE Work_Experience bullet points SHALL contain only metrics that the developer can substantiate from their own records or direct knowledge, with no invented, estimated-without-basis, or rounded-up values.
11. THE Professional_Summary and Work_Experience bullet points SHALL omit the employer name and internal product names, and THE employer name SHALL appear only in the company field of the Work_Experience entry.
12. THE Content_Model SHALL omit Work_Experience entries whose end date is more than 15 years before the current date, or SHALL condense each such entry to a single line containing only role title, company, and date range.
13. THE Technical_Skills section SHALL omit obsolete technologies, including MFC and WinForms.
14. THE Technical_Skills section SHALL present each skill as a plain text label, with no graphical skill meters, charts, star ratings, percentage values, or rating bars.
15. THE top of the CV, defined as the content visible before the first Work_Experience entry, SHALL use a single-column layout containing the target role title, headline technologies, and the Professional_Summary.
16. WHERE a CV is tailored to a specific application, THE tailored content MAY be provided as a separate Content_Model file derived from the base `cv.json`, as covered by Requirement 18.

---

### Requirement 18: Application-Specific Content Variants

**User Story:** As a developer who tailors the CV per job application, I want to load an alternative Content_Model file through a URL parameter, so that I can present application-specific content without changing the base `cv.json` or publishing employer-specific details.

#### Acceptance Criteria

1. WHEN the page URL contains a `cv` query parameter, THE Renderer SHALL load the Content_Model from the path given in that parameter instead of the default `cv.json`.
2. THE Renderer SHALL accept a `cv` parameter value only if it is a relative path that starts with `variants/`, ends with `.json`, and contains no `..` segment, no backslash, no protocol, and no leading slash; IF the value does not satisfy these rules, THEN THE Renderer SHALL ignore it and load the default `cv.json`.
3. IF the file referenced by a valid `cv` parameter cannot be fetched or parsed, THEN THE Renderer SHALL display the existing error banner and SHALL NOT fall back silently to the default `cv.json`.
4. THE `variants/` directory SHALL be excluded from version control through `.gitignore`, so tailored files naming specific employers are not published in the public repository.
5. EACH variant file SHALL use the same Content_Model schema as `cv.json` and SHALL be a complete document, with no merging with the base file.
6. WHEN a variant is loaded, THE print-only live-website footer SHALL still show the default site URL without the `cv` query parameter.
