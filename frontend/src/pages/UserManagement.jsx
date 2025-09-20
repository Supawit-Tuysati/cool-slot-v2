import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, Edit, Trash2, UserPlus, Users, UserCheck, UserX, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const UserManagement = () => {
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;
  const { token } = useAuth();
  const navigate = useNavigate();


  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/user/getUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatUsers = data.map((user) => ({
        id: user.id,
        fullName: user.name || "ไม่ระบุชื่อ",
        email: user.email,
        role: user.role?.name || "user",
        department: user.department?.name || "-",
        lastLogin: formatLastLogin(user.lastLogin) || "-",
        status: user.status || "Active",
      }));

      setUsers(formatUsers);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatLastLogin = (isoDate) => {
    if (!isoDate) return "-";

    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}   ${hours}:${minutes}:${seconds}`;
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">ผู้ดูแลระบบ</Badge>;
      case "user":
        return <Badge variant="outline">ผู้ใช้ทั่วไป</Badge>;
      case "cleaner":
        return <Badge variant="secondary">ผู้ดูแล</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ใช้งาน
          </Badge>
        );
      case "Inactive":
        return (
          <Badge variant="danger" className="bg-red-100 text-gray-800">
            ปิดการใช้งาน
          </Badge>
        );
      default:
        return (
          <Badge variant="danger" className="bg-red-100 text-gray-800">
            ปิดการใช้งาน
          </Badge>
        );
    }
  };

  const handleEditClick = (user) => {
    navigate(`/edit-user/${user}`); // ส่ง id ไปด้วยถ้าจะทำหน้าแก้ไข
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-600">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        <Button onClick={() => navigate("/add-user")} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ใช้งานอยู่</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ปิดการใช้งาน</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>รายการผู้ใช้งาน</CardTitle>
          <CardDescription>จัดการและดูข้อมูลผู้ใช้ทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  กรองตามระดับใช้งาน
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRole("all")}>ทั้งหมด</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("admin")}>ผู้ดูแลระบบ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("cleaner")}>ผู้ดูแล</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("user")}>ผู้ใช้ทั่วไป</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table style={{ tableLayout: "fixed", width: "100%" }}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">ผู้ใช้</TableHead>
                  <TableHead className="w-24">ระดับใช้งาน</TableHead>
                  <TableHead className="w-32">แผนก</TableHead>
                  <TableHead className="w-24">สถานะ</TableHead>
                  <TableHead className="w-40">เข้าสู่ระบบล่าสุด</TableHead>
                  <TableHead className="w-24 text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="w-56 break-words">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-gray-500">@{user.email}</div>
                    </TableCell>
                    <TableCell className="w-24">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="w-32">{user.department}</TableCell>
                    <TableCell className="w-24">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="w-40 text-sm text-gray-500">{user.lastLogin}</TableCell>
                    <TableCell className="w-24 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ปิดการใช้งาน
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/50 z-50 flex items-center justify-center"
          onClick={() => setIsDeleteModalOpen(false)} // คลิกที่พื้นที่นอก modal ปิด modal
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-red-600">ยืนยันปิดการใช้งาน</h2>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการปิดการใช้งานผู้ใช้ <strong>{selectedUser.fullName}</strong>?
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

                    const response = await axios.put(
                      `${BASE_URL}/api/user/deleteUser/${selectedUser.id}`,
                      {},
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    if (response.status === 200) {
                      toast.success("ลบผู้ใช้สำเร็จ");
                      await fetchUsers(); // รีโหลดข้อมูลหลังลบ
                      setIsDeleteModalOpen(false);
                      setSelectedUser(null);
                    } else {
                      toast.error("ไม่สามารถลบผู้ใช้ได้");
                    }
                  } catch (err) {
                    toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
                    console.error(err);
                  }
                }}
              >
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
