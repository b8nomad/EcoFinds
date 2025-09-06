import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const RoleBasedRedirect = () => {
    const { isAuthenticated, isAdmin, isUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
        }
        if (isAdmin) {
            navigate('/admin');
        }
        if (isUser) {
            navigate('/user');
        }
    }, [isAuthenticated, isAdmin, isUser, navigate]);

    return null;
}