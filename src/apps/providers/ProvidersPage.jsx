import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        <h1 className="text-3xl font-bold">Providers</h1>
      </div>
      
      <Card className="border-amber-200 dark:border-amber-900/30">
        <CardHeader>
          <CardTitle>Wellness Providers</CardTitle>
          <CardDescription>
            Connect with wellness providers and professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Provider directory and management will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

