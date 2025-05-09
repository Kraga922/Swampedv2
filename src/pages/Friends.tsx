
import { useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, UserCheck, Search } from "lucide-react";

const Friends = () => {
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for friends and requests
  const [friends, setFriends] = useState([
    { id: "f1", name: "Alex Johnson", username: "alexj", avatar: null },
    { id: "f2", name: "Sarah Williams", username: "sarahw", avatar: null },
    { id: "f3", name: "Mike Chen", username: "mikec", avatar: null },
  ]);
  
  const [friendRequests, setFriendRequests] = useState([
    { id: "fr1", name: "Taylor Smith", username: "taylors", avatar: null },
    { id: "fr2", name: "Jordan Lee", username: "jordanl", avatar: null },
  ]);
  
  // Mock search results
  const searchResults = !searchQuery ? [] : [
    { id: "sr1", name: "Chris Davis", username: "chrisd", avatar: null },
    { id: "sr2", name: "Pat Wilson", username: "patw", avatar: null },
  ];
  
  const handleAcceptRequest = (id: string) => {
    const request = friendRequests.find(req => req.id === id);
    if (request) {
      setFriends([...friends, request]);
      setFriendRequests(friendRequests.filter(req => req.id !== id));
    }
  };
  
  const handleRejectRequest = (id: string) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
  };
  
  const handleAddFriend = (id: string) => {
    // In a real app, this would send a friend request
    alert(`Friend request sent to ${searchResults.find(user => user.id === id)?.name}`);
  };
  
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
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          {searchQuery && (
            <CardContent>
              {searchResults.length > 0 ? (
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
                              {result.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-gray-500">@{result.username}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAddFriend(result.id)}
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
        
        {friendRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Friend Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {friendRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      {request.avatar ? (
                        <AvatarImage src={request.avatar} alt={request.name} />
                      ) : (
                        <AvatarFallback className="bg-app-purple text-white">
                          {request.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-gray-500">@{request.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptRequest(request.id)}
                      size="sm" 
                      className="bg-app-purple hover:bg-app-dark-blue"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      onClick={() => handleRejectRequest(request.id)}
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
