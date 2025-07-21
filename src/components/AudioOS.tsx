
import { useState, useEffect, useRef } from "react";
import { logger } from '@/utils/logger';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Power, 
  Monitor, 
  Folder, 
  Calendar, 
  Settings, 
  Search,
  Music,
  MessageSquare,
  Wifi,
  Battery,
  Sun,
  Moon,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";

interface SystemAction {
  action: string;
  data: any;
  timestamp: number;
}

interface OSApplication {
  id: string;
  name: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isActive: boolean;
}

export const AudioOS = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemActions, setSystemActions] = useState<SystemAction[]>([]);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Mock applications
  const [applications, setApplications] = useState<OSApplication[]>([
    { id: 'files', name: 'Files', icon: <Folder className="w-6 h-6" />, isOpen: false, isActive: false },
    { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-6 h-6" />, isOpen: false, isActive: false },
    { id: 'music', name: 'Music', icon: <Music className="w-6 h-6" />, isOpen: false, isActive: false },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-6 h-6" />, isOpen: false, isActive: false },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-6 h-6" />, isOpen: false, isActive: false },
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize speech APIs
  useEffect(() => {
    console.log('Audio OS initializing...');
    
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = 'en-US';
        
        speechRecognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(interimTranscript || finalTranscript);
          
          if (finalTranscript) {
            handleVoiceCommand(finalTranscript.trim());
          }
        };
        
        speechRecognitionRef.current.onerror = (event) => {
          logger.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        speechRecognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      }
    }

    // Cleanup on unmount
    return () => {
      console.log('Audio OS cleaning up...');
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const connectToAudioOS = async () => {
    console.log('Attempting to connect to Audio OS...');
    
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecure) {
        toast({
          title: "HTTPS Required",
          description: "Voice features require HTTPS. Please use the published version of your app.",
          variant: "destructive"
        });
        return;
      }

      // Check browser support
      if (!speechRecognitionRef.current) {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
          variant: "destructive"
        });
        return;
      }

      // Check microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
      } catch (micError) {
        console.error('Microphone access denied:', micError);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access and try again.",
          variant: "destructive"
        });
        return;
      }

      setIsConnected(true);
      console.log('Audio OS connected successfully');
      
      toast({
        title: "Audio OS Connected",
        description: "ARIA is ready! Try saying 'Hello' or 'What time is it?'",
      });
      
      // Auto-start listening after connecting
      setTimeout(() => {
        startListening();
      }, 500); // Small delay to ensure connection is stable
      
    } catch (error) {
      logger.error('Error initializing Audio OS:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const startListening = async () => {
    console.log('Starting speech recognition...');
    
    try {
      if (!speechRecognitionRef.current) {
        toast({
          title: "Speech Recognition Error", 
          description: "Speech recognition not available",
          variant: "destructive"
        });
        return;
      }
      
      // Request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Ensure previous recognition is stopped
      speechRecognitionRef.current.stop();
      
      // Small delay before starting
      setTimeout(() => {
        speechRecognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started');
        
        toast({
          title: "Listening Started",
          description: "Speak now - I'm listening!",
        });
      }, 100);
      
    } catch (error) {
      logger.error('Error starting speech recognition:', error);
      setIsConnected(false); // Reset connection status on error
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Microphone Permission Denied",
          description: "Please allow microphone access in your browser settings.",
          variant: "destructive"
        });
      } else if (error.name === 'NotFoundError') {
        toast({
          title: "No Microphone Found",
          description: "Please connect a microphone and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Audio Error",
          description: `Failed to start listening: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    console.log('Stopping speech recognition...');
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (!isConnected) {
      connectToAudioOS();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speak = (text: string) => {
    console.log('Speaking:', text);
    if (speechSynthesisRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
      };
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Processing voice command:', command);
    const lowerCommand = command.toLowerCase();
    
    const action: SystemAction = {
      action: 'voice_command',
      data: { command },
      timestamp: Date.now()
    };
    setSystemActions(prev => [action, ...prev.slice(0, 9)]);

    // Process different command types
    if (lowerCommand.includes('open') || lowerCommand.includes('launch')) {
      if (lowerCommand.includes('file')) {
        openApplication('files');
        speak('Opening Files application');
      } else if (lowerCommand.includes('music')) {
        openApplication('music');
        speak('Opening Music application');
      } else if (lowerCommand.includes('calendar')) {
        openApplication('calendar');
        speak('Opening Calendar application');
      } else if (lowerCommand.includes('settings')) {
        openApplication('settings');
        speak('Opening Settings application');
      } else if (lowerCommand.includes('messages')) {
        openApplication('messages');
        speak('Opening Messages application');
      }
    } else if (lowerCommand.includes('volume')) {
      if (lowerCommand.includes('up') || lowerCommand.includes('increase')) {
        adjustSystemSetting('volume', 'up');
        speak('Volume increased');
      } else if (lowerCommand.includes('down') || lowerCommand.includes('decrease')) {
        adjustSystemSetting('volume', 'down');
        speak('Volume decreased');
      }
    } else if (lowerCommand.includes('brightness')) {
      if (lowerCommand.includes('up') || lowerCommand.includes('increase')) {
        adjustSystemSetting('brightness', 'up');
        speak('Brightness increased');
      } else if (lowerCommand.includes('down') || lowerCommand.includes('decrease')) {
        adjustSystemSetting('brightness', 'down');
        speak('Brightness decreased');
      }
    } else if (lowerCommand.includes('dark mode')) {
      if (lowerCommand.includes('on') || lowerCommand.includes('enable')) {
        setIsDarkMode(true);
        speak('Dark mode enabled');
      } else if (lowerCommand.includes('off') || lowerCommand.includes('disable')) {
        setIsDarkMode(false);
        speak('Dark mode disabled');
      }
    } else if (lowerCommand.includes('time')) {
      speak(`The current time is ${currentTime.toLocaleTimeString()}`);
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      speak('Hello! I am ARIA, your audio operating system. How can I help you?');
    } else {
      speak('Command not recognized. Try saying things like open files, increase volume, or what time is it.');
    }
  };

  const openApplication = (appName: string) => {
    console.log('Opening application:', appName);
    setApplications(prev => prev.map(app => {
      if (app.name.toLowerCase().includes(appName.toLowerCase()) || 
          app.id.toLowerCase().includes(appName.toLowerCase())) {
        return { ...app, isOpen: true, isActive: true };
      }
      return { ...app, isActive: false };
    }));
  };

  const adjustSystemSetting = (setting: string, value: string) => {
    console.log('Adjusting system setting:', setting, value);
    switch (setting) {
      case 'volume':
        if (value.includes('up') || value.includes('increase')) {
          setVolume(prev => Math.min(100, prev + 10));
        } else if (value.includes('down') || value.includes('decrease')) {
          setVolume(prev => Math.max(0, prev - 10));
        } else {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            setVolume(Math.max(0, Math.min(100, numValue)));
          }
        }
        break;
      case 'brightness':
        if (value.includes('up') || value.includes('increase')) {
          setBrightness(prev => Math.min(100, prev + 10));
        } else if (value.includes('down') || value.includes('decrease')) {
          setBrightness(prev => Math.max(0, prev - 10));
        }
        break;
      case 'dark_mode':
        setIsDarkMode(value.includes('on') || value.includes('enable'));
        break;
    }
  };

  const disconnect = () => {
    console.log('Disconnecting Audio OS...');
    stopListening();
    setIsConnected(false);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  // Prevent event bubbling and ensure clicks work properly
  const handleCardClick = (e: React.MouseEvent, callback?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked');
    if (callback) {
      callback();
    }
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked');
    callback();
  };

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-500 select-none",
        "bg-background text-foreground"
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Desktop Wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 opacity-20"></div>
      
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b backdrop-blur-sm bg-background/80 border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">ARIA OS</span>
          </div>
          
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>

          {isSpeaking && (
            <Badge variant="secondary" className="animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" />
              Speaking
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
            <span className="text-sm">{batteryLevel}%</span>
          </div>
          
          <span className="text-sm font-mono">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Voice Control Center */}
          <Card className={cn(
            "mb-8 border-2 transition-colors bg-card border-border",
            isListening && "border-primary shadow-glow"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Voice Control Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6">
                <Button
                  onClick={(e) => handleButtonClick(e, toggleListening)}
                  size="lg"
                  className={cn(
                    "w-20 h-20 rounded-full transition-all duration-300",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>

                <div className="flex-1 max-w-md">
                  <div className="text-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      {isListening ? "Listening..." : "Click to start listening"}
                    </span>
                  </div>
                  
                  {transcript && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    )}>
                      <strong>You said:</strong> {transcript}
                    </div>
                  )}
                </div>

                {isConnected && (
                  <Button
                    onClick={(e) => handleButtonClick(e, disconnect)}
                    variant="outline"
                    size="lg"
                  >
                    <Power className="w-5 h-5 mr-2" />
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications */}
            <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                        app.isOpen 
                          ? "border-blue-500 bg-blue-500/10" 
                          : isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                      )}
                      onClick={(e) => handleCardClick(e, () => openApplication(app.name))}
                    >
                      {app.icon}
                      <span className="text-xs">{app.name}</span>
                      {app.isOpen && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Volume</span>
                    <span className="text-sm">{volume}%</span>
                  </div>
                  <Progress value={volume} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Brightness</span>
                    <span className="text-sm">{brightness}%</span>
                  </div>
                  <Progress value={brightness} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark Mode</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleButtonClick(e, () => setIsDarkMode(!isDarkMode))}
                  >
                    {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {systemActions.map((action, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded text-xs",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}
                    >
                      <div className="font-medium">{action.action}</div>
                      <div className="text-muted-foreground">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {systemActions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent actions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Commands Help */}
          <Card className={cn("mt-8", isDarkMode ? "bg-gray-800" : "bg-white")}>
            <CardHeader>
              <CardTitle>Voice Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Applications:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>"Open Files"</li>
                    <li>"Launch Music"</li>
                    <li>"Start Calendar"</li>
                  </ul>
                </div>
                <div>
                  <strong>System:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>"Increase volume"</li>
                    <li>"Set brightness to 50%"</li>
                    <li>"What time is it?"</li>
                  </ul>
                </div>
                <div>
                  <strong>Files:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>"Create new folder"</li>
                    <li>"Search for documents"</li>
                    <li>"Delete old files"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
