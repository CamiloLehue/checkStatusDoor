import ThemeToggleButton from "../modeColor/ThemeToggleButton";
import type { AppConfig } from "@/config/ConfigServer";
import { NotificationDropdown } from "@/template/notifications";
import { UserMenu } from "@/template/components";
import { useBreakpoint } from "@/hooks/useBreakpoints";
import { IconCategory2 } from "@tabler/icons-react";

function Header({
  useConfigApp,
  isOpenSidebar,
  setIsOpenSidebar,
}: {
  useConfigApp: AppConfig;
  isOpenSidebar: boolean;
  setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isMobile } = useBreakpoint();
  return (
    <header className="max-w-7xl h-10 mx-auto rounded-xl  bg-bg-100  text-text-100 w-full z-60 flex items-center relative">
      <div className="w-full flex items-center justify-between ">
        <div className="px-5 flex gap-1">
          <h4 className="font-bold text-text-200">
            <span className="text-brand-100">
              {useConfigApp.PROVIDER_APP.slice(0, 2)}
            </span>
            {useConfigApp.PROVIDER_APP.slice(2)}
          </h4>
        </div>
        {!isMobile && (
          <div className="absolute left-[50%] top-2 -translate-x-1/2">
            <span className="text-2xl  text-text-200 font-secondary capitalize">
              {useConfigApp.NAME_APP}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center gap-3 px-1 rounded-2xl">
            {isMobile && (
              <button
                className="text-text-100"
                onClick={() => setIsOpenSidebar(!isOpenSidebar)}
              >
                <IconCategory2 size={20} />
              </button>
            )}
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <div className="border-s border-border/50  px-0.5">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
