import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Switch, Route } from "wouter"
import HomePage from "./pages/home"

export function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-screen w-full bg-linear-to-br from-primary/10 to-background p-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route>404: No such page!</Route>
        </Switch>
      </main>
    </SidebarProvider>
  )
}

export default App
