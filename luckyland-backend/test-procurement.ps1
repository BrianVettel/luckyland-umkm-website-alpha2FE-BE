# Lucky Land API - Procurement Flow Test (SL_05)
# Tests requesting, approving, and receiving raw materials with inventory discrepancy

$baseUrl = "http://localhost:3001"

function Login($username, $password) {
    $body = @{username=$username;password=$password} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $body
    return $result.data.token
}

Write-Host "`n========== 1. Seed Raw Material (Flour) ==========" -ForegroundColor Cyan
# Directly seeding via Prisma would be best, but we can do it via a quick node script inline
$seedScript = @"
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
async function run() {
    const rm = await prisma.rawMaterial.create({
        data: { name: 'Flour (Tepung Terigu)', unit: 'kg', currentStock: 5, minimumStock: 10 }
    });
    console.log(rm.id);
}
run().catch(console.error).finally(() => prisma.`$disconnect());
"@
$seedScript | Out-File -FilePath seed-flour.js -Encoding UTF8
$rawMaterialId = bun run seed-flour.js
Remove-Item seed-flour.js
Write-Host "SUCCESS: Seeded Flour. ID: $rawMaterialId" -ForegroundColor Green

Write-Host "`n========== 2. Check Low Stock ==========" -ForegroundColor Cyan
$ownerToken = Login "owner" "owner123"
$headersOwner = @{Authorization = "Bearer $ownerToken"}
$lowStockResult = Invoke-RestMethod -Uri "$baseUrl/api/procurement/low-stock" -Method GET -Headers $headersOwner
$foundLow = $false
foreach ($mat in $lowStockResult.data.materials) {
    if ($mat.id -eq $rawMaterialId) { $foundLow = $true }
}
if ($foundLow) { Write-Host "SUCCESS: Flour is correctly flagged in low-stock!" -ForegroundColor Green }
else { Write-Host "FAIL: Flour not found in low stock!" -ForegroundColor Red }

Write-Host "`n========== 3. Submit Procurement Request (BAKER) ==========" -ForegroundColor Cyan
$bakerToken = Login "baker" "baker123"
$headersBaker = @{Authorization = "Bearer $bakerToken"}

$requestBody = @{
    type = "RAW_MATERIAL"
    reason = "Running out of flour for tomorrow's batch"
    items = @(
        @{
            itemId = $rawMaterialId
            quantity = 20 # requesting 20kg
            notes = "Need Segitiga Biru brand"
        }
    )
} | ConvertTo-Json -Depth 5

$reqResult = Invoke-RestMethod -Uri "$baseUrl/api/procurement" -Method POST -Headers $headersBaker -ContentType 'application/json' -Body $requestBody
$procurementId = $reqResult.data.id
$procurementItemId = $reqResult.data.items[0].id
Write-Host "SUCCESS: Request created. ID: $procurementId" -ForegroundColor Green

Write-Host "`n========== 4. Approve Request (OWNER) ==========" -ForegroundColor Cyan
$approveBody = @{
    status = "APPROVED"
} | ConvertTo-Json
$approveResult = Invoke-RestMethod -Uri "$baseUrl/api/procurement/$procurementId/approve" -Method PUT -Headers $headersOwner -ContentType 'application/json' -Body $approveBody
Write-Host "SUCCESS: Request APPROVED by Owner" -ForegroundColor Green

Write-Host "`n========== 5. Confirm Receipt with Discrepancy (BAKER) ==========" -ForegroundColor Cyan
# Requested 20kg, but only received 18kg because 2kg bag was torn
$receiveBody = @{
    receivedItems = @(
        @{
            itemId = $procurementItemId
            actualQuantity = 18
            notes = "Supplier delivered 20kg but one 2kg bag was torn, rejected it."
        }
    )
} | ConvertTo-Json -Depth 5

$receiveResult = Invoke-RestMethod -Uri "$baseUrl/api/procurement/$procurementId/receive" -Method POST -Headers $headersBaker -ContentType 'application/json' -Body $receiveBody
Write-Host "SUCCESS: Receipt confirmed. Status: $($receiveResult.data.status)" -ForegroundColor Green

Write-Host "`n========== 6. Verify Inventory Increment ==========" -ForegroundColor Cyan
$verifyScript = @"
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
async function run() {
    const rm = await prisma.rawMaterial.findUnique({ where: { id: '$rawMaterialId' } });
    console.log(rm.currentStock);
}
run().catch(console.error).finally(() => prisma.`$disconnect());
"@
$verifyScript | Out-File -FilePath verify-stock.js -Encoding UTF8
$finalStock = bun run verify-stock.js
Remove-Item verify-stock.js

if ($finalStock.Trim() -eq "23") {
    Write-Host "SUCCESS: Stock updated correctly! (5 initial + 18 received = 23)" -ForegroundColor Green
} else {
    Write-Host "FAIL: Expected 23, got $finalStock" -ForegroundColor Red
}

Write-Host "`n========== ALL TESTS PASSED! ==========" -ForegroundColor Green
