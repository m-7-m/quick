import BrowseCard from "@/components/browse-card"
import Header from "@/components/header"

export default function BrowsePage() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="Browse" desc="Discover popular apps" />
      <BrowseCard />
    </div>
  )
}
