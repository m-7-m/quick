export type AppProfile = {
  name: string
  apps: { id: string; name: string }[]
}

export const AppProfiles: AppProfile[] = [
  {
    name: "Base",
    apps: [
      { name: "Google Chrome", id: "Google.Chrome" },
      { name: "7-Zip", id: "7zip.7zip" },
      { name: "VLC media player", id: "VideoLAN.VLC" },
      { name: "Notepad++", id: "Notepad++.Notepad++" },
      { name: "Microsoft PowerToys", id: "Microsoft.PowerToys" },
      { name: "Everything", id: "voidtools.Everything" },
      { name: "Bitwarden", id: "Bitwarden.Bitwarden" },
      { name: "Windows Terminal", id: "Microsoft.WindowsTerminal" },
      { name: "Microsoft Visual C++ Redistributable (x64)", id: "Microsoft.VCRedist.2015+.x64" },
      { name: "Microsoft Visual C++ Redistributable (x86)", id: "Microsoft.VCRedist.2015+.x86" },
      { name: ".NET Desktop Runtime 8", id: "Microsoft.DotNet.DesktopRuntime.8" },
      { name: "Microsoft Edge WebView2 Runtime", id: "Microsoft.EdgeWebView2Runtime" },
    ],
  },
  {
    name: "Gaming",
    apps: [
      { name: "Steam", id: "Valve.Steam" },
      { name: "Epic Games Launcher", id: "EpicGames.EpicGamesLauncher" },
      { name: "GOG GALAXY", id: "GOG.GalaxyClient" },
      { name: "Ubisoft Connect", id: "Ubisoft.Connect" },
      { name: "EA app", id: "ElectronicArts.EADesktop" },
      { name: "Battle.net", id: "Blizzard.BattleNet" },
      { name: "Playnite", id: "Playnite.Playnite" },
      { name: "DirectX", id: "Microsoft.DirectX" },
      { name: "MSI Afterburner", id: "Guru3D.Afterburner" },
      { name: "HWiNFO", id: "REALiX.HWiNFO" },
      { name: "Discord", id: "Discord.Discord" },
      { name: "OBS Studio", id: "OBSProject.OBSStudio" },
      { name: "Parsec", id: "Parsec.Parsec" },
    ],
  },
  {
    name: "Dev",
    apps: [
      { name: "Git", id: "Git.Git" },
      { name: "GitHub CLI", id: "GitHub.cli" },
      { name: "Visual Studio Code", id: "Microsoft.VisualStudioCode" },
      { name: "PowerShell", id: "Microsoft.PowerShell" },
      { name: "Windows Subsystem for Linux", id: "Microsoft.WSL" },
      { name: "Docker Desktop", id: "Docker.DockerDesktop" },
      { name: "Postman", id: "Postman.Postman" },
      { name: "DBeaver Community", id: "DBeaver.DBeaver.Community" },
    ],
  },
  {
    name: "Content Creation",
    apps: [
      { name: "OBS Studio", id: "OBSProject.OBSStudio" },
      { name: "Blender", id: "BlenderFoundation.Blender" },
      { name: "Kdenlive", id: "Kdenlive.Kdenlive" },
      { name: "Audacity", id: "Audacity.Audacity" },
      { name: "HandBrake", id: "HandBrake.HandBrake" },
      { name: "FFmpeg", id: "Gyan.FFmpeg" },
      { name: "GIMP", id: "GIMP.GIMP.3" },
      { name: "Krita", id: "Krita.Krita" },
      { name: "Inkscape", id: "Inkscape.Inkscape" },
      { name: "ShareX", id: "ShareX.ShareX" },
    ],
  },
  {
    name: "Office/Student",
    apps: [
      { name: "LibreOffice", id: "TheDocumentFoundation.LibreOffice" },
      { name: "SumatraPDF", id: "SumatraPDF.SumatraPDF" },
      { name: "Obsidian", id: "Obsidian.Obsidian" },
      { name: "Notion", id: "Notion.Notion" },
      { name: "Zoom Workplace", id: "Zoom.Zoom" },
      { name: "Google Drive", id: "Google.GoogleDrive" },
    ],
  },
]
