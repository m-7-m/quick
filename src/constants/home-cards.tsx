import {
  IconApps,
  IconDownload,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"

export const HomeCards = [
  {
    title: "Install",
    desc: "Find and install new apps",
    icon: IconDownload,
    href: "/install",
    outline: "outline-emerald-500",
    iconClass: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Update",
    desc: "Update your installed apps",
    icon: IconRefresh,
    href: "/update",
    outline: "outline-sky-500",
    iconClass: "bg-sky-500/10 text-sky-500",
  },
  {
    title: "Remove",
    desc: "Remove apps from system",
    icon: IconTrash,
    href: "/remove",
    outline: "outline-rose-500",
    iconClass: "bg-rose-500/10 text-rose-500",
  },
  {
    title: "Browse",
    desc: "Discover popular apps",
    icon: IconApps,
    href: "/browse",
    outline: "outline-indigo-500",
    iconClass: "bg-indigo-500/10 text-indigo-500",
  },
]
