"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdminAuthActions } from "@/lib/context/AdminAuthContextSimple"
import { ADMIN_ROUTES } from "@/lib/routes"
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const router = useRouter()
  const { signIn } = useAdminAuthActions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    
    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (!email.includes('@')) {
      setError("Por favor, ingresa un email válido")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Usar el nuevo sistema de autenticación
      const result = await signIn(email, password)

      if (!result.success) {
        setError(result.error ?? 'Error de autenticación')
        return
      }

      // Login exitoso, redirigir a rifas
      router.replace(ADMIN_ROUTES.RIFAS)
      
    } catch (error) {
      console.error("Error inesperado:", error)
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        <CardTitle className="text-2xl text-center text-card-foreground font-bold">
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-base">
          Ingresa tus credenciales para acceder al panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-card-foreground font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@elevenrifas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={cn(
                  "pl-10 h-11 border-border focus:border-ring focus:ring-ring",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="password" className="text-card-foreground font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={cn(
                  "pl-10 pr-10 h-11 border-border focus:ring-ring focus:ring-ring",
                  "transition-all duration-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className={cn(
              "w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground",
              "font-medium shadow-lg hover:shadow-xl transition-all duration-200",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
