const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// ✅ Register team for event with QR data per participant
router.post('/register', verifyToken, async (req, res) => {
  const { event_id, participant_ids } = req.body;
  const user_id = req.user.id;

  console.log('📥 Received request to register team');
  console.log('➡️ Event ID:', event_id);
  console.log('➡️ Participant IDs:', participant_ids);

  if (!event_id || !participant_ids || participant_ids.length === 0) {
    return res.status(400).json({ msg: 'Missing event ID or participants' });
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
      console.log('❌ No team found for user');
      return res.status(403).json({ msg: 'User is not in a team' });
    }

    const { team_id, leader_id } = teamRes.rows[0];
    console.log('✅ User team ID:', team_id);
    console.log('👑 Team leader ID:', leader_id);

    if (user_id !== leader_id) {
      console.log('❌ User is not the team leader');
      return res.status(403).json({ msg: 'Only team leader can register for events' });
    }

    // Check if already registered
    const exists = await pool.query(`
      SELECT 1 FROM event_registrations WHERE event_id = $1 AND team_id = $2
    `, [event_id, team_id]);

    if (exists.rows.length > 0) {
      console.log('⚠️ Already registered for this event');
      return res.status(400).json({ msg: 'Already registered for this event' });
    }

    // ✅ Generate QR data per participant
    const qrData = participant_ids.map(pid => ({
      participant_id: pid,
      qr: {
        event_id,
        team_id,
        participant_id: pid
      }
    }));

    console.log('📦 QR Data to insert:', JSON.stringify(qrData, null, 2));

    // ✅ Insert registration with qr_data column as JSONB
    await pool.query(`
      INSERT INTO event_registrations (event_id, team_id, participant_ids, qr_data)
      VALUES ($1, $2, $3, $4::jsonb)
    `, [event_id, team_id, participant_ids, JSON.stringify(qrData)]);

    console.log('✅ Registration successful, QR data saved.');
    res.json({ msg: '✅ Event registered with QR codes' });

  } catch (err) {
    console.error('❌ Event registration error:', err.message);
    res.status(500).json({ msg: 'Event registration failed' });
  }
});

// ✅ List all events (for index.html)
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM events ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error loading event list:', err.message);
    res.status(500).json({ msg: 'Failed to load events' });
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
      SELECT event_id, participant_ids, qr_data, created_at
      FROM event_registrations
      WHERE team_id = $1
      ORDER BY created_at DESC
    `, [team_id]);

    res.json({ events: result.rows });
  } catch (err) {
    console.error('❌ Fetch registered events error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch registered events' });
  }
});

// ✅ Get single event by ID (used in enroll.html)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, max_members, description FROM events WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching event by ID:', err.message);
    res.status(500).json({ msg: 'Failed to fetch event' });
  }
});

module.exports = router;