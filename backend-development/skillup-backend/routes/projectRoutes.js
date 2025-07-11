import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

router.post('/', async (req, res) => {
  const newProject = await Project.create(req.body);
  res.status(201).json(newProject);
});

export default router;

