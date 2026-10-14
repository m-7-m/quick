import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Switch, Route } from "wouter"
import HomePage from "./pages/home"
import { Toaster } from "@/components/ui/sonner"
import SearchPage from "./pages/search"
import UpdatesPage from "./pages/updates"
import BrowsePage from "./pages/browse"
import AppsPage from "./pages/apps"
import ProfilesPage from "./pages/profiles"
import SettingsPage from "./pages/settings"

export function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-linear-to-br from-primary/10 to-background p-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/apps" component={AppsPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/updates" component={UpdatesPage} />
          <Route path="/browse" component={BrowsePage} />
          <Route path="/profiles" component={ProfilesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route>404: No such page!</Route>
        </Switch>
        <Toaster position="top-center" />
      </main>
    </SidebarProvider>
  )
}

export default App
