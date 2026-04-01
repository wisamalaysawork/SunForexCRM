"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { TrendingUp } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-sm border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات الاعتماد للوصول إلى SunForex CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="rounded-xl border-border focus-visible:ring-primary shadow-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-xl border-border focus-visible:ring-primary shadow-sm"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl mt-4 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all text-sm font-bold"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                "دخول"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
