import React from 'react';
import { Refrigerator, Users, Calendar, AlertCircle } from 'lucide-react';

function Dashboard() {
  const stats = [
    {
      title: 'ผู้ใช้งานทั้งหมด',
      value: '124',
      icon: Users,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'การจองวันนี้',
      value: '23',
      icon: Calendar,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'ตู้เย็นทั้งหมด',
      value: '8',
      icon: Refrigerator,
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'รอการอนุมัติ',
      value: '7',
      icon: AlertCircle,
      change: '+3',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-600">ยินดีต้อนรับสู่ระบบจองตู้เย็น ภาพรวมของระบบในวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon size={24} className="text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { icon: Calendar, text: 'สมชาย ใจดี ทำการจองตู้เย็น A', time: '5 นาทีที่แล้ว' },
              { icon: AlertCircle, text: 'การจองของสมหญิง รักงาน รอการอนุมัติ', time: '15 นาทีที่แล้ว' },
              { icon: Refrigerator, text: 'เพิ่มตู้เย็นใหม่ "ตู้เย็น D" ชั้น 4', time: '1 ชั่วโมงที่แล้ว' },
              { icon: Users, text: 'ผู้ใช้ใหม่ลงทะเบียน: นายใจดี มีความสุข', time: '2 ชั่วโมงที่แล้ว' },
              { icon: Calendar, text: 'การจองของพนักงาน EMP003 หมดอายุ', time: '3 ชั่วโมงที่แล้ว' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

