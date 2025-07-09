const Skill = require('../models/Skill')

//  Create a new skill
const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create({
      ...req.body,
      createdBy: req.user._id, // Assumes authenticateUser middleware
    })
    res.status(201).json(skill)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

//  Get all skills (optionally filtered by category)
const getSkills = async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase()
    }

    const skills = await Skill.find(filter)
      .populate('createdBy', 'name email') // Optional: show who added it
      .sort({ createdAt: -1 })

    res.status(200).json(skills)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//  Endorse a skill (add user to endorsements array)
const endorseSkill = async (req, res) => {
  try {
    const { id } = req.params
    const skill = await Skill.findById(id)

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' })
    }

    // Prevent duplicate endorsements
    if (skill.endorsements.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already endorsed' })
    }

    skill.endorsements.push(req.user._id)
    await skill.save()

    res.status(200).json({ message: 'Skill endorsed', endorsements: skill.endorsements.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//  Delete a skill (admin or creator only)
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params
    const skill = await Skill.findById(id)

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' })
    }

    // Check permission
    if (
      skill.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Skill.findByIdAndDelete(id)
    res.status(200).json({ message: 'Skill deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateSkill = async (req, res) => {
  try {
    // For example: find by ID and update
    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createSkill,
  getSkills,
  endorseSkill,
  deleteSkill,
  updateSkill
};


