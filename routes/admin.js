const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ✅ Get all users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM users ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// ✅ Update user info
router.put('/update-user/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const {
    name, email, role, roll_number, section,
    department, referral_roll_no, is_approved
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET name = $1, email = $2, role = $3, roll_number = $4,
       section = $5, department = $6, referral_roll_no = $7, is_approved = $8
       WHERE id = $9`,
      [name, email, role, roll_number, section, department, referral_roll_no, is_approved, id]
    );

    res.json({ msg: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update user' });
  }
});

// ✅ Delete a user
router.delete('/delete-user/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM team_members WHERE user_id = $1`, [id]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Delete failed' });
  }
});

module.exports = router;