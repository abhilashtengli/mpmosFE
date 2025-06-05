import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ImageIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    name: "Activities",
    icon: BarChart3,
    children: [
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
    ]
  },
  { name: "Projects", href: "/admin/projects", icon: FileText },
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
      { name: "Project Details", href: "/admin/project_details", icon: FileText }
    ]
  },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 }
  //   { name: "Settings", href: "/settings", icon: Settings }
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Activities"]);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Millet Project mos
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
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal cursor-pointer",
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
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.name} to={child.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer",
                            pathname === child.href &&
                              "bg-green-50 text-green-700"
                          )}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Admin Director
              </p>
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
