import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/Auth"
import { useMessage } from "../Hooks/Message";
import { Role } from "../Types/User";

type AdminAuthProps = {
    children: ReactNode
    roles: Role[]
}

export function AuthModdleware({ children, roles }: AdminAuthProps) {
    const { user } = useAuth()
    
    return (
        <>
            {roles.includes(user?.role) ?
                <>
                    {children}
                </>
                :
                <Navigate to="/admin/login" />}
        </>
    );
}