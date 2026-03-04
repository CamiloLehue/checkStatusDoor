import { Outlet } from "react-router";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import { configServer } from "@/config/ConfigServer";
import { DropdownProvider } from "@/components/ui/Dropdown";
import { useState } from "react";

function Template() {
  const { useCompany, useConfigApp } = configServer();
  const [isOpenSidebar, setOpenSidebar] = useState(false);
  return (
    <DropdownProvider>
      <div className="min-h-screen w-screen flex overflow-hidden">
        <Sidebar
          useCompany={useCompany}
          useConfigApp={useConfigApp}
          isOpenSidebar={isOpenSidebar}
          setIsOpenSidebar={setOpenSidebar}
        />
        <div className="flex-1 flex flex-col z-0 bg-bg-200  pe-2 pb-2">
          <div className="relative bg-bg-200 p-1 animate-slide-in-top z-60">
            <Header
              useConfigApp={useConfigApp}
              isOpenSidebar={isOpenSidebar}
              setIsOpenSidebar={setOpenSidebar}
            />
            <div className="w-1/2 absolute left-[50%] z-30 top-0 m-0.5 -translate-x-1/2 bg-linear-to-l from-transparent via-bg-400/10 to-transparent h-[0.6px] "></div>
          </div>
          <div className="flex-1 flex flex-col z-0 rounded-2xl rounded-ss-none overflow-hidden bg-bg-200 ">
            <main className="flex-1 overflow-auto w-full  ">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </DropdownProvider>
  );
}

export default Template;
