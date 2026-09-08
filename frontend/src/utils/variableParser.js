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

  const merged = {
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    group: contact.group_name || '',
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

