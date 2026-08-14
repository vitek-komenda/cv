/**
 * renderer.js — CV Renderer
 * Fetches cv.json and builds a semantic HTML CV dynamically.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Creates a DOM element with the given tag, attributes, and children.
 * @param {string} tag — HTML tag name
 * @param {Object} attrs — key/value pairs for element attributes
 * @param {Array<HTMLElement|string>} children — child elements or text strings
 * @returns {HTMLElement}
 */
function createElement(tag, attrs, children) {
  var el = document.createElement(tag);

  if (attrs) {
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
  }

  if (children) {
    children.forEach(function (child) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }

  return el;
}

/**
 * Converts a date string to a display-friendly format.
 * - null/undefined → "Present"
 * - "YYYY-MM" → "Mon YYYY" (e.g. "2023-01" → "Jan 2023")
 * - anything else → returned as-is
 * @param {string|null|undefined} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (dateStr == null) {
    return 'Present';
  }

  var match = /^(\d{4})-(\d{2})$/.exec(dateStr);
  if (match) {
    var months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    var year = match[1];
    var monthIndex = parseInt(match[2], 10) - 1;
    return months[monthIndex] + ' ' + year;
  }

  return dateStr;
}

/**
 * Returns the number of words in the given text.
 * Handles empty/whitespace-only strings (returns 0) and extra whitespace.
 * @param {string} text
 * @returns {number}
 */
function wordCount(text) {
  if (!text || !text.trim()) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}

/**
 * Displays the error banner with the given message.
 * Finds the #error-banner element, sets its text, and removes the hidden attribute.
 * @param {string} message
 */
function showError(message) {
  var banner = document.getElementById('error-banner');
  if (banner) {
    banner.textContent = message;
    banner.removeAttribute('hidden');
  }
}

// ─── Data Fetching ──────────────────────────────────────────────────────────

/**
 * Fetches and parses the CV JSON from the given URL.
 * Handles network errors, HTTP errors, empty responses, and JSON parse errors.
 * On any failure, calls showError() with a descriptive message and returns null.
 * @param {string} url — URL to the cv.json file
 * @returns {Promise<object|null>} — parsed CV data or null on failure
 */
async function fetchCV(url) {
  var response;

  try {
    response = await fetch(url);
  } catch (e) {
    showError('Unable to load CV data. Check that cv.json exists and the page is served over HTTP.');
    return null;
  }

  if (!response.ok) {
    showError('Unable to load CV data. Server returned HTTP ' + response.status + '.');
    return null;
  }

  var text;
  try {
    text = await response.text();
  } catch (e) {
    showError('Unable to load CV data. Check that cv.json exists and the page is served over HTTP.');
    return null;
  }

  if (!text || !text.trim()) {
    showError('cv.json is empty.');
    return null;
  }

  var data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    showError('cv.json contains invalid JSON. Please fix syntax errors.');
    return null;
  }

  return data;
}

// ─── Validation ─────────────────────────────────────────────────────────────

/**
 * Validates CV data and returns a ValidationResult.
 * Checks required header fields, summary word count, work entry bullet counts,
 * and missing dates. Warnings are non-fatal — rendering still proceeds.
 * @param {object} data — parsed CV data object
 * @returns {{ valid: boolean, warnings: Array<{ section: string, field: string, message: string }> }}
 */
function validateCV(data) {
  var warnings = [];

  // Check required header fields
  if (data.header) {
    if (!data.header.fullName || !data.header.fullName.trim()) {
      warnings.push({
        section: 'header',
        field: 'fullName',
        message: 'Full name is required.'
      });
    }
    if (!data.header.email || !data.header.email.trim()) {
      warnings.push({
        section: 'header',
        field: 'email',
        message: 'Email address is required.'
      });
    }
    if (!data.header.phone || !data.header.phone.trim()) {
      warnings.push({
        section: 'header',
        field: 'phone',
        message: 'Phone number is required.'
      });
    }
  }

  // Check professional summary word count
  if (data.professionalSummary && wordCount(data.professionalSummary) > 100) {
    warnings.push({
      section: 'professionalSummary',
      field: 'text',
      message: 'Professional summary exceeds 100 words.'
    });
  }

  // Check work experience entries
  if (data.workExperience && Array.isArray(data.workExperience)) {
    data.workExperience.forEach(function (entry, index) {
      if (!entry.startDate || !entry.startDate.trim()) {
        warnings.push({
          section: 'workExperience',
          field: 'startDate',
          index: index,
          message: 'Work entry ' + (index + 1) + ' is missing a start date.'
        });
      }
      if (entry.bullets) {
        if (entry.bullets.length < 3) {
          warnings.push({
            section: 'workExperience',
            field: 'bullets',
            index: index,
            message: 'Work entry ' + (index + 1) + ' has fewer than 3 bullet points.'
          });
        } else if (entry.bullets.length > 6) {
          warnings.push({
            section: 'workExperience',
            field: 'bullets',
            index: index,
            message: 'Work entry ' + (index + 1) + ' has more than 6 bullet points.'
          });
        }
      }
    });
  }

  return {
    valid: warnings.length === 0,
    warnings: warnings
  };
}

// ─── SVG Icon Helpers ────────────────────────────────────────────────────────

function createSvgIcon(pathD, viewBox) {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', viewBox || '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

function iconPhone() {
  return createSvgIcon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z');
}

function iconEmail() {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  var rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', '2');
  rect.setAttribute('y', '4');
  rect.setAttribute('width', '20');
  rect.setAttribute('height', '16');
  rect.setAttribute('rx', '2');
  var polyline = document.createElementNS(ns, 'polyline');
  polyline.setAttribute('points', '22,7 12,13 2,7');
  svg.appendChild(rect);
  svg.appendChild(polyline);
  return svg;
}

function iconLocation() {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  var circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '3');
  svg.appendChild(path);
  svg.appendChild(circle);
  return svg;
}

function iconLinkedIn() {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z');
  var rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', '2');
  rect.setAttribute('y', '9');
  rect.setAttribute('width', '4');
  rect.setAttribute('height', '12');
  var circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '4');
  circle.setAttribute('cy', '4');
  circle.setAttribute('r', '2');
  svg.appendChild(path);
  svg.appendChild(rect);
  svg.appendChild(circle);
  return svg;
}

function iconGitHub() {
  return createSvgIcon('M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22');
}

function iconGlobe() {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  var circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  var line1 = document.createElementNS(ns, 'line');
  line1.setAttribute('x1', '2'); line1.setAttribute('y1', '12');
  line1.setAttribute('x2', '22'); line1.setAttribute('y2', '12');
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z');
  svg.appendChild(circle);
  svg.appendChild(line1);
  svg.appendChild(path);
  return svg;
}

// ─── Section Builders ────────────────────────────────────────────────────────

/**
 * Builds the CV header section containing photo, name, title, and contact items with SVG icons.
 * Layout: photo on the left, vertical stack on the right (name, title, contact items each on own line).
 * Shows orange placeholder text for missing required fields (fullName, email, phone).
 * @param {object} header — Header object from CVData
 * @returns {HTMLElement} — <header> element
 */
function buildHeader(header) {
  var h = header || {};

  // ── Photo ──
  var img = createElement('img', {
    src: h.photo || 'assets/photo-placeholder.png',
    alt: h.fullName ? h.fullName + ' profile photo' : 'Profile photo'
  }, []);

  img.onerror = function () {
    img.src = 'assets/photo-placeholder.png';
    img.onerror = null;
  };

  var photoWrapper = createElement('div', { class: 'header-photo' }, [img]);

  // ── Full Name (h1) ──
  var nameEl;
  if (!h.fullName || !h.fullName.trim()) {
    nameEl = createElement('h1', { 'data-field': 'fullName', class: 'placeholder-text' }, ['[Full Name Required]']);
  } else {
    nameEl = createElement('h1', { 'data-field': 'fullName' }, [h.fullName]);
  }

  // ── Professional Title ──
  var titleText = h.title ? h.title.substring(0, 100) : '';
  var titleEl = createElement('p', { class: 'header-title' }, [titleText]);

  // ── Contact items (each on its own line with icon) ──
  var infoChildren = [nameEl, titleEl];

  // Phone
  if (!h.phone || !h.phone.trim()) {
    var phoneItem = createElement('div', { class: 'header-contact-item', 'data-field': 'phone' }, []);
    phoneItem.appendChild(iconPhone());
    phoneItem.appendChild(document.createTextNode('[Phone Required]'));
    phoneItem.classList.add('placeholder-text');
    infoChildren.push(phoneItem);
  } else {
    var phoneItem = createElement('div', { class: 'header-contact-item', 'data-field': 'phone' }, []);
    phoneItem.appendChild(iconPhone());
    phoneItem.appendChild(document.createTextNode(h.phone));
    infoChildren.push(phoneItem);
  }

  // Email
  if (!h.email || !h.email.trim()) {
    var emailItem = createElement('div', { class: 'header-contact-item', 'data-field': 'email' }, []);
    emailItem.appendChild(iconEmail());
    emailItem.appendChild(document.createTextNode('[Email Required]'));
    emailItem.classList.add('placeholder-text');
    infoChildren.push(emailItem);
  } else {
    var emailItem = createElement('div', { class: 'header-contact-item', 'data-field': 'email' }, []);
    emailItem.appendChild(iconEmail());
    var emailLink = createElement('a', { href: 'mailto:' + h.email }, [h.email]);
    emailItem.appendChild(emailLink);
    infoChildren.push(emailItem);
  }

  // Location (city, country consolidated)
  if (h.city || h.country) {
    var locationParts = [];
    if (h.city) { locationParts.push(h.city); }
    if (h.country) { locationParts.push(h.country); }
    var locItem = createElement('div', { class: 'header-contact-item' }, []);
    locItem.appendChild(iconLocation());
    locItem.appendChild(document.createTextNode(locationParts.join(', ')));
    infoChildren.push(locItem);
  }

  // LinkedIn
  if (h.linkedIn) {
    var liItem = createElement('div', { class: 'header-contact-item' }, []);
    liItem.appendChild(iconLinkedIn());
    liItem.appendChild(createElement('a', { href: h.linkedIn, target: '_blank', rel: 'noopener noreferrer' }, ['LinkedIn']));
    infoChildren.push(liItem);
  }

  // GitHub
  if (h.github) {
    var ghItem = createElement('div', { class: 'header-contact-item' }, []);
    ghItem.appendChild(iconGitHub());
    ghItem.appendChild(createElement('a', { href: h.github, target: '_blank', rel: 'noopener noreferrer' }, ['GitHub']));
    infoChildren.push(ghItem);
  }

  // Website
  if (h.website) {
    var webItem = createElement('div', { class: 'header-contact-item' }, []);
    webItem.appendChild(iconGlobe());
    webItem.appendChild(createElement('a', { href: h.website, target: '_blank', rel: 'noopener noreferrer' }, [h.website]));
    infoChildren.push(webItem);
  }

  // ── Assemble header-info ──
  var infoWrapper = createElement('div', { class: 'header-info' }, infoChildren);

  // ── Assemble header ──
  var headerEl = createElement('header', { class: 'cv-header', role: 'banner', 'aria-label': 'Contact Information' }, [photoWrapper, infoWrapper]);

  return headerEl;
}

/**
 * Builds the Professional Summary section.
 * Renders the summary text in a <section> with a <p> element.
 * Applies a validation-warning class if the text exceeds 100 words.
 * @param {string} text — professional summary text
 * @returns {HTMLElement}
 */
function buildSummary(text) {
  var classes = 'summary-section';
  if (wordCount(text) > 100) {
    classes += ' validation-warning';
  }

  return createElement('section', { class: classes, 'aria-label': 'Professional Summary' }, [
    createElement('h2', null, ['Professional Summary']),
    createElement('p', null, [text || ''])
  ]);
}

/**
 * Builds the Work Experience section.
 * Sorts entries in reverse chronological order by startDate.
 * Each entry is rendered as an <article> with class "work-entry".
 * Applies validation-warning class for missing startDate or bullet count outside 3–6.
 * @param {Array} entries — array of WorkEntry objects
 * @returns {HTMLElement}
 */
function buildWorkExperience(entries) {
  var section = createElement('section', { class: 'work-experience-section', 'aria-label': 'Work Experience' }, [
    createElement('h2', null, ['Work Experience'])
  ]);

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return section;
  }

  // Sort entries in reverse chronological order by startDate
  var sorted = entries.slice().sort(function (a, b) {
    var dateA = a.startDate || '';
    var dateB = b.startDate || '';
    // Compare as strings — "YYYY-MM" format sorts lexicographically
    if (dateB < dateA) { return -1; }
    if (dateB > dateA) { return 1; }
    return 0;
  });

  sorted.forEach(function (entry) {
    // Determine if validation warning is needed
    var needsWarning = false;
    if (!entry.startDate || !entry.startDate.trim()) {
      needsWarning = true;
    }
    if (entry.bullets && (entry.bullets.length < 3 || entry.bullets.length > 6)) {
      needsWarning = true;
    }

    var articleClass = 'work-entry';
    if (needsWarning) {
      articleClass += ' validation-warning';
    }

    // Build date range string
    var dateRange = formatDate(entry.startDate) + ' – ' + formatDate(entry.endDate);

    // Entry header: job title and date range
    var entryHeader = createElement('div', { class: 'entry-header' }, [
      createElement('h3', null, [entry.jobTitle || '']),
      createElement('span', null, [dateRange])
    ]);

    // Entry meta: company and location
    var metaText = (entry.company || '') + ' · ' + (entry.location || '');
    var entryMeta = createElement('div', { class: 'entry-meta' }, [metaText]);

    // Bullet list
    var bulletItems = [];
    if (entry.bullets && entry.bullets.length > 0) {
      entry.bullets.forEach(function (bullet) {
        bulletItems.push(createElement('li', null, [bullet]));
      });
    }
    var bulletList = createElement('ul', null, bulletItems);

    // Assemble article
    var article = createElement('article', { class: articleClass }, [
      entryHeader,
      entryMeta,
      bulletList
    ]);

    section.appendChild(article);
  });

  return section;
}

/**
 * Builds the Education section.
 * Sorts entries in reverse chronological order (null graduationYear = "In Progress" first).
 * Each entry displays degree, institution, graduation year, optional field of study,
 * grade (if non-empty), and description (capped at 150 characters).
 * @param {Array} entries — array of EducationEntry objects
 * @returns {HTMLElement}
 */
function buildEducation(entries) {
  var section = createElement('section', { class: 'education-section', 'aria-label': 'Education' }, [
    createElement('h2', null, ['Education'])
  ]);

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return section;
  }

  // Sort: null graduationYear (In Progress) first, then descending by year
  var sorted = entries.slice().sort(function (a, b) {
    if (a.graduationYear === null && b.graduationYear === null) { return 0; }
    if (a.graduationYear === null) { return -1; }
    if (b.graduationYear === null) { return 1; }
    return b.graduationYear - a.graduationYear;
  });

  sorted.forEach(function (entry) {
    var yearText = entry.graduationYear === null ? 'In Progress' : String(entry.graduationYear);

    // Header row: degree on left, year on right
    var header = createElement('div', { class: 'entry-header' }, [
      createElement('strong', null, [entry.degree]),
      createElement('span', null, [yearText])
    ]);

    // Meta row: institution and optional field of study
    var metaParts = [entry.institution];
    if (entry.fieldOfStudy) {
      metaParts.push(entry.fieldOfStudy);
    }
    var meta = createElement('div', { class: 'entry-meta' }, [metaParts.join(' — ')]);

    var articleChildren = [header, meta];

    // Grade (display if non-empty string)
    if (entry.grade && entry.grade.trim()) {
      articleChildren.push(
        createElement('div', { class: 'entry-meta' }, ['Grade: ' + entry.grade])
      );
    }

    // Description (capped at 150 characters)
    if (entry.description && entry.description.trim()) {
      var desc = entry.description.substring(0, 150);
      articleChildren.push(
        createElement('p', { class: 'edu-description' }, [desc])
      );
    }

    var article = createElement('article', { class: 'edu-entry' }, articleChildren);
    section.appendChild(article);
  });

  return section;
}

/**
 * Builds the Technical Skills section.
 * Renders each non-empty skill category as a named group with styled inline tags.
 * Categories with an empty skills array are omitted entirely from the output.
 * @param {Array} categories — array of SkillCategory objects { category: string, skills: string[] }
 * @returns {HTMLElement}
 */
function buildTechnicalSkills(categories) {
  var section = createElement('section', { class: 'skills-section', 'aria-label': 'Technical Skills' }, [
    createElement('h2', null, ['Technical Skills'])
  ]);

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return section;
  }

  categories.forEach(function (cat) {
    // Omit categories with empty skills array entirely
    if (!cat.skills || cat.skills.length === 0) {
      return;
    }

    var tags = cat.skills.map(function (skill) {
      return createElement('span', { class: 'skill-tag' }, [skill]);
    });

    // Render obsolete skills with smaller/muted style
    if (cat.obsoleteSkills && cat.obsoleteSkills.length > 0) {
      cat.obsoleteSkills.forEach(function (skill) {
        tags.push(createElement('span', { class: 'skill-tag-legacy' }, [skill]));
      });
    }

    var tagContainer = createElement('div', { class: 'skill-tags' }, tags);

    var categoryDiv = createElement('div', { class: 'skills-category' }, [
      createElement('h3', null, [cat.category || '']),
      tagContainer
    ]);

    section.appendChild(categoryDiv);
  });

  return section;
}

/**
 * Builds the Projects section.
 * Each entry displays the project name, description, technologies, optional URL,
 * and project type (personal/professional).
 * @param {Array} entries — array of ProjectEntry objects
 * @returns {HTMLElement}
 */
function buildProjects(entries) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  // Filter out entries with empty name
  var valid = entries.filter(function (e) { return e.name && e.name.trim(); });
  if (valid.length === 0) {
    return null;
  }

  var section = createElement('section', { class: 'projects-section', 'aria-label': 'Projects' }, [
    createElement('h2', null, ['Projects'])
  ]);

  valid.forEach(function (entry) {
    // Build heading children: project name + optional type indicator
    var headingChildren = [entry.name || ''];
    if (entry.type) {
      headingChildren.push(
        createElement('span', { class: 'project-type' }, [' (' + entry.type + ')'])
      );
    }

    var h3 = createElement('h3', null, headingChildren);

    // Description paragraph
    var descP = createElement('p', null, [entry.description || '']);

    // Technology + URL line
    var techChildren = [];
    if (entry.technologies && entry.technologies.length > 0) {
      techChildren.push(entry.technologies.join(', '));
    }

    if (entry.url) {
      if (techChildren.length > 0) {
        techChildren.push(' · ');
      }
      techChildren.push(
        createElement('a', { href: entry.url, target: '_blank', rel: 'noopener noreferrer' }, [entry.url])
      );
    }

    var techDiv = createElement('div', { class: 'project-tech' }, techChildren);

    // Assemble article
    var article = createElement('article', { class: 'project-entry' }, [h3, descP, techDiv]);
    section.appendChild(article);
  });

  return section;
}

/**
 * Builds the Certifications & Courses section.
 * Sorts entries in reverse chronological order by year (most recent first).
 * Applies expired styling when expiryYear < current year.
 * Renders verification URL or credential ID as clickable link when provided.
 * @param {Array} entries — array of CertificationEntry objects
 * @returns {HTMLElement}
 */
function buildCertifications(entries) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  // Filter out entries with empty name
  var valid = entries.filter(function (e) { return e.name && e.name.trim(); });
  if (valid.length === 0) {
    return null;
  }

  var section = createElement('section', { class: 'certifications-section', 'aria-label': 'Certifications and Courses' }, [
    createElement('h2', null, ['Certifications & Courses'])
  ]);

  var currentYear = new Date().getFullYear();

  // Sort entries in reverse chronological order by year
  var sorted = valid.slice().sort(function (a, b) {
    return (b.year || 0) - (a.year || 0);
  });

  sorted.forEach(function (entry) {
    var isExpired = entry.expiryYear != null && entry.expiryYear < currentYear;

    var articleClass = 'cert-entry';
    if (isExpired) {
      articleClass += ' expired';
    }

    // Build h3 children: cert name + optional expired label
    var h3Children = [entry.name || ''];
    if (isExpired) {
      h3Children.push(createElement('span', { class: 'expired-label' }, ['Expired']));
    }
    var heading = createElement('h3', null, h3Children);

    // Build meta parts: issuer · year · optional expiry · optional verify link
    var metaParts = [];
    if (entry.issuer) {
      metaParts.push(entry.issuer);
    }
    if (entry.year) {
      metaParts.push(String(entry.year));
    }
    if (entry.expiryYear != null) {
      metaParts.push('Expires ' + entry.expiryYear);
    }

    var metaChildren = [metaParts.join(' \u00B7 ')];

    // Add verification link or credential ID
    if (entry.verificationUrl) {
      metaChildren.push(' \u00B7 ');
      metaChildren.push(
        createElement('a', { href: entry.verificationUrl, target: '_blank', rel: 'noopener noreferrer' }, ['Verify'])
      );
    } else if (entry.credentialId) {
      metaChildren.push(' \u00B7 ');
      metaChildren.push('ID: ' + entry.credentialId);
    }

    var meta = createElement('div', { class: 'cert-meta' }, metaChildren);

    var article = createElement('article', { class: articleClass }, [heading, meta]);
    section.appendChild(article);
  });

  return section;
}

/**
 * Builds the Languages section.
 * Sorts entries so that "Native" proficiency appears first; other entries
 * maintain their original order. Requires at least one entry to render content.
 * @param {Array} entries — array of LanguageEntry objects { name, proficiency }
 * @returns {HTMLElement}
 */
function buildLanguages(entries) {
  var section = createElement('section', { class: 'languages-section', 'aria-label': 'Languages' }, [
    createElement('h2', null, ['Languages'])
  ]);

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return section;
  }

  // Sort: Native entries first, all others maintain original order
  var native = [];
  var others = [];
  entries.forEach(function (entry) {
    if (entry.proficiency === 'Native') {
      native.push(entry);
    } else {
      others.push(entry);
    }
  });
  var sorted = native.concat(others);

  var spans = sorted.map(function (entry) {
    var profSpan = createElement('span', { class: 'proficiency' }, ['(' + entry.proficiency + ')']);
    return createElement('span', { class: 'language-entry' }, [entry.name + ' ', profSpan]);
  });

  var listDiv = createElement('div', { class: 'languages-list' }, spans);
  section.appendChild(listDiv);

  return section;
}

/**
 * Builds the Achievements & Awards section.
 * Sorts entries in reverse chronological order (most recent first).
 * Each entry displays the achievement name, awarding organisation, year,
 * and an optional quantifiable impact statement.
 * Returns an empty section element if entries is null/empty (defensive).
 * @param {Array} entries — array of AchievementEntry objects { name, organisation, year, impact? }
 * @returns {HTMLElement}
 */
function buildAchievements(entries) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  // Filter out entries with empty name
  var valid = entries.filter(function (e) { return e.name && e.name.trim(); });
  if (valid.length === 0) {
    return null;
  }

  var section = createElement('section', { class: 'achievements-section', 'aria-label': 'Achievements and Awards' }, [
    createElement('h2', null, ['Achievements & Awards'])
  ]);

  // Sort entries in reverse chronological order by year
  var sorted = valid.slice().sort(function (a, b) {
    return (b.year || 0) - (a.year || 0);
  });

  sorted.forEach(function (entry) {
    var articleChildren = [];

    // Achievement name
    articleChildren.push(createElement('h3', null, [entry.name || '']));

    // Meta line: organisation · year
    var metaParts = [];
    if (entry.organisation) {
      metaParts.push(entry.organisation);
    }
    if (entry.year) {
      metaParts.push(String(entry.year));
    }
    articleChildren.push(
      createElement('div', { class: 'achievement-meta' }, [metaParts.join(' \u00B7 ')])
    );

    // Optional impact statement
    if (entry.impact && entry.impact.trim()) {
      articleChildren.push(
        createElement('p', { class: 'achievement-impact' }, [entry.impact])
      );
    }

    var article = createElement('article', { class: 'achievement-entry' }, articleChildren);
    section.appendChild(article);
  });

  return section;
}

/**
 * Builds the References section.
 * When mode is "available-upon-request", renders italic note text.
 * When mode is "listed", renders each referee entry with name, title, company, and contact.
 * This section is always rendered last in the document when present.
 * @param {object} refs — { mode: "available-upon-request"|"listed", entries: Array }
 * @returns {HTMLElement}
 */
function buildReferences(refs) {
  if (!refs) {
    return null;
  }

  // Omit section when mode is empty and entries are empty
  if ((!refs.mode || !refs.mode.trim()) && (!refs.entries || refs.entries.length === 0)) {
    return null;
  }

  // For "listed" mode, check if all entries have empty names
  if (refs.mode === 'listed') {
    if (!refs.entries || !Array.isArray(refs.entries) || refs.entries.length === 0) {
      return null;
    }
    var hasNamed = refs.entries.some(function (e) { return e.name && e.name.trim(); });
    if (!hasNamed) {
      return null;
    }
  }

  var section = createElement('section', { class: 'references-section', 'aria-label': 'References' }, [
    createElement('h2', null, ['References'])
  ]);

  if (refs.mode === 'available-upon-request') {
    section.appendChild(
      createElement('p', { class: 'references-note' }, ['Available upon request'])
    );
  } else if (refs.mode === 'listed') {
    if (refs.entries && Array.isArray(refs.entries)) {
      refs.entries.forEach(function (entry) {
        var entryDiv = createElement('div', { class: 'reference-entry' }, [
          createElement('strong', null, [entry.name || '']),
          document.createTextNode(' \u2014 ' + (entry.title || '') + ', ' + (entry.company || '')),
          createElement('div', null, ['Contact: ' + (entry.contact || '')])
        ]);
        section.appendChild(entryDiv);
      });
    }
  }

  return section;
}

/**
 * Builds the Driver's Licence section.
 * Renders the licence type in a smaller font. Only called when type is non-empty.
 * @param {object} licence — { type: string }
 * @returns {HTMLElement|null}
 */
function buildDriversLicence(licence) {
  if (!licence || !licence.category || !licence.category.trim()) {
    return null;
  }

  var section = createElement('section', { class: 'drivers-licence-section', 'aria-label': "Driver's Licence" }, [
    createElement('h2', null, ["Driver's Licence"]),
    createElement('p', null, ['Category: ' + licence.category])
  ]);

  return section;
}

// ─── CV Renderer & Entry Point ──────────────────────────────────────────────

/**
 * Renders the full CV by calling each section builder in order and appending
 * results to the given root element. After rendering, applies validation
 * warning CSS classes based on the validation result.
 *
 * Section order:
 *   Header → Summary → Work Experience → Technical Skills → Education →
 *   Projects → Certifications → Languages → Achievements (if present) →
 *   References (if present) → Driver's Licence (if present, always last)
 *
 * @param {object} data — parsed CVData object
 * @param {object} validationResult — { valid: boolean, warnings: [] }
 * @param {HTMLElement} root — the container element to render into
 */
function renderCV(data, validationResult, root) {
  // Clear existing content
  root.innerHTML = '';

  // Build and append each section in order
  root.appendChild(buildHeader(data.header));
  root.appendChild(buildSummary(data.professionalSummary));
  root.appendChild(buildWorkExperience(data.workExperience));
  root.appendChild(buildTechnicalSkills(data.technicalSkills));
  root.appendChild(buildEducation(data.education));

  // Projects, Certifications, Achievements, References return null when all entries have empty names
  var projectsEl = buildProjects(data.projects);
  if (projectsEl) { root.appendChild(projectsEl); }

  var certsEl = buildCertifications(data.certifications);
  if (certsEl) { root.appendChild(certsEl); }

  root.appendChild(buildLanguages(data.languages));

  // Optional: Achievements (only if array exists and has named entries)
  if (data.achievements && data.achievements.length > 0) {
    var achievementsEl = buildAchievements(data.achievements);
    if (achievementsEl) { root.appendChild(achievementsEl); }
  }

  // Optional: References (always last when present, except Driver's Licence)
  if (data.references) {
    var refsEl = buildReferences(data.references);
    if (refsEl) { root.appendChild(refsEl); }
  }

  // Driver's Licence — always last section when present
  if (data.driversLicense) {
    var dlEl = buildDriversLicence(data.driversLicense);
    if (dlEl) { root.appendChild(dlEl); }
  }

  // Accessibility footer (screen only; hidden in print)
  var footer = createElement('footer', { class: 'cv-footer', 'aria-label': 'Page information' }, [
    'This page is built with accessibility in mind — semantic HTML, ARIA landmarks, and WCAG AA contrast.'
  ]);
  root.parentNode.appendChild(footer);

  // Print-only footer with the live website URL
  var printFooter = createElement('footer', { class: 'print-footer', 'aria-hidden': 'true' }, [
    'View the live version at ',
    createElement('a', { href: 'https://cv-gules-psi.vercel.app/' }, ['https://cv-gules-psi.vercel.app/'])
  ]);
  root.parentNode.appendChild(printFooter);

  // Apply validation warning classes to affected elements
  if (validationResult && validationResult.warnings) {
    validationResult.warnings.forEach(function (warning) {
      applyValidationWarning(root, warning);
    });
  }
}

/**
 * Applies a validation warning CSS class to the element matching the warning.
 * Looks for elements by section data attribute or known class patterns.
 *
 * @param {HTMLElement} root — rendered CV root
 * @param {object} warning — { section, field, message }
 */
function applyValidationWarning(root, warning) {
  var selector = '';

  if (warning.section === 'header') {
    // Mark specific header fields with warning class
    selector = '[data-field="' + warning.field + '"]';
  } else if (warning.section === 'professionalSummary') {
    selector = '.summary-section';
  } else if (warning.section === 'workExperience') {
    // If the warning has an index, target that specific entry
    if (warning.index != null) {
      var entries = root.querySelectorAll('.work-entry');
      if (entries[warning.index]) {
        entries[warning.index].classList.add('cv-warning');
      }
      return;
    }
    selector = '.work-experience-section';
  }

  if (selector) {
    var el = root.querySelector(selector);
    if (el) {
      el.classList.add('cv-warning');
    }
  }
}

/**
 * Main entry point. Fetches CV data, validates it, and renders the CV.
 * Invoked automatically when the script loads.
 */
async function main() {
  var data = await fetchCV('cv.json');
  if (!data) {
    // fetchCV already called showError; abort rendering
    return;
  }

  var validationResult = validateCV(data);

  var root = document.getElementById('cv-root');
  if (!root) {
    showError('Missing CV root element in the page.');
    return;
  }

  renderCV(data, validationResult, root);
}

// Invoke main on load
main();
