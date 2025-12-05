import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios"; // IMPORTANT: axios with baseURL & auth config

export const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("login");

  const [loginData, setLoginData] = useState({
    phone_number: "",
    password: "",
    remember: false,
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  // -----------------------------
  // LOGIN SUBMIT
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/auth/login", {
        phone_number: loginData.phone_number,
        password: loginData.password,
      });

      // save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(t("auth.loginSuccess"));
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message) toast.error(err.response.data.message);
      else toast.error(t("auth.loginFailed"));
    }
  };

  // -----------------------------
  // REGISTER SUBMIT
  // -----------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error(t("auth.passwordMatch"));
      return;
    }

    try {
      const res = await axios.post("/auth/register", {
        username: registerData.username,
        phone_number: registerData.phone_number,
        email: registerData.email || null,
        password: registerData.password,
        role: registerData.role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(t("auth.registerSuccess"));

      navigate("/profile-completion");
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => toast.error(errors[key][0]));
      } else toast.error(t("auth.registerFailed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/intro")} className="mb-6 hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("auth.back")}
        </Button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">{t("brand.name")}</h1>
          <p className="text-muted-foreground mt-2">{t("brand.tagline")}</p>
        </div>

        {/* Auth Card */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t("auth.welcome")}</CardTitle>
            <CardDescription className="text-center">{t("auth.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
              </TabsList>

              {/* ---------------- LOGIN TAB ---------------- */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>{t("auth.phoneNumber")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="+961 XX XXX XXX"
                        value={loginData.phone_number}
                        onChange={(e) =>
                          setLoginData({ ...loginData, phone_number: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                  >
                    {t("auth.signIn")}
                  </Button>
                </form>
              </TabsContent>

              {/* ---------------- REGISTER TAB ---------------- */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label>{t("auth.username")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, username: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("auth.phoneNumber")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={registerData.phone_number}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, phone_number: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("auth.role")}</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("auth.role")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">{t("auth.roleClient")}</SelectItem>
                        <SelectItem value="agency">{t("auth.roleAgency")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, password: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("auth.confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-secondary to-accent text-white font-semibold"
                  >
                    {t("auth.createAccount")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.continueAsGuest")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
