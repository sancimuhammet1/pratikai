import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginWithGoogle, loginWithEmail, registerWithEmail, handleRedirect } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle } from "react-icons/fa";
import { Brain } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Handle redirect result on component mount
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        await handleRedirect();
      } catch (error) {
        console.error("Auth redirect error:", error);
      }
    };

    handleAuthRedirect();
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const profession = urlParams.get('profession');
      
      if (profession) {
        setLocation(`/chat?profession=${profession}`);
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, location, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      // Redirect is handled by the auth provider
    } catch (error) {
      toast({
        title: "Giriş başarısız",
        description: "Google ile giriş yapılırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen e-posta ve şifre alanlarını doldurun",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      
      toast({
        title: isLogin ? "Giriş başarılı" : "Kayıt başarılı",
        description: "PratikAI'ya hoş geldiniz!",
      });
    } catch (error: any) {
      toast({
        title: isLogin ? "Giriş başarısız" : "Kayıt başarısız",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={16} />
            </div>
            <span className="text-xl font-bold text-gray-900">PratikAI</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            PratikAI'ya {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </CardTitle>
          <p className="text-gray-600">
            {isLogin 
              ? "Hesabınızla giriş yapın veya yeni hesap oluşturun"
              : "Yeni hesap oluşturun ve AI asistanınızla tanışın"
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
            Google ile {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </Button>

          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="px-4 text-gray-500 text-sm">veya</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "İşleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
