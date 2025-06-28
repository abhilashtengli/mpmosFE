"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Sprout,
  Building,
  Package,
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ImageIcon,
  Plus,
  Check,
  X,
  UserPlus,
  LogOut
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useActivityCategoriesStore } from "@/stores/useActivityCategoryStore";

// Default activity categories
const defaultActivityCategories = [
  { name: "Training", href: "/admin/trainings", icon: GraduationCap },
  {
    name: "Awareness Programs",
    href: "/admin/awarness_programs",
    icon: Users
  },
  { name: "FLD", href: "/admin/fld", icon: Sprout },
  {
    name: "Infrastructure Dev",
    href: "/admin/infrastructure_development",
    icon: Building
  },
  {
    name: "Input Distribution",
    href: "/admin/input_distribution",
    icon: Package
  }
];

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FileText },
  {
    name: "Activities",
    icon: BarChart3,
    children: [] // Will be populated dynamically
  },
  {
    name: "Content",
    icon: BookOpen,
    children: [
      {
        name: "Upcoming Events",
        href: "/admin/upcoming_events",
        icon: Calendar
      },
      { name: "Publications", href: "/admin/publications", icon: BookOpen },
      { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      {
        name: "Project Details",
        href: "/admin/project_details",
        icon: FileText
      }
    ]
  },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Activities",
    "Content"
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();

  // Zustand store
  const { navItems, isLoading, fetchCategories, createCategory, clearError } =
    useActivityCategoriesStore();

  useEffect(() => {
    if (user?.role) {
      fetchCategories(user.role);
    }
  }, [user?.role, fetchCategories]);

  // Combine default categories with fetched ones
  const allActivityCategories = [...defaultActivityCategories, ...navItems];

  // Update navigation with current activity categories
  const updatedNavigation = navigation.map((item) => {
    if (item.name === "Activities") {
      return {
        ...item,
        children: allActivityCategories
      };
    }
    return item;
  });

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    const capitalizedName = newCategoryName
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const success = await createCategory(capitalizedName);

    if (success) {
      setNewCategoryName("");
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCategoryName("");
    setShowAddForm(false);
    clearError();
  };

  const handleAddAdmin = () => {
    setIsDropdownOpen(false);
    navigate("/admin/signup");
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen overflow-y-scroll flex flex-col transition-all duration-300 custom-scrollbar",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
                  Millet-PMoS
                </h2>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {updatedNavigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start tracking-wide  text-left font-normal cursor-pointer",
                    collapsed && "justify-center"
                  )}
                  onClick={() => !collapsed && toggleExpanded(item.name)}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.name) && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </Button>
                {!collapsed && expandedItems.includes(item.name) && (
                  <div className="ml-4 mt-2 space-y-1 ">
                    {item.children.map((child) => (
                      <Link key={child.name} to={child.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-start text-left tracking-wide   w-full font-normal cursor-pointer",
                            pathname === child.href &&
                              "bg-green-50 text-green-700"
                          )}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.name}
                        </Button>
                      </Link>
                    ))}
                    {/* Add New Category Section - Only for Activities */}
                    {item.name === "Activities" && (
                      <div className="mt-2">
                        {!showAddForm ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full tracking-wide justify-start text-left font-normal cursor-pointer text-green-600 hover:bg-green-50"
                            onClick={() => setShowAddForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Category
                          </Button>
                        ) : (
                          <div className="space-y-2 p-2 bg-gray-50 rounded-md">
                            <Input
                              placeholder="Category name"
                              value={newCategoryName}
                              onChange={(e) =>
                                setNewCategoryName(e.target.value)
                              }
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddCategory();
                                if (e.key === "Escape") handleCancelAdd();
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={handleAddCategory}
                                className="h-6 px-2 text-xs"
                                disabled={!newCategoryName.trim() || isLoading}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelAdd}
                                className="h-6 px-2 text-xs bg-transparent"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start tracking-wide text-left font-normal",
                    pathname === item.href &&
                      "bg-green-50 text-green-700 cursor-pointer",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && item.name}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer with Dropdown */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div ref={dropdownRef} className="relative">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center pb-0.5 justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <div className="text-[12px] border w-fit px-1 rounded-sm pb-0.5">
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 transition-transform" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-48 mb-2"
                sideOffset={8}
              >
                <DropdownMenuItem
                  onClick={handleAddAdmin}
                  className="cursor-pointer flex items-center space-x-3 px-4 py-3"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Add Admin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center space-x-3 px-4 py-3 text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
