import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { configServer } from "@/config/ConfigServer";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  const { theme } = useTheme();
  const { useCompany, useConfigApp } = configServer();

  const logo =
    theme === "dark"
      ? useCompany.LOGO_COMPANY_WHITE
      : useCompany.LOGO_COMPANY_BLACK;

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden max-w-screen relative">
      <img
        src={logo}
        alt={useCompany.NAME_COMPANY}
        className="absolute inset-0 opacity-5 -rotate-35 skew-20 h-full"
      />
      <div className="absolute left-0 top-0 bg-linear-120 from-bg-200 to-bg-300 w-full h-full"></div>
      <div className="relative flex flex-col justify-center items-center gap-5  max-w-3xl  backdrop-blur py-10 w-full">
        <div className="text-center">
          <h2 className="text-text-100 font-light">{title}</h2>
          {subtitle && (
            <p className=" text-text-200 font-light">{subtitle}</p>
          )}
        </div>
        <div className="w-full flex justify-center items-center gap-10  ">
          <div className="flex flex-col items-center justify-center gap-5 w-1/2">
            <div className="flex justify-center">
              <img src={logo} alt={useCompany.NAME_COMPANY} className="h-40" />
            </div>
            <div className="flex justify-center items-center ">
              <h1 className="text-transparent text-4xl font-light text-clip bg-clip-text bg-linear-60 from-text-300 via-text-200 to-text-300">
                {useConfigApp.NAME_APP}
              </h1>
            </div>
          </div>
          <div className="w-1/2 p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
