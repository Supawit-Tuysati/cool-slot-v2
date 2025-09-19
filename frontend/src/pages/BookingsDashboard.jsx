import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios"; // Removed axios
import {
  AlertCircle,
  Edit,
  Clock,
  Eye,
  Package,
  User,
  XCircle,
  RefreshCw,
  Refrigerator,
  CheckCircle,
  Plus,
} from "lucide-react";
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
  const [clearCancelId, setClearCancelId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- helpers ---
  const getStatus = (endTime, bookingStatus) => {
    if (bookingStatus === "cleared") return "cleared";
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
      case "cleared":
        return "เคลียร์";
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
      const { data } = await axios.get(`${BASE_URL}/api/booking/listBookings`, {
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

                fridge_id: fridge.id,
                slot_id: slot.id,
                id: booking.id,
                title: fridge.name,
                user: booking.user?.name || "-",
                start_time: booking.start_time,
                end_time: booking.end_time,
                items: booking.items,
                originalStatus: booking.cancelled_at ? "cancelled" : booking.cleared_at ? "cleared" : "booked",
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

      processedBookings.sort((a, b) => b.id - a.id);

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
    const cleared = bookings.filter((b) => b.status === "cleared").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    return { total, booked, nearExpired, expired, cleared, cancelled };
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
      setCurrentPage(1);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, term]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // --- cancel ---
  const clearOrCancelBooking = async (id, slot_id, action) => {
    // console.log(id, "xxxxxx", slot_id);

    try {
      setClearCancelId(id);
      const submitData = {
        booking_id: id,
        slot_id: slot_id,
        action: action,
      };
      await axios.put(`${BASE_URL}/api/booking/clearOrCancelBookingFridge`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error simulating cancellation:", err);
      // toast.error("ยกเลิกการจองไม่สำเร็จ (จำลอง)"); // Removed toast
    } finally {
      setClearCancelId(null);
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
          <Button onClick={() => navigate("/booking-fridge")} className="flex items-center gap-2">
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
              <SelectItem value="cleared">เคลียร์</SelectItem>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตู้</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จอง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วัน—เวลาจอง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วัน—เวลาหมดอายุ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สิ่งของ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      ยังไม่มีรายการ
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((booking) => (
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
                            {booking.start_time ? (
                              <>
                                <div>{new Date(booking.start_time).toLocaleDateString("th-TH")}</div>
                                <div>
                                  {new Date(booking.start_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </>
                            ) : (
                              "-"
                            )}
                          </span>
                        </div>
                      </td>

                      {/* วัน—เวลาหมดอายุ */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {booking.end_time ? (
                              <>
                                <div>{new Date(booking.end_time).toLocaleDateString("th-TH")}</div>
                                <div>
                                  {new Date(booking.end_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </>
                            ) : (
                              "-"
                            )}
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
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      {/* รายละเอียด */}
                      <td className="px-6 py-4">
                        {booking.items && booking.items.length > 0 ? (
                          <div className="space-y-1">
                            {booking.items.map((item, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <span className="text-gray-900">{item.note ? ` ${item.note}` : "-"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      {/* สถานะ */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
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
                        </div>
                      </td>

                      {/* การจัดการ */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-1">
                          {/* แสดงปุ่มก็ต่อเมื่อ booking.status ไม่ใช่ cancelled หรือ expired */}
                          {booking.status !== "expired" && booking.status !== "cleared" && booking.status !== "cancelled" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/edit-booking/${booking.fridge_id}`, {
                                    state: { booking_id: booking.id },
                                  })
                                }
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={16} />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearOrCancelBooking(booking.id, booking.slot_id, "clear")}
                                disabled={clearCancelId === booking.id}
                                className="text-green-600 hover:text-green-900"
                              >
                                {clearCancelId === booking.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearOrCancelBooking(booking.id, booking.slot_id, "cancel")}
                                disabled={clearCancelId === booking.id}
                                className="text-red-600 hover:text-red-900"
                              >
                                {clearCancelId === booking.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <XCircle size={16} />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                ก่อนหน้า
              </Button>

              <span>
                หน้า {currentPage} / {totalPages || 1}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookingsDashboard;
