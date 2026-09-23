$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}

function Set-EnvValue([string]$Name, [string]$Value) {
  $path = Join-Path (Get-Location) ".env"
  $lines = Get-Content $path
  $pattern = "^$Name="
  $updated = $false
  $next = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $current = $line.Substring($Name.Length + 1)
      if ([string]::IsNullOrWhiteSpace($current)) {
        $updated = $true
        "$Name=$Value"
      } else {
        $line
      }
    } else {
      $line
    }
  }
  if (-not $updated -and -not ($lines -match $pattern)) {
    $next += "$Name=$Value"
  }
  Set-Content -Path $path -Value $next
}

function New-Secret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

Set-EnvValue "JWT_SECRET" (New-Secret)
Set-EnvValue "JWT_REFRESH_SECRET" (New-Secret)
Set-EnvValue "SEED_ADMIN_PASSWORD" (New-Secret)
Set-EnvValue "SEED_ORGANIZER_PASSWORD" (New-Secret)
Set-EnvValue "SEED_PARTICIPANT_PASSWORD" (New-Secret)

npm install
npm run db:generate

Write-Host ""
Write-Host "Environment file: .env"
Write-Host "Create the PostgreSQL database, set DATABASE_URL, then run:"
Write-Host "  npm run db:migrate --prefix backend"
Write-Host "  npm run db:seed --prefix backend"
Write-Host "Seed account emails are in .env. Passwords were generated into .env."
