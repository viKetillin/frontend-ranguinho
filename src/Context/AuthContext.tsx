import { createContext, ReactNode, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import api from "../Services/api";
import { User } from "../Types/User";

type AuthContextType = {
    user?: User;
    cookies: any;
    SignIn: (username: string, password: string) => Promise<any>;
    SignUp: (username: string, email: string, password: string) => Promise<any>;
    SignOut: () => void;
    removeCookie: (any) => void;
}

export const AuthContext = createContext({} as AuthContextType);

type AuthContextProviderProps = {
    children: ReactNode
}

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>(JSON.parse(localStorage.getItem('user') || `{}`) || undefined)

    const [cookies, setCookies, removeCookie] = useCookies(['authentication']);

    useEffect(() => {
        if (cookies.authentication) {
            if (String(cookies.authentication).split(".").length !== 3) SignOut()
            api.post("/api/Login/validarToken", {}, { params: { authToken: cookies.authentication } }).then(resp => {
                let userInfo: User = undefined
                if (resp.data.autenticado) {
                    userInfo = {
                        email: resp.data.user.usuario.emailUsuario,
                        franquiaId: resp.data.franquiaUsuarioModel?.franquiaId,
                        username: resp.data.user.usuario.nomeUsuario,
                        role: resp.data.user.perfil.nomePerfil
                    }
                }
                if (userInfo.username && userInfo.role && resp.data.autenticado) {
                    setUser(userInfo);
                    localStorage.setItem("user", JSON.stringify(userInfo));
                } else {
                    SignOut()
                }
            }).catch((err) => {
                console.error(err)
                SignOut()
            })
        } else {
            SignOut()
        }

    }, [cookies])

    async function SignUp(username: string, email: string, password: string) {

    }

    async function SignIn(usuario: string, senha: string) {
        return api.post("/api/Login/login", { usuario, senha }, { params: { usuario, senha } }).then(resp => {
            let userInfo: User = {
                email: resp.data.user.usuario.emailUsuario,
                franquiaId: resp.data.franquiaUsuarioModel?.franquiaId,
                username: resp.data.user.usuario.nomeUsuario,
                role: resp.data.user.perfil.nomePerfil
            }

            if (userInfo.role) {
                setUser(userInfo);
                setCookies('authentication', resp.data?.token, { path: "/", maxAge: 60 * 60 * 8 });
                localStorage.setItem("user", JSON.stringify(userInfo));
            } else {
                SignOut()
            }
        }).catch(err => { console.error(err); throw err; })
    }

    async function SignOut() {
        setUser(undefined);
        removeCookie("authentication", { path: "/" });
        localStorage.removeItem("user");
    }

    return (
        <AuthContext.Provider value={{ user, removeCookie, cookies, SignIn, SignUp, SignOut }}>
            {props.children}
        </AuthContext.Provider>
    );
}