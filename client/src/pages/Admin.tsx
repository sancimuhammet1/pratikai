import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase";
import type { User } from "@shared/schema";

export default function Admin() {
  const { user, getAuthToken } = useAuth();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yetkiniz Yok</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-users"></i>
              <span>Kullanıcılar</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-comments"></i>
              <span>Sohbetler</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-chart-line"></i>
              <span>Analitikler</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-cog"></i>
              <span>Sistem Ayarları</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sistem Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Son güncelleme: 5 dakika önce</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Sistem Aktif</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-primary"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aktif Oturumlar</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeSessions || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bolt text-green-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Mesaj</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.dailyMessages || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-comment-dots text-purple-500"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">API Kullanımı</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.apiUsage || "87%"}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-server text-yellow-500"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Kayıt Olan Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {users.slice(0, 10).map((singleUser) => {
                      const initials = singleUser.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <div key={singleUser.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {initials}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{singleUser.name}</p>
                              <p className="text-xs text-gray-500">{singleUser.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {singleUser.isAdmin && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(singleUser.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sistem Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">API Server</span>
                    </div>
                    <span className="text-sm text-green-600">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Veritabanı</span>
                    </div>
                    <span className="text-sm text-green-600">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">AI Service</span>
                    </div>
                    <span className="text-sm text-yellow-600">Yoğun</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Firebase Auth</span>
                    </div>
                    <span className="text-sm text-green-600">Aktif</span>
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
