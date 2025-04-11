const express = require('express');
const router = express.Router(); // ✅ Use Express Router here
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// ✅ Create Team
router.post('/create', verifyToken, async (req, res) => {
  const { name } = req.body;
  const code = uuidv4().split('-')[0];
  try {
    const team = await pool.query(
      `INSERT INTO teams (name, code, leader_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, code, req.user.id]
    );
    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
      [team.rows[0].id, req.user.id]
    );
    res.json({ msg: 'Team created', code });
  } catch (err) {
    res.status(500).json({ error: 'Team name already taken' });
  }
});

// ✅ Join Team
router.post('/join', verifyToken, async (req, res) => {
  const { code } = req.body;
  try {
    const team = await pool.query(`SELECT * FROM teams WHERE code = $1`, [code]);
    if (team.rows.length === 0) return res.status(404).json({ msg: 'Invalid team code' });

    const check = await pool.query(
      `SELECT * FROM team_members WHERE user_id = $1`,
      [req.user.id]
    );
    if (check.rows.length > 0) return res.status(400).json({ msg: 'Already in a team' });

    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
      [team.rows[0].id, req.user.id]
    );
    res.json({ msg: 'Joined team successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;