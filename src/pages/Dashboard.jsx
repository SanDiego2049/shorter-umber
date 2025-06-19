import { useState } from "react";
import LinkHistory from "../components/LinkHistory";
import Statistics from "../components/Statistics";
import DashboardHeader from "../components/DashboardHeader";
import NavigationTabs from "../components/NavigationTabs";
import ThemeToggler from "../components/ThemeToggler";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("history");

  // MODIFIED: Add a state to trigger URL table refresh
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // MODIFIED: Callback function to increment the trigger
  const handleUrlShortened = () => {
    setHistoryRefreshTrigger((prevKey) => prevKey + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "history":
        return (
          <LinkHistory
            refreshTrigger={historyRefreshTrigger} // MODIFIED: Pass the refresh trigger
          />
        );
      case "statistics":
        return <Statistics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative dark:bg-slate-900">
      {/* Animated swirl background */}
      <div
        className="fixed inset-0 bg-no-repeat bg-center bg-contain pointer-events-none z-0
        brightness-75 contrast-125 hue-rotate-180
        dark:brightness-100 dark:contrast-100 dark:hue-rotate-0"
        style={{
          backgroundImage: "url('/src/assets/Swirl.png')",
          animation: "spin 30s linear infinite",
        }}
      />

      {/* Static pattern background */}
      <div
        className="fixed inset-0 bg-repeat bg-contain pointer-events-none z-0
        brightness-100 invert opacity-100 drop-shadow-sm
        dark:brightness-100 dark:invert-0 dark:opacity-100"
        style={{
          backgroundImage: "url('/src/assets/Property%201=Variant2.png')",
        }}
      />

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10">
        {/* MODIFIED: Pass the callback to DashboardHeader */}
        <DashboardHeader onUrlShortened={handleUrlShortened} />{" "}
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <ThemeToggler />
        <div className="max-w-7xl mx-auto px-6 py-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
