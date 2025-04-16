const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const userRes = await pool.query(`
      SELECT id, name, email, phone, roll_number, section, department, referral_roll_no, college_name, is_approved
      FROM users WHERE id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = userRes.rows[0];

    const teamRes = await pool.query(`
      SELECT 
        t.name AS team_name, 
        t.code AS team_code,
        u.name AS team_leader
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE tm.user_id = $1
    `, [userId]);

    const team = teamRes.rows[0] || null;

    res.json({
      ...user,
      team
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ msg: "Failed to load dashboard" });
  }
});

module.exports = router;