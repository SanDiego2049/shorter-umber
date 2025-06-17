import { BarChart3, Calendar } from "lucide-react";

const NavigationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "history", label: "History", icon: Calendar },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
  ];

  return (
    <div className="bg-transparent backdrop-blur-3xl border-b border-slate-700">
      <div className="flex justify-center px-6">
        <nav className="flex gap-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent dark:text-slate-400 text-slate-700 dark:hover:text-slate-300 hover:text-slate-500"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;
