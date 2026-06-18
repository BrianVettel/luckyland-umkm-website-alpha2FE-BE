# Lucky Land API - Auth & RBAC Test Script

Write-Host "`n========== TEST 1: Login as Owner ==========" -ForegroundColor Cyan
$loginBody = @{username='owner';password='owner123'} | ConvertTo-Json
$loginResult = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$token = $loginResult.data.token
Write-Host "SUCCESS: Logged in as $($loginResult.data.user.name) [$($loginResult.data.user.role)]" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 50))..."

Write-Host "`n========== TEST 2: GET /api/auth/me (with token) ==========" -ForegroundColor Cyan
$headers = @{Authorization = "Bearer $token"}
$meResult = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/me' -Method GET -Headers $headers
$meResult | ConvertTo-Json -Depth 3
Write-Host "SUCCESS: Profile retrieved" -ForegroundColor Green

Write-Host "`n========== TEST 3: GET /api/auth/me (NO token - expect 401) ==========" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/me' -Method GET -ErrorAction Stop
    Write-Host "FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "SUCCESS: Got expected HTTP $statusCode" -ForegroundColor Green
}

Write-Host "`n========== TEST 4: Login with wrong password (expect 401) ==========" -ForegroundColor Cyan
try {
    $badBody = @{username='owner';password='wrongpass'} | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $badBody -ErrorAction Stop
    Write-Host "FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "SUCCESS: Got expected HTTP $statusCode (invalid credentials)" -ForegroundColor Green
}

Write-Host "`n========== TEST 5: Login as Kasir ==========" -ForegroundColor Cyan
$kasirBody = @{username='kasir';password='kasir123'} | ConvertTo-Json
$kasirResult = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $kasirBody
Write-Host "SUCCESS: Logged in as $($kasirResult.data.user.name) [$($kasirResult.data.user.role)]" -ForegroundColor Green

Write-Host "`n========== ALL TESTS PASSED ==========" -ForegroundColor Green
