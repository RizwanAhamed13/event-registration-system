const express = require('express');
const router = express.Router();
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

// ✅ Get team info for logged-in user
router.get('/my-team', verifyToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const teamData = await pool.query(`
      SELECT t.id AS team_id, t.name AS team_name, t.leader_id
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = $1
    `, [user_id]);

    if (teamData.rows.length === 0) {
      return res.status(404).json({ msg: 'User is not in a team' });
    }

    const { team_id, team_name, leader_id } = teamData.rows[0];

    const membersData = await pool.query(`
      SELECT u.id, u.name
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
    `, [team_id]);

    res.json({
      team_id,
      team_name,
      leader_id,
      members: membersData.rows
    });

  } catch (err) {
    console.error('Fetch team error:', err.message);
    res.status(500).json({ msg: 'Failed to load team info' });
  }
});

module.exports = router;