import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

function NotificationManagement() {
  const [notifications] = useState([
    {
      id: 1,
      user: {
        name: 'สมชาย ใจดี',
        employee_code: 'EMP001',
        line_user_id: 'U123456789'
      },
      booking_id: 1,
      booking_info: {
        fridge: 'ตู้เย็น A',
        slot: 'ชั้น 1 - ช่อง 3',
        date: '2024-01-20'
      },
      message: 'การจองของคุณได้รับการอนุมัติแล้ว กรุณานำอาหารมาเก็บในตู้เย็น A ชั้น 1 ช่อง 3 ภายในวันที่ 20 มกราคม 2567',
      status: 'success',
      sent_at: '2024-01-19 15:30:00',
      message_type: 'booking_approved'
    },
    {
      id: 2,
      user: {
        name: 'สมหญิง รักงาน',
        employee_code: 'EMP002',
        line_user_id: 'U987654321'
      },
      booking_id: 2,
      booking_info: {
        fridge: 'ตู้เย็น B',
        slot: 'ชั้น 2 - ช่อง 1',
        date: '2024-01-21'
      },
      message: 'คุณมีการจองใหม่รอการอนุมัติ ตู้เย็น B ชั้น 2 ช่อง 1 วันที่ 21 มกราคม 2567',
      status: 'success',
      sent_at: '2024-01-20 14:20:00',
      message_type: 'booking_booked'
    },
    {
      id: 3,
      user: {
        name: 'นางสาวใจดี มีความสุข',
        employee_code: 'EMP004',
        line_user_id: 'U555666777'
      },
      booking_id: 3,
      booking_info: {
        fridge: 'ตู้เย็น A',
        slot: 'ชั้น 2 - ช่อง 5',
        date: '2024-01-19'
      },
      message: 'การจองของคุณหมดอายุแล้ว กรุณานำอาหารออกจากตู้เย็น A ชั้น 2 ช่อง 5',
      status: 'failed',
      sent_at: '2024-01-19 18:30:00',
      message_type: 'booking_expired'
    },
    {
      id: 4,
      user: {
        name: 'สมชาย ใจดี',
        employee_code: 'EMP001',
        line_user_id: 'U123456789'
      },
      booking_id: 1,
      booking_info: {
        fridge: 'ตู้เย็น A',
        slot: 'ชั้น 1 - ช่อง 3',
        date: '2024-01-20'
      },
      message: 'เตือน: การจองของคุณจะหมดอายุในอีก 2 ชั่วโมง กรุณานำอาหารออกจากตู้เย็น',
      status: 'success',
      sent_at: '2024-01-20 16:00:00',
      message_type: 'booking_reminder'
    },
    {
      id: 5,
      user: {
        name: 'พนักงานทำความสะอาด',
        employee_code: 'EMP003',
        line_user_id: null
      },
      booking_id: null,
      booking_info: null,
      message: 'มีอาหารที่หมดอายุในตู้เย็น A ชั้น 2 ช่อง 5 กรุณาตรวจสอบและทำความสะอาด',
      status: 'failed',
      sent_at: '2024-01-20 08:00:00',
      message_type: 'cleaning_alert'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />ส่งสำเร็จ</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle size={12} className="mr-1" />ส่งไม่สำเร็จ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMessageTypeBadge = (type) => {
    switch (type) {
      case 'booking_approved':
        return <Badge variant="outline" className="text-green-600">อนุมัติการจอง</Badge>;
      case 'booking_pending':
        return <Badge variant="outline" className="text-yellow-600">รอการอนุมัติ</Badge>;
      case 'booking_expired':
        return <Badge variant="outline" className="text-red-600">หมดอายุ</Badge>;
      case 'booking_reminder':
        return <Badge variant="outline" className="text-blue-600">เตือนความจำ</Badge>;
      case 'cleaning_alert':
        return <Badge variant="outline" className="text-purple-600">แจ้งทำความสะอาด</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getNotificationStats = () => {
    return {
      total: notifications.length,
      success: notifications.filter(n => n.status === 'success').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      today: notifications.filter(n => {
        const today = new Date().toISOString().split('T')[0];
        return n.sent_at.startsWith(today.replace(/-/g, '-'));
      }).length
    };
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.message_type === typeFilter;
    const matchesSearch = notification.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = getNotificationStats();

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('th-TH'),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการการแจ้งเตือน</h1>
          <p className="text-gray-600">ติดตามและจัดการการส่งข้อความแจ้งเตือนผ่าน LINE</p>
        </div>
        <Button className="flex items-center gap-2">
          <Send size={16} />
          ส่งข้อความใหม่
        </Button>
      </div>

      {/* สถิติการแจ้งเตือน */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ข้อความทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ส่งสำเร็จ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ส่งไม่สำเร็จ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">วันนี้</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ตัวกรองและค้นหา */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาชื่อผู้รับ, รหัสพนักงาน หรือข้อความ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="success">ส่งสำเร็จ</SelectItem>
                  <SelectItem value="failed">ส่งไม่สำเร็จ</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                  <SelectItem value="booking_approved">อนุมัติการจอง</SelectItem>
                  <SelectItem value="booking_booked">รอการอนุมัติ</SelectItem>
                  <SelectItem value="booking_expired">หมดอายุ</SelectItem>
                  <SelectItem value="booking_reminder">เตือนความจำ</SelectItem>
                  <SelectItem value="cleaning_alert">แจ้งทำความสะอาด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ตารางการแจ้งเตือน */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการแจ้งเตือน ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้รับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ข้อความ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจองที่เกี่ยวข้อง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เวลาส่ง
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const sentDateTime = formatDateTime(notification.sent_at);
                  
                  return (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{notification.user.name}</div>
                            <div className="text-sm text-gray-500">{notification.user.employee_code}</div>
                            {notification.user.line_user_id ? (
                              <Badge variant="outline" className="text-green-600 text-xs mt-1">
                                LINE เชื่อมต่อ
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 text-xs mt-1">
                                ไม่มี LINE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={notification.message}>
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMessageTypeBadge(notification.message_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.booking_info ? (
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {notification.booking_info.fridge}
                            </div>
                            <div className="text-gray-500">{notification.booking_info.slot}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{sentDateTime.date}</div>
                          <div className="text-gray-500">{sentDateTime.time}</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationManagement;

