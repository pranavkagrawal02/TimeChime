$tests = @(
    @{ Name = "pranav / hashed_password_123"; Body = '{"username":"pranav","password":"hashed_password_123"}' },
    @{ Name = "admin / admin";                Body = '{"username":"admin","password":"admin"}' }
)
foreach ($t in $tests) {
    Write-Host ""
    Write-Host ("--- Login as " + $t.Name + " ---") -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3001/api/login" -Method POST -ContentType "application/json" -Body $t.Body -UseBasicParsing
        Write-Host ("Status: " + $r.StatusCode) -ForegroundColor Green
        Write-Host $r.Content
    } catch {
        $code = $null
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        Write-Host ("Status: " + $code) -ForegroundColor Red
        try {
            $s = $_.Exception.Response.GetResponseStream()
            Write-Host ((New-Object System.IO.StreamReader($s)).ReadToEnd())
        } catch { Write-Host $_.Exception.Message }
    }
}
