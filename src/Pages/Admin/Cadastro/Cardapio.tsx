import { useEffect, useReducer, useState } from "react"
import { useAuth } from "../../../Hooks/Auth"

import { Helmet } from "react-helmet-async"
import removeAccent from "../../../utils/removeAccent"
import api from "../../../Services/api"
import Admin from "../../../Layout/Admin"

import { FaAngleDown, FaAngleUp, FaPencilAlt, FaPlusCircle, FaSearch, FaTrashAlt } from "react-icons/fa"
import { BiCategory, BiPencil } from "react-icons/bi"
import { VscLoading } from "react-icons/vsc"
import { MdOutlineMenuBook } from "react-icons/md"

import Produto, { Categoria } from "../../../Types/Produto"
import Franquia from "../../../Types/Franquia"
import { Status } from "../../../Types/Status"
import { Alert, Collapse } from "../../../Components/Utils"
import { AlertReducer } from "../../../Components/Utils/Alert"

import FormCategoriaPopup from "../../../Components/Pages/Popups/Forms/FormCategoriaPopup"
import FormProdutoPopup from "../../../Components/Pages/Popups/Forms/FormProdutoPopup"
import ProdutoPopup from "../../../Components/Pages/Popups/Views/ProdutoPopup"
import DeletePopup from "../../../Components/Pages/Popups/DeletePopup"

const Index = () => {
    const { cookies, user } = useAuth()

    const [produtosCategoria, setProdutosCategoria] = useState<{ state: Status, data: { categoria: Categoria, produtos: Produto[] }[] }>({ state: "initial", data: [] })

    const [franquias, setFranquias] = useState<{ state: Status, data: Franquia[] }>({ state: "initial", data: [] })

    const [selectedProduto, setSelectedProduto] = useState<Produto>()
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria>()

    const [filter, setFilter] = useState({ search: "", franquia: user?.franquiaId })

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const [popup, setPopup] = useState<"produto-form" | "categoria-form" | "delete" | "view">()

    useEffect(() => {
        if (!popup) {
            setSelectedCategoria(undefined)
            setSelectedProduto(undefined)
            alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "produto-error" });
        }
    }, [popup])

    const [deleteStatus, setDeleteStatus] = useState<Status>("initial")

    const [collapses, setCollapses] = useState<boolean[]>([])

    const DeleteProduct = () => {
        if (deleteStatus === "loading") return;
        setDeleteStatus("loading");

        api.delete(`/api/admin/Cardapio/produto${selectedProduto?.id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` }, })
            .then(response => {
                setPopup(undefined)
                setDeleteStatus("success");
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: "Produto excluido com sucesso!", type: "success" }], origin: "produto-success" });
                LoadProducts()
            }).catch((err) => {
                console.error(err)
                setDeleteStatus("error");
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: "Erro ao excluir produto", type: "error" }], origin: "ingrediente-error" });
            });
    }

    const LoadProducts = async () => {
        if (produtosCategoria.state === "loading") return;
        setProdutosCategoria({ state: "loading", data: [] })

        try {
            let produtosCategoria: { categoria: Categoria, produtos: Produto[] }[] = await api.get(`/api/admin/Cardapio/cardapio${filter.franquia || franquias.data[0]?.id}`, {
                headers: { Authorization: `Bearer ${cookies.authentication}` }
            })
                .then(response => response.data.data?.map(produtosCategoria => {
                    return {
                        categoria: {
                            id: produtosCategoria.idCategoria,
                            descricao: produtosCategoria.nomeCategoria,
                            description: produtosCategoria.categoryName,
                            imagemFiltro: produtosCategoria.imagemFiltro
                        },
                        produtos: produtosCategoria.lstProdutosEstabelecimento.map(produto => {
                            return {
                                id: produto.id,
                                nome: produto.nomeProduto,
                                linkCardapio: franquias.data[0]?.linkCardapio,
                                descricao: produto.descricaoProduto,
                                description: produto.productDescription,
                                imagem: produto.imagemProduto,
                                valor: produto.valor,
                                valorPromocional: produto.valorPromocional,
                                ativo: produto.ativo,
                                categoria: {
                                    id: produtosCategoria.idCategoria,
                                    descricao: produtosCategoria.nomeCategoria
                                },
                                produtoEstabelecimentoId: produto.produtoEstabelecimentoId
                            }
                        })
                    }
                }))
            setCollapses(produtosCategoria.map(() => false))
            setProdutosCategoria({ state: "success", data: produtosCategoria })
        } catch (err) {
            console.error(err);
            setProdutosCategoria({ state: "error", data: [] })
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: "Erro ao carregar produtos", type: "error" }], origin: "loadata-error" });
        }
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
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: "Erro ao carregar franquias", type: "error" }], origin: "loadata-error" });
            });
    }

    useEffect(() => {
        if (!filter.franquia && franquias.state === "success" && !["Franqueado", "Funcionário"].includes(user?.role))
            setFilter({ ...filter, franquia: franquias.data[0]?.id })
        if (franquias.state === "success")
            LoadProducts();
    }, [filter.franquia, franquias]);

    useEffect(() => {
        LoadData();
    }, []);

    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Cadastro do Cardápio</title>
            </Helmet>

            <FormCategoriaPopup
                open={popup === "categoria-form"}
                onClose={() => setPopup(undefined)}
                onSuccess={() => { alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: `Categoria ${selectedCategoria?.id ? "editada" : "criada"} com sucesso!`, type: "success" }], origin: "categoria-success" }); LoadProducts() }}
                franquiaId={filter.franquia}
                categoria={selectedCategoria} />

            <ProdutoPopup
                open={popup === "view"}
                onClose={() => setPopup(undefined)}
                idFranquia={filter.franquia}
                produto={selectedProduto} />

            <FormProdutoPopup
                key={selectedCategoria?.id || 'default-key'}
                open={popup === "produto-form"}
                onClose={() => setPopup(undefined)}
                onSuccess={() => { alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{message: `Produto ${selectedCategoria?.id ? "editado" : "criado"} com sucesso!`  , type: "success" }], origin: "produto-success" }); LoadProducts(); }}
                categorias={produtosCategoria.data.map(produtoscategoria => ({ id: produtoscategoria?.categoria?.id, descricao: produtoscategoria?.categoria?.descricao, exibirCardapio: produtoscategoria?.categoria?.exibirCardapio }))}
                franquiaId={filter.franquia}
                produto={selectedProduto} />

            <DeletePopup message={`Confirmar exclusão do produto ${selectedProduto?.nome}? Após confirmação não será possível desfazer essa ação.`}
                alerts={alerts["produto-error"]?.map(alert => alert.message)} status={deleteStatus} open={popup === "delete"} onCancel={() => setPopup(undefined)} onDelete={() => DeleteProduct()} />

            <div className="container p-2 lg:p-6 mx-auto">
                <h1 className="text-zinc-600 py-2 text-lg font-semibold sm:text-2xl">
                    <MdOutlineMenuBook className="inline-block mr-1 mb-2" size={30} />
                    <span className="inline-block mx-1">Cardápio</span>
                </h1>
                <div className="bg-white mt-4 shadow shadow-zinc-500/10">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <h2 className="text-xl font-semibold text-zinc-600">Lista de cardápios</h2>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex items-center h-7">
                                <input type="text" onChange={evt => setFilter({ ...filter, search: removeAccent(evt.currentTarget.value.toUpperCase()) })} className="outline-none h-full w-full pl-1 rounded-l pl-2 border" placeholder="Procurar" />
                                <button type="submit" className="relative h-full text-white bg-zinc-700 hover:bg-zinc-800 p-1.5 rounded-r">
                                    <FaSearch />
                                </button>
                            </div>
                            {/* <button className="flex items-center text-white bg-zinc-700 hover:bg-zinc-800 px-2 py-0.5 gap-2 rounded"><FaSearchPlus /> Busca Avançada</button> */}
                        </div>
                    </div>
                    <hr />
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-start justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setPopup("categoria-form") }} className="flex items-center text-white bg-zinc-700 hover:bg-zinc-800 px-3 py-1 gap-2 rounded"><FaPlusCircle /> Adicionar Categoria</button>
                        </div>
                        {franquias !== undefined &&
                            <select onChange={(evt) => setFilter({ ...filter, franquia: Number(evt.currentTarget.value) })} disabled={["Franqueado", "Funcionário"].includes(user?.role)} value={filter.franquia} className="form-select px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none">
                                {
                                    franquias?.data.map(franquia => <option key={franquia.linkCardapio} value={franquia.linkCardapio}>{franquia.nome}</option>)
                                }
                            </select>
                        }
                    </div>
                    <div className="px-4 pb-2">
                        {alerts["loaddata-error"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {alerts["produto-success"]?.map(alert => <Alert key={alert.message} message={alert.message} type={alert.type} />)}
                        {produtosCategoria.state === "success" &&
                            <>
                                {produtosCategoria?.data.map((produtoCategoria, index) => {
                                    return (
                                        <div key={produtoCategoria.categoria.id + produtoCategoria.categoria.descricao} className="border w-full my-4">
                                            <Collapse CollapseClass="collapsed" toggleClass="max-h-0" collapsed={collapses[index]}>
                                                <div onClick={() => setCollapses(collapses.map((c, i) => i === index ? !c : c))} className="bg-gray-100 text-gray-800 text-lg font-semibold p-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <span><button onClick={() => { setPopup("categoria-form"); setTimeout(() => setCollapses(collapses), 1); setSelectedCategoria(produtoCategoria.categoria); }} className="flex items-center gap-2">{produtoCategoria.categoria.descricao}<BiPencil /></button></span>
                                                            <button onClick={() => { setPopup("produto-form"); setTimeout(() => setCollapses(collapses), 1); }} className="px-2 py-1 rounded text-sky-600 hover:text-sky-800 underline text-sm pt-2">Adicionar Produto</button>
                                                        </div>
                                                        <span className="px-3">{collapses[index] ? <FaAngleDown /> : <FaAngleUp />}</span>
                                                    </div>
                                                </div>
                                                <div className={`collapsed overflow-auto`}>
                                                    {produtoCategoria.produtos?.filter(produto => removeAccent(produto?.nome ?? "").toUpperCase().includes(filter?.search ?? "") ||
                                                        removeAccent(produto?.description ?? "").toUpperCase().includes(filter?.search ?? "") ||
                                                        removeAccent(produto?.descricao ?? "").toUpperCase().includes(filter?.search ?? "")).map(produto => {
                                                            return (
                                                                <div key={produto.id + produto.nome}>
                                                                    <hr />
                                                                    <div className="flex items-center flex-col md:flex-row p-3 justify-between">
                                                                        <div className="grow gap-2 flex flex-col lg:flex-row items-center">
                                                                            <div className="shrink-0">
                                                                                {produto?.imagem &&
                                                                                    <img onLoad={evt => {
                                                                                        let toggle = evt.currentTarget.naturalWidth > evt.currentTarget.naturalHeight * 1.5
                                                                                        evt.currentTarget.classList.toggle("object-cover", toggle)
                                                                                        evt.currentTarget.classList.toggle("h-32", toggle)
                                                                                        evt.currentTarget.classList.toggle("object-contain", !toggle)
                                                                                    }} className='rounded sm:w-32 mx-auto' onError={(evt) => evt.currentTarget.remove()} src={produto.imagem} alt={produto?.nome} />
                                                                                }
                                                                                {(produto?.valorPromocional || 0) > 0 &&
                                                                                    <span className='bg-custom-orange px-2 py-1 text-white font-extrabold relative -top-4'>Promoção</span>
                                                                                }
                                                                            </div>
                                                                            <div className='pt-4 sm:pt-0 mr-2'>
                                                                                <h3 className="text-center sm:text-left text-2xl font-semibold text-gray-800 w-full">{produto?.nome.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") ?? ""}</h3>
                                                                                <p className="font-thin text-gray-600 my-2">{produto.descricao}</p>
                                                                                {(produto?.valorPromocional || 0) > 0 &&
                                                                                    <p className="text-zinc-600 font-semibold text-sm text-center sm:text-left"><s>R$ {produto?.valor?.toFixed(2).toString().replace(".", ",")}</s></p>
                                                                                }
                                                                                <p className="text-custom-orange text-2xl font-bold md:text-lg text-center sm:text-left">R$ {((produto?.valorPromocional || 0) > 0 ? produto?.valorPromocional : produto?.valor)?.toFixed(2).toString().replace(".", ",")}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mx-4 flex items-center gap-2 justify-end text-white">
                                                                            <button className="px-2 py-1 bg-teal-500 hover:bg-teal-600 rounded flex items-center gap-2" onClick={() => { setSelectedProduto(produto); setPopup("view") }}><FaSearch /> Detalhes</button>
                                                                            <button className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 rounded flex items-center gap-2" onClick={() => { setSelectedProduto(produto); setPopup("produto-form") }}><FaPencilAlt /> Editar</button>
                                                                            <button className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded flex items-center gap-2" onClick={() => { setSelectedProduto(produto); setPopup("delete") }}><FaTrashAlt /> Apagar</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </Collapse>
                                        </div>
                                    )
                                })}
                                {produtosCategoria.data.length === 0 &&
                                    <div className="text-center text-zinc-400">
                                        <BiCategory className="mx-auto" size={200} />
                                        <span className="text-gray-500">Nenhuma categoria cadastrada!</span>
                                    </div>}
                            </>
                        }

                        {(produtosCategoria.state === "loading" || franquias.state === "loading") &&
                            <div className="container mx-auto my-6">
                                <VscLoading size={30} className='mx-auto animate-spin' />
                            </div>}

                    </div>
                </div>
            </div>
        </Admin>
    )
}

export default Index