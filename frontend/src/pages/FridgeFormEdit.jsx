// EditFridgeForm.jsx - Edit only version
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Plus, Trash2, Layers, Grid3X3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

function EditFridgeForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // ดึง id จาก URL parameters
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });

  const [shelves, setShelves] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // โหลดข้อมูลตู้เย็น
  useEffect(() => {
    const loadFridgeData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/fridge/editFridge/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fridgeData = response.data;

        setFormData({
          name: fridgeData.name,
          location: fridgeData.location,
          description: fridgeData.description || "",
        });

        // แปลงข้อมูลชั้นและช่องให้เป็นรูปแบบที่ frontend ใช้
        if (fridgeData.shelves && fridgeData.shelves.length > 0) {
          const shelvesData = fridgeData.shelves.map((shelf) => ({
            id: shelf.id, // เก็บ ID จริงจากฐานข้อมูล
            shelf_number: shelf.shelf_number,
            shelf_name: shelf.shelf_name,
            slots: shelf.slots.map((slot) => ({
              id: slot.id, // เก็บ ID จริงจากฐานข้อมูล
              slot_number: slot.slot_number,
            })),
          }));
          setShelves(shelvesData);
        } else {
          // ถ้าไม่มีชั้น ให้สร้างชั้นเริ่มต้น
          setShelves([
            {
              id: `temp_${Date.now()}`, // ใช้ temporary ID
              shelf_number: 1,
              shelf_name: "ชั้นบน",
              slots: [{ id: `temp_${Date.now() + 1}`, slot_number: 1 }],
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading fridge data:", error);
        const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
        toast.error(errorMessage);

        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFridgeData();
  }, [id, BASE_URL, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleShelfNameChange = (shelfId, value) => {
    setShelves((prev) => prev.map((shelf) => (shelf.id === shelfId ? { ...shelf, shelf_name: value } : shelf)));
    if (errors[`shelf_name_${shelfId}`]) {
      setErrors((prev) => ({ ...prev, [`shelf_name_${shelfId}`]: "" }));
    }
  };

  const addShelf = () => {
    const newShelfNumber = Math.max(...shelves.map((s) => s.shelf_number)) + 1;
    const newShelf = {
      id: `temp_${Date.now()}`, // ใช้ string เพื่อแยกแยะจาก ID จริง
      shelf_number: newShelfNumber,
      shelf_name: `ชั้นที่ ${newShelfNumber}`,
      slots: [{ id: `temp_${Date.now() + 1}`, slot_number: 1 }],
    };
    setShelves((prev) => [...prev, newShelf]);
  };

  const removeShelf = (shelfId) => {
    if (shelves.length <= 1) {
      toast.warning("ต้องมีอย่างน้อย 1 ชั้น");
      return;
    }
    setShelves((prev) => prev.filter((shelf) => shelf.id !== shelfId));
  };

  const addSlot = (shelfId) => {
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id === shelfId) {
          const newSlotNumber = Math.max(...shelf.slots.map((s) => s.slot_number)) + 1;
          return {
            ...shelf,
            slots: [...shelf.slots, { id: `temp_${Date.now()}`, slot_number: newSlotNumber }],
          };
        }
        return shelf;
      })
    );
  };

  const removeSlot = (shelfId, slotId) => {
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id === shelfId) {
          if (shelf.slots.length <= 1) {
            toast.warning("แต่ละชั้นต้องมีอย่างน้อย 1 ช่อง");
            return shelf;
          }
          return {
            ...shelf,
            slots: shelf.slots.filter((slot) => slot.id !== slotId),
          };
        }
        return shelf;
      })
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณาระบุชื่อตู้เย็น";
    }

    if (!formData.location.trim()) {
      newErrors.location = "กรุณาระบุสถานที่ตั้ง";
    }

    if (shelves.length === 0) {
      newErrors.shelves = "ต้องมีอย่างน้อย 1 ชั้น";
    }

    shelves.forEach((shelf) => {
      // ตรวจสอบชื่อชั้น
      if (!shelf.shelf_name.trim()) {
        newErrors[`shelf_name_${shelf.id}`] = "กรุณาระบุชื่อชั้น";
      }

      if (shelf.slots.length === 0) {
        newErrors[`shelf_${shelf.id}`] = `ชั้นที่ ${shelf.shelf_number} ต้องมีอย่างน้อย 1 ช่อง`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const submitData = {
        ...formData,
        shelves: shelves.map((shelf) => ({
          // ส่ง ID เฉพาะที่เป็นตัวเลขจริง (จากฐานข้อมูล)
          ...(typeof shelf.id === "number" && { id: shelf.id }),
          shelf_number: shelf.shelf_number,
          shelf_name: shelf.shelf_name,
          slots: shelf.slots.map((slot) => ({
            // ส่ง ID เฉพาะที่เป็นตัวเลขจริง (จากฐานข้อมูล)
            ...(typeof slot.id === "number" && { id: slot.id }),
            slot_number: slot.slot_number,
          })),
        })),
      };

      console.log("Submitting update data:", submitData);

      await axios.put(`${BASE_URL}/api/fridge/updateFridge/${id}`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("แก้ไขตู้เย็นสำเร็จ!");
      // navigate("/fridge-management");
    } catch (error) {
      console.error("Error updating fridge:", error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไข กรุณาลองใหม่อีกครั้ง";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalSlots = () => {
    return shelves.reduce((total, shelf) => total + shelf.slots.length, 0);
  };

  if (isLoading) {
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/fridge-management")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขตู้เย็น</h1>
          <p className="text-gray-600">แก้ไขข้อมูลตู้เย็น ชั้น และช่องเก็บของ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อมูลพื้นฐานตู้เย็น */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อตู้เย็น *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="เช่น ตู้เย็น A"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">สถานที่ตั้ง *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="เช่น ชั้น 1 - ห้องพักพนักงาน"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับตู้เย็น (ถ้ามี)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* สรุปข้อมูล */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  <span className="text-sm font-medium">จำนวนชั้น: {shelves.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Grid3X3 size={16} className="text-green-600" />
                  <span className="text-sm font-medium">จำนวนช่องทั้งหมด: {getTotalSlots()}</span>
                </div>
              </div>
              <Button type="button" onClick={addShelf} variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                เพิ่มชั้น
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* จัดการชั้นและช่อง */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">จัดการชั้นและช่อง</h3>
            {errors.shelves && (
              <Alert className="border-red-500">
                <AlertDescription className="text-red-500">{errors.shelves}</AlertDescription>
              </Alert>
            )}
          </div>

          {shelves.map((shelf) => (
            <Card key={shelf.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-blue-600" />
                    <CardTitle className="text-base">ชั้นที่ {shelf.shelf_number}</CardTitle>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{shelf.slots.length} ช่อง</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addSlot(shelf.id)}>
                      <Plus size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShelf(shelf.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={shelves.length <= 1}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* ช่องใส่ชื่อชั้น */}
                <div className="mt-2 space-y-2">
                  <Input
                    id={`shelf_name_${shelf.id}`}
                    value={shelf.shelf_name}
                    onChange={(e) => handleShelfNameChange(shelf.id, e.target.value)}
                    placeholder="เช่น ชั้นบน, ชั้นกลาง, ชั้นล่าง"
                    className={errors[`shelf_name_${shelf.id}`] ? "border-red-500" : ""}
                  />
                  {errors[`shelf_name_${shelf.id}`] && (
                    <p className="text-sm text-red-500">{errors[`shelf_name_${shelf.id}`]}</p>
                  )}
                  {errors[`shelf_${shelf.id}`] && <p className="text-sm text-red-500">{errors[`shelf_${shelf.id}`]}</p>}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {shelf.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="relative group border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-700">ช่อง {slot.slot_number}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(shelf.id, slot.id)}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={shelf.slots.length <= 1}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" onClick={() => navigate("/fridge-management")} variant="outline" disabled={isSaving}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSaving} className="min-w-[120px]">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังบันทึก...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} />
                บันทึกการแก้ไข
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditFridgeForm;
