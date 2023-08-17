import { useEffect, useReducer, useState } from "react"

import { useAuth } from "../../../Hooks/Auth"
import api from "../../../Services/api"
import Admin from "../../../Layout/Admin"

import { Helmet } from "react-helmet-async"
import Alert, { AlertReducer } from "../../../Components/Utils/Alert"
import FormIngredientePopup from "../../../Components/Pages/Popups/Forms/FormIngredientePopup"
import DeletePopup from "../../../Components/Pages/Popups/DeletePopup"

import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaListUl, FaLongArrowAltDown, FaLongArrowAltUp, FaPencilAlt, FaPlusCircle, FaSearch, FaTrashAlt } from "react-icons/fa"
import { VscLoading } from "react-icons/vsc"
import { MdFoodBank } from "react-icons/md"

import removeAccent from "../../../utils/removeAccent"
import { sort_by } from "../../../utils/sort_by"

import { Ingrediente } from "../../../Types/Ingrediente"

import { RequestReducer } from "../../../Hooks/RequestDataReducer"
import Franquia from "../../../Types/Franquia"
import { Status } from "../../../Types/Status"

const Index = () => {
    const { cookies, user } = useAuth()

    const [requestsData, RequestsDataDispatch] = useReducer(RequestReducer, {
        "ingredientes": {
            state: "initial",
            data: []
        },
        "deleteStatus": {
            state: "initial",
            data: []
        },
    });

    const [franquias, setFranquias] = useState<{ state: Status, data: Franquia[] }>({ state: "initial", data: [] })

    const [filter, setFilter] = useState<{ search: string, perpage: number, page: number, orderBy: { field: "nome" | "name", inverse: boolean } }>({ search: "", perpage: 10, page: 1, orderBy: { field: "nome", inverse: false } })
    const [filterFranquia, setFilterFranquia] = useState({ search: "", franquia: user?.franquiaId })
    const [popup, setPopup] = useState<"ingrediente" | "delete">()

    const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente>()

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const LoadIngredientes = async () => {
        if (requestsData["ingredientes"].state === "loading") return;

        RequestsDataDispatch({ reqURL: "ingredientes", requestData: { state: "loading", data: [] } })

        api.get(`/api/admin/Ingrediente/ingredientes${filterFranquia.franquia || franquias.data[0]?.id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } }).then(resp => {
            setFilter({ search: "", perpage: 10, page: 1, orderBy: { field: "nome", inverse: false } })
            RequestsDataDispatch({
                reqURL: "ingredientes",
                requestData: {
                    state: "success", data: resp.data.data?.map(ingrediente => ({
                        id: ingrediente?.id,
                        nome: ingrediente?.nomeIngrediente,
                        name: ingrediente?.nameIngredient,
                        descricao: ingrediente?.descricaoIngrediente,
                        estabelecimentoId: ingrediente?.estabelecimentoId
                    }))
                }
            })
        }).catch(err => {
            console.error(err)
            RequestsDataDispatch({ reqURL: "ingredientes", requestData: { state: "error", data: [] } })
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao carregar ingredientes", type: "error" }], origin: "loaddata-error" });
        })
    }

    const LoadData = async () => {
        setFranquias({ state: "loading", data: [] });

        await api.get("/api/admin/Estabelecimento/estabelecimento", { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(response => {
                setFranquias({
                    state: "success",
                    data: response.data.data?.map((franquia, index) => index === 0 ? { ...franquia, selected: true } : franquia)
                });
            }).catch((err) => {
                console.error(err)
                setFranquias({ state: "error", data: [] });
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Erro ao carregar franquias", type: "error" }], origin: "loadata-error" });
            });
    }

    useEffect(() => {
        if (!filterFranquia.franquia && franquias.state === "success" && !["Franqueado", "Funcionário"].includes(user?.role))
            setFilterFranquia({ ...filter, franquia: franquias.data[0]?.id })
        if (franquias.state === "success")
            LoadIngredientes();
    }, [filterFranquia.franquia, franquias]);

    const DeleteIngrediente = () => {
        if (requestsData["deleteStatus"].state === "loading") return;
        RequestsDataDispatch({ reqURL: "deleteStatus", requestData: { state: "loading" } })
        api.delete(`/api/admin/Ingrediente/ingrediente${selectedIngrediente.id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } }).then(resp => {
            setPopup(undefined)
            RequestsDataDispatch({ reqURL: "deleteStatus", requestData: { state: "success" } })
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: resp.data.mensagem || "Ingrediente excluido com sucesso!", type: "success" }], origin: "ingrediente-success" });
            LoadData()
        }).catch((err) => {
            console.error(err)
            RequestsDataDispatch({ reqURL: "deleteStatus", requestData: { state: "error" } })
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: typeof err.response.data === "string" ? err.response.data : "Erro ao excluir ingrediente", type: "error" }], origin: "ingrediente-error" });
        });
    }

    useEffect(() => {
        if (!popup) {
            setSelectedIngrediente(undefined)
            alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "ingrediente-error" });
        }
    }, [popup]);

    useEffect(() => {
        LoadData();
    }, []);

    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Cadastro de Ingredientes</title>
            </Helmet>

            <FormIngredientePopup
                onSuccess={() => { alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Ingrediente ${selectedIngrediente?.id ? "alterado" : "adicionado"} com sucesso!`, type: "success" }], origin: "ingrediente-success" }); LoadData(); }}
                open={popup === "ingrediente"}
                onClose={() => { setPopup(undefined) }}
                ingrediente={selectedIngrediente}
                estabelecimentoId={filterFranquia.franquia || franquias.data[0]?.id || 0}
            />

            <DeletePopup message={`Confirmar exclusão do ingrediente ${selectedIngrediente?.nome}? Após confirmação não será possível desfazer essa ação.`}
                alerts={alerts["ingrediente-error"]?.map(alert => alert.message)} status={requestsData["deleteStatus"]} open={popup === "delete"} onCancel={() => setPopup(undefined)} onDelete={() => DeleteIngrediente()} />

            <div className="container p-2 lg:p-6 mx-auto">
                <h1 className="text-zinc-600 py-2 text-lg font-semibold sm:text-2xl">
                    <FaListUl className="inline-block mr-1 mb-2" size={30} />
                    <span className="inline-block mx-1">Ingredientes</span>
                </h1>
                <div className="bg-white mt-4 shadow shadow-zinc-500/10">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <h2 className="text-xl font-semibold text-zinc-600">Lista de ingredientes</h2>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex items-center h-7">
                                <input type="text" onChange={evt => setFilter({ ...filter, search: removeAccent(evt.currentTarget.value.toLowerCase()), page: 1 })} className="outline-none h-full w-full rounded-l pl-2 border" placeholder="Procurar" />
                                <button type="submit" className="relative h-full text-white bg-zinc-700 hover:bg-zinc-800 p-1.5 rounded-r">
                                    <FaSearch />
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-start justify-between">
                        <button onClick={() => setPopup("ingrediente")} className="flex items-center text-white bg-zinc-700 hover:bg-zinc-800 px-3 py-1 gap-2 rounded"><FaPlusCircle /> Adicionar Ingrediente</button>
                    </div>
                    <div className="px-4 pb-4">
                        {franquias !== undefined &&
                            <select onChange={(evt) => setFilterFranquia({ ...filter, franquia: Number(evt.currentTarget.value) })} disabled={["Franqueado", "Funcionário"].includes(user?.role)} value={filterFranquia.franquia} className="form-select px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none">
                                {
                                    franquias?.data.map(franquia => <option key={franquia.linkCardapio} value={franquia.id}>{franquia.nome}</option>)
                                }
                            </select>
                        }
                        {alerts["loaddata-error"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {requestsData["ingredientes"].state === "success" &&
                            (function () {
                                const filtered_ingredientes = requestsData["ingredientes"].data?.filter(ingrediente =>
                                    removeAccent(ingrediente?.nome ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                    removeAccent(ingrediente?.name ?? "").toLowerCase().includes(filter?.search ?? "") ||
                                    removeAccent(ingrediente?.descricao ?? "").toLowerCase().includes(filter?.search ?? "")
                                ).sort(sort_by(filter.orderBy.field, filter.orderBy.inverse, (a) => (a ?? "").toUpperCase()))

                                return (
                                    <div className="px-1">
                                        <div className="overflow-x-auto">
                                            {filtered_ingredientes.length > 0 ?
                                                <>
                                                    <div className="py-2 text-gray-700 flex items-center gap-2">
                                                        <label htmlFor="">Por página:</label>
                                                        <input onChange={evt => setFilter({ ...filter, perpage: Number(evt.currentTarget.value) < 2 ? 2 : Number(evt.currentTarget.value) })} value={filter.perpage} className="pl-2 w-16 border text-gray-700" type="number" />
                                                    </div>
                                                    <table className="table-auto w-full text-center">
                                                        <thead className="font-semibold bg-zinc-100 text-zinc-700 text-left">
                                                            <tr>
                                                                <th className="border border-zinc-300 px-2 w-52 py-3" onClick={() => {
                                                                    if (filter.orderBy.field === "nome" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "nome", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "nome", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-center gap-3 items-center cursor-pointer px-2">Nome
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "nome" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "nome" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 w-52 cursor-pointer px-2" onClick={() => {
                                                                    if (filter.orderBy.field === "name" && filter.orderBy.inverse)
                                                                        setFilter({ ...filter, orderBy: { field: "name", inverse: false } })
                                                                    else
                                                                        setFilter({ ...filter, orderBy: { field: "name", inverse: true } })
                                                                }}>
                                                                    <span className="flex justify-center gap-3 items-center px-2">Name
                                                                        <span className="flex -space-x-2 text-zinc-400">
                                                                            <FaLongArrowAltDown className={`${filter.orderBy.field === "name" && filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                            <FaLongArrowAltUp className={`${filter.orderBy.field === "name" && !filter.orderBy.inverse && "text-zinc-600"}`} />
                                                                        </span>
                                                                    </span></th>
                                                                <th className="border border-zinc-300 text-center px-2">Descrição</th>
                                                                <th className="border border-zinc-300 px-2 w-24">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-zinc-600">
                                                            {
                                                                filtered_ingredientes.filter((ingrediente, i) => {
                                                                    const initial = (filter.perpage * filter.page) - filter.perpage;
                                                                    return i >= initial && i < initial + filter.perpage;
                                                                }).map(ingrediente => {
                                                                    return (
                                                                        <tr key={ingrediente.id + ingrediente.name}>
                                                                            <td className="border border-zinc-300 px-2 py-3">{ingrediente.nome}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{ingrediente.name}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">{ingrediente.descricao}</td>
                                                                            <td className="border border-zinc-300 px-2 py-3">
                                                                                <div className="text-white flex items-center justify-center gap-3">
                                                                                    {/* <button className="bg-teal-500 hover:bg-teal-600 rounded p-1"><FaSearch /></button> */}
                                                                                    <button onClick={() => { setSelectedIngrediente(ingrediente); setPopup("ingrediente"); }} className="bg-yellow-500 hover:bg-yellow-600 rounded p-1"><FaPencilAlt /></button>
                                                                                    <button onClick={() => { setSelectedIngrediente(ingrediente); setPopup("delete"); }} className="bg-red-500 hover:bg-red-600 rounded p-1"><FaTrashAlt /></button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </tbody>
                                                    </table>
                                                    <div className="flex flex-wrap gap-2 py-4">
                                                        <button onClick={() => setFilter({ ...filter, page: 1 })} type="button" disabled={!(filter.page > 1)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleDoubleLeft /></button>
                                                        <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} disabled={!(filter.page > 1)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleLeft /></button>

                                                        {filter.page > 3 && <button onClick={() => setFilter({ ...filter, page: filter.page - 3 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 3}</button>}
                                                        {filter.page > 2 && <button onClick={() => setFilter({ ...filter, page: filter.page - 2 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 2}</button>}
                                                        {filter.page > 1 && <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page - 1}</button>}

                                                        {<button type="button" className="flex bg-zinc-400 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page}</button>}

                                                        {filter.page + 1 < (filtered_ingredientes.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 1}</button>}
                                                        {filter.page + 2 < (filtered_ingredientes.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 2 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 2}</button>}
                                                        {filter.page + 3 < (filtered_ingredientes.length / filter.perpage) + 1 && <button onClick={() => setFilter({ ...filter, page: filter.page + 3 })} type="button" className="flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2">{filter.page + 3}</button>}

                                                        <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} type="button" disabled={!(filter.page < filtered_ingredientes.length / filter.perpage)} className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleRight /></button>
                                                        <button onClick={() => setFilter({ ...filter, page: Math.ceil(filtered_ingredientes.length / filter.perpage) })} disabled={!(filter.page < filtered_ingredientes.length / filter.perpage)} type="button" className="disabled:opacity-50 flex bg-zinc-200 text-gray-700 rounded items-center gap-2 px-4 py-2"><FaAngleDoubleRight /></button>
                                                    </div>
                                                </>
                                                : <div className="text-center text-zinc-400 py-6">
                                                    <MdFoodBank className="mx-auto" size={200} />
                                                    <span className="text-gray-500">Nenhum ingrediente encontrado.</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )
                            }())
                        }
                        {requestsData["ingredientes"].state == "loading" &&
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