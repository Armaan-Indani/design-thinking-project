const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');


// Get All Templates
router.get('/', async (req, res, next) => {
  try {
    const { phase } = req.query;
    const where = phase ? { phase } : {};

    const templates = await prisma.template.findMany({
      where,
      orderBy: { title: 'asc' },
    });
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get Single Template
router.get('/:id', async (req, res, next) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
    });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Create Template (Admin/Seed only - for now public or easy access for seeding)
router.post('/', async (req, res, next) => {
  try {
    const { title, description, phase, content } = req.body;
    const template = await prisma.template.create({
      data: {
        title,
        description,
        phase,
        content: JSON.stringify(content), // Ensure it's stored as string
      }
    });
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
