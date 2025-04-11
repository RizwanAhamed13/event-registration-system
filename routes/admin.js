const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ✅ Approve Users
router.get('/pending-users', verifyToken, requireRole('admin'), async (req, res) => {
  const result = await pool.query(`SELECT id, name, email FROM users WHERE is_approved = false`);
  res.json(result.rows);
});

router.post('/approve-user', verifyToken, requireRole('admin'), async (req, res) => {
  const { user_id } = req.body;
  await pool.query(`UPDATE users SET is_approved = true WHERE id = $1`, [user_id]);
  res.json({ msg: 'User approved' });
});

// ✅ Approve Event Registrations
router.get('/pending-events', verifyToken, requireRole('admin'), async (req, res) => {
  const result = await pool.query(
    `SELECT er.id, er.team_id, er.event_id, t.name AS team_name, e.name AS event_name
     FROM event_registrations er
     JOIN teams t ON er.team_id = t.id
     JOIN events e ON er.event_id = e.id
     WHERE er.approved = false`
  );
  res.json(result.rows);
});

router.post('/approve-event', verifyToken, requireRole('admin'), async (req, res) => {
  const { registration_id } = req.body;
  await pool.query(`UPDATE event_registrations SET approved = true WHERE id = $1`, [registration_id]);
  res.json({ msg: 'Event registration approved' });
});

module.exports = router;