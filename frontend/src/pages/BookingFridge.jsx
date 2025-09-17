import React, { useState, useEffect } from "react";
import { Refrigerator, ArrowLeft, Plus, Edit, Trash2, MapPin, Grid3X3, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

function BookingFridge() {
  const navigate = useNavigate();

  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;
  const { token } = useAuth();

  const [fridges, setFridges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ดึงข้อมูลตู้เย็นทั้งหมด
  const fetchFridges = async () => {
    setTimeout(() => setIsLoading(false), 500);
    try {
      setIsLoading(true);

      const response = await axios.get(`${BASE_URL}/api/fridge`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log(response.data);

      const fridgeData = response.data.map((fridge) => {
        const totalShelves = fridge._count?.shelves || 0;
        const allSlots = fridge.shelves?.flatMap((shelf) => shelf.slots) || [];
        const totalSlots = allSlots.length;
        const availableSlots = allSlots.filter((slot) => slot.is_disabled === false).length;

        return {
          id: fridge.id,
          name: fridge.name,
          location: fridge.location,
          description: fridge.description,
          shelves: totalShelves,
          totalSlots,
          availableSlots,
          created_at: fridge.created_at,
        };
      });

      setFridges(fridgeData);
    } catch (error) {
      console.error("Error fetching fridges:", error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล";
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchFridges();
  }, []);

  const getUsagePercentage = (available, total) => {
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading && fridges.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold">เลือกตู้เย็น</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFridges} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* ข้อความเมื่อไม่มีข้อมูล */}
      {fridges.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Refrigerator size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีตู้เย็น</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นด้วยการเพิ่มตู้เย็นแรกของคุณ</p>
          </CardContent>
        </Card>
      )}

      {/* รายการตู้เย็น */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fridges.map((fridge) => {
          const usagePercentage = getUsagePercentage(fridge.availableSlots, fridge.totalSlots);

          return (
            <Card key={fridge.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Refrigerator size={20} className="text-blue-600" />
                    {fridge.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  {fridge.location}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{fridge.description || "ไม่มีรายละเอียด"}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>การใช้งาน</span>
                    <span>
                      {fridge.totalSlots - fridge.availableSlots}/{fridge.totalSlots} ช่อง
                    </span>
                  </div>
                  {fridge.totalSlots > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getUsageColor(usagePercentage)}`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{usagePercentage}% ใช้งาน</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500 italic">ยังไม่มีช่องเก็บของ</div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Badge variant="outline">{fridge.shelves} ชั้น</Badge>
                    <Badge variant="outline" className="text-green-600">
                      {fridge.availableSlots} ช่องว่าง
                    </Badge>
                  </div>
                  <Button
                    className=""
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/add-booking/${fridge.id}`)}
                  >
                    จอง
                  </Button>
                </div>

                {fridge.created_at && (
                  <div className="text-xs text-gray-400 pt-2 border-t">
                    สร้างเมื่อ: {new Date(fridge.created_at).toLocaleDateString("th-TH")}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default BookingFridge;
