import { LoginForm } from '../components/login-form'
import { LoginGuardSimple } from '../components/login-guard-simple'
import { AdminAuthProviderSimpleStorage } from '@/lib/context/AdminAuthContextSimpleStorage'

export default function AdminLoginPage() {
  return (
    <AdminAuthProviderSimpleStorage>
      <LoginGuardSimple>
        <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-md">
            {/* Header con logo y título */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-6">
                <img
                  src="/E_LOGO.png"
                  alt="ElevenRifas Logo"
                  className="h-20 w-auto sm:h-24 drop-shadow-lg"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Accede al sistema de gestión de rifas
              </p>
            </div>

            {/* Formulario de login */}
            <LoginForm />
          </div>
        </div>
      </LoginGuardSimple>
    </AdminAuthProviderSimpleStorage>
  )
}