// server/api/vendas/nova.ts
import sql from '~/server/database' // Corrigido para importar o default 'sql'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' // Mantenha o JWT

// ... (O restante da lógica que faz os 5 passos)git add .