$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "QuadroJS Studio v0.2.0 - Preparacao do Windows" -ForegroundColor Cyan

function Has($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
if (-not (Has 'winget')) {
  Write-Host "[ERRO] winget nao encontrado. Instale/atualize App Installer da Microsoft Store." -ForegroundColor Red
  exit 1
}
function Install-Pkg($id, $label) {
  Write-Host "Instalando/verificando $label..." -ForegroundColor Yellow
  winget install --id $id -e --accept-package-agreements --accept-source-agreements --silent
}
if (-not (Has 'node')) { Install-Pkg 'OpenJS.NodeJS.LTS' 'Node.js LTS' }
if (-not (Has 'ffmpeg') -and -not (Test-Path 'C:\ffmpeg\bin\ffmpeg.exe')) { Install-Pkg 'Gyan.FFmpeg' 'FFmpeg' }
if (-not (Has 'ollama')) { Install-Pkg 'Ollama.Ollama' 'Ollama' }
$edge = Join-Path ${env:ProgramFiles} 'Microsoft\Edge\Application\msedge.exe'
$chrome = Join-Path ${env:ProgramFiles} 'Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $edge) -and -not (Test-Path $chrome)) { Install-Pkg 'Google.Chrome' 'Google Chrome' }

$ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
$vramMB = 0
if (Has 'nvidia-smi') {
  try { $vramMB = [int]((nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | Select-Object -First 1).Trim()) } catch {}
}
$model = 'qwen3.5:0.8b'
if ($vramMB -ge 22000 -and $ramGB -ge 32) { $model = 'qwen3-coder:30b' }
elseif ($vramMB -ge 7000 -and $ramGB -ge 14) { $model = 'qwen3.5:9b' }
elseif ($vramMB -ge 3500 -or $ramGB -ge 12) { $model = 'qwen3.5:4b' }
elseif ($ramGB -ge 8) { $model = 'qwen3.5:2b' }
Write-Host "RAM: $ramGB GB | VRAM detectada: $vramMB MB" -ForegroundColor Green
Write-Host "Modelo local recomendado: $model" -ForegroundColor Green
$resp = Read-Host "Deseja baixar o modelo agora? (S/N)"
if ($resp -match '^[SsYy]') { ollama pull $model }
Write-Host "Preparacao concluida. Se Node/FFmpeg/Ollama foram instalados agora, reabra o terminal e execute start.bat." -ForegroundColor Cyan
