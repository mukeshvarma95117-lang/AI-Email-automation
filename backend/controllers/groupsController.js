import dbHelper from '../database/db.js';

export function getGroups(req, res) {
  try {
    const groups = dbHelper.all(`
      SELECT g.*, COUNT(c.id) as contact_count 
      FROM groups_table g 
      LEFT JOIN contacts c ON g.id = c.group_id 
      GROUP BY g.id 
      ORDER BY g.name ASC
    `);
    return res.json({ groups });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch groups.' });
  }
}

export function createGroup(req, res) {
  try {
    const { name, description, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    const existing = dbHelper.get('SELECT id FROM groups_table WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'Group with this name already exists.' });
    }

    const result = dbHelper.run(
      'INSERT INTO groups_table (name, description, color) VALUES (?, ?, ?)',
      [name.trim(), description || null, color || '#6366F1']
    );

    const newGroup = dbHelper.get('SELECT * FROM groups_table WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json({ message: 'Group created successfully.', group: { ...newGroup, contact_count: 0 } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create group.' });
  }
}

export function deleteGroup(req, res) {
  try {
    const { id } = req.params;
    const existing = dbHelper.get('SELECT id FROM groups_table WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Set contact group_id to null
    dbHelper.run('UPDATE contacts SET group_id = NULL WHERE group_id = ?', [id]);
    dbHelper.run('DELETE FROM groups_table WHERE id = ?', [id]);

    return res.json({ message: 'Group deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete group.' });
  }
}

