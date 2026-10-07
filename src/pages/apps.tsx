import Header from "@/components/header"
import InstalledApps from "@/components/installed-apps"

export default function AppsPage() {
  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Installed apps"
        desc="Manage your installed applications"
      />
      <InstalledApps />
    </div>
  )
}
