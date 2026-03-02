import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useSidebar } from "../../../libs/zustand/hooks/useUI";
import { useTheme } from "@/context/ThemeContext";
import type { CompanyConfig, AppConfig } from "@/config/ConfigServer";
import { Link, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoints";

function Sidebar({
  useCompany,
  useConfigApp,
  isOpenSidebar,
  setIsOpenSidebar,
}: {
  useCompany: CompanyConfig;
  useConfigApp: AppConfig;
  isOpenSidebar: boolean;
  setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isMobile } = useBreakpoint();
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

  return !isMobile ? (
    <aside className={`relative bg-bg-200 min-h-screen w-19 z-10 `}>
      <div
        className={`absolute top-0 left-0 h-full rounded-e-2xl    ${
          isCollapsed
            ? "w-19 animate-slide-in-left"
            : "w-64  bg-bg-100"
        } transition-all duration-200 ease-in-out flex flex-col justify-between`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className="absolute top-3 -right-10 text-text-300 outline outline-transparent p-0.5 hover:text-text-100 bg-bg-100 hover:bg-brand-100 rounded-full"
          onClick={() => setCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <IconChevronRight size={20} />
          ) : (
            <IconChevronLeft size={20} />
          )}
        </button>
        <div className="w-full h-full p-1">
          <div className="bg-bg-100 rounded-lg">
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
        </div>
        <BottomSidebar isCollapsed={isCollapsed} />
      </div>
    </aside>
  ) : (
    isOpenSidebar && (
      <div className="fixed inset-0 z-50 bg-bg-100">
        <button
          className="fixed top-2 right-2 bg-bg-100  z-50 p-2 text-text-300 outline outline-transparent "
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
        >
          <IconX size={20} />
        </button>
        <TopSidebar
          isCollapsed={isCollapsed}
          useCompany={useCompany}
          useConfigApp={useConfigApp}
        />
        <MenuNavigation
          isCollapsed={!isCollapsed}
          useConfigApp={useConfigApp}
        />
      </div>
    )
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
    <div
      className={` ${_isCollapsed ? "mt-4  p-1 " : "mt-4 p-1 mx-1 bg-bg-100 rounded-lg"} `}
    >
      {_useConfigApp.NAVIGATION_APP.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.link}
            className={({ isActive }: { isActive: boolean }) => `
              flex items-center text-text-100  p-3 rounded hover:bg-bg-200 transition-all duration-300
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
          w-full h-18 flex items-center overflow-hidden
          ${isCollapsed ? "px-2 py-2" : "px-5 py-2"}
          `}
    >
      <div
        className={` h-full flex items-center justify-center
        ${isCollapsed ? "w-full" : "px-5 py-2"}
        `}
      >
        <Link to="/">
          <img
            src={
              theme === "dark"
                ? useCompany.LOGO_COMPANY_WHITE
                : useCompany.LOGO_COMPANY_BLACK
            }
            alt={useCompany.NAME_COMPANY}
            className="h-8 object-cover "
          />
        </Link>
      </div>
      {!isCollapsed && (
        <span className="ml-2 truncate text-xs font-medium">
          {useConfigApp.NAME_APP}
        </span>
      )}
    </div>
  );
};

export default Sidebar;
