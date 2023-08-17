import React, { useState, useEffect, useReducer } from 'react';
import { Link, useParams } from 'react-router-dom';

import moment from 'moment';
import 'moment/locale/pt-br';

import rmAccent from '../../utils/removeAccent';
import api, { ResponseHandler } from '../../Services/api';

import { useCart } from '../../Hooks/Cart';
import ProdutoCarrinho from '../../Components/Pages/Popups/ProdutoCarrinho';
import ModalCardapio from '../../Components/Pages/Popups/ModalCardapio';
import { Helmet } from 'react-helmet-async';

import { FaMapMarkerAlt, FaPlus, FaRegClock, FaSearch, FaShoppingCart, FaWindowClose } from "react-icons/fa"
import { VscLoading } from 'react-icons/vsc';

import Franquia from '../../Types/Franquia';
import Produto, { Categoria } from '../../Types/Produto';

import './Cardapio.css';

import { Alert, Outclick } from '../../Components/Utils';

import { AlertReducer } from '../../Components/Utils/Alert';
import { RequestReducer } from '../../Hooks/RequestDataReducer';

import AOS from "aos";

AOS.init()

export type ModalInfo = { produtoId?: Number, index?: number }

type MyProps = {
    lang: "pt_BR" | "en_US"
}

const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function App({ lang }: MyProps) {
    const [displayCart, setDisplayCart] = useState<Boolean>()

    const [selectedProduct, setSelectedProduct] = useState<{ id: number, cartIndex?: number }>()

    const [requestsData, RequestsDataDispatch] = useReducer(RequestReducer, {
        "produtosCategoria": {
            state: "initial",
            data: []
        },
        "franquia": {
            state: "initial",
            data: {}
        }
    });

    const [filter, setFilter] = useState<{ categoria?: string, search?: string }>({})

    const { link } = useParams()

    const { cart, LoadCart, AddProduct } = useCart()

    const [showHorarios, setShowHorarios] = useState<boolean>(false)

    const [horarios, setHorarios] = useState<{
        diaInicio?: string;
        diaFim?: string,
        horaInicio?: string,
        horaFim?: string
    }[]>()

    const [isOpened, setIsOpened] = useState<Boolean>()

    const [popup, setPopup] = useState<"produto" | "">()

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const LoadData = async () => {
        let franquia
        RequestsDataDispatch({ reqURL: "produtosCategoria", requestData: { state: "loading", data: [] } })
        RequestsDataDispatch({ reqURL: "franquia", requestData: { state: "loading" } })

        try {
            franquia = await api.get(`/api/Navegacao/estabelecimento${link}`)
                .then(response => {
                    ResponseHandler(response.data).then(alert => {
                        ["sucess"].includes(alert.alertType) ??
                            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: alert.message, type: alert.alertType }] })
                    })
                    return response.data.data
                }).catch(err => {
                    RequestsDataDispatch({ reqURL: "franquia", requestData: { state: "error" } })
                })

                RequestsDataDispatch({ reqURL: "franquia", requestData: { state: "success", data: franquia } })

            await api.get(`/api/Navegacao/cardapio${franquia?.id}`)
                .then(response => {
                    ResponseHandler(response.data).then(alert => {
                        ["sucess"].includes(alert.alertType) ??
                            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: alert.message, type: alert.alertType }] })
                    })
                    RequestsDataDispatch({
                        reqURL: "produtosCategoria",
                        requestData: {
                            state: 'success',
                            data: response.data.data?.map(produtosCategoria => {
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
                                            descricao: produto.descricaoProduto,
                                            description: produto.productDescription,
                                            imagem: produto.imagemProduto,
                                            valor: produto.valor,
                                            valorPromocional: produto?.valorPromocional
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
        } catch (err) {
            RequestsDataDispatch({ reqURL: "produtosCategoria", requestData: { state: "error", data: [] } });
            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: "Ocorreu um erro ao carregar dados do estabelecimento", type: 'error' }] });
            console.error(err);
        }

        api.get(`/api/Navegacao/horario-funcionamento${franquia?.id}`)
            .then(resp => {
                ResponseHandler(resp.data).then(alert => {
                    ["sucess"].includes(alert.alertType) ??
                        alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: alert.message, type: alert.alertType }] })
                })
                let isOpened = false;
                let horarios = resp.data.data.map(diaEHrario => {
                    let horaInicio = diaEHrario.horaInicio.split(":").map(e => Number(e))
                    let horaFim = diaEHrario.horaFim.split(":").map(e => Number(e))

                    let now = moment()

                    let dateTimeInicio = moment(now.format("YYYY-MM-DD")).set({ "hour": horaInicio[0], "minute": horaInicio[1] }).day(daysArray.indexOf(diaEHrario.diaInicio))
                    let dateTimeFim = moment(dateTimeInicio.format("YYYY-MM-DD")).set({ "hour": horaFim[0], "minute": horaFim[1] }).day(daysArray.indexOf(diaEHrario.diaFim))

                    if (now.isBetween(dateTimeInicio, dateTimeFim))
                        isOpened = true

                    return {
                        diaInicio: diaEHrario.diaInicio,
                        diaFim: diaEHrario.diaFim,
                        horaInicio: diaEHrario.horaInicio,
                        horaFim: diaEHrario.horaFim
                    }
                })
                setHorarios(horarios)
                setIsOpened(isOpened)
            })
    }

    const [meta, setMeta] = useState<{ title: string, description: string, keywords: string }>({
        title: {
            "pt_BR": `Ranguinho - Cardápio`,
            "en_US": `Ranguinho - Menu`
        }[lang],
        description: {
            "pt_BR": `O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida.`,
            "en_US": ``
        }[lang],
        keywords: {
            "pt_BR": `Ranguinho, Hamburgueria, Hamburguer, Hamburgueres, Comida, Lanches, Cardápio, Interior de São Paulo`,
            "en_US": ``
        }[lang]
    })


    useEffect(() => {
        setMeta({
            title: {
                "pt_BR": `Ranguinho - Cardápio ${requestsData["franquia"].data?.cidade || ""}`,
                "en_US": `Ranguinho - Menu ${requestsData["franquia"].data?.cidade || ""}`
            }[lang],
            description: {
                "pt_BR": `O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida.`,
                "en_US": ``
            }[lang],
            keywords: {
                "pt_BR": `Ranguinho, ${requestsData["franquia"].data?.cidade ? requestsData["franquia"].data?.cidade + ", " : ""}Hamburgueria, Hamburguer, Hamburgueres, Comida, Lanches, Cardápio, Interior de São Paulo`,
                "en_US": `Ranguinho, ${requestsData["franquia"].data?.cidade ? requestsData["franquia"].data?.cidade + ", " : ""}, Hamburguer, Food, Lunch, Menu, São Paulo contryside`
            }[lang]
        })
        if (requestsData["franquia"].data?.id)
            LoadCart(requestsData["franquia"].data?.id)
        if (requestsData["franquia"].state === "initial")
            LoadData();
    }, [requestsData["franquia"], lang]);

    const [dropdownLanguages, setDropdownLanguages] = useState<boolean>(false)

    const [navCategoriesReact, setNavCategoriesReact] = useState<number>(1)

    useEffect(() => {
        window.addEventListener('scroll', () => {
            setNavCategoriesReact(document.querySelector("#sticky-nav")?.getBoundingClientRect()?.top)
        })
    }, [])

    return (
        <>
            <Helmet>
                <html lang={{ "pt_BR": "pt-BR", "en_US": "en" }[lang]} />
                <title>{meta.title}</title>
                <meta name="title" content={meta.title} />
                <meta name="description" content={meta.description} />
                <meta name="image" content={requestsData["franquia"].data?.logo || "/assets/imagens/logos/ranguinho/07.png"} />
                <meta name="keywords" content={meta.keywords} />

                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:image" content={requestsData["franquia"].data?.logo || "/assets/imagens/logos/ranguinho/07.png"} />
                <meta property="og:url" content={window.location.host + window.location.pathname} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content={lang} />

                <meta name="twitter:title" content={meta.title} />
                <meta name="twitter:description" content={meta.description} />
                <meta name="twitter:image" content={requestsData["franquia"].data?.logo || "/assets/imagens/logos/ranguinho/07.png"} />
            </Helmet>

            {popup === "produto" &&
                <>
                    <ModalCardapio
                        lang={lang}
                        idProduto={selectedProduct.id}
                        cartIndex={selectedProduct.cartIndex}
                        CloseCallback={() => { setPopup(""); document.querySelector("body").style.overflow = "auto"; }}
                        idFranquia={requestsData["franquia"].data.id}
                    />
                </>
            }

            <header className="relative w-full header h-screen">
                <img className="w-full h-full z-10 absolute object-cover" src="/assets/imagens/capaCardapio.jpg" />
                <nav className="relative z-30 top-10">
                    <div className="container px-5 sm:mx-auto flex flex-wrap gap-2 justify-between items-center">
                        <div className=''>
                            <Outclick callback={() => setShowHorarios(false)}>
                                <span onClick={() => setShowHorarios(!showHorarios)} className={`cursor-pointer flex gap-2 items-center bg-white py-2 px-4 rounded-2xl font-semibold ${isOpened === true &&
                                    "text-green-700 hover:text-green-800"
                                    } ${isOpened === false && "text-red-700 hover:text-red-800"}`}>
                                    <FaRegClock size={20} />
                                    {isOpened === undefined &&
                                        <VscLoading size={20} className='mx-4 animate-spin' />}
                                    {isOpened === true &&
                                        { "pt_BR": "Estamos abertos", "en_US": "We are opened" }[lang]
                                    }
                                    {isOpened === false &&
                                        { "pt_BR": "Estamos fechados", "en_US": "We are closed" }[lang]
                                    }
                                </span>

                                {showHorarios == true &&

                                    <div data-aos="fade-up" className='bg-white py-2 px-3 rounded absolute mt-2 shadow-lg'>
                                        {
                                            isOpened !== undefined && [
                                                { "pt_BR": "Segunda-Feira", "en_US": "Monday" },
                                                { "pt_BR": "Terça-feira", "en_US": "Tuesday" },
                                                { "pt_BR": "Quarta-feira", "en_US": "Wednesday" },
                                                { "pt_BR": "Quinta-feira", "en_US": "Thursday" },
                                                { "pt_BR": "Sexta-feira", "en_US": "Friday" },
                                                { "pt_BR": "Sábado", "en_US": "Saturday" },
                                                { "pt_BR": "Domingo", "en_US": "Sunday" }
                                            ]
                                                .map((dia, index) => {
                                                    let diaHorarios = horarios?.filter(horario => horario.diaInicio === dia.pt_BR)
                                                    return (
                                                        <div className='flex justify-between gap-8 py-1' key={dia.en_US}>
                                                            <span className='text-gsray-800'>
                                                                {dia[lang]}
                                                            </span>

                                                            {diaHorarios?.length > 0 ?
                                                                <span className='text-green-700 font-semibold'>
                                                                    {
                                                                        {
                                                                            "pt_BR": `${diaHorarios[0]?.horaInicio} às ${diaHorarios[0]?.horaFim}`,
                                                                            "en_US": `${diaHorarios[0]?.horaInicio} to ${diaHorarios[0]?.horaFim}`,
                                                                        }[lang]
                                                                    }
                                                                </span> :
                                                                <span className='text-red-700 font-semibold'>
                                                                    {{ "pt_BR": "fechado", "en_US": "closed" }[lang]}
                                                                </span>
                                                            }
                                                        </div>

                                                    )
                                                })
                                        }
                                        {isOpened === undefined &&
                                            <VscLoading size={20} className='mx-4 animate-spin' />}
                                    </div>
                                }
                            </Outclick>
                        </div>
                        <div className='bg-white rounded w-16'>
                            <Outclick callback={() => setDropdownLanguages(false)}>
                                <span onClick={() => setDropdownLanguages(true)}>
                                    {{
                                        "pt_BR": <img className='p-2' src="/assets/imagens/brazil.png" alt={{ "pt_BR": "Bandeira do Brasil", "en_US": "Brazil Flag" }[lang]} />,
                                        "en_US": <img className='p-2' src="/assets/imagens/usa.png" alt={{ "pt_BR": "Bandeira do Estados nidos", "en_US": "USA Flag" }[lang]} />
                                    }[lang]}
                                </span>
                                {dropdownLanguages &&
                                    <div className='absolute bg-white rounded mt-1 w-16 border flex flex-col'>
                                        {["pt_BR", "en_US"].filter(myLang => myLang !== lang).map(myLang => {
                                            return (
                                                <Link key={myLang} to={window.location.pathname.split("/").filter(sublink => !(["pt-BR", "en-US"].includes(sublink))).join("/") + "/" + myLang.replace("_", "-")} onClick={() => setDropdownLanguages(false)} className='hover:bg-gray-100 w-full p-2 rounded'>
                                                    <img className='' src={"/assets/imagens/" + { "pt_BR": "brazil.png", "en_US": "usa.png" }[myLang]} alt={{ "pt_BR": "Bandeira do Brasil", "en_US": "Brazil Flag" }[myLang]} />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                }
                            </Outclick>
                        </div>
                    </div>
                </nav >

                <div className='absolute h-full w-full z-20 bottom-0'>
                    <div data-aos="zoom-in" className='h-full justify-end sm:justify-center pb-6 sm:pb-0 flex flex-col px-5'>
                        <img className='mx-auto' src={(requestsData["franquia"].data?.logo?.length > 0) ? requestsData["franquia"].data?.logo : "/assets/imagens/logos/ranguinho/05.png"} alt="logo ranguinho" />
                        {requestsData["franquia"].data?.endereco &&
                            <span className='justify-center gap-1 font-bold flex item-center text-white pt-10'><FaMapMarkerAlt size={17} className="mt-1" />{`${requestsData["franquia"].data?.endereco || ""}, ${requestsData["franquia"].data?.cidade || ""} - ${requestsData["franquia"].data?.uf}` || ""}</span>
                        }
                    </div>
                </div>
            </header>
            <div>
                <div className={`sticky top-0 my-2 md:my-0 w-full ${navCategoriesReact > 0 ? "lg:-translate-y-1/2" : "bg-zinc-100 py-2 shadow-lg"} z-30`} id="sticky-nav" style={{ height: "200%" }}>
                    <div className="container mx-auto lg:flex lg:gap-12">
                        <div className={`flex overflow-x-auto py-2 w-full ${navCategoriesReact > 0 ? "lg:-translate-y-1/2" : ""} lg:translate-y-0 text-center md:w-auto`}>
                            <div onClick={() => setFilter({ ...filter, categoria: null })} className={`shrink-0 inline-block mx-4 rounded-full cursor-pointer ${navCategoriesReact > 0 ? "w-20" : "w-16"} ${filter.categoria == null && "border-2 border-orange-700"}`}>
                                <img className='w-full h-full' src="/assets/imagens/iconesCategoriaProduto/icon_cardapio.svg" alt={{ "pt_BR": "Todos", "en_US": "All" }[lang]} />
                            </div>
                            {requestsData["produtosCategoria"].data?.map(categoriaProdutos =>
                                <div onClick={() => setFilter({ ...filter, categoria: categoriaProdutos.categoria.descricao })} className={`shrink-0 inline-block mx-4 rounded-full cursor-pointer ${navCategoriesReact > 0 ? "w-20" : "w-16"} ${filter.categoria == categoriaProdutos.categoria.descricao && "border-2 border-orange-700"}`}>
                                    <img className='w-full h-full' src={categoriaProdutos.categoria.imagemFiltro || "/assets/imagens/icon_hamburger.svg"} alt={{ "pt_BR": categoriaProdutos.categoria.descricao, "en_US": categoriaProdutos.categoria.description || categoriaProdutos.categoria.descricao }[lang]} />
                                </div>
                            )}
                        </div>

                        <div className="lg:grow lg:flex lg:items-center mx-2">
                            <div className='flex items-center gap-2 bg-white border rounded py-1 px-3 w-full'>
                                <input className="w-full h-8 outline-none" type="text" onChange={(evt) => setFilter({ ...filter, search: rmAccent(evt?.target?.value?.toUpperCase()) })} placeholder={{ "pt_BR": "Buscar", "en_US": "Search" }[lang]} aria-label={{ "pt_BR": "Buscar", "en_US": "Search" }[lang]} />
                                <FaSearch />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='container lg:-translate-y-12 mx-auto pb-28- pb-1 max-w-screen'>
                    {alerts[""]?.map((alert, i) =>
                        <Alert key={alert.message + i} message={alert.message} type={alert.type} />
                    )}

                    {requestsData["produtosCategoria"].state === "success" && requestsData["produtosCategoria"].state === "success" &&
                        requestsData["produtosCategoria"].data?.filter(categoria => filter?.categoria == null || filter?.categoria == categoria.categoria.descricao).map(categoria => {
                            let produtos = categoria.produtos
                                .filter(produto => rmAccent(produto?.nome ?? "").toUpperCase().includes(filter?.search ?? "") ||
                                    rmAccent(produto?.description ?? "").toUpperCase().includes(filter?.search ?? "") ||
                                    rmAccent(produto?.descricao ?? "").toUpperCase().includes(filter?.search ?? ""))
                            return (
                                <div key={categoria.categoria.descricao}>

                                    {produtos.length > 0 &&
                                        <>
                                            <h2 className="text-2xl font-bold my-4 mb-10 text-gray-800 mx-2">{{ "pt_BR": categoria.categoria.descricao, "en_US": categoria.categoria.description || categoria.categoria.descricao }[lang]}</h2>

                                            <div className='grid gap-4 mb-10 grid-cols-1 lg:grid-cols-2 w-full'>
                                                {
                                                    produtos.map((produto, index) => {
                                                        return (
                                                            <div data-aos={![0, 1].includes(index) ? "fade-up" : ""} data-aos-once='true' onClick={() => { [1, 3].includes(categoria.categoria.id) ? setSelectedProduct({ id: produto.id }) : AddProduct(requestsData["produtosCategoria"].data.id, { ...produto, categoria: categoria.categoria.id }) }} className="sm:flex sm:items-center mx-2 sm:mr-8 lg:mr-0" key={`${produto.id}-${produto.nome}`}>
                                                                <div className='w-full h-full border-2 border-transparent bg-white sm:flex items-center rounded p-3'>
                                                                    <div className='flex-none pr-2'>
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
                                                                        <p className='text-gray-600 mt-2'>{categoria.categoria.id === 1 && "ACOMPANHA PORÇÃO DE FRITAS."}</p>
                                                                        <p className="font-thin text-gray-600 my-2">{{ "pt_BR": produto.descricao, "en_US": produto.description || produto.descricao }[lang]}</p>
                                                                        {(produto?.valorPromocional || 0) > 0 &&
                                                                            <p className="text-zinc-600 font-semibold text-sm text-center sm:text-left"><s>R$ {produto?.valor?.toFixed(2).toString().replace(".", ",")}</s></p>
                                                                        }
                                                                        <p className="text-custom-orange text-2xl font-bold md:text-lg text-center sm:text-left">R$ {((produto?.valorPromocional || 0) > 0 ? produto?.valorPromocional : produto?.valor)?.toFixed(2).toString().replace(".", ",")}</p>
                                                                    </div>
                                                                </div>
                                                                {/* <div className='sm:w-0 -translate-y-full sm:-translate-y-0 pb-4 px-2 sm:p-0'>
                                                                    {
                                                                        <button onClick={() => { setSelectedProduct({ id: produto.id });[1, 3].includes(categoria.categoria.id) && setPopup("produto") }} className="mx-auto text-xl font-semibold w-auto flex items-center gap-2 px-4 py-2 sm:p-2 sm:w-auto bg-custom-orange text-white rounded-sm sm:-translate-x-1/2">
                                                                            <span className='sm:hidden'>{{ "pt_BR": "Adicionar item ao carrinho", "en_US": "Add to cart" }[lang]}</span>
                                                                            <FaPlus />
                                                                        </button>
                                                                    }
                                                                </div> */}
                                                            </div>
                                                        )
                                                    })
                                                }
                                                {
                                                    categoria.produtos.length == 0 &&
                                                    <div className="col-span-3 my-2">{{ "pt_BR": `Nenhum produto encontrado em ${categoria.categoria.descricao}.`, "en_US": `No products were found for ${categoria.categoria.descricao}.` }[lang]}</div>
                                                }
                                            </div>
                                        </>
                                    }
                                </div>
                            )
                        })
                    }



                    {(requestsData["franquia"].state === "error" || requestsData["produtosCategoria"].state === "error") &&
                        <Alert message={{ "pt_BR": `Erro ao carregar dados.`, "en_US": `Fail to load the data.` }[lang]} type='error' />
                    }

                    {(requestsData["franquia"].state === "loading" && requestsData["produtosCategoria"].state === "loading") &&
                        <div className="container mx-auto mt-20 py-10">
                            <VscLoading size={30} className='mx-auto animate-spin' />
                        </div>
                    }

                </div>

                {/* <div data-aos="fade-up" className="fixed bottom-0 z-30 w-full left-0">
                    <div className='container mx-auto flex justify-end'>
                        <div className='fixed -translate-y-full max-w-screen p-4'>
                            {displayCart &&
                                <div data-aos="fade-down" className='shadow-xl bg-gray-100 flex flex-col rounded-lg w-auto md:w-80' style={{ maxHeight: cart?.produtos.length === 0 ? "70vh" : "auto", height: cart?.produtos.length === 0 ? "auto" : "70vh" }}>
                                    <div className='bg-white text-custom-orange gap-20 flex items-center justify-between font-semibold rounded-t-lg p-2 text-xl'><span>{{ "pt_BR": `Carrinho`, "en_US": `Cart` }[lang]}</span> <FaWindowClose onClick={() => setDisplayCart(!displayCart)} /></div>
                                    <div className='grow overflow-auto'>
                                        {cart?.produtos.length === 0 &&
                                            <p className='px-4 py-8 text-gray-800 text-center font-semibold'>{{ "pt_BR": `Nenhum produto adicionado`, "en_US": `No products in the cart yet` }[lang]}</p>
                                        }
                                        {cart?.produtos.length > 0 && cart?.produtos.map((produto, index) => {
                                            return (
                                                <ProdutoCarrinho lang={lang} index={index} produto={produto} callbackEdit={() => { setSelectedProduct({ id: produto.id, cartIndex: index }); setPopup("produto") }} idFranquia={(franquia.data.id)} key={produto.id + "-" + index} />
                                            )
                                        })}
                                    </div>
                                </div>
                            }
                            {!displayCart &&
                                <button data-aos="fade-down" onClick={() => setDisplayCart(!displayCart)} className='shadow-xl text-custom-orange bg-white border-custom-orange p-2 rounded-full'>
                                    <FaShoppingCart size={30} />
                                </button>
                            }
                        </div>
                    </div>
                    <div className="bg-gray-50 w-full">
                        <div className="mx-2 sm:mx-auto gap-2 flex items-center justify-between py-4" style={{ maxWidth: "840px" }}>
                            <span className=" bg-gray-200 text-gray-800 flex items-center rounded px-4 py-2 gap-2"><FaShoppingCart size={27} /><span>Total <b>R$
                                {cart?.produtos.reduce((total, produto) => {
                                    return total + produto.valor + (produto.ingredientesAdicionais?.reduce((total, ingrediente) => {
                                        return total + ingrediente.valor
                                    }, 0) ?? 0)
                                }, 0).toFixed(2).toString().replace(".", ",")}
                            </b></span></span>
                            <div className="flex items-center sm:gap-4">
                                <span className="hidden sm:block text-right text-sm font-thin text-gray-700">{{ "pt_BR": `Para finalizar seu pedido`, "en_US": `Click here` }[lang]} <br /> {{ "pt_BR": `clique aqui`, "en_US": `to finish your order` }[lang]}</span>
                                <button className="text-xl bg-custom-orange text-white px-4 py-2 rounded">{{ "pt_BR": `Finalizar pedido`, "en_US": `Finish your order` }[lang]}</button>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    );
}

export default App;