import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Switch, Route } from "wouter"
import HomePage from "./pages/home"
import { Toaster } from "@/components/ui/sonner"
import SearchPage from "./pages/search"
import UpdatesPage from "./pages/updates"
import BrowsePage from "./pages/browse"

export function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-screen w-full bg-linear-to-br from-primary/10 to-background p-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/updates" component={UpdatesPage} />
          <Route path="/browse" component={BrowsePage} />
          <Route>404: No such page!</Route>
        </Switch>
        <Toaster position="top-center" />
      </main>
    </SidebarProvider>
  )
}

export default App
