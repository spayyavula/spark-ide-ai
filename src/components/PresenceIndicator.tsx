import { Users, Circle, MousePointer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PresenceUser {
  user_id: string;
  user_name: string;
  cursor_position?: { x: number; y: number };
  last_seen: string;
  is_active: boolean;
}

interface PresenceIndicatorProps {
  presenceUsers: PresenceUser[];
  isConnected: boolean;
  currentUserId: string;
}

const PresenceIndicator = ({ presenceUsers, isConnected, currentUserId }: PresenceIndicatorProps) => {
  const activeUsers = presenceUsers.filter(user => 
    user.is_active && user.user_id !== currentUserId
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="fixed top-4 right-4 z-50 min-w-[280px] shadow-elevation">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Live Collaboration
          </CardTitle>
          <div className="flex items-center gap-1">
            <Circle 
              className={`w-2 h-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} 
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Current User */}
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                You
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">You</span>
            <Badge variant="secondary" className="text-xs ml-auto">Owner</Badge>
          </div>

          {/* Active Collaborators */}
          {activeUsers.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Active Collaborators ({activeUsers.length})
              </p>
              {activeUsers.map((user) => (
                <div key={user.user_id} className="flex items-center gap-2 p-2 rounded-lg border">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className={`text-xs text-white ${getRandomColor(user.user_id)}`}>
                      {getInitials(user.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last seen: {new Date(user.last_seen).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    {user.cursor_position && (
                      <MousePointer className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active collaborators</p>
              <p className="text-xs text-muted-foreground">
                Invite team members to collaborate live
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PresenceIndicator;