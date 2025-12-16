const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');
const prisma = require('../lib/prisma');


// Validation Schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// Apply middleware
router.use(authMiddleware);

// Get All Projects for User
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Create Project
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: req.userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// Get Single Project
router.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { documents: true }, // Include stats or docs if needed
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Update Project
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = updateProjectSchema.parse(req.body);

    // Check ownership
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });

    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// Delete Project
router.delete('/:id', async (req, res, next) => {
  try {
    // Check ownership
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
