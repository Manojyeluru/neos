import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    if (!user) {
        // Redirect to specific login based on path if possible, or just root
        if (location.pathname.startsWith("/admin")) return <Navigate to="/login/admin" replace />;
        if (location.pathname.startsWith("/reviewer")) return <Navigate to="/login/reviewer" replace />;
        if (location.pathname.startsWith("/teamleader")) return <Navigate to="/login/teamleader" replace />;
        return <Navigate to="/" replace />;
    }

    // Admin can access everything
    if (user.role === "admin") return <>{children}</>;

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they are lost
        if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
        if (user.role === "reviewer") return <Navigate to="/reviewer/dashboard" replace />;
        if (user.role === "teamleader") return <Navigate to="/teamleader/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
