import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Calendar, Refrigerator, Users, Bell, Building, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      label: "เมนูหลัก",
      isLabel: true,
      roles: ["admin", "user", "cleaner"],
    },
    {
      path: "/dashboard",
      icon: Home,
      title: "แดชบอร์ด",
      roles: ["admin", "user", "cleaner"],
    },
    {
      path: "/bookings",
      icon: Calendar,
      title: "การจองของฉัน",
      roles: ["admin", "user", "cleaner"],
    },
    {
      label: "จัดการระบบ",
      isLabel: true,
      roles: ["admin", "cleaner"],
    },
    {
      path: "/fridge-management",
      icon: Refrigerator,
      title: "จัดการตู้เย็น",
      roles: ["admin"],
    },
    {
      path: "/booking-management",
      icon: Calendar,
      title: "จัดการการจอง",
      roles: ["admin", "cleaner"],
    },
    {
      path: "/departments",
      icon: Building,
      title: "จัดการแผนก",
      roles: ["admin"],
    },
    {
      path: "/user-management",
      icon: Users,
      title: "จัดการผู้ใช้งาน",
      roles: ["admin"],
    },
    {
      path: "/notification-management",
      icon: Bell,
      title: "จัดการการแจ้งเตือน",
      roles: ["admin", "cleaner"],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {!mobileOpen && (
        <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-lg rounded-lg" onClick={toggleMobile}>
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={toggleMobile} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative
          top-0 left-0 h-full
          bg-sidebar border-r border-sidebar-border
          transition-all duration-200 ease-in-out
          z-40
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {collapsed ? (
              <button
                className="w-full flex justify-center p-1 hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={toggleSidebar}
                title="Expand Sidebar"
              >
                <ChevronRight size={20} className="text-sidebar-foreground" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="w-8 h-8 ml-5 rounded-lg flex items-center justify-center">
                      <img src="/image/logo-icon.png" className="logo-icon" alt="logo icon" />
                    </div>
                    <span className="ml-3 text-lg font-semibold text-sidebar-foreground">COOL SLOT</span>
                  </div>

                  {/* Mobile Close */}
                  {mobileOpen && (
                    <button
                      className="lg:hidden p-1 hover:bg-sidebar-accent rounded-md transition-colors"
                      onClick={toggleMobile}
                      title="Close Menu"
                    >
                      <X size={20} className="text-sidebar-foreground" />
                    </button>
                  )}

                  {/* Desktop Close */}
                  {!collapsed && (
                    <button
                      className="hidden lg:block p-1 hover:bg-sidebar-accent rounded-md transition-colors"
                      onClick={toggleSidebar}
                      title="Close Sidebar"
                    >
                      <X size={20} className="text-sidebar-foreground" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {menuItems
                .filter((item) => !item.roles || item.roles.includes(user?.role.name))
                .map((item, index) => {
                  if (item.isLabel) {
                    return (
                      <div
                        key={index}
                        className={`
                          px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider
                          ${collapsed ? "text-center" : ""}
                        `}
                      >
                        {collapsed ? "•••" : item.label}
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 rounded-lg
                        text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        transition-all duration-200
                        group
                        ${collapsed ? "justify-center" : ""}
                      `}
                      onClick={() => setMobileOpen(false)}
                    >
                    <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}

                      {/* Tooltip */}
                      {collapsed && (
                        <div
                          className="
                            absolute left-full ml-2 px-2 py-1 
                            bg-gray-900 text-white text-sm rounded-md
                            opacity-0 group-hover:opacity-100
                            pointer-events-none transition-opacity duration-200
                            whitespace-nowrap z-50
                          "
                        >
                          {item.title}
                        </div>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Users size={16} className="text-gray-600" />
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">{user?.email || "email"}</p>
                  <p className="text-xs text-sidebar-foreground/60">{user?.department?.name || "department name"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
