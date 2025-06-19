// src/pages/Home.jsx
import { useState } from "react"; // MODIFIED: Import useState
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import ThemeToggler from "../components/ThemeToggler";
import UrlTable from "../components/UrlTable";
import swirlImage from "../assets/Swirl.png";
import patternImage from "../assets/Property 1=Variant2.png";

const Home = () => {
  // MODIFIED: Add a state to trigger URL table refresh
  const [urlRefreshTrigger, setUrlRefreshTrigger] = useState(0);

  // MODIFIED: Callback function to increment the trigger
  const handleUrlShortened = () => {
    setUrlRefreshTrigger((prevKey) => prevKey + 1);
  };

  return (
    <main className="dark:bg-gray-900 relative flex flex-col items-center h-screen overflow-hidden">
      {/* Animated swirl background */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-contain animate-spin-slow pointer-events-none
        brightness-75 contrast-125 hue-rotate-180
        dark:brightness-100 dark:contrast-100 dark:hue-rotate-0"
        style={{
          backgroundImage: `url(${swirlImage})`,
          animation: "spin 30s linear infinite",
        }}
      />

      {/* Static pattern background */}
      <div
        className="absolute inset-0 bg-repeat bg-contain pointer-events-none
        brightness-100 invert opacity-100 drop-shadow-sm
        dark:brightness-100 dark:invert-0 dark:opacity-100"
        style={{
          backgroundImage: `url(${patternImage})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <Navbar />
        {/* MODIFIED: Pass the callback to Hero */}
        <Hero onUrlShortened={handleUrlShortened} />
        <ThemeToggler />
        {/* MODIFIED: Pass the refresh trigger to UrlTable */}
        <UrlTable refreshTrigger={urlRefreshTrigger} />
      </div>
    </main>
  );
};

export default Home;
