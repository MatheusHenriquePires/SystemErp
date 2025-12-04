// server/utils/prisma.ts

import { PrismaClient } from "@prisma/client";

// Inicializa a instância do Prisma Client
const prisma = new PrismaClient();

// Exporta a instância para uso nos Handlers da API
export default prisma;