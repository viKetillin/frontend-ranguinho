import { useEffect, useReducer, useState } from "react"
import { Link } from "react-router-dom"

import Admin from "../../../../Layout/Admin"
import api from "../../../../Services/api"
import { Helmet } from "react-helmet-async"
import { sort_by } from "../../../../utils/sort_by"
import removeAccent from "../../../../utils/removeAccent"

import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaLongArrowAltDown, FaLongArrowAltUp, FaPencilAlt, FaPlusCircle, FaSearch, FaStore, FaStoreAlt, FaTrashAlt } from "react-icons/fa"
import { VscLoading } from "react-icons/vsc"
import { Alert } from "../../../../Components/Utils"
import { AlertReducer } from "../../../../Components/Utils/Alert"

import Franquia from "../../../../Types/Franquia"

import { useMessage } from "../../../../Hooks/Message"
import { useAuth } from "../../../../Hooks/Auth"

import AOS from "aos";
import DeletePopup from "../../../../Components/Pages/Popups/DeletePopup"
import EstabelecimentoPopup from "../../../../Components/Pages/Popups/Views/EstabelecimentoPopup"
AOS.init()

const Index = () => {
    const { cookies, user } = useAuth()

    const [franquias, setFranquias] = useState<Franquia[]>()

    const [loadDataStatus, setLoadDataStatus] = useState<"success" | "error" | "loading" | "initial">("initial")

    const { GetMessage } = useMessage()

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const [popup, setPopup] = useState<"delete" | "view">()

    const [filter, setFilter] = useState<{ search: string, perpage: number, page: number, orderBy: { field: "cidade" | "uf" | "nome", inverse: boolean } }>({ search: "", perpage: 10, page: 1, orderBy: { field: "cidade", inverse: false } })

    const [selectedFranquia, setSelectedFranquia] = useState<Franquia>()

    const LoadData = () => {
        setLoadDataStatus("loading")
        api.get("/api/admin/Estabelecimento/estabelecimento", { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(response => {
                setFranquias(response.data.data.map((franquia, index) => index === 0 ? { ...franquia, selected: true } : franquia));
                setLoadDataStatus("success")
            }).catch((err) => {
                console.error(err)
                setLoadDataStatus("error");
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao carregar estabelecimentos", type: "success" }], origin: "franquia-error" });
            });
    }

    const [deleteStatus, setDeleteStatus] = useState<"loading" | "success" | "error" | "initial">("initial")

    useEffect(() => {
        if (!popup) {
            setSelectedFranquia(undefined)
        }
    }, [popup])

    const DeleteFranquia = () => {
        if (deleteStatus === "loading") return;
        setDeleteStatus("loading")
        api.delete(`/api/admin/Estabelecimento/estabelecimento${selectedFranquia.id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(resp => {
                LoadData()
                setDeleteStatus("success")
                setPopup(undefined)
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Estabelecimento excluido com sucesso!", type: "success" }], origin: "franquia-success" });
            }).catch((err) => {
                console.error(err)
                setDeleteStatus("error")
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao excluir estabelecimento", type: "success" }], origin: "franquia-delete-error" });
            });
    }

    useEffect(() => {
        LoadData()
        GetMessage('/admin/cadastro/estabelecimento').then(messages => alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: messages.map(message => ({ message, type: "success" })), origin: "franquia-delete-error" }))
    }, [])

    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Cadastro de Estabelecimento</title>
            </Helmet>

            <DeletePopup message={`Confirmar exclusão de estabelecimento de ${selectedFranquia?.cidade}? Após confirmação não será possível desfazer essa ação.`}
                alerts={alerts["franquia-delete-error"]?.map(alert => alert.message)} status={deleteStatus} open={popup === "delete"} onCancel={() => setPopup(undefined)} onDelete={() => DeleteFranquia()} />

            <EstabelecimentoPopup open={popup === "view"} onClose={() => setPopup(undefined)} franquia={selectedFranquia} />

            <div className="container mx-auto p-2 lg:p-6 max-h-full overflow-auto">
                <h1 className="text-zinc-600 py-2 text-lg font-semibold sm:text-2xl">
                    <FaStore className="inline-block mr-1 mb-2" size={30} />
                    <span className="inline-block mx-1">Estabelecimentos</span>
                </h1>
                <div className="container bg-white shadow-lg shadow-zinc-500/10 mt-4">
                    <div className="p-4 gap-4 flex flex-col md:flex-row items-center justify-between border-b">
                        <h2 className="text-xl font-semibold text-zinc-600">Lista de estabelecimentos</h2>
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
                        <Link to="/admin/cadastro/estabelecimento/novo-estabelecimento" className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-800 text-white px-3 py-1 rounded"><FaPlusCircle /> Adicionar</Link>
                    </div>
                    <div className="px-4 pb-4">
                        {alerts["franquia-error"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {alerts["franquia-success"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {
                            loadDataStatus === "success" &&
                            <>
                                {franquias?.length > 0 &&
                                    (function () {
                                        const filtered_franquias = franquias?.filter(franquia =>
                                            removeAccent(franquia?.cidade ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(franquia?.uf ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(franquia?.telefone ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                            removeAccent(franquia?.endereco ?? "").toLowerCase().includes(filter?.search ?? ""))

                                        if (filtered_franquias?.length === 0) {
                                            return (
                                                <div className="text-center text-zinc-400">
                                                    <FaStoreAlt className="mx-auto" size={200} />
                                                    <span className="text-gray-500">Nenhum estabelecimento encontrado!</span>
                                                </div>
                                            )
                                        }

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
                                                            <th className="border border-zinc-300 px-2 py-3 w-24 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "nome" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "nome", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "nome", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center cursor-pointer px-2">Nome
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "nome" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "nome" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span>
                                                                </th>
                                                                <th className="border border-zinc-300 px-2 py-3 w-24 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "uf" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "uf", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "uf", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center cursor-pointer px-2">UF
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "uf" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "uf" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span>
                                                                </th>
                                                                <th className="border border-zinc-300 cursor-pointer px-2 w-36 text-center" onClick={() => {
                                                                    if (filter.orderBy.field === "cidade" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "cidade", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "cidade", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-between items-center px-2">Cidade
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "cidade" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "cidade" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th style={{ minWidth: "250px" }} className="border border-zinc-300 px-2 w-80 text-center">Endereço</th>
                                                                <th style={{ minWidth: "150px" }} className="border border-zinc-300 px-2 w-36 text-center">Telefone</th>
                                                                <th className="border border-zinc-300 px-2 w-32 text-center">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-zinc-600">
                                                            {
                                                                filtered_franquias.sort(sort_by(filter.orderBy.field, filter.orderBy.inverse, (a) => (a ?? "").toUpperCase())).filter((franquia, i) => {
                                                                    const initial = (filter.perpage * filter.page) - filter.perpage;
                                                                    return i >= initial && i < initial + filter.perpage;
                                                                }).map(franquia => {
                                                                    return (
                                                                        <tr key={franquia.linkCardapio}>
                                                                            <td className="border border-zinc-300 px-2 py-3">{franquia.nome}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{franquia.uf}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3 w-36">{franquia.cidade}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{franquia.endereco}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{franquia.telefone}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">
                                                                                <div className="text-white flex justify-center items-center gap-3">
                                                                                    <button onClick={() => { setSelectedFranquia(franquia); setPopup("view"); }} className="bg-teal-500 hover:bg-teal-600 rounded p-1"><FaSearch /></button>
                                                                                    {["Admin", "Proprietário"].includes(user.role) &&
                                                                                        <>
                                                                                            <Link to={`/admin/cadastro/estabelecimento/${franquia.linkCardapio}/editar`} className="bg-yellow-500 hover:bg-yellow-600 rounded p-1"><FaPencilAlt /></Link>
                                                                                            <button onClick={() => { setSelectedFranquia(franquia); setPopup("delete"); }} className="bg-red-500 hover:bg-red-600 rounded p-1"><FaTrashAlt /></button>
                                                                                        </>}

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
                                                    <button onClick={() => setFilter({ ...filter, page: 1 })} type="button" disabled={!(filter.page > 1)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleDoubleLeft /></button>
                                                    <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} disabled={!(filter.page > 1)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleLeft /></button>

                                                    {filter.page > 3 && <button onClick={() => setFilter({ ...filter, page: filter.page - 3 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 3}</button>}
                                                    {filter.page > 2 && <button onClick={() => setFilter({ ...filter, page: filter.page - 2 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 2}</button>}
                                                    {filter.page > 1 && <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 1}</button>}

                                                    {<button type="button" className="flex bg-zinc-400 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page}</button>}

                                                    {filter.page + 1 < (filtered_franquias.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 1}</button>}
                                                    {filter.page + 2 < (filtered_franquias.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 2 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 2}</button>}
                                                    {filter.page + 3 < (filtered_franquias.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 3 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 3}</button>}

                                                    <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" disabled={!(filter.page < filtered_franquias.length / filter.perpage)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleRight /></button>
                                                    <button onClick={() => setFilter({ ...filter, page: Math.ceil(filtered_franquias.length / filter.perpage) })} disabled={!(filter.page < filtered_franquias.length / filter.perpage)} type="button" className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleDoubleRight /></button>
                                                </div>
                                            </>
                                        )
                                    }())
                                }

                                {franquias?.length === 0 &&
                                    <div className="text-center text-zinc-400">
                                        <FaStoreAlt className="mx-auto" size={200} />
                                        <span className="text-gray-500">Nenhum estabelecimento adicionado!</span>
                                    </div>}
                            </>
                        }

                        {loadDataStatus === "loading" &&
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