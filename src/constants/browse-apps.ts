export type BrowseApp = {
  name: string
  id: string
}

export type BrowseCategory = {
  name: string
  apps: BrowseApp[]
}

export const BrowseCategories: BrowseCategory[] = [
  {
    name: "Browsers",
    apps: [
      { name: "Google Chrome", id: "Google.Chrome" },
      { name: "Mozilla Firefox", id: "Mozilla.Firefox" },
      { name: "Brave", id: "Brave.Brave" },
      { name: "Microsoft Edge", id: "Microsoft.Edge" },
      { name: "Opera", id: "Opera.Opera" },
      { name: "Vivaldi", id: "VivaldiTechnologies.Vivaldi" },
    ],
  },
  {
    name: "Communication",
    apps: [
      { name: "Discord", id: "Discord.Discord" },
      { name: "Telegram", id: "Telegram.TelegramDesktop" },
      { name: "WhatsApp", id: "9NKSQGP7F2NH" },
      { name: "Signal", id: "OpenWhisperSystems.Signal" },
      { name: "Slack", id: "SlackTechnologies.Slack" },
      { name: "Zoom", id: "Zoom.Zoom" },
      { name: "Microsoft Teams", id: "Microsoft.Teams" },
    ],
  },
  {
    name: "Development",
    apps: [
      { name: "Visual Studio Code", id: "Microsoft.VisualStudioCode" },
      { name: "Git", id: "Git.Git" },
      { name: "GitHub Desktop", id: "GitHub.GitHubDesktop" },
      { name: "Node.js (LTS)", id: "OpenJS.NodeJS.LTS" },
      { name: "Python 3.12", id: "Python.Python.3.12" },
      { name: "Go", id: "GoLang.Go" },
      { name: "Rustup", id: "Rustlang.Rustup" },
      { name: "Bun", id: "Oven-sh.Bun" },
      { name: "Docker Desktop", id: "Docker.DockerDesktop" },
      { name: "Postman", id: "Postman.Postman" },
      { name: "JetBrains Toolbox", id: "JetBrains.Toolbox" },
      { name: "Android Studio", id: "Google.AndroidStudio" },
      { name: "Windows Terminal", id: "Microsoft.WindowsTerminal" },
      { name: "Neovim", id: "Neovim.Neovim" },
      { name: "Cursor", id: "Anysphere.Cursor" },
    ],
  },
  {
    name: "Media",
    apps: [
      { name: "VLC", id: "VideoLAN.VLC" },
      { name: "Spotify", id: "Spotify.Spotify" },
      { name: "OBS Studio", id: "OBSProject.OBSStudio" },
      { name: "Audacity", id: "Audacity.Audacity" },
      { name: "HandBrake", id: "HandBrake.HandBrake" },
      { name: "foobar2000", id: "PeterPawlowski.foobar2000" },
      { name: "Kdenlive", id: "KDE.Kdenlive" },
    ],
  },
  {
    name: "Utilities",
    apps: [
      { name: "7-Zip", id: "7zip.7zip" },
      { name: "WinRAR", id: "RARLab.WinRAR" },
      { name: "PowerToys", id: "Microsoft.PowerToys" },
      { name: "Everything", id: "voidtools.Everything" },
      { name: "Notepad++", id: "Notepad++.Notepad++" },
      { name: "ShareX", id: "ShareX.ShareX" },
      { name: "AutoHotkey", id: "AutoHotkey.AutoHotkey" },
      { name: "Sysinternals Suite", id: "Microsoft.Sysinternals.Suite" },
      { name: "qBittorrent", id: "qBittorrent.qBittorrent" },
      { name: "Rufus", id: "Rufus.Rufus" },
      { name: "balenaEtcher", id: "Balena.Etcher" },
    ],
  },
  {
    name: "Gaming",
    apps: [
      { name: "Steam", id: "Valve.Steam" },
      { name: "Epic Games Launcher", id: "EpicGames.EpicGamesLauncher" },
      { name: "GOG Galaxy", id: "GOG.Galaxy" },
      { name: "EA app", id: "ElectronicArts.EADesktop" },
      { name: "Ubisoft Connect", id: "Ubisoft.Connect" },
      { name: "Battle.net", id: "Blizzard.BattleNet" },
      { name: "Playnite", id: "Playnite.Playnite" },
    ],
  },
  {
    name: "Productivity & Office",
    apps: [
      { name: "Notion", id: "Notion.Notion" },
      { name: "Obsidian", id: "Obsidian.Obsidian" },
      { name: "Joplin", id: "Joplin.Joplin" },
      { name: "Todoist", id: "Doist.Todoist" },
      { name: "LibreOffice", id: "TheDocumentFoundation.LibreOffice" },
      { name: "Adobe Acrobat Reader", id: "Adobe.Acrobat.Reader.64-bit" },
      { name: "SumatraPDF", id: "SumatraPDF.SumatraPDF" },
    ],
  },
  {
    name: "Design & Creative",
    apps: [
      { name: "Figma", id: "Figma.Figma" },
      { name: "GIMP", id: "GIMP.GIMP.3" },
      { name: "Inkscape", id: "Inkscape.Inkscape" },
      { name: "Krita", id: "KDE.Krita" },
      { name: "Blender", id: "BlenderFoundation.Blender" },
      { name: "Paint.NET", id: "dotPDN.PaintDotNet" },
    ],
  },
  {
    name: "Cloud Storage",
    apps: [
      { name: "Google Drive", id: "Google.GoogleDrive" },
      { name: "Dropbox", id: "Dropbox.Dropbox" },
      { name: "OneDrive", id: "Microsoft.OneDrive" },
      { name: "Nextcloud", id: "Nextcloud.NextcloudDesktop" },
    ],
  },
  {
    name: "Security & Privacy",
    apps: [
      { name: "Bitwarden", id: "Bitwarden.Bitwarden" },
      { name: "KeePassXC", id: "KeePassXCTeam.KeePassXC" },
      { name: "Proton VPN", id: "Proton.ProtonVPN" },
      { name: "NordVPN", id: "NordSecurity.NordVPN" },
      { name: "Malwarebytes", id: "Malwarebytes.Malwarebytes" },
      { name: "Wireshark", id: "WiresharkFoundation.Wireshark" },
    ],
  },
  {
    name: "System & Hardware",
    apps: [
      { name: "CPU-Z", id: "CPUID.CPU-Z" },
      { name: "HWiNFO", id: "REALiX.HWiNFO" },
      { name: "MSI Afterburner", id: "Guru3D.Afterburner" },
      { name: "NVIDIA App", id: "Nvidia.NvidiaApp" },
      {
        name: "Display Driver Uninstaller",
        id: "Wagnardsoft.DisplayDriverUninstaller",
      },
    ],
  },
]
