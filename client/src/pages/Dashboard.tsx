import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase";
import type { UserStats } from "@shared/schema";

export default function Dashboard() {
  const { user, getAuthToken } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Dashboard Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">PratikAI</span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-primary rounded-lg">
              <i className="fas fa-chart-bar"></i>
              <span>Genel Bakış</span>
            </Link>
            <Link href="/chat" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-comments"></i>
              <span>Sohbetler</span>
            </Link>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-coins"></i>
              <span>Kredi Yönetimi</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-user-cog"></i>
              <span>Profil Ayarları</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-question-circle"></i>
              <span>Yardım</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-coins text-yellow-500 mr-2"></i>
                <span>{user.credits}</span> kredi kaldı
              </div>
              <Button variant="default" size="sm">
                Kredi Al
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Sohbet</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalChats || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-comments text-primary"></i>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-green-600 text-sm font-medium">+12%</span>
                  <span className="text-gray-500 text-sm ml-2">Bu ay</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kullanılan Kredi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.usedCredits || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-yellow-500"></i>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-red-600 text-sm font-medium">+8%</span>
                  <span className="text-gray-500 text-sm ml-2">Bu ay</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ortalama Oturum</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.avgSessionDuration || '24dk'}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-green-600"></i>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-green-600 text-sm font-medium">+5%</span>
                  <span className="text-gray-500 text-sm ml-2">Bu ay</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Memnuniyet</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.satisfaction || 4.8}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-purple-500"></i>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-green-600 text-sm font-medium">+0.2</span>
                  <span className="text-gray-500 text-sm ml-2">Bu ay</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity and Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Yeni sohbet başlattınız</p>
                      <p className="text-xs text-gray-500">2 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">100 kredi kullandınız</p>
                      <p className="text-xs text-gray-500">1 gün önce</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Profil bilgilerinizi güncellediniz</p>
                      <p className="text-xs text-gray-500">3 gün önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kredi Kullanımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Günlük Limit</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-20" />
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Haftalık Kullanım</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={40} className="w-20" />
                      <span className="text-sm text-gray-600">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Aylık Kullanım</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-20" />
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
