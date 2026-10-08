import Header from "@/components/header"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HomeCards } from "@/constants/home-cards"
import { cn } from "cn"
import { Link } from "wouter"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Home"
        desc="Manage your apps install, update, remove and use profiles."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {HomeCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card
              className={cn(
                card.outline,
                "relative overflow-hidden transition-all hover:outline-2 hover:outline-offset-6"
              )}
            >
              <div
                className={cn(
                  card.background,
                  "absolute -top-12/12 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full blur-3xl"
                )}
              ></div>
              <div
                className={cn(
                  card.background,
                  "absolute -bottom-12/12 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full blur-3xl"
                )}
              ></div>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
                <CardAction>
                  <card.icon
                    className={cn(card.iconClass, "size-10 rounded-lg p-2")}
                  />
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
