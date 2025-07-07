const express = require('express')
const router = express.Router()

const {
  createSkill,
  getSkills,
  endorseSkill,
  deleteSkill,
} = require('../controllers/skillController')

const { verifyToken } = require('../middlewares/auth.middleware')
console.log('verifyToken:', verifyToken);
console.log('createSkill:', createSkill)

// 👉 GET all skills or filter by category
// 👉 POST new skill (must be authenticated)
router.route('/')
  .get(getSkills)
  .post(verifyToken, createSkill)

// 👉 PATCH endorsement (only logged-in users)
router.patch('/endorse/:id', verifyToken, endorseSkill)

// 👉 DELETE skill (admin or creator only)
router.delete('/:id', verifyToken, deleteSkill)

module.exports = router

