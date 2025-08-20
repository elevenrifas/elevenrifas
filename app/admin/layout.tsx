import "./styles/admin-theme.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background admin-theme">
      {children}
    </div>
  );
}


