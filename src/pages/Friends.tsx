
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, UserCheck, Search, Loader2 } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useToast } from "@/components/ui/use-toast";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { 
    friends, 
    friendRequests, 
    loading,
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    searchUsers 
  } = useFriends();
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string, userName: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      toast({
        title: 'Friend request sent',
        description: `Friend request sent to ${userName}`,
      });
    }
  };

  const incomingRequests = friendRequests.filter(req => req.receiver_id !== req.sender_id);

  if (loading) {
    return (
      <Layout title="Friends">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Friends">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                placeholder="Search for users by name or username"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          {searchQuery && (
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Search Results</h3>
                  {searchResults.map(result => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          {result.avatar ? (
                            <AvatarImage src={result.avatar} alt={result.name} />
                          ) : (
                            <AvatarFallback className="bg-app-purple text-white">
                              {(result.name || result.username || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{result.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">@{result.username || 'unknown'}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSendFriendRequest(result.id, result.name)}
                        size="sm" 
                        className="bg-app-purple hover:bg-app-dark-blue"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No results found</p>
              )}
            </CardContent>
          )}
        </Card>
        
        {incomingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Friend Requests ({incomingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      {request.sender.avatar ? (
                        <AvatarImage src={request.sender.avatar} alt={request.sender.name} />
                      ) : (
                        <AvatarFallback className="bg-app-purple text-white">
                          {request.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{request.sender.name}</p>
                      <p className="text-sm text-gray-500">@{request.sender.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                      size="sm" 
                      className="bg-app-purple hover:bg-app-dark-blue"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      onClick={() => rejectFriendRequest(request.id)}
                      size="sm" 
                      variant="outline"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2" />
              Your Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {friends.length > 0 ? (
              friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      {friend.avatar ? (
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                      ) : (
                        <AvatarFallback className="bg-app-purple text-white">
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-gray-500">@{friend.username}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <User className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium mb-1">No friends yet</h3>
                <p className="text-sm text-gray-500">Search for users to add them as friends</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Friends;
