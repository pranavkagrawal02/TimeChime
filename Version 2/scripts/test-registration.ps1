$ErrorActionPreference = 'Continue'
$base = "http://localhost:3001"

function Invoke-Test {
    param([string]$Name, [string]$Url, [string]$Body)
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri $Url -Method POST -ContentType "application/json" -Body $Body -UseBasicParsing
        Write-Host ("Status: {0}" -f $r.StatusCode) -ForegroundColor Green
        Write-Host $r.Content
    } catch {
        $code = $null
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        Write-Host ("Status: {0}" -f $code) -ForegroundColor Yellow
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
        elseif ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                Write-Host $reader.ReadToEnd()
            } catch { Write-Host $_.Exception.Message }
        } else { Write-Host $_.Exception.Message }
    }
}

$reg1 = '{"firstName":"Test","lastName":"User","email":"test.user@company.com","phone":"+91-9000000001","department":"Engineering","designation":"Intern","username":"test.user","password":"TestPass123"}'
Invoke-Test "TEST 1: Valid registration" "$base/api/register" $reg1

Invoke-Test "TEST 2: Duplicate username" "$base/api/register" $reg1

$reg3 = '{"firstName":"Test","lastName":"User","email":"test.user@company.com","phone":"+91-9000000002","department":"Engineering","designation":"Intern","username":"test.user2","password":"TestPass123"}'
Invoke-Test "TEST 3: Duplicate email" "$base/api/register" $reg3

$reg4 = '{"firstName":"Short","lastName":"Pwd","email":"shortpwd@company.com","phone":"+91-9000000003","department":"QA","designation":"Tester","username":"short.pwd","password":"abc"}'
Invoke-Test "TEST 4: Short password" "$base/api/register" $reg4

$reg5 = '{"firstName":"NoLast","email":"x@y.com","password":"TestPass123"}'
Invoke-Test "TEST 5: Missing required fields" "$base/api/register" $reg5

$lg = '{"username":"test.user","password":"TestPass123"}'
Invoke-Test "TEST 6: Login as new user" "$base/api/login" $lg

$lgw = '{"username":"test.user","password":"WrongPass999"}'
Invoke-Test "TEST 7: Wrong password" "$base/api/login" $lgw

Write-Host "`n=== JSON files in EmpDetailsJSON ===" -ForegroundColor Cyan
Get-ChildItem "D:\PranavData\scheduleTrackerProject\Version 2\EmpDetailsJSON" | Format-Table Name, Length, LastWriteTime -AutoSize
