import React, { useState } from "react";
import { Refrigerator, Users, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  const [filter, setFilter] = useState("monthly");

  // Stats mock
  const stats = [
    {
      title: "ผู้ใช้งานทั้งหมด",
      value: "124",
      icon: Users,
      change: "+5%",
      changeType: "positive",
    },
    {
      title: "การจองวันนี้",
      value: "23",
      icon: Calendar,
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "ตู้เย็นทั้งหมด",
      value: "8",
      icon: Refrigerator,
      change: "+1",
      changeType: "positive",
    },
  ];

  // Mock ข้อมูลการจอง
  const bookingData = {
    daily: [
      { label: "จ.", bookings: 5 },
      { label: "อ.", bookings: 8 },
      { label: "พ.", bookings: 6 },
      { label: "พฤ.", bookings: 10 },
      { label: "ศ.", bookings: 7 },
      { label: "ส.", bookings: 4 },
      { label: "อา.", bookings: 3 },
    ],
    monthly: [
      { label: "ม.ค.", bookings: 20 },
      { label: "ก.พ.", bookings: 35 },
      { label: "มี.ค.", bookings: 28 },
      { label: "เม.ย.", bookings: 45 },
      { label: "พ.ค.", bookings: 32 },
      { label: "มิ.ย.", bookings: 50 },
      { label: "ก.ค.", bookings: 42 },
      { label: "ส.ค.", bookings: 38 },
      { label: "ก.ย.", bookings: 55 },
      { label: "ต.ค.", bookings: 47 },
      { label: "พ.ย.", bookings: 60 },
      { label: "ธ.ค.", bookings: 72 },
    ],
    yearly: [
      { label: "2021", bookings: 420 },
      { label: "2022", bookings: 510 },
      { label: "2023", bookings: 640 },
      { label: "2024", bookings: 720 },
    ],
  };

  // Mock ข้อมูลการใช้งานตู้เย็น
  const fridgeUsage = [
    { name: "ตู้เย็น A", value: 40 },
    { name: "ตู้เย็น B", value: 25 },
    { name: "ตู้เย็น C", value: 35 },
      { name: "ตู้เย็น D", value: 35 },
        { name: "ตู้เย็น E", value: 3 },
  ];

  const COLORS = ["#FC7D9A", "#f86541ff", "#ff9c1bff", "#f8d90fff", "#A3E635"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-600">
          ภาพรวมของระบบจองพื้นที่ในตู้เย็น
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change} จากเดือนที่แล้ว
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

      {/* Chart Section (70 / 30) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Bar Chart - 70% */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-7">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              จำนวนการจอง ({filter})
            </h2>
            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="daily">รายวัน</option>
              <option value="monthly">รายเดือน</option>
              <option value="yearly">รายปี</option>
            </select>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData[filter]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#364672ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - 30% */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-3">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              TOP 5 ตู้เย็นที่ถูกจองมากที่สุด
            </h2>
          </div>
          <div className="p-6 flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fridgeUsage}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {fridgeUsage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
