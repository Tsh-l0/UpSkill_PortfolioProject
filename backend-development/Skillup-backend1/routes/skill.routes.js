const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const { verifyToken } = require('../middlewares/auth.middleware');
const { updateSkill } = require('../controllers/skillController');

const {
  createSkill,
  getSkills,
  endorseSkill,
  deleteSkill,
} = require('../controllers/skillController');

const router = express.Router();

//  GET all skills or filter by category
router.get('/', getSkills);

//  POST new skill (requires authentication + validated input)
router.post(
  '/',
  [
    verifyToken,
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('level')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    validateRequest,
  ],
  createSkill
);

router.put(
  "/:id",
  [
    verifyToken,
    param("id").isMongoId().withMessage("Invalid skill ID"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    validateRequest,
  ],
  updateSkill
);


//  PATCH to endorse a skill (authenticated users only)
router.patch(
  '/endorse/:id',
  [
    verifyToken,
    param('id').isMongoId().withMessage('Invalid skill ID'),
    validateRequest,
  ],
  endorseSkill
);

//  DELETE a skill (admin or creator)
router.delete(
  '/:id',
  [
    verifyToken,
    param('id').isMongoId().withMessage('Invalid skill ID'),
    validateRequest,
  ],
  deleteSkill
);

module.exports = router;

