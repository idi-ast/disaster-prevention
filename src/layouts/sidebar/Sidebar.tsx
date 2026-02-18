import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useSidebar } from "../../../libs/zustand/hooks/useUI";
import { useTheme } from "@/context/ThemeContext";
import type { CompanyConfig, AppConfig } from "@/config/ConfigServer";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";

function Sidebar({
  useCompany,
  useConfigApp,
}: {
  useCompany: CompanyConfig;
  useConfigApp: AppConfig;
}) {
  const { isCollapsed, setCollapsed } = useSidebar();

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!isCollapsed && !isHovered) {
      timeout = setTimeout(() => {
        setCollapsed(true);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isCollapsed, isHovered, setCollapsed]);

  return (
    <aside className={`relative bg-bg-100 min-h-screen w-19 z-10`}>
      <div
        className={`absolute top-0 left-0 h-full rounded-2xl bg-bg-100   ${
          isCollapsed ? "w-19" : "w-64"
        } transition-all duration-200 ease-in-out flex flex-col justify-between`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className="absolute top-2.5 -right-8 text-text-300 outline outline-transparent border border-border shadow shadow-bg-400/30 p-0.5 hover:text-text-100 bg-bg-100 hover:bg-brand-100 rounded-full"
          onClick={() => setCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <IconChevronRight size={20} />
          ) : (
            <IconChevronLeft size={20} />
          )}
        </button>
        <div className="w-full h-full">
          <TopSidebar
            isCollapsed={isCollapsed}
            useCompany={useCompany}
            useConfigApp={useConfigApp}
          />
          <MenuNavigation
            isCollapsed={isCollapsed}
            useConfigApp={useConfigApp}
          />
        </div>
        <BottomSidebar isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

const BottomSidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div
      className={`border-t border-border bg-bg-200 flex items-center p-3 ${
        isCollapsed ? "justify-center" : "justify-start"
      } `}
    >
      <span className={`text-xs text-text-200 text-center`}>
        © {new Date().getFullYear()} v0.0.1
      </span>
    </div>
  );
};

const MenuNavigation = ({
  isCollapsed: _isCollapsed,
  useConfigApp: _useConfigApp,
}: {
  isCollapsed: boolean;
  useConfigApp: AppConfig;
}) => {
  return (
    <div className={` ${_isCollapsed ? "mt-4 px-1" : "mt-4 px-3"} `}>
      {_useConfigApp.NAVIGATION_APP.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.link}
            className={({ isActive }: { isActive: boolean }) => `
              flex items-center mb-3 p-3 rounded hover:bg-bg-200 transition-all duration-300
              ${_isCollapsed ? "justify-center" : "justify-start"}
              ${isActive ? "bg-bg-300 hover:bg-bg-200" : "text-text-100"}
            `}
            target={item.target ? "_blank" : "_self"}
            rel="noreferrer"
          >
            <span>
              <Icon size={22} stroke={1.5} />
            </span>
            {!_isCollapsed && (
              <span className="ml-2 truncate">{item.name}</span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

const TopSidebar = ({
  isCollapsed,
  useCompany,
  useConfigApp,
}: {
  isCollapsed: boolean;
  useCompany: CompanyConfig;
  useConfigApp: AppConfig;
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
          w-full h-13 flex items-center overflow-hidden
          ${isCollapsed ? "px-2 py-2" : "px-5 py-2"}
          `}
    >
      <img
        src={
          theme === "dark"
            ? useCompany.LOGO_COMPANY_WHITE
            : useCompany.LOGO_COMPANY_BLACK
        }
        alt={useCompany.NAME_COMPANY}
        className="h-full "
      />
      {!isCollapsed && (
        <span className="ml-2 truncate text-xs font-medium">
          {useConfigApp.NAME_APP}
        </span>
      )}
    </div>
  );
};

export default Sidebar;
