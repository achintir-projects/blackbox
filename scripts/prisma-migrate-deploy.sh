#!/bin/bash
# Script to deploy Prisma migrations

echo "Deploying Prisma migrations..."
npx prisma migrate deploy
echo "Prisma migrations deployed."
