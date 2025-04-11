const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ✅ Moderator scans QR
router.post('/scan', verifyToken, requireRole('moderator'), async (req, res) => {
  const { event_id, user_id } = req.body;

  try {
    // Check if user is part of the event
    const participant = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [event_id, user_id]
    );

    if (participant.rows.length === 0)
      return res.status(403).json({ msg: 'Not registered for this event' });

    // Record attendance
    await pool.query(
      `INSERT INTO attendance (event_id, user_id) VALUES ($1, $2)`,
      [event_id, user_id]
    );

    res.json({ msg: 'Attendance recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Error scanning QR' });
  }
});

module.exports = router;