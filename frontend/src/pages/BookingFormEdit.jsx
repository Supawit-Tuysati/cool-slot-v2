import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Package, Plus, Trash2, Save, Refrigerator, Grid3X3, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ฟอร์มจองช่องเก็บของในตู้เย็น
function BookingFormEdit() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { fridge_id } = useParams();
  const location = useLocation();
  const booking_id = location.state?.booking_id;
  console.log(fridge_id, booking_id);

  // กำหนด URL สำหรับเรียก API
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;

  // สเตทสำหรับข้อมูลต่างๆ
  const [fridges, setFridges] = useState([]); // รายการตู้เย็น
  const [selectedFridge, setSelectedFridge] = useState(null); // ตู้เย็นที่เลือก
  const [selectedSlot, setSelectedSlot] = useState(null); // ช่องที่เลือก
  const [bookingData, setBookingData] = useState({
    start_time: "",
    end_time: "",
    note: "",
  }); // ข้อมูลการจอง
  const [items, setItems] = useState([{ id: 1, name: "", quantity: 1, note: "" }]); // รายการสิ่งของ
  const [errors, setErrors] = useState({}); // ข้อผิดพลาด
  const [isLoading, setIsLoading] = useState(false); // สถานะโหลด

  // โหลดข้อมูลตู้เย็นจาก API
  const loadFridges = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/booking/getDataBooking/${fridge_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFridges(res.data);

      // ✅ หา booking ที่เรากำลังแก้ไข
      const fridge = res.data[0];
      let foundBooking = null;
      let foundFridge = null;
      let foundSlot = null;

      fridge.shelves.forEach((shelf) => {
        shelf.slots.forEach((slot) => {
          slot.bookings.forEach((booking) => {
            if (booking.id === booking_id) {
              foundBooking = booking;
              foundFridge = fridge;
              foundSlot = { ...slot, shelf_number: shelf.shelf_number };
            }
          });
        });
      });

      if (foundBooking) {
        // ✅ set state เพื่อโชว์ฟอร์มอัตโนมัติ
        setSelectedFridge(foundFridge);
        setSelectedSlot(foundSlot);
        setBookingData({
          start_time: formatDateForInput(foundBooking.start_time),
          end_time: formatDateForInput(foundBooking.end_time),
          note: foundBooking.note || "",
        });
        setItems(
          foundBooking.items.length > 0
            ? foundBooking.items.map((it) => ({
                id: it.id,
                name: it.name,
                quantity: it.quantity,
                note: it.note || "",
              }))
            : [{ id: 1, name: "", quantity: 1, note: "" }]
        );
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลตู้เย็นได้");
    }
  };

  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const pad = (n) => n.toString().padStart(2, "0");

    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());

    // datetime-local ไม่ต้องมี timezone / seconds
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }
  // โหลดข้อมูลตู้เย็นเมื่อเปิดหน้า
  useEffect(() => {
    loadFridges();
  }, []);

  // อัพเดทข้อมูลการจองเมื่อกรอกฟอร์ม
  function handleBookingInput(field, value) {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // อัพเดทข้อมูลสิ่งของแต่ละรายการ
  function handleItemInput(itemId, field, value) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  // เพิ่มรายการสิ่งของ
  function addItem() {
    setItems((prev) => [...prev, { id: Date.now(), name: "", quantity: 1, note: "" }]);
  }

  // ลบรายการสิ่งของ
  function removeItem(itemId) {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  }

  // เลือกช่องในตู้เย็น
  function chooseSlot(fridge, shelf, slot) {
    // ✅ ถ้ามี booking_id แสดงว่าเป็นหน้าแก้ไข → ห้ามกดเปลี่ยนช่อง
    if (booking_id) return;

    if (slot.is_disabled === false) {
      setSelectedFridge(fridge);
      setSelectedSlot({ ...slot, shelf_number: shelf.shelf_number });
    }
  }

  // นับจำนวนช่องว่างในแต่ละตู้เย็น
  function countAvailableSlots(fridge) {
    let count = 0;
    fridge.shelves.forEach((shelf) => {
      shelf.slots.forEach((slot) => {
        if (slot.is_disabled === false) count++;
      });
    });
    return count;
  }

  // ตรวจสอบข้อมูลก่อนส่ง
  function validateForm() {
    const newErrors = {};

    if (!selectedSlot) newErrors.slot = "กรุณาเลือกช่องที่ต้องการจอง";
    if (!bookingData.start_time) newErrors.start_time = "กรุณาระบุเวลาเริ่มต้น";
    if (!bookingData.end_time) newErrors.end_time = "กรุณาระบุเวลาสิ้นสุด";
    if (
      bookingData.start_time &&
      bookingData.end_time &&
      new Date(bookingData.start_time) >= new Date(bookingData.end_time)
    ) {
      newErrors.end_time = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น";
    }

    items.forEach((item, idx) => {
      if (!item.name.trim()) newErrors[`item_${item.id}_name`] = `กรุณาระบุชื่อสิ่งของที่ ${idx + 1}`;
      if (item.quantity < 1) newErrors[`item_${item.id}_quantity`] = "จำนวนต้องมากกว่า 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ส่งข้อมูลการจอง
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const submitData = {
        booking_id, 
        slot_id: selectedSlot.id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        note: bookingData.note,
        items: items.filter((item) => item.name.trim()),
      };
      

      await axios.put(`${BASE_URL}/api/booking/updateBookingFridge`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFridges();
      toast.success("จองสำเร็จ!");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  // ส่วนแสดงผล
  return (
    <div className="space-y-6">
      {/* ส่วนหัว */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
          <ArrowLeft className="w-4 h-4" /> กลับ
        </Button>
        <div>
          <h1 className="text-2xl font-bold">แก้ไขการจองช่องเก็บของ</h1>
          <p className="text-gray-600">เพิ่ม/แก้ไข รายการสิ่งของ</p>
        </div>
      </div>

      {/* ฟอร์มจอง */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* เลือกตู้เย็นและช่อง */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกตู้เย็นและช่อง</CardTitle>
            {errors.slot && <>{toast.error(errors.slot)}</>}
          </CardHeader>
          <CardContent className="space-y-6">
            {fridges.map((fridge) => (
              <div key={fridge.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Refrigerator size={20} className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{fridge.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        {fridge.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {countAvailableSlots(fridge)} ช่องว่าง
                  </Badge>
                </div>
                {/* แสดงชั้นและช่อง */}
                <div className="space-y-4">
                  {fridge.shelves.map((shelf) => (
                    <div key={shelf.id} className="border-l-2 border-l-gray-300 pl-4">
                      <div className="text-sm font-medium mb-2">ชั้นที่ {shelf.shelf_number}</div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {shelf.slots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => chooseSlot(fridge, shelf, slot)}
                            disabled={booking_id ? slot.id !== selectedSlot?.id : false}
                            className={
                              booking_id && slot.id !== selectedSlot?.id
                                ? "border-gray-200 bg-gray-100 text-gray-400 p-3 rounded-lg border-2 cursor-not-allowed"
                                : slot.is_disabled === false
                                ? selectedSlot?.id === slot.id
                                  ? "border-blue-500 bg-blue-50 text-blue-700 p-3 rounded-lg border-2"
                                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 p-3 rounded-lg border-2"
                                : "border-red-300 bg-red-50 text-red-500 p-3 rounded-lg border-2 cursor-not-allowed"
                            }
                          >
                            <div>ช่อง {slot.slot_number}</div>
                            <div className="text-xs mt-1">{slot.is_disabled === false ? "ว่าง" : "จองแล้ว"}</div>
                            {selectedSlot?.id === slot.id && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ข้อมูลการจอง */}
        {selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการจอง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">ตำแหน่งที่เลือก:</div>
                <div className="text-blue-700">
                  {selectedFridge.name} - ชั้นที่ {selectedSlot.shelf_number} ช่อง {selectedSlot.slot_number}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">เวลาเริ่มต้น *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={bookingData.start_time}
                    onChange={(e) => handleBookingInput("start_time", e.target.value)}
                    className={errors.start_time ? "border-red-500" : ""}
                  />
                  {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">เวลาสิ้นสุด *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={bookingData.end_time}
                    onChange={(e) => handleBookingInput("end_time", e.target.value)}
                    className={errors.end_time ? "border-red-500" : ""}
                  />
                  {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* รายการสิ่งของ */}
        {selectedSlot && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>รายการสิ่งของที่จะเก็บ</CardTitle>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus size={16} className="mr-2" /> เพิ่มรายการ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">รายการที่ {idx + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`item_name_${item.id}`}>ชื่อสิ่งของ *</Label>
                      <Input
                        id={`item_name_${item.id}`}
                        value={item.name}
                        onChange={(e) => handleItemInput(item.id, "name", e.target.value)}
                        placeholder="เช่น ข้าวกล่อง, น้ำผลไม้"
                        className={errors[`item_${item.id}_name`] ? "border-red-500" : ""}
                      />
                      {errors[`item_${item.id}_name`] && (
                        <p className="text-sm text-red-500">{errors[`item_${item.id}_name`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item_quantity_${item.id}`}>จำนวน *</Label>
                      <Input
                        id={`item_quantity_${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemInput(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className={errors[`item_${item.id}_quantity`] ? "border-red-500" : ""}
                      />
                      {errors[`item_${item.id}_quantity`] && (
                        <p className="text-sm text-red-500">{errors[`item_${item.id}_quantity`]}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`item_note_${item.id}`}>หมายเหตุ</Label>
                    <Input
                      id={`item_note_${item.id}`}
                      value={item.note}
                      onChange={(e) => handleItemInput(item.id, "note", e.target.value)}
                      placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ปุ่มส่งคำขอ */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="submit" disabled={isLoading || !selectedSlot} className="min-w-[120px]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังจองพื้นที่...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} /> แก้ไขการจอง
              </div>
            )}
          </Button>
          <Button type="button" variant="outline">
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BookingFormEdit;
