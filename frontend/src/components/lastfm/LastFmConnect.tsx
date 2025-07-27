import { useState } from "react";
import { Music, ExternalLink, User, Headphones, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useLastFm } from "../../hooks/useLastFm";

export function LastFmConnect() {
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isAuthenticated, 
    username: connectedUsername, 
    userInfo, 
    recentTracks, 
    topArtists,
    connectLastFm, 
    disconnectLastFm 
  } = useLastFm();

  const handleConnect = () => {
    if (username.trim()) {
      connectLastFm(username.trim());
      setIsOpen(false);
      setUsername("");
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            Last.fm Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{connectedUsername}</p>
              {userInfo && (
                <p className="text-sm text-muted-foreground">
                  {parseInt(userInfo.playcount).toLocaleString()} scrobbles
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={disconnectLastFm}>
              Disconnect
            </Button>
          </div>

          

          <Button variant="outline" size="sm" className="w-full" asChild>
            <a 
              href={`https://www.last.fm/user/${connectedUsername}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Profile
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          Connect Last.fm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Sync your listening history and discover insights about your music taste.
        </p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <User className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to Last.fm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your Last.fm username to connect your account and start syncing your listening data.
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="Last.fm username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConnect} disabled={!username.trim()} className="flex-1">
                  Connect
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}