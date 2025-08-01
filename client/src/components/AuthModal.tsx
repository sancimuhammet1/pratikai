import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle } from "react-icons/fa";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            PratikAI'ya {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {isLogin 
              ? "Hesabınızla giriş yapın veya yeni hesap oluşturun"
              : "Yeni hesap oluşturun ve AI asistanınızla tanışın"
            }
          </p>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
