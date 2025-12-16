const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');
const prisma = require('../lib/prisma');


const createDocSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string().uuid(),
  content: z.record(z.any()), // JSON content
});

const updateDocSchema = z.object({
  content: z.record(z.any()),
});

router.use(authMiddleware);

// Get Documents for a Project
router.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    // Verify project ownership FIRST
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const documents = await prisma.document.findMany({
      where: { projectId },
      include: { template: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// Create Document
router.post('/', async (req, res, next) => {
  try {
    const { projectId, templateId, content } = createDocSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const document = await prisma.document.create({
      data: {
        projectId,
        templateId,
        content: JSON.stringify(content),
      },
      include: { template: true }
    });

    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// Get Single Document
router.get('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { template: true, project: true }
    });

    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Check ownership
    if (document.project.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Update Document
router.put('/:id', async (req, res, next) => {
  try {
    const { content } = updateDocSchema.parse(req.body);

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.project.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        content: JSON.stringify(content),
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// Delete Document
router.delete('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.project.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.document.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
