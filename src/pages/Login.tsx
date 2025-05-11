
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, LogIn, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  // If user is already logged in, redirect to home
  if (session.user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, name);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gradient">SafeNight</h1>
          <p className="text-gray-600 mt-2">Track drinks, connect with friends, stay safe</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{isLogin ? "Login" : "Create Account"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="name" 
                      placeholder="Your full name" 
                      className="pl-10"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {isLogin && (
                <div className="text-right">
                  <a href="#" className="text-sm text-app-purple hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-app-purple hover:bg-app-dark-blue"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLogin ? "Login" : "Create Account"}
              </Button>
              
              <p className="mt-4 text-center text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="text-app-purple hover:underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up" : "Login"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
