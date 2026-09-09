/**
 * Variable Resolver Service
 * Handles {{variable}} extraction, replacement, and validation against contact data
 */

export function extractVariables(template) {
  if (!template) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1].trim());
  }
  return Array.from(matches);
}

export function resolveVariables(text, contact = {}, globalVars = {}) {
  if (!text) return { text: '', unresolvedVariables: [], isFullyResolved: true };

  // Parse contact custom fields if JSON string
  let customFields = {};
  if (contact.custom_fields) {
    try {
      customFields = typeof contact.custom_fields === 'string' 
        ? JSON.parse(contact.custom_fields) 
        : contact.custom_fields;
    } catch (e) {
      customFields = {};
    }
  }

  // Merge available variables dictionary:
  // Priority: customFields -> globalVars -> direct contact properties
  const fullName = contact.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const mergedVars = {
    ...contact,
    name: fullName,
    first_name: contact.first_name || firstName,
    firstname: contact.firstname || firstName,
    last_name: contact.last_name || lastName,
    lastname: contact.lastname || lastName,
    email: contact.email || '',
    phone: contact.phone || '',
    group: contact.group_name || contact.group || '',
    ...globalVars,
    ...customFields
  };

  const regex = /\{\{([^}]+)\}\}/g;
  const unresolved = [];

  const replacedText = text.replace(regex, (fullMatch, varName) => {
    const cleanKey = varName.trim();
    // Check case-insensitive key in mergedVars
    const foundKey = Object.keys(mergedVars).find(
      k => k.toLowerCase() === cleanKey.toLowerCase()
    );

    if (foundKey && mergedVars[foundKey] !== undefined && mergedVars[foundKey] !== '') {
      return mergedVars[foundKey];
    } else {
      unresolved.push(cleanKey);
      return fullMatch; // Keep original {{key}} so user sees it
    }
  });

  return {
    text: replacedText,
    unresolvedVariables: Array.from(new Set(unresolved)),
    isFullyResolved: unresolved.length === 0
  };
}

export function validateMessageVariables(template, sampleContact = {}) {
  const vars = extractVariables(template);
  const { unresolvedVariables } = resolveVariables(template, sampleContact);
  return {
    totalVariables: vars,
    unresolvedVariables,
    hasUnresolved: unresolvedVariables.length > 0
  };
}

