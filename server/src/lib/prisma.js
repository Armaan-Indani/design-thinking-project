const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

// Fix for "Unknown property datasourceUrl"
// Pass datasources object with the name of the datasource in schema.prisma (usually "db")
const prisma = new PrismaClient();

module.exports = prisma;
