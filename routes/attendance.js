const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// ✅ Mark or update attendance
router.post('/mark', verifyToken, async (req, res) => {
  const { event_id, user_id, status } = req.body;

  if (!event_id || !user_id || status === undefined) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    // Confirm user is part of the event
    const regRes = await pool.query(`
      SELECT * FROM event_registrations
      WHERE event_id = $1 AND participant_ids::text[] @> ARRAY[$2]
    `, [event_id, user_id]);

    if (regRes.rows.length === 0) {
      return res.status(404).json({ msg: 'User not registered for the event' });
    }

    // Check for existing attendance
    const check = await pool.query(`
      SELECT * FROM attendance
      WHERE event_id = $1 AND user_id = $2
    `, [event_id, user_id]);

    if (check.rows.length > 0) {
      // Update status
      await pool.query(`
        UPDATE attendance
        SET status = $1, created_at = CURRENT_TIMESTAMP
        WHERE event_id = $2 AND user_id = $3
      `, [status, event_id, user_id]);
    } else {
      // Insert new
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

// ✅ Export attendance as CSV
router.get('/export', verifyToken, async (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ msg: 'Event ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT u.name, u.email, u.roll_number, u.department, a.status, a.created_at
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE a.event_id = $1
    `, [event_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'No attendance records found' });
    }

    const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Status', 'Timestamp'];
    const csv = [
      headers.join(','),
      ...result.rows.map(r => [
        r.name,
        r.email,
        r.roll_number,
        r.department,
        r.status ? 'Present' : 'Absent',
        new Date(r.created_at).toLocaleString()
      ].join(','))
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_${event_id}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err.message);
    res.status(500).json({ msg: 'Failed to export attendance CSV' });
  }
});

module.exports = router;