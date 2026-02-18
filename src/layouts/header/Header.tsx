import ThemeToggleButton from "../modeColor/ThemeToggleButton";
import type { AppConfig } from "@/config/ConfigServer";
import { NotificationDropdown } from "@/template/notifications";
import { UserMenu } from "@/template/components";

function Header({ useConfigApp }: { useConfigApp: AppConfig }) {
  return (
    <header className="max-w-7xl h-10 mx-auto rounded-xl shadow bg-bg-100/70 backdrop-blur text-text-100 w-full z-50 flex items-center relative">
      <div className="w-full flex items-center justify-between">
        <div className="px-5 flex gap-1">
          <h4 className="font-bold">
            <span className="text-brand-100">
              {useConfigApp.PROVIDER_APP.slice(0, 2)}
            </span>
            {useConfigApp.PROVIDER_APP.slice(2)}
          </h4>
        </div>
        <div className="absolute left-[50%] -translate-x-1/2">
          <span className="font-extralight text-text-100">
            {useConfigApp.NAME_APP}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center gap-3 px-1 rounded-2xl">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <div className="border-s border-border/50  px-1">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
