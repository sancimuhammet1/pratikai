import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { handleRedirect } from "@/lib/firebase";
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  useEffect(() => {
    // Handle Firebase redirect result on app load
    handleRedirect().catch(console.error);
  }, []);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
