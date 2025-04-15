const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateCode = () => uuidv4().split('-')[0];

// ✅ REGISTER
router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    roll_number,
    section,
    department,
    referral_roll_no,
    phone,
    team_code,
    team_name,
    college_name
  } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ msg: 'Invalid email format' });

  if (!team_code && !team_name) {
    return res.status(400).json({ msg: 'Enter a team code or create a team name' });
  }
  if (team_code && team_name) {
    return res.status(400).json({ msg: 'Enter only one: team code or team name' });
  }

  try {
    const check = await pool.query(`SELECT * FROM users WHERE email = $1 OR roll_number = $2`, [email, roll_number]);
    if (check.rows.length > 0) return res.status(400).json({ msg: 'Email or roll number already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, roll_number, section, department, referral_roll_no, college_name, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, email, hashed, roll_number, section, department, referral_roll_no, college_name, phone]
    );

    const user_id = newUser.rows[0].id;

    if (team_code) {
      const team = await pool.query(`SELECT * FROM teams WHERE code = $1`, [team_code]);
      if (team.rows.length === 0) return res.status(400).json({ msg: 'Invalid team code' });

      const members = await pool.query(
        `SELECT u.name, u.roll_number FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = $1`,
        [team.rows[0].id]
      );
      const leader = await pool.query(`SELECT name FROM users WHERE id = $1`, [team.rows[0].leader_id]);

      await pool.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
        [team.rows[0].id, user_id]
      );

      return res.json({
        msg: 'Joined team successfully. Awaiting approval.',
        team_leader: leader.rows[0].name,
        members: members.rows
      });
    }

    if (team_name) {
      const code = generateCode();
      const team = await pool.query(
        `INSERT INTO teams (name, code, leader_id) VALUES ($1, $2, $3) RETURNING *`,
        [team_name, code, user_id]
      );
      await pool.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
        [team.rows[0].id, user_id]
      );
      return res.json({ msg: 'Team created and registered. Awaiting approval.', team_code: team.rows[0].code });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const q = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = q.rows[0];

    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    if (!user.is_approved) return res.status(403).json({ msg: 'Not approved yet' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;