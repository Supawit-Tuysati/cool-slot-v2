import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_PORT = import.meta.env.VITE_API_PORT;
  const BASE_URL = `${API_HOST}:${API_PORT}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIsLoading(false);
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    if (error) setError(""); // เคลียร์ error เมื่อมีการพิมพ์
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      console.log(data);

      login(data.token);
      navigate("/dashboard"); // ไปหน้า dashboard
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "เข้าสู่ระบบล้มเหลว");
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex">
      {/* ซ้าย - รูปภาพ */}
      <div className="hidden md:flex md:w-[65%] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <img src="/image/login-cover.svg" alt="Login Illustration" className="w-[55%] transform scale-x-[-1]" />
      </div>

      {/* ขวา - ฟอร์ม login */}
      <div className="w-full md:w-[35%] flex items-center justify-center p-6 pt-0 bg-white">
        <div className="w-full max-w-md">
          {/* Logo และ Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
              <img src="/image/logo-icon.png" className="logo-icon" alt="logo icon" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">ระบบจัดการตู้เย็น</h2>
            <p className="text-gray-600">กรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="กรอกอีเมลผู้ใช้"
                      value={email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-gray-500">© {currentYear} COOL SLOT All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
