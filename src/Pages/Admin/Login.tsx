import { useEffect, useReducer, useState } from "react"

import { useNavigate } from "react-router-dom"
import { useAuth } from "../../Hooks/Auth"
import { useMessage } from "../../Hooks/Message"

import { Helmet } from "react-helmet-async"

import { RequestReducer } from "../../Hooks/RequestDataReducer"

import Alert, { AlertProps, AlertReducer } from "../../Components/Utils/Alert"
import { VscLoading } from "react-icons/vsc"

const Index = () => {
    const { user, SignIn } = useAuth()

    const [form, setForm] = useState<{ usuario: string, senha: string }>({
        usuario: "",
        senha: ""
    })

    const navigate = useNavigate();

    const { GetMessage } = useMessage()

    const [RequestsData, RequestsDataDispatch] = useReducer(RequestReducer, {
        "login": {
            state: "initial"
        }
    });

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const SubmitSignIn: React.FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault()
        RequestsDataDispatch({ reqURL: "login", requestData: { state: "loading" } })
        
        alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "login" })

        SignIn(form.usuario, form.senha)
            .catch(err => {
                alertsDispatch({ type: "REPLACE-ALL-FROM-ORIGIN", alerts: [{ message: err.response?.data?.message || "Ocorreu um erro inesperado!", type: "error" }], origin: "login" })
                RequestsDataDispatch({ reqURL: "login", requestData: { state: "error" } })
            })

            RequestsDataDispatch({ reqURL: "login", requestData: { state: "success" } })
    }

    useEffect(() => {
        if (user?.role) {
            if (["Admin", "Franqueado", "Proprietário"].includes(user.role))
                navigate("/admin/dashboard");
            else
                navigate('/');
        }

        (async function () {
            const alerts: AlertProps[] = await GetMessage("login").then(messages => messages.map(message => ({ message, type: "error" })))
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts, origin: "login" });
        }())
    }, [user, navigate])

    return (
        <>
            <Helmet>
                <title>Ranguinho - Entrar na área administrativa</title>
            </Helmet>
            <div className="h-screen w-screen bg-custom-orange flex items-center justify-center">
                <div className="border shadow-xl shadow-black/20 sm:w-96 max-w-screen w-full max-h-screen overflow-auto bg-white h-screen overflow-auto sm:h-auto">
                    <div className="pt-4 px-6">
                        <img className="w-full" src="/assets/imagens/logos/ranguinho/01.png" alt="logo" />
                        <hr className="mt-6" />
                    </div>
                    <form onSubmit={SubmitSignIn} className="px-4 pb-8 md:px-8">
                        <h1 className="text-2xl text-zinc-800 font-semibold py-3">Entrar</h1>
                        <p className="font-thin text-zinc-600 mb-4">Bem vindo à área administrativa!</p>
                        {alerts["login"]?.map(alert => <Alert {...alert} key={alert.message + alert.type} />)}
                        <div className="my-1 mt-4">
                            <label className="text-gray-700" htmlFor="password">Usuário:</label><br />
                            <input onChange={evt => setForm({ ...form, usuario: evt.currentTarget.value })} className="my-1 px-2 py-0.5 border text-gray-600 w-full outline-none" placeholder="Digite seu nome de usuário" type="text" />
                        </div>
                        <div className="my-1">
                            <label className="text-gray-700" htmlFor="password">Senha:</label><br />
                            <input onChange={evt => setForm({ ...form, senha: evt.currentTarget.value })} className="my-1 px-2 py-0.5 border text-gray-600 w-full outline-none" placeholder="Digite sua senha" type="password" />
                        </div>
                        <hr className="my-4" />
                        {
                            RequestsData["login"].state === "loading" ?
                                <div className="container mx-auto my-6">
                                    <VscLoading size={20} className='mx-auto animate-spin' />
                                </div>
                                : <div className="flex justify-center">
                                    <button type="submit" className="bg-custom-orange hover:bg-orange-700 px-2 py-1 font-semibold text-white">Entrar</button>
                                </div>
                        }

                    </form>
                </div>
            </div>
        </>
    )
}

export default Index