import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "../player/MusicPlayer";
import { useMusic } from "../../hooks/useMusic";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { MusicQueue } from "../player/MusicQueue";
import { ListMusic } from "lucide-react";
import { Button } from "../ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const { currentTrack, isPlaying } = useMusic();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
        {/* Music Player */}
        {currentTrack && (
          <MusicPlayer track={currentTrack} isPlaying={isPlaying} isQueueOpen={isQueueOpen} setIsQueueOpen={setIsQueueOpen} />
        )}
      </div>
    </div>
  );
}