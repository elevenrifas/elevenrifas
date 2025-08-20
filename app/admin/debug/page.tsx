"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/database"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DebugPage() {
  const [email, setEmail] = useState("admin@elevenrifas.com")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [currentTest, setCurrentTest] = useState("")

  const addResult = (test: string, success: boolean, message: string, details?: any) => {
    setResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testConnection = async () => {
    setCurrentTest("Conexión a Supabase")
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        addResult("Conexión", false, "Error de conexión", error)
      } else {
        addResult("Conexión", true, "Conexión exitosa a Supabase")
      }
    } catch (error) {
      addResult("Conexión", false, "Error inesperado", error)
    } finally {
      setIsLoading(false)
      setCurrentTest("")
    }
  }

  const testAuth = async () => {
    if (!email || !password) {
      addResult("Autenticación", false, "Email y contraseña son requeridos")
      return
    }

    setCurrentTest("Autenticación")
    setIsLoading(true)
    
    try {
      console.log("🔐 Intentando autenticar...")
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addResult("Autenticación", false, "Error de autenticación", error)
        console.error("❌ Error:", error)
      } else if (data.user) {
        addResult("Autenticación", true, "Usuario autenticado exitosamente", {
          userId: data.user.id,
          email: data.user.email
        })
        console.log("✅ Usuario autenticado:", data.user)
        
        // Verificar rol de admin
        await testAdminRole(data.user.id)
      } else {
        addResult("Autenticación", false, "No se recibió usuario en la respuesta")
      }
    } catch (error) {
      addResult("Autenticación", false, "Error inesperado", error)
      console.error("💥 Error:", error)
    } finally {
      setIsLoading(false)
      setCurrentTest("")
    }
  }

  const testAdminRole = async (userId: string) => {
    setCurrentTest("Verificación de rol admin")
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', userId)
        .eq('role', 'admin')
        .single()

      if (error) {
        addResult("Rol Admin", false, "Error verificando rol", error)
      } else if (profile && profile.role === 'admin') {
        addResult("Rol Admin", true, "Usuario confirmado como administrador", profile)
      } else {
        addResult("Rol Admin", false, "Usuario no tiene rol de administrador", profile)
      }
    } catch (error) {
      addResult("Rol Admin", false, "Error inesperado verificando rol", error)
    }
  }

  const testFormSubmission = async () => {
    setCurrentTest("Simulación de formulario")
    
    // Simular el evento submit del formulario
    const mockEvent = {
      preventDefault: () => console.log("preventDefault llamado"),
      target: { email: { value: email }, password: { value: password } }
    }
    
    addResult("Formulario", true, "Evento submit simulado correctamente")
    
    // Ahora probar la autenticación real
    await testAuth()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 Debug del Sistema de Login</h1>
        
        {/* Panel de configuración */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>⚙️ Configuración de Prueba</CardTitle>
            <CardDescription>
              Usa estas credenciales para probar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elevenrifas.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={testConnection} disabled={isLoading}>
                🔌 Probar Conexión
              </Button>
              <Button onClick={testAuth} disabled={isLoading}>
                🔐 Probar Autenticación
              </Button>
              <Button onClick={testFormSubmission} disabled={isLoading}>
                📝 Probar Formulario Completo
              </Button>
              <Button onClick={clearResults} variant="outline">
                🗑️ Limpiar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado actual */}
        {currentTest && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ejecutando: {currentTest}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados de las Pruebas</CardTitle>
            <CardDescription>
              Revisa aquí el estado de cada prueba realizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No se han ejecutado pruebas aún. Usa los botones de arriba para comenzar.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {result.test} - {result.timestamp}
                        </h4>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground">
                              Ver detalles
                            </summary>
                            <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Probar Conexión</strong>: Verifica que Supabase esté accesible</p>
              <p>2. <strong>Probar Autenticación</strong>: Intenta autenticar con las credenciales</p>
              <p>3. <strong>Probar Formulario Completo</strong>: Simula el flujo completo del login</p>
              <p>4. <strong>Revisar Consola</strong>: Abre las herramientas de desarrollador (F12) para ver logs detallados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
