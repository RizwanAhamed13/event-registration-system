const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ✅ Get all users with team and college info
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.*,
        t.name AS team_name,
        t.code AS team_code,
        (SELECT name FROM users WHERE id = t.leader_id) AS team_leader
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// ✅ Update user info including college_name
router.put('/update-user/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    role,
    roll_number,
    section,
    department,
    referral_roll_no,
    is_approved,
    college_name
  } = req.body;

  try {
    await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           role = $3,
           roll_number = $4,
           section = $5,
           department = $6,
           referral_roll_no = $7,
           is_approved = $8,
           college_name = $9
       WHERE id = $10`,
      [name, email, role, roll_number, section, department, referral_roll_no, is_approved, college_name, id]
    );

    res.json({ msg: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
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