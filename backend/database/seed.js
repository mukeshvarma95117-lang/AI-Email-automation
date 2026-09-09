import bcrypt from 'bcryptjs';
import dbHelper from './db.js';

export async function seedDatabase() {
  console.log('Seeding SmartSend AI database...');

  // 1. Seed default admin user if not exists
  const existingUser = dbHelper.get('SELECT * FROM users WHERE email = ?', ['admin@smartsend.ai']);
  let adminId = existingUser?.id;

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const result = dbHelper.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@smartsend.ai', passwordHash, 'admin']
    );
    adminId = result.lastInsertRowid;
    console.log('Created default admin user: admin@smartsend.ai (password: admin123)');
  }

  // 2. Seed groups
  const groups = [
    { name: 'AI Workshop Students', description: 'Enrolled attendees for hands-on GenAI mini-project series', color: '#6366F1' },
    { name: 'Web Dev Cohort', description: 'Full-stack web engineering students', color: '#0EA5E9' },
    { name: 'Faculty & Mentors', description: 'Professors, department heads, and guest speakers', color: '#10B981' },
    { name: 'VIP Hackathon Finalists', description: 'Top 10 shortlisted student developer teams', color: '#F59E0B' }
  ];

  const groupMap = {};
  for (const g of groups) {
    const existing = dbHelper.get('SELECT id FROM groups_table WHERE name = ?', [g.name]);
    if (existing) {
      groupMap[g.name] = existing.id;
    } else {
      const res = dbHelper.run(
        'INSERT INTO groups_table (name, description, color) VALUES (?, ?, ?)',
        [g.name, g.description, g.color]
      );
      groupMap[g.name] = res.lastInsertRowid;
    }
  }

  // 3. Seed contacts if table empty
  const contactCount = dbHelper.get('SELECT count(*) as count FROM contacts')?.count || 0;
  if (contactCount === 0) {
    const contacts = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.edu',
        phone: '+1 555-0192',
        group_id: groupMap['AI Workshop Students'],
        custom_fields: JSON.stringify({
          event: "Tomorrow's Hands-On AI Workshop",
          date: 'tomorrow, Sept 8',
          time: '10:00 AM',
          location: 'Lab 3B & Zoom Room 4',
          student_id: 'CS-2024-042'
        })
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.edu',
        phone: '+1 555-0193',
        group_id: groupMap['AI Workshop Students'],
        custom_fields: JSON.stringify({
          event: "Tomorrow's Hands-On AI Workshop",
          date: 'tomorrow, Sept 8',
          time: '10:00 AM',
          location: 'Lab 3B & Zoom Room 4',
          student_id: 'CS-2024-089'
        })
      },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.edu',
        phone: '+1 555-0194',
        group_id: groupMap['AI Workshop Students'],
        custom_fields: JSON.stringify({
          event: "Tomorrow's Hands-On AI Workshop",
          date: 'tomorrow, Sept 8',
          time: '10:00 AM',
          location: 'Lab 3B & Zoom Room 4',
          student_id: 'CS-2024-115'
        })
      },
      {
        name: 'Sarah Connor',
        email: 'sarah.c@example.org',
        phone: '+1 555-0199',
        group_id: groupMap['AI Workshop Students'],
        custom_fields: JSON.stringify({
          event: "Tomorrow's Hands-On AI Workshop",
          date: 'tomorrow, Sept 8',
          time: '10:00 AM',
          location: 'Lab 3B & Zoom Room 4',
          student_id: 'CS-2024-201'
        })
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.edu',
        phone: '+1 555-0195',
        group_id: groupMap['Web Dev Cohort'],
        custom_fields: JSON.stringify({
          event: 'Full Stack Capstone Review',
          date: 'Thursday, Sept 10',
          time: '2:30 PM',
          location: 'Auditorium 1',
          student_id: 'IT-2024-018'
        })
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.v@example.edu',
        phone: '+1 555-0196',
        group_id: groupMap['Web Dev Cohort'],
        custom_fields: JSON.stringify({
          event: 'Full Stack Capstone Review',
          date: 'Thursday, Sept 10',
          time: '2:30 PM',
          location: 'Auditorium 1',
          student_id: 'IT-2024-055'
        })
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'e.rostova@university.edu',
        phone: '+1 555-0197',
        group_id: groupMap['Faculty & Mentors'],
        custom_fields: JSON.stringify({
          event: 'Academic Council & Syllabus Review',
          date: 'Friday, Sept 11',
          time: '11:00 AM',
          location: 'Boardroom Alpha',
          department: 'Computer Science'
        })
      },
      {
        name: 'Prof. David Kim',
        email: 'dkim@university.edu',
        phone: '+1 555-0198',
        group_id: groupMap['Faculty & Mentors'],
        custom_fields: JSON.stringify({
          event: 'Academic Council & Syllabus Review',
          date: 'Friday, Sept 11',
          time: '11:00 AM',
          location: 'Boardroom Alpha',
          department: 'AI & Robotics'
        })
      },
      {
        name: 'Devin Chen',
        email: 'devin.chen@codefest.io',
        phone: '+1 555-0210',
        group_id: groupMap['VIP Hackathon Finalists'],
        custom_fields: JSON.stringify({
          event: 'Grand Hackathon Final Pitch',
          date: 'Saturday, Sept 12',
          time: '9:00 AM',
          location: 'Innovation Hub Main Stage',
          team_name: 'NeuralCrafters'
        })
      },
      {
        name: 'Fatima Al-Mansoor',
        email: 'fatima.m@codefest.io',
        phone: '+1 555-0211',
        group_id: groupMap['VIP Hackathon Finalists'],
        custom_fields: JSON.stringify({
          event: 'Grand Hackathon Final Pitch',
          date: 'Saturday, Sept 12',
          time: '9:00 AM',
          location: 'Innovation Hub Main Stage',
          team_name: 'VectorVanguard'
        })
      }
    ];

    for (const c of contacts) {
      dbHelper.run(
        'INSERT INTO contacts (name, email, phone, group_id, custom_fields) VALUES (?, ?, ?, ?, ?)',
        [c.name, c.email, c.phone, c.group_id, c.custom_fields]
      );
    }
    console.log(`Seeded ${contacts.length} sample contacts.`);
  }

  // 4. Seed initial messages & message logs
  const messageCount = dbHelper.get('SELECT count(*) as count FROM messages')?.count || 0;
  if (messageCount === 0 && adminId) {
    const msg1 = dbHelper.run(
      `INSERT INTO messages (user_id, prompt, subject, body, short_version, cta, channel, recipient_count, recipients_json, status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        'Send a professional reminder to all students about tomorrow’s AI workshop at 10 AM.',
        'Reminder: Hands-On AI Workshop Tomorrow at 10:00 AM',
        'Hi {{name}},\n\nThis is a friendly reminder that {{event}} is scheduled for {{date}} at {{time}} in {{location}}.\n\nPlease arrive 10 minutes early with your laptop prepared with Python 3.11+ installed.\n\nWe look forward to building cutting-edge GenAI applications together!\n\nBest regards,\nSmartSend Academic Team',
        'Reminder: AI Workshop starts tomorrow at 10:00 AM in Lab 3B. Bring your laptop!',
        'Join Online Session',
        'email',
        4,
        JSON.stringify(['rahul.sharma@example.edu', 'priya.patel@example.edu', 'alex.johnson@example.edu', 'sarah.c@example.org']),
        'sent',
        1
      ]
    );

    const msg1Id = msg1.lastInsertRowid;
    const sampleRecipients = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.edu', status: 'delivered' },
      { name: 'Priya Patel', email: 'priya.patel@example.edu', status: 'delivered' },
      { name: 'Alex Johnson', email: 'alex.johnson@example.edu', status: 'delivered' },
      { name: 'Sarah Connor', email: 'sarah.c@example.org', status: 'delivered' }
    ];

    for (const r of sampleRecipients) {
      dbHelper.run(
        `INSERT INTO message_logs (message_id, contact_name, contact_target, channel, rendered_subject, rendered_body, status, is_demo, delivery_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))`,
        [
          msg1Id,
          r.name,
          r.email,
          'email',
          'Reminder: Hands-On AI Workshop Tomorrow at 10:00 AM',
          `Hi ${r.name},\n\nThis is a friendly reminder that Tomorrow's Hands-On AI Workshop is scheduled for tomorrow, Sept 8 at 10:00 AM in Lab 3B & Zoom Room 4.`,
          r.status,
          1
        ]
      );
    }

    // Add a scheduled message
    dbHelper.run(
      `INSERT INTO scheduled_messages (message_id, channel, subject, body, recipients_json, scheduled_time, timezone, status, is_demo)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+1 day'), 'Asia/Kolkata', 'scheduled', 1)`,
      [
        msg1Id,
        'whatsapp',
        'Urgent: Capstone Code Freeze',
        'Hi {{name}}, urgent notice: The GitHub repository submission closes at 11:59 PM. Please push your final branch immediately.',
        JSON.stringify(['+1 555-0195', '+1 555-0196']),
      ]
    );

    console.log('Seeded sample messages, scheduled message, and logs.');
  }

  // 5. Seed default settings
  const defaultSettings = [
    { key: 'demo_mode', value: 'true' },
    { key: 'default_channel', value: 'email' },
    { key: 'default_tone', value: 'Professional' },
    { key: 'default_language', value: 'English' },
    { key: 'timezone', value: 'Asia/Kolkata' },
    { key: 'llm_provider', value: 'openai' },
    { key: 'llm_model', value: 'gpt-4o-mini' },
    { key: 'llm_base_url', value: 'https://api.openai.com/v1' },
    { key: 'llm_api_key', value: '' },
    { key: 'email_provider', value: 'resend' },
    { key: 'resend_api_key', value: '' },
    { key: 'resend_from', value: 'SmartSend AI <notifications@smartsendai.online>' },
    { key: 'email_host', value: 'smtp.gmail.com' },
    { key: 'email_port', value: '587' },
    { key: 'email_user', value: '' },
    { key: 'email_pass', value: '' },
    { key: 'email_from', value: 'notifications@smartsend.ai' },
    { key: 'whatsapp_provider', value: 'meta_cloud' },
    { key: 'whatsapp_token', value: '' },
    { key: 'whatsapp_phone_number_id', value: '' },
    { key: 'sms_provider', value: 'twilio' },
    { key: 'sms_account_sid', value: '' },
    { key: 'sms_auth_token', value: '' },
    { key: 'sms_from_number', value: '+15550100' }
  ];

  for (const s of defaultSettings) {
    const exists = dbHelper.get('SELECT key FROM settings WHERE key = ?', [s.key]);
    if (!exists) {
      dbHelper.run('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
    }
  }

  console.log('Database initialization & seeding complete!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

