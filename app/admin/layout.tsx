import "./styles/admin-theme.css";
// import { ErrorNotificationContainer } from '@/components/ui/error-notification'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background admin-theme">
      {children}
      {/* <ErrorNotificationContainer /> */}
    </div>
  )
}


