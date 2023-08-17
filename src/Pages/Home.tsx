import { useState, useEffect, useReducer } from 'react';

import rmAccent from '../utils/removeAccent';
import api, { ResponseHandler } from '../Services/api';

import { useCart } from '../Hooks/Cart';
import { Helmet } from 'react-helmet-async';

import { FaSearch } from "react-icons/fa"
import { VscLoading } from 'react-icons/vsc';

import './Franquias/Cardapio.css';

import { Alert } from '../Components/Utils';

import { AlertReducer } from '../Components/Utils/Alert';
import { RequestReducer } from '../Hooks/RequestDataReducer';
import { useNavigate } from 'react-router-dom';
import AOS from "aos";

AOS.init()

type MyProps = {
    lang: "pt_BR" | "en_US"
}

function App({ lang }: MyProps) {
    let navigate = useNavigate();

    const [requestsData, RequestsDataDispatch] = useReducer(RequestReducer, {
        "estabelecimentosCategoria": {
            state: "initial",
            data: []
        },
    });

    const [filter, setFilter] = useState<{ categoria?: string, search?: string }>({})

    const { LoadCart } = useCart()

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const LoadData = async () => {
        RequestsDataDispatch({ reqURL: "estabelecimentosCategoria", requestData: { state: "loading", data: [] } });

        try {
            await api.get(`/api/Navegacao/estabelecimentos`)
                .then(response => {
                    ResponseHandler(response.data).then(alert => {
                        ["sucess"].includes(alert.alertType) ??
                            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: alert.message, type: alert.alertType }] })
                    })
                    RequestsDataDispatch({
                        reqURL: "estabelecimentosCategoria",
                        requestData: {
                            state: 'success',
                            data: response.data.data?.map(estabelecimentosCategoria => {
                                return {
                                    categoria: {
                                        id: estabelecimentosCategoria.idCategoriaEstabelecimento,
                                        descricao: estabelecimentosCategoria.nomeCategoriaEstabelecimento,
                                        imagemFiltro: estabelecimentosCategoria.icone
                                    },
                                    estabelecimentos: estabelecimentosCategoria.lstEstabelecimentos.map(estabelecimento => {
                                        return {
                                            id: estabelecimento.id,
                                            nome: estabelecimento.nome,
                                            logo: estabelecimento.logo,
                                            linkCardapio: estabelecimento.linkCardapio,
                                            statusEstabelecimento: estabelecimento?.statusEstabelecimento
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
        } catch (err) {
            RequestsDataDispatch({ reqURL: "estabelecimentosCategoria", requestData: { state: "error", data: [] } });
            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: "Ocorreu um erro ao carregar dados do estabelecimento", type: 'error' }] });
            console.error(err);
        }
    }

    const [meta, setMeta] = useState<{ title: string, description: string, keywords: string }>({
        title: {
            "pt_BR": `Ranguinho - Estabelecimentos`,
            "en_US": `Ranguinho - Menu`
        }[lang],
        description: {
            "pt_BR": `O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida.`,
            "en_US": ``
        }[lang],
        keywords: {
            "pt_BR": `Ranguinho, Hamburguer, Hamburgueres, Comida, Lanches, Cardápio, Interior de São Paulo`,
            "en_US": ``
        }[lang]
    })


    useEffect(() => {
        if (requestsData["estabelecimentosCategoria"].data?.id)
            LoadCart(requestsData["estabelecimentosCategoria"].data?.id)
        if (requestsData["estabelecimentosCategoria"].state === "initial")
            LoadData();
    }, [requestsData["estabelecimentosCategoria"], lang]);

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
                <meta name="image" content={"/assets/imagens/logos/ranguinho/05.png"} />
                <meta name="keywords" content={meta.keywords} />

                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:image" content={"/assets/imagens/logos/ranguinho/05.png"} />
                <meta property="og:url" content={window.location.host + window.location.pathname} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content={lang} />

                <meta name="twitter:title" content={meta.title} />
                <meta name="twitter:description" content={meta.description} />
                <meta name="twitter:image" content={"/assets/imagens/logos/ranguinho/05.png"} />
            </Helmet>

            <header className="relative w-full header h-screen">
                <img className="w-full h-full z-10 absolute object-cover" src="/assets/imagens/capaMarcas.jpg" />
                <div className='absolute h-full w-full z-20 bottom-0'>
                    <div data-aos="zoom-in" className='h-full justify-center pb-6 sm:pb-0 flex flex-col px-5'>
                        <img className='mx-auto' src={"/assets/imagens/logos/ranguinho/05.png"} alt="logo ranguinho" />
                    </div>
                </div>
            </header>
            <div>
                <div className={`sticky top-0 my-2 md:my-0 w-full ${navCategoriesReact > 0 ? "lg:-translate-y-1/2" : "bg-zinc-100 py-2 shadow-lg"} z-30`} id="sticky-nav" style={{ height: "200%" }}>
                    <div className="container mx-auto lg:flex lg:gap-12" key={requestsData["estabelecimentosCategoria"].data?.id}>
                        <div className={`flex overflow-x-auto py-2 w-full ${navCategoriesReact > 0 ? "lg:-translate-y-1/2" : ""} lg:translate-y-0 text-center md:w-auto`}>
                            <div onClick={() => setFilter({ ...filter, categoria: null })} className={`shrink-0 inline-block mx-4 rounded-full cursor-pointer ${navCategoriesReact > 0 ? "w-20" : "w-16"} ${filter.categoria == null && "border-2 border-orange-700"}`}>
                                <img className='w-full h-full' src="/assets/imagens/iconesCategoriaProduto/icon_cardapio.svg" alt={{ "pt_BR": "Todos", "en_US": "All" }[lang]} />
                            </div>
                            {requestsData["estabelecimentosCategoria"].data?.map(categoriaEstabelecimentos =>
                                <div key={categoriaEstabelecimentos.estabelecimentos.id} onClick={() => setFilter({ ...filter, categoria: categoriaEstabelecimentos.categoria.nomeCategoriaEstabelecimento })} className={`shrink-0 inline-block mx-4 rounded-full cursor-pointer ${navCategoriesReact > 0 ? "w-20" : "w-16"} ${filter.categoria == categoriaEstabelecimentos.categoria.nomeCategoriaEstabelecimento && "border-2 border-orange-700"}`}>
                                    <img className='w-full h-full' src={categoriaEstabelecimentos.categoria.imagemFiltro || "/assets/imagens/icon_hamburger.svg"} alt={categoriaEstabelecimentos.categoria.nomeCategoriaEstabelecimento} />
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

                    {requestsData["estabelecimentosCategoria"].state === "success" && requestsData["estabelecimentosCategoria"].state === "success" &&
                        requestsData["estabelecimentosCategoria"].data?.filter(categoria => filter?.categoria == null || filter?.categoria == categoria.categoria.descricao).map((categoria, index) => {
                            let estabelecimentos = categoria.estabelecimentos
                                .filter(estabelecimento => rmAccent(estabelecimento?.nome ?? "").toUpperCase().includes(filter?.search ?? ""))
                            return (
                                <div key={categoria.categoria.descricao}>

                                    {estabelecimentos.length > 0 &&
                                        <div key={index}>
                                            <h2 className="text-2xl font-bold my-4 mb-10 text-gray-800 mx-2">{categoria.categoria.descricao}</h2>
                                            <div className='grid gap-4 mb-10 grid-cols-2 lg:grid-cols-4 w-full'>
                                                {
                                                    estabelecimentos.map((estabelecimento, index) => {
                                                        return (
                                                            <div data-aos={![0, 1].includes(index) ? "fade-up" : ""} data-aos-once='true' className="sm:flex sm:items-center mx-2 sm:mr-8 lg:mr-0" key={`${estabelecimento.id}-${estabelecimento.nome}`} onClick={() => navigate(`/franquias/${(estabelecimento.linkCardapio)}/cardapio`)}>
                                                                <div className='w-full h-full border-2 border-transparent bg-white sm:flex items-center rounded p-3'>
                                                                    <div className='flex-none pr-2 rounded sm:w-32'>
                                                                        {estabelecimento?.logo &&
                                                                            <img onError={(evt) => evt.currentTarget.remove()} src={estabelecimento.logo} alt={estabelecimento?.nome} />
                                                                        }
                                                                    </div>
                                                                    <div className='pt-4 sm:pt-0 mr-2'>
                                                                        <h3 className="text-center sm:text-left text-2xl font-semibold text-gray-800 w-full">{estabelecimento?.nome.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") ?? ""}</h3>
                                                                        <h3 className="text-center sm:text-left text-base font-semibold text-gray-800 w-full">{estabelecimento?.statusEstabelecimento ? <span style={{ color: "#439044" }}>Aberto</span> : <span style={{ color: "#823c3c" }}>Fechado</span>}</h3>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }

                    {(requestsData["estabelecimentosCategoria"].state === "error" || requestsData["estabelecimentosCategoria"].state === "error") &&
                        <Alert message={{ "pt_BR": `Erro ao carregar dados.`, "en_US": `Fail to load the data.` }[lang]} type='error' />
                    }

                    {(requestsData["estabelecimentosCategoria"].state === "loading" && requestsData["estabelecimentosCategoria"].state === "loading") &&
                        <div className="container mx-auto mt-20 py-10">
                            <VscLoading size={30} className='mx-auto animate-spin' />
                        </div>
                    }

                </div>
            </div>
        </>
    );
}

export default App;
