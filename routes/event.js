const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// ✅ Register team for event
router.post('/register', verifyToken, async (req, res) => {
  const { event_name, participant_ids } = req.body;
  const user_id = req.user.id;

  if (!event_name || !participant_ids || participant_ids.length === 0) {
    return res.status(400).json({ msg: 'Missing event name or participants' });
  }

  try {
    // Get user's team
    const teamRes = await pool.query(`
      SELECT t.id AS team_id, t.leader_id
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = $1
    `, [user_id]);

    if (teamRes.rows.length === 0) {
      return res.status(403).json({ msg: 'User is not in a team' });
    }

    const { team_id, leader_id } = teamRes.rows[0];

    // Only team leader can register
    if (user_id !== leader_id) {
      return res.status(403).json({ msg: 'Only team leader can register for events' });
    }

    // Check if already registered
    const exists = await pool.query(`
      SELECT * FROM event_registrations WHERE event_name = $1 AND team_id = $2
    `, [event_name, team_id]);

    if (exists.rows.length > 0) {
      return res.status(400).json({ msg: 'Already registered for this event' });
    }

    // Insert registration
    await pool.query(`
      INSERT INTO event_registrations (event_name, team_id, participant_ids)
      VALUES ($1, $2, $3)
    `, [event_name, team_id, participant_ids]);

    res.json({ msg: 'Event registration successful' });
  } catch (err) {
    console.error('Event registration error:', err.message);
    res.status(500).json({ msg: 'Event registration failed' });
  }
});

// ✅ Get all events registered by the user's team
router.get('/registered', verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const teamRes = await pool.query(`
      SELECT t.id AS team_id
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = $1
    `, [user_id]);

    if (teamRes.rows.length === 0) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    const team_id = teamRes.rows[0].team_id;

    const result = await pool.query(`
      SELECT event_name, participant_ids, created_at
      FROM event_registrations
      WHERE team_id = $1
      ORDER BY created_at DESC
    `, [team_id]);

    res.json({ events: result.rows });
  } catch (err) {
    console.error('Fetch registered events error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch registered events' });
  }
});

// ✅ Get all event list
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, description FROM events`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ msg: 'Failed to load events' });
  }
});

module.exports = router;