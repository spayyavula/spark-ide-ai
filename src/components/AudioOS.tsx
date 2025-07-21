import { useState, useEffect, useRef } from "react";
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
import { AudioRecorder, encodeAudioForAPI, playAudioData } from "@/utils/AudioRecorder";
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const connectToAudioOS = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const wsUrl = 'wss://jbfvlqpbqztnbtiqvmxd.supabase.co/functions/v1/realtime-audio-os';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to Audio OS');
        setIsConnected(true);
        toast({
          title: "Audio OS Connected",
          description: "ARIA is ready to assist you. Try saying 'Hello ARIA' to get started.",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received from Audio OS:', data);

        if (data.type === 'session.created') {
          console.log('Session created, starting audio recorder...');
          startAudioRecording();
        } else if (data.type === 'response.audio.delta') {
          // Play audio response
          setIsSpeaking(true);
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          if (audioContextRef.current) {
            await playAudioData(audioContextRef.current, bytes);
          }
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          setTranscript(data.transcript);
        } else if (data.type === 'response.function_call_arguments.done') {
          // Handle system actions
          const result = JSON.parse(data.arguments);
          handleSystemAction(result);
        } else if (data.type === 'error') {
          toast({
            title: "Audio OS Error",
            description: data.message,
            variant: "destructive"
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Audio OS",
          variant: "destructive"
        });
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from Audio OS');
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        stopAudioRecording();
      };

    } catch (error) {
      console.error('Error connecting to Audio OS:', error);
      toast({
        title: "Permission Denied",
        description: "Microphone access is required for Audio OS",
        variant: "destructive"
      });
    }
  };

  const startAudioRecording = async () => {
    try {
      audioRecorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && isListening) {
          const base64Audio = encodeAudioForAPI(audioData);
          const audioEvent = {
            type: 'input_audio_buffer.append',
            audio: base64Audio
          };
          wsRef.current.send(JSON.stringify(audioEvent));
        }
      });

      await audioRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start audio recording",
        variant: "destructive"
      });
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (!isConnected) {
      connectToAudioOS();
      return;
    }

    if (isListening) {
      audioRecorderRef.current?.pause();
      setIsListening(false);
    } else {
      audioRecorderRef.current?.resume();
      setIsListening(true);
    }
  };

  const handleSystemAction = (actionData: any) => {
    const action: SystemAction = {
      action: actionData.action,
      data: actionData.data,
      timestamp: Date.now()
    };

    setSystemActions(prev => [action, ...prev.slice(0, 9)]);

    // Execute the action based on type
    switch (actionData.action) {
      case 'open_app':
        openApplication(actionData.data.app);
        break;
      case 'adjust_settings':
        adjustSystemSetting(actionData.data.setting, actionData.data.value);
        break;
      case 'control_media':
        controlMedia(actionData.data.action);
        break;
      default:
        console.log('System action:', actionData);
    }
  };

  const openApplication = (appName: string) => {
    setApplications(prev => prev.map(app => {
      if (app.name.toLowerCase().includes(appName.toLowerCase()) || 
          app.id.toLowerCase().includes(appName.toLowerCase())) {
        return { ...app, isOpen: true, isActive: true };
      }
      return { ...app, isActive: false };
    }));
  };

  const adjustSystemSetting = (setting: string, value: string) => {
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

  const controlMedia = (action: string) => {
    // Mock media control
    console.log('Media control:', action);
    toast({
      title: "Media Control",
      description: `Media ${action} executed`,
    });
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopAudioRecording();
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    )}>
      {/* Desktop Wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 opacity-20"></div>
      
      {/* Status Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b backdrop-blur-sm",
        isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-200"
      )}>
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
            "mb-8 border-2 transition-colors",
            isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300",
            isListening && "border-blue-500 shadow-lg shadow-blue-500/20"
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
                  onClick={toggleListening}
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
                    onClick={disconnect}
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
                      onClick={() => openApplication(app.name)}
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
                    onClick={() => setIsDarkMode(!isDarkMode)}
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