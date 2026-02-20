import { Outlet } from "react-router";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import { configServer } from "@/config/ConfigServer";
import { DropdownProvider } from "@/components/ui/Dropdown";
import { useSismosNotificaciones } from "@/features/sismos/hooks/useSismosNotificaciones";

function Template() {
  const { useCompany, useConfigApp } = configServer();

  // Inyecta automáticamente las notificaciones de sismos al store del template
  useSismosNotificaciones({ period: "day", refetchInterval: 60_000 });
  return (
    <DropdownProvider>
      <div className="min-h-screen w-screen flex overflow-hidden">
        <Sidebar useCompany={useCompany} useConfigApp={useConfigApp} />
        <div className="flex-1 flex flex-col z-0 ">
          <div className="relative bg-bg-300 p-1">
            <Header useConfigApp={useConfigApp} />
            <div className="w-1/2 absolute left-[50%] z-30 top-0 m-0.5 -translate-x-1/2 bg-linear-to-l from-transparent via-bg-400/60 to-transparent h-[0.6px] "></div>
          </div>
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </DropdownProvider>
  );
}

export default Template;
