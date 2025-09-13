import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Eye, EyeOff, User, Mail, Building, UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    line_user_id: "",
    department_id: "",
    role_id: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [newDepartmentDes, setNewDepartmentDes] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

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

  const roles = [
    { id: 1, name: "ผู้ดูแลระบบ" },
    { id: 2, name: "ผู้ใช้ทั่วไป" },
    { id: 3, name: "ผู้ดูแล" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "กรุณากรอก ชื่อ-นามสกุล";
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    if (!formData.line_user_id) newErrors.line_user_id = "กรุณากรอก Line ID";
    if (!formData.department_id) newErrors.department = "กรุณาเลือกแผนก";
    if (!formData.role_id) newErrors.role = "กรุณาเลือกระดับใช้งาน";
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (!formData.confirmPassword) newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";

    if (formData.name && formData.name.length < 6) {
      newErrors.name = "ชื่อผู้ใช้ต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: Number(formData.role_id),
        department_id: Number(formData.department_id),
        line_user_id: formData.line_user_id,
        lastLogin: null,
        created_by: 0,
      };

      await axios.post(`${BASE_URL}/api/auth/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTimeout(() => {
        toast.success("สร้างผู้ใช้สำเร็จแล้ว!");
        navigate("/user-management");
      }, 1000);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างผู้ใช้");
    } finally {
      setIsLoading(false);
    }
  };

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

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="container mx-auto p-2 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/user-management")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เพิ่มผู้ใช้ใหม่</h1>
          <p className="text-gray-600">สร้างบัญชีผู้ใช้ใหม่สำหรับระบบจัดการตู้เย็น</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            ข้อมูลผู้ใช้
          </CardTitle>
          <CardDescription>กรอกข้อมูลที่จำเป็นเพื่อสร้างบัญชีผู้ใช้ใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="กรอก ชื่อ-นามสกุล"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="กรอกอีเมล"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2 w-full">
                <div className="flex gap-2 items-start">
                  {/* Line ID - กินพื้นที่ 2 เท่าของระดับใช้งาน */}
                  <div className="space-y-2 flex-grow-[2]">
                    <Label htmlFor="line_user_id">Line ID</Label>
                    <div className="relative grow">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Input
                        id="line_user_id"
                        name="line_user_id"
                        placeholder="กรอก Line ID"
                        value={formData.line_user_id}
                        onChange={handleInputChange}
                        className={`w-full pl-10 ${errors.line_user_id ? "border-red-500" : ""}`}
                      />
                      {errors.line_user_id && <p className="text-sm text-red-500 mt-1">{errors.line_user_id}</p>}
                    </div>
                  </div>

                  {/* ระดับใช้งาน */}
                  <div className="space-y-2">
                    <Label htmlFor="role">ระดับใช้งาน *</Label>
                    <div className="relative grow">
                      <Select
                        value={formData.role_id?.toString()}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, role_id: parseInt(value) }))}
                      >
                        <SelectTrigger
                          className={`w-full ${errors.role ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="ระดับใช้งาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()} className="text-black">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="department">แผนก</Label>
                <div className="flex gap-2 items-start">
                  {/* Dropdown แผนก */}
                  <div className="relative grow">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select
                      value={formData.department_id?.toString()}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, department_id: parseInt(value) }))}
                    >
                      <SelectTrigger
                        className={`w-full pl-10 ${
                          errors.department ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="เลือกแผนก" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()} className="text-black">
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeptModalOpen(true)}
                    className="shrink-0"
                  >
                    + เพิ่มแผนก
                  </Button>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่าน"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="ยืนยันรหัสผ่าน"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isLoading ? "กำลังสร้างผู้ใช้..." : "สร้างผู้ใช้"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/user-management")} className="flex-1">
                ยกเลิก
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isDeptModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsDeptModalOpen(false)} // คลิกที่พื้นที่นอก modal ปิด modal
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
};

export default AddUser;
