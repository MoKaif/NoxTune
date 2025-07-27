import { NavLink } from "react-router-dom";
import {
  Home,
  Library,
  Clock,
  Album,
  Users,
  BarChart3,
  Compass,
  Menu,
  Music,
  Settings,
  Radio,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: Radio, label: "Last.fm", path: "/lastfm" },
  { icon: Album, label: "Albums", path: "/albums" },
  { icon: Users, label: "Artists", path: "/artists" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Compass, label: "Discover", path: "/discover" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar-bg border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center glow">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">NoxTunes</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg p-3 transition-all duration-200 group",
                    "hover:bg-muted text-muted-foreground hover:text-foreground",
                    isActive && "bg-primary text-primary-foreground glow",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">NoxTunes</p>
            <p>Premium Music Experience</p>
          </div>
        )}
      </div>
    </aside>
  );
}
