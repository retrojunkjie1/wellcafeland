import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "@/components/Logo"

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-amber-200 dark:border-amber-900/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="dark" size="md" showText={true} />
          </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your WellnessCafe OS account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-background"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-background"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-background"
            />
          </div>
          <Button className="w-full luxury-gradient text-white shadow-md hover:shadow">
            Create Account
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 dark:text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

