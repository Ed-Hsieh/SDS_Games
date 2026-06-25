param(
    [string]$RawRoot = "incoming\raw",
    [string]$Output = "incoming\raw\assets-index.json",
    [string]$ProjectRoot = (Resolve-Path ".").Path,
    [switch]$NoWrite
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Write-Utf8NoBom([string]$PathValue, [string]$Content) {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($PathValue, $Content, $utf8NoBom)
}

function Resolve-ProjectPath([string]$PathValue) {
    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $PathValue))
}

function Get-RelativeProjectPath([string]$PathValue) {
    $fullPath = [System.IO.Path]::GetFullPath($PathValue)
    $rootPath = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\', '/')
    if (-not $fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path is outside project root: $fullPath"
    }
    return $fullPath.Substring($rootPath.Length + 1).Replace('\', '/')
}

function Get-ImageInfo([string]$PathValue) {
    $extension = [System.IO.Path]::GetExtension($PathValue).ToLowerInvariant()
    if ($extension -eq ".png") {
        $stream = $null
        try {
            $stream = [System.IO.File]::OpenRead($PathValue)
            $header = New-Object byte[] 24
            $read = $stream.Read($header, 0, 24)
            $signature = "89504e470d0a1a0a"
            $actualSignature = [System.BitConverter]::ToString($header, 0, 8).Replace("-", "").ToLowerInvariant()
            if ($read -ge 24 -and $actualSignature -eq $signature) {
                return @{
                    width = [System.Net.IPAddress]::NetworkToHostOrder([System.BitConverter]::ToInt32($header, 16))
                    height = [System.Net.IPAddress]::NetworkToHostOrder([System.BitConverter]::ToInt32($header, 20))
                }
            }
        } finally {
            if ($stream) { $stream.Dispose() }
        }
    }

    $image = $null
    try {
        $image = [System.Drawing.Bitmap]::FromFile($PathValue)
        return @{
            width = $image.Width
            height = $image.Height
        }
    } finally {
        if ($image) { $image.Dispose() }
    }
}

$rawRootPath = Resolve-ProjectPath $RawRoot
if (-not (Test-Path -LiteralPath $rawRootPath)) {
    throw "Raw asset folder not found: $rawRootPath"
}

$extensions = @(".png", ".jpg", ".jpeg", ".webp")
$files = Get-ChildItem -LiteralPath $rawRootPath -Recurse -File |
    Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object FullName

$assets = @()
foreach ($file in $files) {
    $info = Get-ImageInfo $file.FullName
    $assets += [ordered]@{
        path = Get-RelativeProjectPath $file.FullName
        fileName = $file.Name
        width = $info.width
        height = $info.height
        bytes = $file.Length
        updatedAt = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
}

$index = [ordered]@{
    version = 1
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    rawRoot = (Get-RelativeProjectPath $rawRootPath)
    count = $assets.Count
    assets = $assets
}

$json = $index | ConvertTo-Json -Depth 8
if ($NoWrite) {
    $json
} else {
    $outputPath = Resolve-ProjectPath $Output
    $outputDirectory = Split-Path -Parent $outputPath
    if (-not (Test-Path -LiteralPath $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory | Out-Null
    }
    Write-Utf8NoBom $outputPath $json
    Write-Host "Indexed $($assets.Count) raw assets -> $outputPath"
}
