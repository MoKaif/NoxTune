import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FolderOpen, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [libraryPath, setLibraryPath] = useState('');

  useEffect(() => {
    // Load saved library path from localStorage
    const savedPath = localStorage.getItem('noxtunes-library-path');
    if (savedPath) {
      setLibraryPath(savedPath);
    }
  }, []);

  const handleSavePath = () => {
    localStorage.setItem('noxtunes-library-path', libraryPath);
    toast({
      title: "Settings Saved",
      description: "Library path has been updated successfully.",
    });
  };

  const handleBrowseFolder = () => {
    // In a real local app, this would open a folder picker dialog
    // For now, we'll just show a message
    toast({
      title: "Folder Browser",
      description: "In a local app, this would open a folder picker dialog.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your NoxTunes experience
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Music Library
          </CardTitle>
          <CardDescription>
            Set the local directory path where your music files are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="library-path">Library Path</Label>
            <div className="flex gap-2">
              <Input
                id="library-path"
                value={libraryPath}
                onChange={(e) => setLibraryPath(e.target.value)}
                placeholder="/Users/username/Music"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleBrowseFolder}
                className="shrink-0"
              >
                <FolderOpen className="w-4 h-4" />
                Browse
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This should point to the folder containing your music files. The app will scan this directory for supported audio formats.
            </p>
          </div>
          
          <Button onClick={handleSavePath} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Supported Audio Formats</CardTitle>
          <CardDescription>
            NoxTunes supports the following audio file formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-muted rounded p-2 text-center">MP3</div>
            <div className="bg-muted rounded p-2 text-center">FLAC</div>
            <div className="bg-muted rounded p-2 text-center">WAV</div>
            <div className="bg-muted rounded p-2 text-center">OGG</div>
            <div className="bg-muted rounded p-2 text-center">M4A</div>
            <div className="bg-muted rounded p-2 text-center">AAC</div>
            <div className="bg-muted rounded p-2 text-center">WMA</div>
            <div className="bg-muted rounded p-2 text-center">AIFF</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}