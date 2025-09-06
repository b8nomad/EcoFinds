import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    userType: "ADMIN" | "USER";
}

export const ProtectedRoute = ({ children, userType }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin, isUser, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Don't navigate while loading
        if (loading) return;

        if (!isAuthenticated) {
            navigate('/auth/login');
        } else if (userType === 'ADMIN' && !isAdmin) {
            navigate('/user');
        } else if (userType === 'USER' && !isUser) {
            navigate('/admin');
        }
    }, [isAuthenticated, isAdmin, isUser, userType, navigate, loading]);

    return <>{children}</>;
}