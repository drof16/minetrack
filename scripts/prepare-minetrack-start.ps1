param(
    [string] $ProjectPath = (Resolve-Path "$PSScriptRoot\..")
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectPath

function Set-EnvValue {
    param(
        [string] $Key,
        [string] $Value
    )

    $envPath = Join-Path $ProjectPath ".env"
    $lines = Get-Content $envPath
    $pattern = "^$([regex]::Escape($Key))="

    if ($lines -match $pattern) {
        $lines = $lines | ForEach-Object {
            if ($_ -match $pattern) {
                "$Key=$Value"
            } else {
                $_
            }
        }
    } else {
        $lines += "$Key=$Value"
    }

    Set-Content -Path $envPath -Value $lines
}

function Get-EnvValue {
    param([string] $Key)

    $line = Get-Content ".env" | Where-Object { $_ -like "$Key=*" } | Select-Object -First 1
    if (-not $line) {
        return ""
    }

    return $line.Substring($Key.Length + 1)
}

function Get-TailscaleIp {
    try {
        $ip = (& tailscale ip -4 2>$null | Select-Object -First 1).Trim()
        if ($ip) {
            return $ip
        }
    } catch {
    }

    return ""
}

function Get-ClientIp {
    $ip = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike "127.*" `
                -and $_.IPAddress -notlike "169.254.*" `
                -and $_.InterfaceAlias -notlike "*Loopback*"
        } |
        Sort-Object -Property @{ Expression = { if ($_.IPAddress -like "10.*") { 0 } elseif ($_.IPAddress -like "192.168.*") { 1 } elseif ($_.IPAddress -like "100.*") { 2 } else { 3 } } } |
        Select-Object -First 1 -ExpandProperty IPAddress

    return $ip
}

$tailscaleIp = Get-TailscaleIp
$clientIp = Get-ClientIp

$stateful = @(
    "localhost",
    "localhost:8000",
    "localhost:5173",
    "127.0.0.1",
    "127.0.0.1:8000",
    "127.0.0.1:5173"
)

if ($tailscaleIp) {
    $stateful += $tailscaleIp
    $stateful += "$tailscaleIp`:8000"
}

Set-EnvValue "APP_URL" "http://localhost:8000"
Set-EnvValue "FRONTEND_URL" "http://localhost:8000"
Set-EnvValue "SESSION_DOMAIN" ""
Set-EnvValue "SANCTUM_STATEFUL_DOMAINS" (($stateful | Select-Object -Unique) -join ",")

Write-Host "Local URL:     http://localhost:8000"
if ($tailscaleIp) {
    Write-Host "Tailscale URL: http://$tailscaleIp`:8000"
} else {
    Write-Host "Tailscale URL: unavailable because Tailscale is disconnected or not running."
}

Write-Host ""
Write-Host "Checking database access..."

$dbHost = Get-EnvValue "DB_HOST"
$dbPort = Get-EnvValue "DB_PORT"
$dbName = Get-EnvValue "DB_DATABASE"
$dbUser = Get-EnvValue "DB_USERNAME"
$dbPassword = Get-EnvValue "DB_PASSWORD"
$mysqlClient = "C:\Program Files\MariaDB 12.3\bin\mysql.exe"

try {
    & ".\tools\php\php.exe" artisan config:clear --ansi | Out-Host
    if (Test-Path $mysqlClient) {
        & $mysqlClient --host=$dbHost --port=$dbPort --user=$dbUser --password="$dbPassword" --execute="SELECT 1;" $dbName *> $null
        if ($LASTEXITCODE -ne 0) {
            throw "MySQL client returned exit code $LASTEXITCODE."
        }
    } else {
        $checkOutput = & ".\tools\php\php.exe" artisan tinker --execute="dump(DB::select('select 1 as ok'));" 2>&1
        if (($checkOutput -join "`n") -match "QueryException|Access denied|SQLSTATE") {
            throw ($checkOutput -join "`n")
        }
    }
    Write-Host "Database access OK: $dbUser@$dbHost/$dbName"
    exit 0
} catch {
    Write-Host ""
    Write-Host "Database login failed for $dbUser from this PC."
    Write-Host "Server: $dbHost`:$dbPort"
    Write-Host "Database: $dbName"
    Write-Host "This PC IP: $clientIp"
    Write-Host ""
    Write-Host "Open HeidiSQL as a working admin user and run ONE of these fixes:"
    Write-Host ""
    Write-Host "Option A - allow only this PC:"
    Write-Host "CREATE USER IF NOT EXISTS '$dbUser'@'$clientIp' IDENTIFIED BY 'p@ssw0rd';"
    Write-Host "GRANT ALL PRIVILEGES ON *.* TO '$dbUser'@'$clientIp' WITH GRANT OPTION;"
    Write-Host "FLUSH PRIVILEGES;"
    Write-Host ""
    Write-Host "Option B - allow this user from any company/Tailscale IP:"
    Write-Host "CREATE USER IF NOT EXISTS '$dbUser'@'%' IDENTIFIED BY 'p@ssw0rd';"
    Write-Host "GRANT ALL PRIVILEGES ON *.* TO '$dbUser'@'%' WITH GRANT OPTION;"
    Write-Host "FLUSH PRIVILEGES;"
    Write-Host ""
    Write-Host "After running the SQL, start this script again."
    exit 1
}
