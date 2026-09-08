import dbHelper from '../database/db.js';

export function getContacts(req, res) {
  try {
    const { search, group_id, limit = 100, offset = 0 } = req.query;

    let sql = `
      SELECT c.*, g.name as group_name, g.color as group_color 
      FROM contacts c 
      LEFT JOIN groups_table g ON c.group_id = g.id 
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      sql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (group_id && group_id !== 'all') {
      sql += ` AND c.group_id = ?`;
      params.push(group_id);
    }

    sql += ` ORDER BY c.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const contacts = dbHelper.all(sql, params).map(c => {
      let customFields = {};
      try {
        customFields = c.custom_fields ? JSON.parse(c.custom_fields) : {};
      } catch (e) {
        customFields = {};
      }
      return { ...c, custom_fields: customFields };
    });

    const totalRow = dbHelper.get('SELECT count(*) as count FROM contacts');

    return res.json({
      contacts,
      total: totalRow?.count || 0
    });
  } catch (err) {
    console.error('getContacts error:', err);
    return res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
}

export function getContactById(req, res) {
  try {
    const { id } = req.params;
    const contact = dbHelper.get(
      `SELECT c.*, g.name as group_name 
       FROM contacts c 
       LEFT JOIN groups_table g ON c.group_id = g.id 
       WHERE c.id = ?`,
      [id]
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    let customFields = {};
    try {
      customFields = contact.custom_fields ? JSON.parse(contact.custom_fields) : {};
    } catch (e) {
      customFields = {};
    }

    return res.json({ contact: { ...contact, custom_fields: customFields } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch contact details.' });
  }
}

export function createContact(req, res) {
  try {
    const { name, email, phone, group_id, custom_fields } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Contact name is required.' });
    }

    const fieldsJson = typeof custom_fields === 'object' ? JSON.stringify(custom_fields) : (custom_fields || '{}');

    const result = dbHelper.run(
      `INSERT INTO contacts (name, email, phone, group_id, custom_fields, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [name.trim(), email?.trim() || null, phone?.trim() || null, group_id || null, fieldsJson]
    );

    const newContact = dbHelper.get('SELECT * FROM contacts WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json({
      message: 'Contact created successfully.',
      contact: newContact
    });
  } catch (err) {
    console.error('createContact error:', err);
    return res.status(500).json({ error: 'Failed to create contact.' });
  }
}

export function updateContact(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, group_id, custom_fields } = req.body;

    const existing = dbHelper.get('SELECT * FROM contacts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    const fieldsJson = typeof custom_fields === 'object' ? JSON.stringify(custom_fields) : (custom_fields || '{}');

    dbHelper.run(
      `UPDATE contacts 
       SET name = ?, email = ?, phone = ?, group_id = ?, custom_fields = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        name ? name.trim() : existing.name,
        email !== undefined ? (email ? email.trim() : null) : existing.email,
        phone !== undefined ? (phone ? phone.trim() : null) : existing.phone,
        group_id !== undefined ? group_id : existing.group_id,
        fieldsJson,
        id
      ]
    );

    const updated = dbHelper.get('SELECT * FROM contacts WHERE id = ?', [id]);
    return res.json({ message: 'Contact updated successfully.', contact: updated });
  } catch (err) {
    console.error('updateContact error:', err);
    return res.status(500).json({ error: 'Failed to update contact.' });
  }
}

export function deleteContact(req, res) {
  try {
    const { id } = req.params;
    const existing = dbHelper.get('SELECT id FROM contacts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    dbHelper.run('DELETE FROM contacts WHERE id = ?', [id]);
    return res.json({ message: 'Contact deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete contact.' });
  }
}

/**
 * Import contacts from CSV parsed data (array of objects or raw text)
 */
export function importCsv(req, res) {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No valid contact rows provided in CSV.' });
    }

    let inserted = 0;
    let errors = 0;

    for (const row of rows) {
      const name = row.name || row.Name || row['Full Name'] || row.fullName;
      if (!name) {
        errors++;
        continue;
      }

      const email = row.email || row.Email || null;
      const phone = row.phone || row.Phone || row['Phone Number'] || null;
      const groupName = row.group || row.Group || row['Group Name'] || null;

      let groupId = null;
      if (groupName) {
        let g = dbHelper.get('SELECT id FROM groups_table WHERE LOWER(name) = LOWER(?)', [groupName.trim()]);
        if (!g) {
          const newG = dbHelper.run('INSERT INTO groups_table (name) VALUES (?)', [groupName.trim()]);
          groupId = newG.lastInsertRowid;
        } else {
          groupId = g.id;
        }
      }

      // Collect custom fields (all extra columns)
      const standardKeys = ['name', 'Name', 'Full Name', 'fullName', 'email', 'Email', 'phone', 'Phone', 'Phone Number', 'group', 'Group', 'Group Name'];
      const customFields = {};
      for (const [k, v] of Object.entries(row)) {
        if (!standardKeys.includes(k) && v !== undefined && v !== null && v !== '') {
          customFields[k] = v;
        }
      }

      try {
        dbHelper.run(
          `INSERT INTO contacts (name, email, phone, group_id, custom_fields) VALUES (?, ?, ?, ?, ?)`,
          [name.trim(), email ? email.trim() : null, phone ? phone.trim() : null, groupId, JSON.stringify(customFields)]
        );
        inserted++;
      } catch (insertErr) {
        errors++;
      }
    }

    return res.json({
      message: `CSV import completed: ${inserted} contacts imported, ${errors} skipped.`,
      inserted,
      errors
    });
  } catch (err) {
    console.error('importCsv error:', err);
    return res.status(500).json({ error: 'Failed to process CSV import.' });
  }
}

/**
 * Export contacts as CSV format string
 */
export function exportContacts(req, res) {
  try {
    const contacts = dbHelper.all(`
      SELECT c.name, c.email, c.phone, g.name as group_name, c.custom_fields 
      FROM contacts c 
      LEFT JOIN groups_table g ON c.group_id = g.id 
      ORDER BY c.id ASC
    `);

    // Build CSV
    const headers = ['Name', 'Email', 'Phone', 'Group', 'Custom Fields'];
    const lines = [headers.join(',')];

    for (const c of contacts) {
      const line = [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.group_name || '').replace(/"/g, '""')}"`,
        `"${(c.custom_fields || '{}').replace(/"/g, '""')}"`
      ];
      lines.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartsend_contacts.csv"');
    return res.send(lines.join('\n'));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to export contacts.' });
  }
}

