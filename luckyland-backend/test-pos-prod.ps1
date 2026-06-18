# Lucky Land API - POS & Production Integration Test (INT-01)
# Tests creating an order, updating status, and checking production tasks

$baseUrl = "http://localhost:3001"
$productId = "cmqjczcud0000u344waadptvt" # Chocolate Fudge Cake

function Login($username, $password) {
    $body = @{username=$username;password=$password} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $body
    return $result.data.token
}

Write-Host "`n========== 1. Login as KASIR ==========" -ForegroundColor Cyan
$kasirToken = Login "kasir" "kasir123"
Write-Host "SUCCESS: Kasir logged in" -ForegroundColor Green

Write-Host "`n========== 2. Create ONLINE Order ==========" -ForegroundColor Cyan
$orderDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ssZ")
$orderBody = @{
    customerName = "Budi Santoso"
    origin = "ONLINE"
    orderDate = $orderDate
    notes = "Birthday cake, write 'Happy Birthday Budi'"
    items = @(
        @{
            productId = $productId
            quantity = 2
            size = "20cm"
            theme = "Spiderman"
        }
    )
} | ConvertTo-Json -Depth 5

$headers = @{Authorization = "Bearer $kasirToken"}
$orderResult = Invoke-RestMethod -Uri "$baseUrl/api/pos/orders" -Method POST -Headers $headers -ContentType 'application/json' -Body $orderBody
$orderId = $orderResult.data.id
Write-Host "SUCCESS: Order created. ID: $orderId, Total: Rp $($orderResult.data.totalAmount)" -ForegroundColor Green

Write-Host "`n========== 3. Verify Order (Trigger INT-01) ==========" -ForegroundColor Cyan
$verifyBody = @{
    status = "VERIFIED"
    paymentStatus = "LUNAS"
} | ConvertTo-Json

$verifyResult = Invoke-RestMethod -Uri "$baseUrl/api/pos/orders/$orderId/status" -Method PUT -Headers $headers -ContentType 'application/json' -Body $verifyBody
Write-Host "SUCCESS: Order status updated to VERIFIED" -ForegroundColor Green

Write-Host "`n========== 4. Login as BAKER ==========" -ForegroundColor Cyan
$bakerToken = Login "baker" "baker123"
Write-Host "SUCCESS: Baker logged in" -ForegroundColor Green

Write-Host "`n========== 5. Check Production Tasks (INT-01 Check) ==========" -ForegroundColor Cyan
$bakerHeaders = @{Authorization = "Bearer $bakerToken"}
$tasksResult = Invoke-RestMethod -Uri "$baseUrl/api/production/tasks" -Method GET -Headers $bakerHeaders

$taskFound = $false
$taskId = ""
foreach ($task in $tasksResult.data) {
    if ($task.orderId -eq $orderId) {
        $taskFound = $true
        $taskId = $task.id
        Write-Host "SUCCESS: INT-01 WORKED! Found auto-generated ProductionTask mapped to Order $orderId" -ForegroundColor Green
        Write-Host "  Task ID: $($task.id)"
        Write-Host "  Status: $($task.status)"
        Write-Host "  Deadline: $($task.deadline)"
    }
}

if (-not $taskFound) {
    Write-Host "FAIL: ProductionTask was NOT generated for VERIFIED ONLINE order!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========== 6. Update Task Status (DOUGH_READY) ==========" -ForegroundColor Cyan
$taskUpdateBody = @{
    status = "DOUGH_READY"
    notes = "Dough is resting"
} | ConvertTo-Json

$taskUpdateResult = Invoke-RestMethod -Uri "$baseUrl/api/production/tasks/$taskId/status" -Method PUT -Headers $bakerHeaders -ContentType 'application/json' -Body $taskUpdateBody
Write-Host "SUCCESS: Task updated to $($taskUpdateResult.data.status). Started At: $($taskUpdateResult.data.startedAt)" -ForegroundColor Green

Write-Host "`n========== ALL TESTS PASSED! ==========" -ForegroundColor Green
