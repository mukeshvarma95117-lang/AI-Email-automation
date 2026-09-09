export function extractVariables(text) {
  if (!text) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.add(match[1].trim());
  }
  return Array.from(matches);
}

export function substituteVariables(text, contact = {}, globalVars = {}) {
  if (!text) return '';

  let customFields = {};
  if (contact.custom_fields) {
    customFields = typeof contact.custom_fields === 'string'
      ? (() => { try { return JSON.parse(contact.custom_fields); } catch(e) { return {}; } })()
      : contact.custom_fields;
  }

  const fullName = contact.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const merged = {
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

  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const key = varName.trim();
    const foundKey = Object.keys(merged).find(k => k.toLowerCase() === key.toLowerCase());
    return (foundKey && merged[foundKey] !== undefined && merged[foundKey] !== '') 
      ? merged[foundKey] 
      : match;
  });
}

