const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const userRes = await pool.query(`SELECT is_approved FROM users WHERE id = $1`, [userId]);
    const user = userRes.rows[0];

    const teamRes = await pool.query(
      `SELECT t.name, t.code FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1`, [userId]
    );

    const team = teamRes.rows[0] || null;

    res.json({ is_approved: user.is_approved, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load dashboard" });
  }
});

module.exports = router;