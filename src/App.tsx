import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import SidebarInset from "@/components/SidebarInset";
import Home from "@/pages/Home";
import MonthlyBudget from "@/pages/MonthlyBudget";
import SavingsGoals from "@/pages/SavingsGoals";
import ComparePrices from "@/pages/ComparePrices";
import Vacation from "@/pages/Vacation";
import Gifts from "@/pages/Gifts";
import AIInsights from "@/pages/AIInsights";
import FinancialResources from "@/pages/FinancialResources";

const SIDEBAR_EXPANDED = 240; // Make sure this matches your expanded sidebar width

function App() {
  return (
    <Router>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen w-full flex flex-col">
          {/* Sticky Header */}
          <Header />

          {/* Main app content: floating sidebar + main content */}
          <div className="flex flex-1 min-h-0">
            {/* Floating Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div
              className="flex-1"
              // On desktop, add left margin so content is not hidden behind the floating sidebar
              style={{
                marginLeft: SIDEBAR_EXPANDED,
                transition: "margin-left 0.2s",
              }}
            >
              <SidebarInset>
                <main className="p-4 md:p-6 min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/budget" element={<MonthlyBudget />} />
                    <Route path="/savings" element={<SavingsGoals />} />
                    <Route path="/compare-prices" element={<ComparePrices />} />
                    <Route path="/vacation" element={<Vacation />} />
                    <Route path="/gifts" element={<Gifts />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/resources" element={<FinancialResources />} />
                  </Routes>
                </main>
              </SidebarInset>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </Router>
  );
}

export default App;
