# Lucky Land API - RBAC Test Script
# Tests that role-based access control works correctly

function Login($username, $password) {
    $body = @{username=$username;password=$password} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
    return $result.data.token
}

function TestEndpoint($url, $token, $expectSuccess) {
    try {
        $headers = @{Authorization = "Bearer $token"}
        $result = Invoke-RestMethod -Uri $url -Method GET -Headers $headers -ErrorAction Stop
        if ($expectSuccess) {
            Write-Host "  PASS: Access granted ($($result.message))" -ForegroundColor Green
        } else {
            Write-Host "  FAIL: Should have been blocked!" -ForegroundColor Red
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (-not $expectSuccess -and $statusCode -eq 403) {
            Write-Host "  PASS: Correctly blocked with HTTP 403" -ForegroundColor Green
        } else {
            Write-Host "  FAIL: Unexpected HTTP $statusCode" -ForegroundColor Red
        }
    }
}

# Get tokens for each role
Write-Host "`nLogging in all users..." -ForegroundColor Cyan
$ownerToken = Login "owner" "owner123"
$adminToken = Login "admin" "admin123"
$kasirToken = Login "kasir" "kasir123"
$bakerToken = Login "baker" "baker123"
$decoratorToken = Login "decorator" "decorator123"
Write-Host "All 5 users logged in successfully`n" -ForegroundColor Green

# Test /api/test/owner-only (should only allow OWNER)
Write-Host "========== /api/test/owner-only (OWNER only) ==========" -ForegroundColor Cyan
Write-Host "[OWNER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/owner-only" $ownerToken $true
Write-Host "[ADMIN]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/owner-only" $adminToken $false
Write-Host "[KASIR]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/owner-only" $kasirToken $false
Write-Host "[BAKER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/owner-only" $bakerToken $false

# Test /api/test/admin-access (OWNER + ADMIN)
Write-Host "`n========== /api/test/admin-access (OWNER + ADMIN) ==========" -ForegroundColor Cyan
Write-Host "[OWNER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/admin-access" $ownerToken $true
Write-Host "[ADMIN]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/admin-access" $adminToken $true
Write-Host "[KASIR]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/admin-access" $kasirToken $false
Write-Host "[BAKER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/admin-access" $bakerToken $false

# Test /api/test/pos-access (OWNER + ADMIN + KASIR)
Write-Host "`n========== /api/test/pos-access (OWNER + ADMIN + KASIR) ==========" -ForegroundColor Cyan
Write-Host "[OWNER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/pos-access" $ownerToken $true
Write-Host "[ADMIN]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/pos-access" $adminToken $true
Write-Host "[KASIR]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/pos-access" $kasirToken $true
Write-Host "[BAKER]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/pos-access" $bakerToken $false
Write-Host "[DECORATOR]" -ForegroundColor Yellow
TestEndpoint "http://localhost:3001/api/test/pos-access" $decoratorToken $false

Write-Host "`n========== ALL RBAC TESTS COMPLETE ==========" -ForegroundColor Green
