Write-Host "=== ComplyFlow Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check dependencies
$missing = @()
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { $missing += "Node.js" }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $missing += "Docker" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { $missing += "npm" }

if ($missing.Count -gt 0) {
    Write-Host "Missing: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Install missing dependencies and try again." -ForegroundColor Yellow
    exit 1
}

# Start Postgres
Write-Host "[1/4] Starting PostgreSQL..." -ForegroundColor Green
docker compose up -d postgres
Write-Host "  Waiting for Postgres to be ready..."
Start-Sleep -Seconds 3

# Install dependencies
Write-Host "[2/4] Installing npm dependencies..." -ForegroundColor Green
npm install

# Generate Prisma client and push schema
Write-Host "[3/4] Setting up database..." -ForegroundColor Green
npx prisma generate
npx prisma db push

# Seed data
Write-Host "[4/4] Seeding ISO 27001 and SOC 2 data..." -ForegroundColor Green
npx tsx prisma/seed.ts

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Run 'npm run dev' to start the development server."
Write-Host "Open http://localhost:3000 and create your account."
Write-Host "The first user to sign up becomes the admin automatically."
