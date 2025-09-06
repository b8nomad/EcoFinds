import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from "react-router-dom";

import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const SignupHandler = async () => {
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const { success, message, data } = await res.json();

            if (!success) {
                toast.error(message || "Signup failed.");
                return;
            }

            login(data.token, data.user);
            toast.success("Signup successful!");
            navigate("/");
        } catch (error) {
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md px-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        SWAPPER
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create your account to get started
                    </p>
                </div>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>
                            Enter your details below to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
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
                                    <Label htmlFor="password">Password</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />

                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="confirmPassword"
                                            type={isPasswordVisible ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <Button
                                            variant="outline"
                                            className="text-sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPasswordVisible(!isPasswordVisible);
                                            }}
                                        >
                                            {isPasswordVisible ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button type="submit" className="w-full" onClick={() => SignupHandler()}>
                            Sign Up
                        </Button>
                        <span className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center w-full">
                            <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700 mx-2" />
                            or
                            <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700 mx-2" />
                        </span>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/auth/login')}>
                            Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Signup;