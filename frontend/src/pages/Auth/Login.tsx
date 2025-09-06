import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useNavigate } from "react-router-dom"

import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("doe@gmail.com");
  const [password, setPassword] = useState("password");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuth();

  async function LoginHandler() {

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const { success, message, data } = await res.json();

    if (!success) {
      return toast.error(message || "Login failed.");
    }

    login(data.token, data.user);

    toast.success("Login successful!");

    navigate('/');
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SWAPPER
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Please sign in to your account
          </p>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <Input id="password" type={isPasswordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button variant="outline" className="text-sm" onClick={(e) => { e.preventDefault(); setIsPasswordVisible(!isPasswordVisible); }}>
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" onClick={(e) => LoginHandler()}>
              Login
            </Button>
            <span className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center w-full">
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700 mx-2" />
              or
              <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700 mx-2" />
            </span>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth/signup')}>
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </div></div >
  )
}

export default Login