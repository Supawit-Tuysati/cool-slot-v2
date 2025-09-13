import React, { useState } from "react";
import { Bell, Search, User, ChevronDown, LogOut, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setAlertDropdownOpen(false);
  };

  const toggleAlertDropdown = () => {
    setAlertDropdownOpen(!alertDropdownOpen);
    setProfileDropdownOpen(false);
  };

  // Mock alert data
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "การจองใกล้หมดเวลา",
      message: "การจองตู้เย็น A-01 จะหมดเวลาในอีก 30 นาที",
      time: "5 นาทีที่แล้ว",
      read: false,
    },
    {
      id: 2,
      type: "success",
      title: "การจองสำเร็จ",
      message: "คุณได้จองตู้เย็น B-03 เรียบร้อยแล้ว",
      time: "1 ชั่วโมงที่แล้ว",
      read: true,
    },
    {
      id: 3,
      type: "info",
      title: "ระบบปรับปรุง",
      message: "ระบบจะปิดปรับปรุงในวันอาทิตย์ เวลา 02:00-04:00 น.",
      time: "3 ชั่วโมงที่แล้ว",
      read: true,
    },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "success":
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-end">
        {/* Right side - Actions */}
        <div className="flex items-end space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={toggleAlertDropdown}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>

            {/* Alert Dropdown */}
            {alertDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">การแจ้งเตือน</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Alert List */}
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-50 last:border-b-0 ${
                            !alert.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                                {!alert.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">ไม่มีการแจ้งเตือน</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {alerts.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                        ดูการแจ้งเตือนทั้งหมด
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={toggleProfileDropdown}
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || "name"}</p>
                <p className="text-xs text-gray-500">{user?.role.name || "role name"}</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-foreground" />
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{'ผู้ใช้'}</p>
                  <p className="text-xs text-gray-500">{'user@example.com'}</p>
                </div> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-3" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(profileDropdownOpen || alertDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileDropdownOpen(false);
            setAlertDropdownOpen(false);
          }}
        />
      )}
    </header>
  );
}

export default Header;
