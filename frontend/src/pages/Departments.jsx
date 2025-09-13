import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { Search, MoreHorizontal, Edit, Trash2, Building } from "lucide-react";

const Departments = () => {
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;

  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [newDepartmentDes, setNewDepartmentDes] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchDepartments = async () => {
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.get(`${BASE_URL}/api/department/getDepartments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = data.map((dept) => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || "-",
        created_at: dept.created_at,
      }));

      setDepartments(formatted);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleSaveDepartment = async () => {
    const trimmedName = newDepartment.trim();
    const trimmedDesc = newDepartmentDes.trim();

    if (!trimmedName) return toast.warning("กรุณากรอกชื่อแผนก");

    const isDuplicate = departments.some((d) => d.name.trim().toLowerCase() === trimmedName.toLowerCase());

    if (isDuplicate) {
      toast.warning("ชื่อแผนกนี้มีอยู่แล้ว");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const dataDept = {
        name: trimmedName,
        description: trimmedDesc || "-",
      };

      const response = await axios.post(`${BASE_URL}/api/department/createDepartment`, dataDept, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("บันทึกสำเร็จ");

        await fetchDepartments();

        setNewDepartment("");
        setNewDepartmentDes("");
        setIsDeptModalOpen(false);
      } else {
        toast.error("ไม่สามารถบันทึกได้");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (dept) => {
    setSelectedDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการแผนก</h1>
          <p className="text-gray-600">จัดการข้อมูลแผนกในระบบ</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDeptModalOpen(true)}>
          <Building className="w-4 h-4 mr-2" />
          เพิ่มแผนกใหม่
        </Button>
      </div>

      {/* Modal */}
      {isDeptModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsDeptModalOpen(false)} // คลิกที่พื้นที่นอก modal ปิด modal
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">เพิ่มแผนกใหม่</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newDepartment" className="mb-3">
                  ชื่อแผนก
                </Label>
                <Input
                  id="newDepartment"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="กรอกชื่อแผนก"
                />
              </div>
              <div>
                <Label htmlFor="newDepartmentDes" className="mb-3">
                  คำอธิบาย
                </Label>
                <Input
                  id="newDepartmentDes"
                  value={newDepartmentDes}
                  onChange={(e) => setNewDepartmentDes(e.target.value)}
                  placeholder="กรอกคำอธิบาย"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeptModalOpen(false);
                    setNewDepartment("");
                  }}
                >
                  ยกเลิก
                </Button>
                <Button onClick={handleSaveDepartment} className="bg-blue-600 hover:bg-blue-700">
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>รายการแผนก</CardTitle>
          <CardDescription>จัดการและดูข้อมูลแผนกในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อแผนก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table style={{ tableLayout: "fixed", width: "100%" }}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/3">ชื่อแผนก</TableHead>
                  <TableHead className="w-1/3">คำอธิบาย</TableHead>
                  <TableHead className="w-24 text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="break-words">{dept.name}</TableCell>
                    <TableCell className="break-words">{dept.description}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(dept)}>
                            <Edit className="mr-2 h-4 w-4" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(dept)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบแผนกที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditModalOpen && selectedDepartment && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsEditModalOpen(false)} // คลิกที่พื้นที่นอก modal ปิด modal
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">แก้ไขแผนก</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">ชื่อแผนก</Label>
                <Input
                  id="editName"
                  value={selectedDepartment.name}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editDesc">คำอธิบาย</Label>
                <Input
                  id="editDesc"
                  value={selectedDepartment.description}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={async () => {
                    const trimmedName = selectedDepartment.name.trim();

                    if (!trimmedName) return toast.warning("กรุณากรอกชื่อแผนก");

                    const isDuplicate = departments.some(
                      (d) => d.id !== selectedDepartment.id && d.name.trim().toLowerCase() === trimmedName.toLowerCase()
                    );

                    if (isDuplicate) {
                      toast.warning("ชื่อแผนกนี้มีอยู่แล้ว");
                      return;
                    }

                    try {
                      const token = localStorage.getItem("token");
                      const response = await axios.put(
                        `${BASE_URL}/api/department/updateDepartment/${selectedDepartment.id}`,
                        {
                          name: selectedDepartment.name,
                          description: selectedDepartment.description,
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      if (response.status === 200) {
                        toast.success("แก้ไขสำเร็จ");

                        await fetchDepartments();
                        setIsEditModalOpen(false);
                        setSelectedDepartment(null);
                      } else {
                        toast.error("ไม่สามารถแก้ไขได้");
                      }
                    } catch (err) {
                      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
                      console.error(err);
                    }
                  }}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedDepartment && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsDeleteModalOpen(false)} // คลิกที่พื้นที่นอก modal ปิด modal
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-red-600">ยืนยันการลบ</h2>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการลบแผนก <strong>{selectedDepartment.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const response = await axios.delete(
                      `${BASE_URL}/api/department/deleteDepartment/${selectedDepartment.id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    if (response.status === 200) {
                      toast.success("ลบสำเร็จ");

                      await fetchDepartments();
                      setIsEditModalOpen(false);
                      setSelectedDepartment(null);
                    } else {
                      toast.error("ไม่สามารถลบได้");
                    }
                  } catch (err) {
                    if (err.response && err.response.status === 400) {
                      toast.error(err.response.data.message);
                    } else {
                      toast.error("เกิดข้อผิดพลาดในการลบ");
                    }
                    console.error(err);
                  }
                }}
              >
                ลบ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
