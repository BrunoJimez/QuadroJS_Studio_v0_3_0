Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[ERRO] Node.js não foi encontrado no PATH." -ForegroundColor Red
  Write-Host "Instale Node.js 22 ou superior e tente novamente."
  exit 1
}
node .\server.mjs
