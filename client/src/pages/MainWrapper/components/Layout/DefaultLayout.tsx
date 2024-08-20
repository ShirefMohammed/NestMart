import React, { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import Footer from "../Footer/Footer";
import Header from "../Header/index";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <section className="font-normal text-base text-text relative z-1">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Content Area Start ===== --> */}
        <div
          ref={contentRef}
          className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          {/* <!-- ===== Header Start ===== --> */}
          <Header />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}

          {/* <!-- ===== Footer Start ===== --> */}
          <Footer />
          {/* <!-- ===== Footer End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </section>
  );
};

export default DefaultLayout;
