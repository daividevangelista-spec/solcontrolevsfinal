import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Database, FileText, Bell } from "lucide-react";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminBackups from "./AdminBackups";
import AdminReports from "./AdminReports";
import AdminNotifications from "./AdminNotifications";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  // Extract the active tab from the URL hash or use 'reports' as default
  const activeTab = location.hash.replace('#', '') || 'reports';

  const handleTabChange = (value: string) => {
    navigate(`#${value}`);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Centro de Controle Administrativo</h1>
        <p className="text-muted-foreground">Gestão de relatórios, backups e auditoria do sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full max-w-2xl grid grid-cols-4 bg-card border border-border">
          <TabsTrigger value="reports" className="data-[state=active]:solar-gradient data-[state=active]:text-accent">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Relatórios Financeiros</span>
            <span className="sm:hidden">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:solar-gradient data-[state=active]:text-accent">
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notificações</span>
            <span className="sm:hidden">Alertas</span>
          </TabsTrigger>
          
          {role === 'admin' && (
            <>
              <TabsTrigger value="backups" className="data-[state=active]:solar-gradient data-[state=active]:text-accent">
                <Database className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Backups & Exportação</span>
                <span className="sm:hidden">Backups</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:solar-gradient data-[state=active]:text-accent">
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logs de Auditoria</span>
                <span className="sm:hidden">Auditoria</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="reports" className="m-0 focus-visible:outline-none">
            <AdminReports />
          </TabsContent>
          <TabsContent value="notifications" className="m-0 focus-visible:outline-none">
            <AdminNotifications />
          </TabsContent>
          <TabsContent value="backups" className="m-0 focus-visible:outline-none">
            <AdminBackups />
          </TabsContent>
          <TabsContent value="audit" className="m-0 focus-visible:outline-none">
            <AdminAuditLogs />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
