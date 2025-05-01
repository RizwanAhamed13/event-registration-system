const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Get user basic info
    const userRes = await pool.query(`
      SELECT id, name, email, phone, roll_number, section, department, referral_roll_no, college_name, is_approved
      FROM users WHERE id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = userRes.rows[0];

    // Get team info
    const teamRes = await pool.query(`
      SELECT 
        t.id AS team_id,
        t.name AS team_name, 
        t.code AS team_code,
        u.name AS team_leader
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE tm.user_id = $1
    `, [userId]);

    const team = teamRes.rows[0] || null;

    if (!team) {
      return res.json({
        ...user,
        team: null,
        qr_entries: []
      });
    }

    // Fetch this user's QR entries from team's event registrations
    const qrRes = await pool.query(`
      SELECT
        e.name AS event_name,
        e.id AS event_id,
        jsonb_array_elements(er.qr_data) AS qr_entry
      FROM event_registrations er
      JOIN events e ON e.id = er.event_id
      WHERE er.team_id = $1
    `, [team.team_id]);

    // Extract only QR codes for this user
    const userQRs = qrRes.rows
      .map(r => {
        const entry = r.qr_entry;
        return {
          event_name: r.event_name,
          event_id: r.event_id,
          qr: entry.qr,
          participant_id: entry.participant_id
        };
      })
      .filter(entry => entry.participant_id?.toString() === userId.toString());

    // Return all combined dashboard data
    res.json({
      ...user,
      team,
      qr_entries: userQRs
    });

  } catch (err) {
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ msg: "Failed to load dashboard" });
  }
});

module.exports = router;