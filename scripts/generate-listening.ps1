# Optional Windows build tool. Committed WAVs play on all platforms without TTS.
$ErrorActionPreference = 'Stop'
$yanRoot = Split-Path $PSScriptRoot -Parent
$yanTexts = & node --input-type=module -e "import {LIBRARY} from './dist/library-data.js'; console.log(JSON.stringify(LIBRARY.filter(x=>x.kind==='听力').map(x=>({id:x.id,text:x.text}))))"
if ($LASTEXITCODE -ne 0) { throw 'Cannot read listening materials' }
Add-Type -AssemblyName System.Speech
$yanSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $yanSynth.SelectVoice('Microsoft Zira Desktop')
 $yanSynth.Rate = -1
 $yanFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Eight, [System.Speech.AudioFormat.AudioChannel]::Mono)
 New-Item -ItemType Directory -Force -Path (Join-Path $yanRoot 'dist/audio') | Out-Null
 foreach ($yanItem in ($yanTexts | ConvertFrom-Json)) {
  $yanSynth.SetOutputToWaveFile((Join-Path $yanRoot ('dist/audio/' + $yanItem.id + '.wav')), $yanFormat)
  $yanSynth.Speak($yanItem.text)
  $yanSynth.SetOutputToNull()
  Write-Output ('Generated synthetic listening: ' + $yanItem.id)
 }
} finally { $yanSynth.Dispose() }
