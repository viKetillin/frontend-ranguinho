import { useEffect, useReducer, useState } from "react"

import Admin from "../../../../Layout/Admin"
import api from "../../../../Services/api"
import { sort_by } from "../../../../utils/sort_by"
import removeAccent from "../../../../utils/removeAccent"
import { Helmet } from "react-helmet-async"
import { useMessage } from "../../../../Hooks/Message"
import { useAuth } from "../../../../Hooks/Auth"

import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaLongArrowAltDown, FaLongArrowAltUp, FaPencilAlt, FaPlusCircle, FaSearch, FaStore, FaTrashAlt, FaUser } from "react-icons/fa"
import { VscLoading } from "react-icons/vsc"

import { Alert } from "../../../../Components/Utils"
import { AlertReducer } from "../../../../Components/Utils/Alert"

import FormUsuarioPopup from "../../../../Components/Pages/Popups/Forms/FormUsuarioPopup"
import DeletePopup from "../../../../Components/Pages/Popups/DeletePopup"

import AOS from "aos";
import UsuarioPopup from "../../../../Components/Pages/Popups/Views/UsuarioPopup"
AOS.init()

export type Usuario = {
    id: number,
    nomeUsuario: string,
    emailUsuario: string,
    codigoUsuario: string,
    senha: string,
    endereco: string,
    whatsapp: string,
    linkCardapio: string,
    nomePerfil: string,
    dataNascimento: Date
}

type Status = "loading" | "success" | "error" | "initial";

const Index = () => {
    const { cookies } = useAuth()

    const [usuarios, setUsuarios] = useState<Usuario[]>([])

    const [filter, setFilter] = useState<{ search: string, perpage: number, page: number, orderBy: { field: "nomeUsuario" | "emailUsuario" | "linkCardapio" | "nomePerfil", inverse: boolean } }>({ search: "", perpage: 10, page: 1, orderBy: { field: "nomeUsuario", inverse: false } })

    const [loadStatus, setLoadStatus] = useState<Status>()

    const { GetMessage } = useMessage()

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const [popup, setPopup] = useState<"delete" | "view" | "user-form" | "">("")

    const [selectedUsuario, setSelectedUsuario] = useState<Usuario>()

    useEffect(() => {
        if (!popup) {
            setSelectedUsuario(undefined)
        }
    }, [popup])

    const LoadData = async () => {
        setLoadStatus("loading")
        await api.get("/api/admin/Usuario/usuarios", { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(resp => {
                setUsuarios(resp.data.data)
                setLoadStatus("success")
            }).catch(err => {
                console.error(err)
                setLoadStatus("error")
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao recuperar usuários!", type: "error" }], origin: "usuario-error" });
            })
    }

    const [deleteStatus, setDeleteStatus] = useState<Status>("initial")

    const DeleteUsuario = async () => {
        if (deleteStatus === "loading") return;
        setDeleteStatus("loading")
        api.delete("/api/admin/Usuario/usuario", { headers: { Authorization: `Bearer ${cookies.authentication}` }, params: { id: selectedUsuario.id } })
            .then(resp => {
                LoadData()
                setPopup(undefined)
                setDeleteStatus("success")
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Usuário excluido com sucesso!", type: "success" }], origin: "usuario-success" });
            }).catch(err => {
                console.error(err)
                setDeleteStatus("error")
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao excluir usuário", type: "error" }], origin: "usuario-delete-error" });
            });
    }

    useEffect(() => {
        LoadData()
        GetMessage('/admin/cadastro/usuario').then(messages => alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: messages.map(message => ({ message: message, type: "success" })), origin: "usuario-success" }))
    }, [])

    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Cadastro de Usuários</title>
            </Helmet>

            <FormUsuarioPopup
                open={popup === "user-form"}
                onClose={() => setPopup(undefined)}
                onSuccess={() => { setPopup(undefined); alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Usuário ${selectedUsuario?.id ? "editado" : "adicionado"} com sucesso!`, type: "error" }], origin: "usuario-success" }); LoadData(); }}
                usuario={selectedUsuario} />

            <UsuarioPopup open={popup === "view"} onClose={() => setPopup(undefined)}
                usuario={selectedUsuario} />

            <DeletePopup message={`Confirmar exclusão do usuário ${selectedUsuario?.nomeUsuario}? Após confirmação não será possível desfazer essa ação.`}
                alerts={alerts["usuario-delete-error"]?.map(alert => alert.message)} status={deleteStatus} open={popup === "delete"} onCancel={() => setPopup(undefined)} onDelete={() => DeleteUsuario()} />

            <div className="container mx-auto p-2 lg:p-6 max-h-full overflow-auto">
                <h1 className="text-zinc-600 py-2 text-lg font-semibold sm:text-2xl">
                    <FaStore className="inline-block mr-1 mb-2" size={30} />
                    <span className="inline-block mx-1">Usuários</span>
                </h1>
                <div className="container bg-white shadow-lg shadow-zinc-500/10 mt-4">
                    <div className="p-4 gap-4 flex flex-col md:flex-row items-center justify-between border-b">
                        <h2 className="text-xl font-semibold text-zinc-600">Lista de usuários</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center h-7">
                                <input type="text" onChange={evt => setFilter({ ...filter, search: removeAccent(evt.currentTarget.value.toLowerCase()), page: 1 })} className="outline-none h-full rounded-l pl-2 border text-zinc-700" placeholder="Procurar" />
                                <button type="button" className="relative h-full text-white bg-zinc-700 hover:bg-zinc-800 p-1.5 rounded-r">
                                    <FaSearch />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 my-4 mx-4">
                        <button onClick={() => setPopup("user-form")} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-800 text-white px-3 py-1 rounded"><FaPlusCircle /> Adicionar</button>
                    </div>
                    <div className="px-5 pb-5">
                        {alerts["usuario-success"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {alerts["usuario-error"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {
                            loadStatus === "success" &&
                            <>
                                {usuarios?.length > 0 &&
                                    (function () {
                                        const filtered_usuarios = usuarios?.filter(usuario => usuario).filter(usuario =>
                                            removeAccent(usuario?.nomeUsuario ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(usuario?.emailUsuario ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(usuario?.nomePerfil ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(usuario?.whatsapp ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(usuario?.endereco ?? "").toLowerCase().includes(filter?.search ?? ""))
                                        return (
                                            <>
                                                <div className="py-2 text-gray-700 flex items-center gap-2">
                                                    <label htmlFor="">Por página:</label>
                                                    <input onChange={evt => setFilter({ ...filter, perpage: Number(evt.currentTarget.value) < 2 ? 2 : Number(evt.currentTarget.value) })} value={filter.perpage} className="pl-2 w-16 border text-gray-700" type="number" />
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full table-fixed text-center">
                                                        <thead className="font-semibold bg-zinc-100 text-zinc-700 text-left">
                                                            <tr>
                                                                <th className="border border-zinc-300 px-2 py-3 w-28 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "nomeUsuario" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "nomeUsuario", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "nomeUsuario", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center cursor-pointer px-2">Nome Usuário
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "nomeUsuario" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "nomeUsuario" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 cursor-pointer px-2 w-52 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "emailUsuario" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "emailUsuario", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "emailUsuario", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center px-2">Email Usuario
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "emailUsuario" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "emailUsuario" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 cursor-pointer px-2 w-36 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "linkCardapio" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "linkCardapio", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "linkCardapio", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center px-2">Link do Cardapio
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "linkCardapio" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "linkCardapio" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 cursor-pointer px-2 w-36 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "nomePerfil" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "nomePerfil", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "nomePerfil", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center px-2">Nome do Perfil
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "nomePerfil" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "nomePerfil" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 px-2 w-32 text-center">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-zinc-600">
                                                            {
                                                                filtered_usuarios.sort(sort_by(filter.orderBy.field, filter.orderBy.inverse, (a) => (a ?? "").toUpperCase())).filter((usuário, i) => {
                                                                    const initial = (filter.perpage * filter.page) - filter.perpage;
                                                                    return i >= initial && i < initial + filter.perpage;
                                                                }).map(usuario => {
                                                                    return (
                                                                        <tr key={usuario.id}>
                                                                            <td className="border border-zinc-300 px-2 py-3">{usuario.nomeUsuario}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3 w-36">{usuario.emailUsuario}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{usuario.linkCardapio}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{usuario.nomePerfil}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">
                                                                                <div className="text-white flex justify-center items-center gap-3">
                                                                                    <button onClick={() => { setSelectedUsuario(usuario); setPopup("view"); }} className="bg-teal-500 hover:bg-teal-600 rounded p-1"><FaSearch /></button>
                                                                                    <button onClick={() => { setSelectedUsuario(usuario); setPopup("user-form"); }} className="bg-yellow-500 hover:bg-yellow-600 rounded p-1"><FaPencilAlt /></button>
                                                                                    <button onClick={() => { setSelectedUsuario(usuario); setPopup("delete"); }} className="bg-red-500 hover:bg-red-600 rounded p-1"><FaTrashAlt /></button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="flex flex-wrap gap-2 py-4">
                                                    <button onClick={() => setFilter({ ...filter, page: 1 })} type="button" disabled={!(filter.page > 1)} className="disabled:opacity-50 bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex"><FaAngleDoubleLeft /></button>
                                                    <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} disabled={!(filter.page > 1)} className="disabled:opacity-50 bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex"><FaAngleLeft /></button>

                                                    {filter.page > 3 && <button onClick={() => setFilter({ ...filter, page: filter.page - 3 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page - 3}</button>}
                                                    {filter.page > 2 && <button onClick={() => setFilter({ ...filter, page: filter.page - 2 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page - 2}</button>}
                                                    {filter.page > 1 && <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page - 1}</button>}

                                                    {<button type="button" className="bg-zinc-400 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page}</button>}

                                                    {filter.page + 1 < (filtered_usuarios.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page + 1}</button>}
                                                    {filter.page + 2 < (filtered_usuarios.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 2 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page + 2}</button>}
                                                    {filter.page + 3 < (filtered_usuarios.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 3 })} type="button" className="bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex">{filter.page + 3}</button>}

                                                    <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" disabled={!(filter.page < filtered_usuarios.length / filter.perpage)} className="disabled:opacity-50 bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex"><FaAngleRight /></button>
                                                    <button onClick={() => setFilter({ ...filter, page: Math.ceil(filtered_usuarios.length / filter.perpage) })} disabled={!(filter.page < filtered_usuarios.length / filter.perpage)} type="button" className="disabled:opacity-50 bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2 inline-flex"><FaAngleDoubleRight /></button>
                                                </div>
                                            </>
                                        )
                                    }())

                                }

                                {
                                    usuarios?.length === 0 &&
                                    <div className="text-center text-zinc-400">
                                        <FaUser className="mx-auto" size={200} />
                                        <span className="text-gray-500">Nenhum usuário cadastrado!</span>
                                    </div>
                                }
                            </>
                        }

                        {loadStatus == "loading" &&
                            <div className="my-6">
                                <VscLoading size={30} className='mx-auto animate-spin' />
                            </div>}
                    </div>
                </div>
            </div>
        </Admin >
    )
}

export default Index