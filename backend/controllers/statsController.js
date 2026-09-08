import dbHelper from '../database/db.js';

export function getDashboardStats(req, res) {
  try {
    const contactsCount = dbHelper.get('SELECT COUNT(*) as count FROM contacts')?.count || 0;
    const sentCount = dbHelper.get("SELECT COUNT(*) as count FROM message_logs WHERE status IN ('Sent', 'delivered', 'Demo Sent')")?.count || 0;
    const scheduledCount = dbHelper.get("SELECT COUNT(*) as count FROM scheduled_messages WHERE status = 'scheduled'")?.count || 0;
    const failedCount = dbHelper.get("SELECT COUNT(*) as count FROM message_logs WHERE status = 'Failed'")?.count || 0;

    // Channel breakdown
    const channelStats = dbHelper.all(`
      SELECT channel, COUNT(*) as count 
      FROM message_logs 
      GROUP BY channel
    `);

    // Channel map with defaults
    const channels = { email: 0, whatsapp: 0, sms: 0 };
    for (const c of channelStats) {
      if (channels[c.channel] !== undefined) {
        channels[c.channel] = c.count;
      }
    }

    // Recent activity list
    const recentActivities = dbHelper.all(`
      SELECT 
        l.id,
        l.contact_name,
        l.channel,
        l.rendered_subject,
        l.status,
        l.is_demo,
        l.delivery_timestamp,
        m.prompt
      FROM message_logs l
      LEFT JOIN messages m ON l.message_id = m.id
      ORDER BY l.id DESC
      LIMIT 8
    `);

    // Next upcoming scheduled messages
    const upcomingScheduled = dbHelper.all(`
      SELECT s.*, m.prompt
      FROM scheduled_messages s
      LEFT JOIN messages m ON s.message_id = m.id
      WHERE s.status = 'scheduled'
      ORDER BY s.scheduled_time ASC
      LIMIT 4
    `);

    // Groups summary
    const groupSummary = dbHelper.all(`
      SELECT g.id, g.name, g.color, COUNT(c.id) as contact_count
      FROM groups_table g
      LEFT JOIN contacts c ON g.id = c.group_id
      GROUP BY g.id
    `);

    return res.json({
      stats: {
        totalContacts: contactsCount,
        messagesSent: sentCount,
        scheduledMessages: scheduledCount,
        failedMessages: failedCount
      },
      channels,
      recentActivities,
      upcomingScheduled,
      groupSummary
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
}

