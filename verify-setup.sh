#!/bin/bash
# ASTRA Backend - Quick Verification Script
# This script verifies the backend setup and generates test output

set -e

echo "================================"
echo "ASTRA Backend Verification"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_mark="${GREEN}✓${NC}"
cross_mark="${RED}✗${NC}"
warning="${YELLOW}⚠${NC}"

echo "Step 1: Checking Node/Bun installation..."
if command -v bun &> /dev/null; then
    bun_version=$(bun --version)
    echo -e "${check_mark} Bun ${bun_version} installed"
else
    echo -e "${cross_mark} Bun not found - install from https://bun.sh"
    exit 1
fi

echo ""
echo "Step 2: Checking project dependencies..."
if [ -f "package.json" ]; then
    echo -e "${check_mark} package.json found"
    if [ -d "node_modules" ] || [ -d ".bun/install" ]; then
        echo -e "${check_mark} Dependencies installed"
    else
        echo -e "${warning} Dependencies not installed"
        echo "  Run: bun install"
    fi
else
    echo -e "${cross_mark} package.json not found"
    exit 1
fi

echo ""
echo "Step 3: Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${check_mark} .env file exists"
    
    if grep -q "DATABASE_URL" .env; then
        echo -e "${check_mark} DATABASE_URL configured"
    else
        echo -e "${cross_mark} DATABASE_URL not set"
    fi
    
    if grep -q "NASA_API_KEY" .env; then
        api_key=$(grep "NASA_API_KEY" .env | cut -d '=' -f 2)
        if [ "$api_key" != "DEMO_KEY" ]; then
            echo -e "${check_mark} NASA API key configured"
        else
            echo -e "${warning} Using DEMO_KEY for NASA API (limited to 50 requests/hour)"
        fi
    else
        echo -e "${cross_mark} NASA_API_KEY not set"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo -e "${check_mark} JWT_SECRET configured"
    else
        echo -e "${cross_mark} JWT_SECRET not set"
    fi
else
    echo -e "${warning} .env file not found"
    echo "  Run: cp .env.example .env"
    echo "  Then edit .env with your values"
fi

echo ""
echo "Step 4: Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${check_mark} prisma/schema.prisma exists"
    
    models=("User" "RefreshToken" "Asteroid" "CloseApproach" "SavedAsteroid" "SavedSearch" "AlertPreference" "Notification")
    missing=0
    
    for model in "${models[@]}"; do
        if grep -q "model $model" prisma/schema.prisma; then
            echo -e "  ${check_mark} $model model defined"
        else
            echo -e "  ${cross_mark} $model model missing"
            missing=$((missing + 1))
        fi
    done
    
    if [ $missing -eq 0 ]; then
        echo -e "${check_mark} All database models defined"
    else
        echo -e "${cross_mark} $missing models missing"
    fi
else
    echo -e "${cross_mark} prisma/schema.prisma not found"
    exit 1
fi

echo ""
echo "Step 5: Checking TypeScript compilation..."
if [ -f "tsconfig.json" ]; then
    echo -e "${check_mark} tsconfig.json found"
    echo "  (TypeScript compilation will be checked on first run)"
else
    echo -e "${cross_mark} tsconfig.json not found"
fi

echo ""
echo "Step 6: Checking essential files..."
essential_files=(
    "src/index.ts"
    "src/config/env.ts"
    "src/db.ts"
    "src/middleware/auth.middleware.ts"
    "src/services/nasa.service.ts"
    "src/controllers/auth.controller.ts"
    "src/routes/auth.routes.ts"
    "src/routes/asteroid.routes.ts"
    "src/routes/neo.routes.ts"
)

missing_files=0
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${check_mark} $file"
    else
        echo -e "  ${cross_mark} $file missing"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -eq 0 ]; then
    echo -e "${check_mark} All essential files present"
else
    echo -e "${cross_mark} $missing_files essential files missing"
fi

echo ""
echo "Step 7: Project Structure Summary"
echo "================================"
echo "Services: $(find src/services -name "*.ts" 2>/dev/null | wc -l) files"
echo "Controllers: $(find src/controllers -name "*.ts" 2>/dev/null | wc -l) files"
echo "Routes: $(find src/routes -name "*.ts" 2>/dev/null | wc -l) files"
echo "Validators: $(find src/validators -name "*.ts" 2>/dev/null | wc -l) files"
echo "Middleware: $(find src/middleware -name "*.ts" 2>/dev/null | wc -l) files"
echo "Utils: $(find src/utils -name "*.ts" 2>/dev/null | wc -l) files"
echo "Total TS Files: $(find src -name "*.ts" 2>/dev/null | wc -l)"

echo ""
echo "Step 8: Documentation"
echo "================================"
docs=(
    "FINAL_SETUP_GUIDE.md"
    "PROJECT_STATUS_REPORT.md"
    "API_DOCUMENTATION.md"
    "BACKEND_QUICK_REFERENCE.md"
    "README.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ${check_mark} $doc"
    else
        echo -e "  ${warning} $doc missing"
    fi
done

echo ""
echo "================================"
echo "SETUP READINESS CHECK"
echo "================================"

ready=true

if ! command -v bun &> /dev/null; then
    echo -e "${cross_mark} Bun not installed"
    ready=false
fi

if [ ! -f ".env" ]; then
    echo -e "${warning} Environment file not configured"
    ready=false
fi

if [ ! -d "node_modules" ] && [ ! -d ".bun/install" ]; then
    echo -e "${warning} Dependencies not installed"
    ready=false
fi

if [ "$ready" = true ]; then
    echo -e "${check_mark} Backend is ready to start!"
    echo ""
    echo "Next steps:"
    echo "1. Run migrations: bun run prisma:migrate dev"
    echo "2. Start server: bun run dev"
    echo "3. Server will be at: http://localhost:3000"
else
    echo -e "${warning} Please complete setup steps above first"
fi

echo ""
echo "For more info, see:"
echo "  - FINAL_SETUP_GUIDE.md (complete setup and deployment)"
echo "  - PROJECT_STATUS_REPORT.md (project status and features)"
echo "  - API_DOCUMENTATION.md (endpoint reference)"
echo ""
