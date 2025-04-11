const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// ✅ Register team for an event
router.post('/register', verifyToken, async (req, res) => {
  const { event_id, members } = req.body;

  try {
    const team = await pool.query(
      `SELECT team_id FROM team_members WHERE user_id = $1`,
      [req.user.id]
    );

    if (!team.rows[0]) return res.status(400).json({ msg: 'Not in a team' });
    const team_id = team.rows[0].team_id;

    const already = await pool.query(
      `SELECT * FROM event_registrations WHERE team_id = $1 AND event_id = $2`,
      [team_id, event_id]
    );
    if (already.rows.length > 0) return res.status(400).json({ msg: 'Already registered' });

    await pool.query(
      `INSERT INTO event_registrations (team_id, event_id) VALUES ($1, $2)`,
      [team_id, event_id]
    );

    // Insert event participants
    for (const user_id of members) {
      await pool.query(
        `INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)`,
        [event_id, user_id]
      );
    }

    res.json({ msg: 'Event registration pending approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;