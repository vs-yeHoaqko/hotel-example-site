#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$ErrorActionPreference = "Stop"

$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

$source = if ($env:SPECKIT_UVX_SOURCE) {
    $env:SPECKIT_UVX_SOURCE
} else {
    "git+https://github.com/github/spec-kit.git@259494a328e13df32e18b2df31abd421c881c071"
}

& uvx --from $source specify @Arguments
exit $LASTEXITCODE
