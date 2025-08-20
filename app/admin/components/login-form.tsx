"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminSignIn } from "@/lib/database/admin_database"
import { ADMIN_ROUTES, REDIRECTS } from "@/lib/routes"
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    console.log("🚀 Iniciando proceso de login...")
    
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
      console.log("📧 Intentando autenticar con:", email)

      // Usar la lógica centralizada de base de datos
      const result = await adminSignIn(email, password)

      if (!result.success) {
        console.error("❌ Error de login:", result.error)
        setError(result.error ?? 'Error de autenticación')
        return
      }

      console.log("✅ Usuario confirmado como admin, redirigiendo...", result.user?.id)
      console.log("📍 Ruta de destino:", REDIRECTS.AFTER_LOGIN)
      console.log("📍 ADMIN_ROUTES.DASHBOARD:", ADMIN_ROUTES.DASHBOARD)
      console.log("📍 Ruta actual antes de navegar:", window.location.pathname)
      
      setError(null)

      // Navegación directa usando el router
      console.log("🧭 Ejecutando navegación directa...")
      
      // Intentar diferentes métodos de navegación
      try {
        // Método 1: router.replace
        console.log("🔄 Método 1: router.replace")
        router.replace(REDIRECTS.AFTER_LOGIN)
        console.log("✅ router.replace ejecutado")
        
        // Método 2: router.push después de un delay
        setTimeout(() => {
          console.log("🔄 Método 2: router.push después de delay")
          router.push(REDIRECTS.AFTER_LOGIN)
          console.log("✅ router.push ejecutado")
        }, 100)
        
        // Método 3: window.location como fallback
        setTimeout(() => {
          console.log("🔄 Método 3: window.location como fallback")
          if (window.location.pathname !== REDIRECTS.AFTER_LOGIN) {
            console.log("⚠️ Navegación falló, usando window.location")
            window.location.href = REDIRECTS.AFTER_LOGIN
          }
        }, 500)
        
      } catch (navError) {
        console.error("❌ Error en navegación:", navError)
        
        // Fallback inmediato
        console.log("🔄 Usando fallback inmediato")
        window.location.href = REDIRECTS.AFTER_LOGIN
      }
      
    } catch (error) {
      console.error("💥 Error inesperado:", error)
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para probar la conexión a Supabase
  const testConnection = async () => {
    try {
      console.log("🔌 Probando conexión a Supabase...")
      // Aquí podrías usar una función centralizada de la base de datos
      setError(null)
    } catch (error) {
      console.error("💥 Error en test de conexión:", error)
      setError("Error de conexión: " + error)
    }
  }

  // Función para probar navegación manual
  const testNavigation = () => {
    console.log("🧪 Probando navegación manual...")
    console.log("📍 Ruta actual:", window.location.pathname)
    console.log("📍 Destino:", REDIRECTS.AFTER_LOGIN)
    
    try {
      router.replace(REDIRECTS.AFTER_LOGIN)
      console.log("✅ Navegación manual exitosa")
    } catch (error) {
      console.error("❌ Error en navegación manual:", error)
    }
  }

  // Función para probar navegación con window.location
  const testWindowLocation = () => {
    console.log("🧪 Probando navegación con window.location...")
    console.log("📍 Ruta actual:", window.location.pathname)
    console.log("📍 Destino:", REDIRECTS.AFTER_LOGIN)
    
    try {
      window.location.href = REDIRECTS.AFTER_LOGIN
      console.log("✅ Navegación con window.location ejecutada")
    } catch (error) {
      console.error("❌ Error en navegación con window.location:", error)
    }
  }

  return (
    <Card className="w-full border-0 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        <CardTitle className="text-2xl text-center text-card-foreground font-bold">
          Panel de Administración
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

          {/* Botones de prueba (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={testConnection}
                className="w-full"
              >
                🔌 Probar Conexión
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={testNavigation}
                className="w-full"
              >
                🧪 Probar Navegación
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={testWindowLocation}
                className="w-full"
              >
                🌐 Probar window.location
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
