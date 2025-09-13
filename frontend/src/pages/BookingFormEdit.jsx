import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Package, Plus, Trash2, Save, Refrigerator, Grid3X3, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
// import axios from "axios"; // Removed axios
// import { toast } from "react-toastify"; // Removed toast
import { useNavigate, useParams } from "react-router-dom";

function BookingFormEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get booking ID from URL

  // const API_HOST = import.meta.env.VITE_API_HOST; // Removed backend related variables
  // const API_PORT = import.meta.env.VITE_API_PORT;
  // const BASE_URL = `${API_HOST}:${API_PORT}`;

  const [fridges, setFridges] = useState([]);
  const [selectedFridge, setSelectedFridge] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    start_time: "",
    end_time: "",
    note: "",
  });
  const [items, setItems] = useState([{ id: 1, name: "", quantity: 1, note: "" }]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFridges, setIsLoadingFridges] = useState(true);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);

  // Mock data for fridges
  const mockFridges = [
    {
      id: "fridge-1",
      name: "ตู้เย็นส่วนกลาง 1",
      location: "อาคาร A ชั้น 1",
      shelves: [
        {
          id: "shelf-1-1",
          shelf_number: 1,
          slots: [
            { id: "slot-1-1-1", slot_number: 1, status: "available" },
            { id: "slot-1-1-2", slot_number: 2, status: "booked" },
            { id: "slot-1-1-3", slot_number: 3, status: "available" },
            { id: "slot-1-1-4", slot_number: 4, status: "available" },
          ],
        },
        {
          id: "shelf-1-2",
          shelf_number: 2,
          slots: [
            { id: "slot-1-2-1", slot_number: 1, status: "available" },
            { id: "slot-1-2-2", slot_number: 2, status: "available" },
            { id: "slot-1-2-3", slot_number: 3, status: "booked" },
            { id: "slot-1-2-4", slot_number: 4, status: "available" },
          ],
        },
      ],
    },
    {
      id: "fridge-2",
      name: "ตู้เย็นส่วนกลาง 2",
      location: "อาคาร B ชั้น 2",
      shelves: [
        {
          id: "shelf-2-1",
          shelf_number: 1,
          slots: [
            { id: "slot-2-1-1", slot_number: 1, status: "available" },
            { id: "slot-2-1-2", slot_number: 2, status: "available" },
            { id: "slot-2-1-3", slot_number: 3, status: "available" },
            { id: "slot-2-1-4", slot_number: 4, status: "available" },
          ],
        },
      ],
    },
  ];

  // Mock booking data for editing
  const mockBooking = {
    id: id, // Use the ID from params
    slot_id: "slot-1-1-1",
    start_time: "2025-09-15T10:00",
    end_time: "2025-09-15T12:00",
    note: "Mock booking note for editing",
    items: [
      { id: 1, name: "Mock Item 1", quantity: 2, note: "" },
      { id: 2, name: "Mock Item 2", quantity: 1, note: "Fragile" },
    ],
  };

  const fetchFridges = async () => {
    try {
      setIsLoadingFridges(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFridges(mockFridges);
    } catch (error) {
      console.error("Error fetching fridges:", error);
    } finally {
      setIsLoadingFridges(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      setIsLoadingBooking(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In a real app, you'd fetch booking data by ID
      setBookingData({ ...mockBooking });
      setItems(mockBooking.items);

      // Find the selected fridge and slot from mock data
      let foundFridge = null;
      let foundSlot = null;
      for (const fridge of mockFridges) {
        for (const shelf of fridge.shelves) {
          for (const slot of shelf.slots) {
            if (slot.id === mockBooking.slot_id) {
              foundFridge = fridge;
              foundSlot = { ...slot, shelf_number: shelf.shelf_number };
              break;
            }
          }
          if (foundSlot) break;
        }
        if (foundFridge) break;
      }
      setSelectedFridge(foundFridge);
      setSelectedSlot(foundSlot);
    } catch (error) {
      console.error("Error fetching booking data:", error);
    } finally {
      setIsLoadingBooking(false);
    }
  };

  useEffect(() => {
    fetchFridges();
    fetchBookingData();
  }, [id]); // Re-fetch if ID changes

  const handleInputChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      quantity: 1,
      note: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (itemId) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const selectSlot = (fridge, shelf, slot) => {
    if (slot.status === "available" || slot.id === selectedSlot?.id) { // Allow re-selecting current slot
      setSelectedFridge(fridge);
      setSelectedSlot({ ...slot, shelf_number: shelf.shelf_number });
    }
  };

  const getAvailableSlots = (fridge) => {
    return fridge.shelves.reduce(
      (total, shelf) => total + shelf.slots.filter((slot) => slot.status === "available").length,
      0
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedSlot) {
      newErrors.slot = "กรุณาเลือกช่องที่ต้องการจอง";
    }

    if (!bookingData.start_time) {
      newErrors.start_time = "กรุณาระบุเวลาเริ่มต้น";
    }

    if (!bookingData.end_time) {
      newErrors.end_time = "กรุณาระบุเวลาสิ้นสุด";
    }

    if (bookingData.start_time && bookingData.end_time) {
      if (new Date(bookingData.start_time) >= new Date(bookingData.end_time)) {
        newErrors.end_time = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น";
      }
    }

    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${item.id}_name`] = `กรุณาระบุชื่อสิ่งของที่ ${index + 1}`;
      }
      if (item.quantity < 1) {
        newErrors[`item_${item.id}_quantity`] = `จำนวนต้องมากกว่า 0`;
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
      const submitData = {
        slot_id: selectedSlot.id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        note: bookingData.note,
        items: items.filter((item) => item.name.trim()),
      };

      console.log("Simulating booking update:", submitData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      console.log("Booking update simulated successfully!");
      // toast.success("อัปเดตการจองสำเร็จ!"); // Removed toast
      navigate("/bookings"); // Redirect after simulated success
    } catch (error) {
      console.error("Error simulating booking update:", error);
      // toast.error("เกิดข้อผิดพลาดในการอัปเดตการจอง กรุณาลองใหม่อีกครั้ง"); // Removed toast
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingFridges || isLoadingBooking) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/bookings")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขการจองช่องเก็บของ</h1>
          <p className="text-gray-600">แก้ไขข้อมูลการจองตู้เย็นและช่อง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* เลือกตู้เย็นและช่อง */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกตู้เย็นและช่อง</CardTitle>
            {errors.slot && <p className="text-sm text-red-500">{errors.slot}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            {fridges.length === 0 ? (
              <p>ไม่พบข้อมูลตู้เย็น</p>
            ) : (
              fridges.map((fridge) => (
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
                      {getAvailableSlots(fridge)} ช่องว่าง
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {fridge.shelves.map((shelf) => (
                      <div key={shelf.id} className="border-l-2 border-l-gray-300 pl-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">ชั้นที่ {shelf.shelf_number}</div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {shelf.slots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => selectSlot(fridge, shelf, slot)}
                              disabled={slot.status === "booked" && slot.id !== selectedSlot?.id} // Allow selecting current slot even if booked
                              className={`
                                relative p-3 rounded-lg border-2 text-sm font-medium transition-all
                                ${
                                  slot.id === selectedSlot?.id
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : slot.status === "available"
                                    ? "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                    : "border-red-300 bg-red-50 text-red-500 cursor-not-allowed"
                                }
                              `}
                            >
                              <div>ช่อง {slot.slot_number}</div>
                              <div className="text-xs mt-1">{slot.status === "available" ? "ว่าง" : "จองแล้ว"}</div>
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
              ))
            )}
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
                    onChange={(e) => handleInputChange("start_time", e.target.value)}
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
                    onChange={(e) => handleInputChange("end_time", e.target.value)}
                    className={errors.end_time ? "border-red-500" : ""}
                  />
                  {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={bookingData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  rows={3}
                />
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
                  <Plus size={16} className="mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">รายการที่ {index + 1}</h4>
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
                        onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
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
                        onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 1)}
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
                      onChange={(e) => handleItemChange(item.id, "note", e.target.value)}
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
          <Button type="button" variant="outline">
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading || !selectedSlot} className="min-w-[120px]">
            {isLoading ? (
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

export default BookingFormEdit;

