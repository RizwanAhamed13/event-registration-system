const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { Parser } = require('json2csv');

// ✅ Route to mark attendance
router.post('/attendance', verifyToken, async (req, res) => {
  const { event_id, user_id, status } = req.body;

  if (!event_id || !user_id || status === undefined) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    // Check if the user is part of the event
    const eventRes = await pool.query(`
      SELECT * FROM event_registrations
      WHERE event_id = $1 AND participant_ids @> ARRAY[$2]::UUID[]
    `, [event_id, user_id]);

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ msg: 'User is not registered for this event' });
    }

    // Insert or update attendance
    const check = await pool.query(`
      SELECT * FROM attendance
      WHERE event_id = $1 AND user_id = $2
    `, [event_id, user_id]);

    if (check.rows.length > 0) {
      await pool.query(`
        UPDATE attendance
        SET status = $1, created_at = CURRENT_TIMESTAMP
        WHERE event_id = $2 AND user_id = $3
      `, [status, event_id, user_id]);
    } else {
      await pool.query(`
        INSERT INTO attendance (event_id, user_id, status)
        VALUES ($1, $2, $3)
      `, [event_id, user_id, status]);
    }

    res.json({ msg: 'Attendance updated successfully' });
  } catch (err) {
    console.error('Attendance mark error:', err.message);
    res.status(500).json({ msg: 'Failed to mark attendance' });
  }
});

// ✅ Route to export attendance CSV
router.get('/export/:eventId', verifyToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        u.name, u.email, u.roll_number, u.section, u.department,
        a.status, a.created_at
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.event_id = $1
    `, [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'No attendance records found' });
    }

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Roll Number', value: 'roll_number' },
      { label: 'Section', value: 'section' },
      { label: 'Department', value: 'department' },
      { label: 'Status', value: row => row.status ? 'Present' : 'Absent' },
      { label: 'Timestamp', value: 'created_at' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_event_${eventId}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err.message);
    res.status(500).json({ msg: 'Failed to export attendance' });
  }
});

module.exports = router;