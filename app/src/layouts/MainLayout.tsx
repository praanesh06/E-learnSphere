import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Menu, X, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/courses', label: 'Courses' },
    { to: '/my-courses', label: 'My Learning', protected: true },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F6F8FC]/92 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#3B5BFF] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0B0E14]">LearnSphere</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                (!link.protected || isAuthenticated) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium transition-colors ${isActive(link.to)
                        ? 'text-[#3B5BFF]'
                        : 'text-[#6B7280] hover:text-[#0B0E14]'
                      }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {hasRole(['admin', 'instructor']) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="text-[#6B7280]"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden focus-visible:ring-offset-0">
                        <div className="w-full h-full bg-[#3B5BFF] flex items-center justify-center text-white font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      {hasRole(['admin', 'instructor']) && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map(link => (
                (!link.protected || isAuthenticated) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block py-2 text-sm font-medium">
                    Profile
                  </Link>
                  {hasRole(['admin', 'instructor']) && (
                    <Link to="/admin" className="block py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block py-2 text-sm font-medium text-red-600">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-sm font-medium">
                    Sign in
                  </Link>
                  <Link to="/register" className="block py-2 text-sm font-medium text-[#3B5BFF]">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E14] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#3B5BFF] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LearnSphere</span>
              </div>
              <p className="text-gray-400 text-sm">
                Learn what matters. Teach what you love.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link to="/my-courses" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/" className="hover:text-white">Blog</Link></li>
                <li><Link to="/" className="hover:text-white">Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">About</Link></li>
                <li><Link to="/" className="hover:text-white">Careers</Link></li>
                <li><Link to="/" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 LearnSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
