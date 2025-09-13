import { useState } from "react";
// import axios from "axios"; // Removed axios
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2, Layers, Grid3X3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify"; // Removed toast

function AddFridgeForm() {
  const navigate = useNavigate();
  // const API_HOST = import.meta.env.VITE_API_HOST; // Removed backend related variables
  // const API_PORT = import.meta.env.VITE_API_PORT;
  // const BASE_URL = `${API_HOST}:${API_PORT}`;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });

  const [shelves, setShelves] = useState([
    {
      id: 1,
      shelf_number: 1,
      shelf_name: "ชั้นที่ 1",
      slots: [{ id: 1, slot_number: 1 }],
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    const newShelfNumber = shelves.length > 0 ? Math.max(...shelves.map((s) => s.shelf_number)) + 1 : 1;
    const newShelf = {
      id: Date.now(),
      shelf_number: newShelfNumber,
      shelf_name: `ชั้นที่ ${newShelfNumber}`,
      slots: [{ id: Date.now() + 1, slot_number: 1 }],
    };
    setShelves((prev) => [...prev, newShelf]);
  };

  const removeShelf = (shelfId) => {
    setShelves((prev) => prev.filter((shelf) => shelf.id !== shelfId));
  };

  const addSlot = (shelfId) => {
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id === shelfId) {
          const newSlotNumber = shelf.slots.length > 0 ? Math.max(...shelf.slots.map((s) => s.slot_number)) + 1 : 1;
          return {
            ...shelf,
            slots: [...shelf.slots, { id: Date.now(), slot_number: newSlotNumber }],
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

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const submitData = {
        ...formData,
        shelves: shelves.map((shelf) => ({
          shelf_number: shelf.shelf_number,
          shelf_name: shelf.shelf_name,
          slots: shelf.slots.map((slot) => ({
            slot_number: slot.slot_number,
          })),
        })),
      };

      console.log("Simulating fridge creation:", submitData);
      // toast.success("เพิ่มตู้เย็นสำเร็จ (จำลอง)"); // Replaced toast with console.log
      console.log("เพิ่มตู้เย็นสำเร็จ (จำลอง)");
      navigate("/fridge-management");
    } catch (error) {
      console.error("Error simulating form submission:", error);
      // toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง (จำลอง)"); // Replaced toast with console.error
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSlots = () => {
    return shelves.reduce((total, shelf) => total + shelf.slots.length, 0);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">เพิ่มตู้เย็นใหม่</h1>
          <p className="text-gray-600">เพิ่มตู้เย็นใหม่พร้อมกำหนดชั้นและช่องเก็บของ</p>
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
              <p className="text-sm text-red-500">{errors.shelves}</p>
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
                    {shelves.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShelf(shelf.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
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
                      {shelf.slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlot(shelf.id, slot.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" onClick={() => navigate("/fridge-management")} variant="outline">
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังบันทึก...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} />
                เพิ่มตู้เย็น
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddFridgeForm;

