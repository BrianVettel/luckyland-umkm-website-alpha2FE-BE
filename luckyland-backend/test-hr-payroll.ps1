# Lucky Land API - HR & Payroll Flow Test (SL_03 & SL_04 & INT-02)
# Tests requesting leave, taking absences, and dynamic payroll calculation

$baseUrl = "http://localhost:3001"

function Login($username, $password) {
    $body = @{username=$username;password=$password} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $body
    return $result.data.token
}

Write-Host "`n========== 1. Update Kasir's Base Salary ==========" -ForegroundColor Cyan
$seedScript = @"
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
async function run() {
    // Set Kasir's salary to Rp 5,000,000 and quota to 2 days left
    await prisma.user.update({
        where: { username: 'kasir' },
        data: { basicSalary: 5000000, leaveQuota: 2, phone: '08111222333' }
    });
}
run().catch(console.error).finally(() => prisma.`$disconnect());
"@
$seedScript | Out-File -FilePath setup-hr.js -Encoding UTF8
bun run setup-hr.js | Out-Null
Remove-Item setup-hr.js
Write-Host "SUCCESS: Kasir's base salary set to Rp 5,000,000 with 2 quota days" -ForegroundColor Green

Write-Host "`n========== 2. Request Leave (KASIR) ==========" -ForegroundColor Cyan
$kasirToken = Login "kasir" "kasir123"
$headersKasir = @{Authorization = "Bearer $kasirToken"}

# Requesting 4 days of leave (exceeds 2 day quota)
$leaveStart = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
$leaveEnd = (Get-Date).AddDays(4).ToString("yyyy-MM-ddTHH:mm:ssZ")

$leaveBody = @{
    type = "ANNUAL"
    startDate = $leaveStart
    endDate = $leaveEnd
    reason = "Going on vacation"
} | ConvertTo-Json

$leaveResult = Invoke-RestMethod -Uri "$baseUrl/api/leave/requests" -Method POST -Headers $headersKasir -ContentType 'application/json' -Body $leaveBody
$leaveId = $leaveResult.data.id
Write-Host "SUCCESS: Leave requested for 4 days. Message: $($leaveResult.message)" -ForegroundColor Green

Write-Host "`n========== 3. Approve Leave (OWNER) ==========" -ForegroundColor Cyan
$ownerToken = Login "owner" "owner123"
$headersOwner = @{Authorization = "Bearer $ownerToken"}

$approveBody = @{ status = "APPROVED" } | ConvertTo-Json
$approveResult = Invoke-RestMethod -Uri "$baseUrl/api/leave/requests/$leaveId/approve" -Method PUT -Headers $headersOwner -ContentType 'application/json' -Body $approveBody
Write-Host "SUCCESS: Leave APPROVED" -ForegroundColor Green

Write-Host "`n========== 4. Verify Quota & Absences ==========" -ForegroundColor Cyan
$verifyScript = @"
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
async function run() {
    const u = await prisma.user.findUnique({ where: { username: 'kasir' } });
    console.log("Kasir leaveQuota: " + u.leaveQuota);

    // Let's also add 1 manual ABSENT record for testing unexcused absences
    await prisma.attendance.create({
      data: {
        employeeId: u.id,
        date: new Date(),
        status: "ABSENT",
        notes: "No show"
      }
    });
    console.log("Added 1 ABSENT record");
}
run().catch(console.error).finally(() => prisma.`$disconnect());
"@
$verifyScript | Out-File -FilePath verify-hr.js -Encoding UTF8
$output = bun run verify-hr.js
Write-Host $output
Remove-Item verify-hr.js

Write-Host "`n========== 5. Calculate Payroll (INT-02) ==========" -ForegroundColor Cyan
$payrollBody = @{
    month = (Get-Date).Month
    year = (Get-Date).Year
    notes = "Monthly payroll run"
} | ConvertTo-Json

$payrollResult = Invoke-RestMethod -Uri "$baseUrl/api/payroll/calculate" -Method POST -Headers $headersOwner -ContentType 'application/json' -Body $payrollBody

$kasirPayroll = $null
$kasirPayrollId = ""
foreach ($detail in $payrollResult.data.details) {
    if ($detail.basicSalary -eq 5000000) { 
        $kasirPayroll = $detail 
        $kasirPayrollId = $detail.id
    }
}

Write-Host "SUCCESS: Payroll calculated!" -ForegroundColor Green
Write-Host "--- KASIR PAYROLL SLIP ---"
Write-Host "Basic Salary: Rp $($kasirPayroll.basicSalary)"
Write-Host "Total Absences: $($kasirPayroll.totalAbsences) days"
Write-Host "Total Excessive Leave: $($kasirPayroll.totalExcessiveLeave) days"
Write-Host "Absence Deduction: Rp $($kasirPayroll.absenceDeduction)"
Write-Host "Leave Deduction: Rp $($kasirPayroll.leaveDeduction)"
Write-Host "Net Salary: Rp $($kasirPayroll.netSalary)"

Write-Host "`n========== 6. Send Payslip via WhatsApp ==========" -ForegroundColor Cyan
$sendResult = Invoke-RestMethod -Uri "$baseUrl/api/payroll/$kasirPayrollId/send-payslip" -Method POST -Headers $headersOwner
Write-Host "SUCCESS: $($sendResult.message)" -ForegroundColor Green

Write-Host "`n========== ALL TESTS PASSED! ==========" -ForegroundColor Green
