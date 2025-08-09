import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Lock, Mail, Phone, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  // identifier can be email OR mobile number
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    try {
      // Backend should accept "identifier" as email or phone
      // If your signIn currently expects "email", just pass identifier through.
      await signIn(identifier, password);
      toast({ title: 'Login successful!' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.message || 'Please check your credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (value: string, pwd = '123123') => {
    setIdentifier(value);
    setPassword(pwd);
  };

  const isEmailLike = identifier.includes('@');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Car className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">TripFlow Dashboard</CardTitle>
            <CardDescription>Sign in to manage your car travel platform</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Mobile Number</Label>
                <div className="relative">
                  {isEmailLike ? (
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  ) : (
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  )}
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@example.com or 9000000000"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.trim())}
                    className="pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Demo credential buttons */}
              <div className="text-center space-y-2">
                <div className="text-xs text-gray-500">Use demo credentials</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fillCredentials('91111111111')}
                    title="Admin"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Admin (Mobile)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fillCredentials('9000000000')}
                    title="Vendor"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Vendor (Mobile)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fillCredentials('9333333333')}
                    title="Driver"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Driver (Mobile)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fillCredentials('8000000002')}
                    title="Rider"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Rider (Mobile)
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
