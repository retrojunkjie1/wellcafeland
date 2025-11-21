import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench } from "lucide-react"

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Wrench className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        <h1 className="text-3xl font-bold">Tools</h1>
      </div>
      
      <Card className="border-amber-200 dark:border-amber-900/30">
        <CardHeader>
          <CardTitle>Wellness Tools</CardTitle>
          <CardDescription>
            Access powerful wellness tools and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Tools and utilities will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

