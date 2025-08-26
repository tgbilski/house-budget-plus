import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";

const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_EXPANDED = 240;
const HEADER_HEIGHT_DESKTOP = 56;
const HEADER_HEIGHT_MOBILE = 48;

// Dummy header
function Header() {
  const [height, setHeight] = useState(
    window.innerWidth < 768 ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT_DESKTOP
  );
  useEffect(() => {
    const onResize = () =>
      setHeight(window.innerWidth < 768 ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT_DESKTOP);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <header
      className="w-full bg-blue-600 text-white flex items-center px-6"
      style={{
        height,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <h1 className="text-2xl font-bold">Lovable Demo Header</h1>
    </header>
  );
}

// Dummy pages
function Page({ title }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p>This is the {title} page content.</p>
    </div>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(
    window.innerWidth < 768 ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT_DESKTOP
  );

  useEffect(() => {
    const onResize = () =>
      setHeaderHeight(window.innerWidth < 768 ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT_DESKTOP);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep sidebar width in sync with collapse state
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex flex-row min-h-0">
          <AppSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            headerHeight={headerHeight}
          />
          <main
            className="flex-1 p-6"
            style={{
              marginLeft: sidebarWidth,
              marginTop: headerHeight,
              transition: "margin-left 0.2s",
            }}
          >
            <Routes>
              <Route path="/" element={<Page title="Home" />} />
              <Route path="/budget" element={<Page title="Monthly Budget" />} />
              <Route path="/savings" element={<Page title="Savings" />} />
              <Route path="/compare-prices" element={<Page title="Compare Vendors" />} />
              <Route path="/vacation" element={<Page title="Vacation" />} />
              <Route path="/gifts" element={<Page title="Gifts" />} />
              <Route path="/ai-insights" element={<Page title="AI Insights" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
