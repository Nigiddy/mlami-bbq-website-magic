
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservation from "./pages/Reservation";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/cart";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected Route Component with role-based access control
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireCook = false
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireCook?: boolean;
}) => {
  const { user, isLoading, isAdmin, isCook, roleChecked } = useAuth();
  const location = useLocation();

  // Wait for both authentication and role check to complete
  if (isLoading || !roleChecked) {
    console.log("Protected route is loading...");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-bbq-orange"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check - fix the logic to use OR correctly
  // If either admin access is required and user is not admin,
  // OR cook access is required and user is not cook, then redirect
  if ((requireAdmin && !isAdmin) && (requireCook && !isCook)) {
    console.log("User lacks required role, redirecting to home. isAdmin:", isAdmin, "isCook:", isCook);
    return <Navigate to="/" replace />;
  }

  console.log("Protected route rendering children, user:", user.email, "isAdmin:", isAdmin, "isCook:", isCook);
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/reservation" element={<Reservation />} />
    <Route path="/login" element={<Login />} />
    <Route 
      path="/admin" 
      element={
        <ProtectedRoute requireAdmin={true} requireCook={true}>
          <Admin />
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
