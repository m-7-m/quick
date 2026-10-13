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
      { name: "Microsoft PC Manager", id: "Microsoft.PCManager" },
      { name: "ShareX", id: "ShareX.ShareX" },
      {
        name: "Microsoft Visual C++ Redistributable (x64)",
        id: "Microsoft.VCRedist.2015+.x64",
      },
      {
        name: "Microsoft Visual C++ Redistributable (x86)",
        id: "Microsoft.VCRedist.2015+.x86",
      },
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
      { name: "Xbox", id: "9MV0B5HZVK9Z" },
      { name: "Playnite", id: "Playnite.Playnite" },
      { name: "Discord", id: "Discord.Discord" },
      { name: "NVIDIA App", id: "Nvidia.NVIDIAApp" },
      { name: "MSI Afterburner", id: "Guru3D.Afterburner" },
      { name: "HWiNFO", id: "REALiX.HWiNFO" },
      { name: "OBS Studio", id: "OBSProject.OBSStudio" },
      { name: "Razer Cortex", id: "Razer.Cortex" },
    ],
  },
  {
    name: "Dev",
    apps: [
      { name: "Git", id: "Git.Git" },
      { name: "GitHub CLI", id: "GitHub.cli" },
      { name: "Visual Studio Code", id: "Microsoft.VisualStudioCode" },
      { name: "PowerShell 7", id: "Microsoft.PowerShell" },
      { name: "Windows Subsystem for Linux", id: "Microsoft.WSL" },
      { name: "Docker Desktop", id: "Docker.DockerDesktop" },
      { name: "Postman", id: "Postman.Postman" },
      { name: "DBeaver Community", id: "DBeaver.DBeaver.Community" },
      { name: "Node.js LTS", id: "OpenJS.NodeJS.LTS" },
      {
        name: "Visual Studio Community",
        id: "Microsoft.VisualStudio.2022.Community",
      },
      { name: "JetBrains Toolbox", id: "JetBrains.Toolbox" },
      { name: "Windows Terminal", id: "Microsoft.WindowsTerminal" },
      { name: "Bruno", id: "Bruno.Bruno" },
    ],
  },
  {
    name: "Content Creation",
    apps: [
      { name: "DaVinci Resolve", id: "BlackmagicDesign.DaVinciResolve" },
      { name: "Adobe Creative Cloud", id: "Adobe.CreativeCloud" },
      { name: "Blender", id: "BlenderFoundation.Blender" },
      { name: "OBS Studio", id: "OBSProject.OBSStudio" },
      { name: "Audacity", id: "Audacity.Audacity" },
      { name: "Adobe Photoshop", id: "Adobe.Photoshop" },
      { name: "Adobe Premiere Pro", id: "Adobe.PremierePro" },
      { name: "Adobe Illustrator", id: "Adobe.Illustrator" },
      { name: "Figma", id: "Figma.Figma" },
      { name: "HandBrake", id: "HandBrake.HandBrake" },
      { name: "FFmpeg", id: "Gyan.FFmpeg" },
      { name: "GIMP", id: "GIMP.GIMP.3" },
    ],
  },
  {
    name: "Office/Student",
    apps: [
      { name: "Microsoft 365", id: "Microsoft.Office" },
      { name: "Google Drive", id: "Google.GoogleDrive" },
      { name: "Obsidian", id: "Obsidian.Obsidian" },
      { name: "Notion", id: "Notion.Notion" },
      { name: "Zoom Workplace", id: "Zoom.Zoom" },
      { name: "Microsoft Teams", id: "Microsoft.Teams" },
      { name: "SumatraPDF", id: "SumatraPDF.SumatraPDF" },
      { name: "Adobe Acrobat Reader", id: "Adobe.Acrobat.Reader.64-bit" },
      { name: "LibreOffice", id: "TheDocumentFoundation.LibreOffice" },
      { name: "Microsoft OneDrive", id: "Microsoft.OneDrive" },
    ],
  },
]
