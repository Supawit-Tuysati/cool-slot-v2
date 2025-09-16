import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios"; // Removed axios
import { AlertCircle, Edit, Clock, Eye, Package, User, XCircle, RefreshCw, Refrigerator, CheckCircle, Plus } from "lucide-react";
// import { toast } from "react-toastify"; // Removed toast
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

function BookingsDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_HOST = import.meta.env.VITE_API_HOST; // Removed backend related variables
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // --- helpers ---
  const getStatus = (endTime, bookingStatus) => {
    if (bookingStatus === "cancelled") return "cancelled";
    if (!endTime) return bookingStatus || "booked";

    const now = new Date();
    const end = new Date(endTime);

    if (end < now) return "expired";
    if (end - now <= 3 * 60 * 60 * 1000) return "near-expired";
    return bookingStatus || "booked";
  };

  const getBadge = (status) => {
    switch (status) {
      case "booked":
        return "จองอยู่";
      case "near-expired":
        return "ใกล้หมดอายุ";
      case "expired":
        return "หมดอายุ";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // เปลี่ยน endpoint ให้ตรงกับข้อมูลที่แนบมา
      const { data } = await axios.get(`${BASE_URL}/api/booking/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ดึง bookings จากข้อมูล nested
      const bookings = [];
      data.forEach((fridge) => {
        fridge.shelves.forEach((shelf) => {
          shelf.slots.forEach((slot) => {
            slot.bookings.forEach((booking) => {
              bookings.push({
                ...booking,
                id: booking.id,
                title: `${fridge.name} / ${shelf.shelf_name} / ช่อง ${slot.slot_number}`,
                user: booking.user?.name || "-",
                start_time: booking.start_time,
                end_time: booking.end_time,
                items: booking.items,
                originalStatus: booking.cancelled_at ? "cancelled" : "booked",
              });
            });
          });
        });
      });

      const processedBookings = bookings.map((booking) => ({
        ...booking,
        date: booking.start_time,
        time:
          booking.start_time && booking.end_time
            ? `${new Date(booking.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(booking.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "-",
        status: getStatus(booking.end_time, booking.originalStatus),
      }));

      processedBookings.sort((a, b) => {
        if (!a.end_time && !b.end_time) return 0;
        if (!a.end_time) return 1;
        if (!b.end_time) return -1;
        return new Date(a.end_time) - new Date(b.end_time);
      });

      setBookings(processedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- stats/filter/search ---
  const stats = useMemo(() => {
    const total = bookings.length;
    const booked = bookings.filter((b) => ["booked", "near-expired"].includes(b.status)).length;
    const nearExpired = bookings.filter((b) => b.status === "near-expired").length;
    const expired = bookings.filter((b) => b.status === "expired").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    return { total, booked, nearExpired, expired, cancelled };
  }, [bookings]);

  const term = (searchTerm || "").toLowerCase();
  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesSearch =
        (booking.userName || "").toLowerCase().includes(term) ||
        (booking.fridgeName || "").toLowerCase().includes(term) ||
        (booking.shelfName || "").toLowerCase().includes(term) ||
        (booking.title || "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, term]);

  // --- cancel ---
  const cancelBooking = async (id) => {
    try {
      setCancellingId(id);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success
      console.log(`Booking ${id} cancelled successfully (simulated)!`);
      // toast.success("ยกเลิกการจองเรียบร้อย (จำลอง)"); // Removed toast
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled", originalStatus: "cancelled" } : b))
      );
    } catch (err) {
      console.error("Error simulating cancellation:", err);
      // toast.error("ยกเลิกการจองไม่สำเร็จ (จำลอง)"); // Removed toast
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การจองตู้เย็น</h1>
          <p className="text-gray-600">จัดการและติดตามการจองช่องเก็บของในตู้เย็น</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-booking")} className="flex items-center gap-2">
            <Plus size={16} />
            จองช่องใหม่
          </Button>
          <Button onClick={fetchBookings} disabled={isLoading} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* สถิติการจอง */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {/* การจองทั้งหมด */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การจองทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Refrigerator size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* จองอยู่ (booked + near-expired) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">จองอยู่</p>
                <p className="text-2xl font-bold text-gray-900">{stats.booked}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ใกล้หมดอายุ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ใกล้หมดอายุ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nearExpired}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* หมดอายุ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">หมดอายุ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Package size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ยกเลิก */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ยกเลิก</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-gray-200 rounded-lg">
                <XCircle size={24} className="text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter/Search */}
      <Card>
        <CardContent className="p-6 flex gap-4 flex-col sm:flex-row">
          <Input
            placeholder="ค้นหาชื่อผู้จอง หรือตู้เย็น/ชั้น..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="booked">จองอยู่</SelectItem>
              <SelectItem value="near-expired">ใกล้หมดอายุ</SelectItem>
              <SelectItem value="expired">หมดอายุ</SelectItem>
              <SelectItem value="cancelled">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การจองล่าสุด ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จอง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วัน—เวลาจอง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วัน—เวลาหมดอายุ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สิ่งของ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      ยังไม่มีรายการ
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : (
                  filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      {/* ตำแหน่ง */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Refrigerator size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{booking.title}</span>
                        </div>
                      </td>

                      {/* ผู้จอง */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{booking.user}</span>
                        </div>
                      </td>

                      {/* วัน—เวลาจอง */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {booking.start_time
                              ? `${new Date(booking.start_time).toLocaleDateString()} ${new Date(
                                  booking.start_time
                                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : "-"}
                          </span>
                        </div>
                      </td>

                      {/* วัน—เวลาหมดอายุ */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {booking.end_time
                              ? `${new Date(booking.end_time).toLocaleDateString()} ${new Date(
                                  booking.end_time
                                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : "-"}
                          </span>
                        </div>
                      </td>

                      {/* สิ่งของ */}
                      <td className="px-6 py-4">
                        {booking.items && booking.items.length > 0 ? (
                          <div className="space-y-1">
                            {booking.items.map((item, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <Package size={12} className="mr-1 text-gray-400" />
                                <span className="text-gray-900">
                                  {item.name} {item.quantity ? `(${item.quantity})` : ""}
                                  {item.note ? ` - ${item.note}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      {/* สถานะ */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === "near-expired"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "expired"
                              ? "bg-red-100 text-red-800"
                              : booking.status === "cancelled"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getBadge(booking.status)}
                        </span>
                      </td>

                      {/* การจัดการ */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </Button>
                          {booking.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="text-red-600 hover:text-red-900"
                            >
                              {cancellingId === booking.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <XCircle size={16} />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookingsDashboard;
