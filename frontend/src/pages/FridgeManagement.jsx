import React, { useState, useEffect } from "react";
import { Refrigerator, Plus, Edit, Trash2, MapPin, Grid3X3, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

function FridgeManagement() {
  const navigate = useNavigate();

  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;
  const { token } = useAuth();

  const [fridges, setFridges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFridge, setSelectedFridge] = useState(null);

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

  // ลบตู้เย็น - แก้ไขให้รับ fridge object แทน
  const handleDeleteFridge = (fridge) => {
    setSelectedFridge(fridge);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFridge = async () => {
    if (!selectedFridge) return;
    try {
      setDeleteLoading(selectedFridge.id);

      await axios.delete(`${BASE_URL}/api/fridge/deleteFridge/${selectedFridge.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("ลบตู้เย็นสำเร็จ");
      await fetchFridges();
    } catch (error) {
      console.error("Error deleting fridge:", error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการลบ";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
      setIsDeleteModalOpen(false);
      setSelectedFridge(null);
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

  // คำนวณสถิติรวม
  const totalFridges = fridges.length;
  const totalSlots = fridges.reduce((sum, fridge) => sum + fridge.totalSlots, 0);
  const totalAvailableSlots = fridges.reduce((sum, fridge) => sum + fridge.availableSlots, 0);
  const overallUsagePercentage =
    totalSlots > 0 ? Math.round(((totalSlots - totalAvailableSlots) / totalSlots) * 100) : 0;

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการตู้เย็น</h1>
          <p className="text-gray-600">จัดการตู้เย็น ชั้น และช่องเก็บของ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-fridge")} className="flex items-center gap-2">
            <Plus size={16} />
            เพิ่มตู้เย็นใหม่
          </Button>
          <Button variant="outline" onClick={fetchFridges} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ตู้เย็นทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{totalFridges}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Refrigerator size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ช่องทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Grid3X3 size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ช่องว่าง</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailableSlots}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Grid3X3 size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">อัตราการใช้งาน</p>
                <p className="text-2xl font-bold text-gray-900">{overallUsagePercentage}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Grid3X3 size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteFridge(fridge)} // ส่ง fridge object แทน
                      disabled={deleteLoading === fridge.id}
                      title="ลบ"
                    >
                      {deleteLoading === fridge.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
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
                  <Button variant="outline" size="sm" onClick={() => navigate(`/edit-fridge/${fridge.id}`)}>
                    แก้ไขตู้เย็น
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedFridge && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-red-600">ยืนยันการลบ</h2>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการลบตู้เย็น <strong>{selectedFridge.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteFridge}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FridgeManagement;
