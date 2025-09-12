Set-Variable obsidianPluginsPath -Option Constant -Value "D:\Docs\YandexDisk\ObsidianDB\.obsidian\plugins\"

Set-Variable pluginName -Option Constant -Value "daily-notes-ext"

npm run build

Copy-Item -Path manifest.json -Destination $obsidianPluginsPath$pluginName

Copy-Item -Path main.js -Destination $obsidianPluginsPath$pluginName