import { useEffect, useReducer } from 'react';
import api, { ResponseHandler } from '../../Services/api';
import { useNavigate } from 'react-router-dom';

import { Navbar, Footer } from '../../Components/Pages';
import { Helmet } from 'react-helmet-async';

import { FaMapMarkerAlt } from 'react-icons/fa'
import { VscLoading } from 'react-icons/vsc'

import Franquia from '../../Types/Franquia';

import AOS from "aos";

import { RequestReducer } from '../../Hooks/RequestDataReducer';
import Alert, { AlertProps, AlertReducer } from '../../Components/Utils/Alert';

import { useMessage } from '../../Hooks/Message';

AOS.init()

const Franquias = () => {
    let navigate = useNavigate();

    const [RequestsData, RequestsDataDispatch] = useReducer(RequestReducer, {
        "franquias": {
            state: "initial",
            data: []
        }
    });

    const { GetMessage } = useMessage();

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const getFranquias = async () => {
        RequestsDataDispatch({ reqURL: "franquias", requestData: { state: "loading" } })

        await api.get("/api/Navegacao/estabelecimentos")
            .then(response => {
                ResponseHandler(response.data).then(alert => {
                    RequestsDataDispatch({ reqURL: "franquias", requestData: { state: alert.alertType, data: response.data.data } })

                    if (["sucess"].includes(alert.alertType))
                        alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "", alerts: [{ message: alert.message, type: alert.alertType }] })
                })
            }).catch((err) => {
                RequestsDataDispatch({ reqURL: "franquias", requestData: { state: "error", data: [] } })
                alertsDispatch({ type: 'REPLACE-ALL-FROM-ORIGIN', origin: "", alerts: [{ message: "Erro ao carregar estabelecimentos", type: "error" }] })
                console.error(err)
            });
    }

    useEffect(() => {
        getFranquias();

        (async function () {
            const alerts: AlertProps[] = await GetMessage("login").then(messages => messages.map(message => ({ message, type: "error" })))
            alertsDispatch({ type: 'ADD-FROM-ORIGIN', origin: "login", alerts })
        }())
    }, []);

    return (
        <>
            <Helmet>
                <title>Ranguinho</title>
                <meta name="title" content="Ranguinho" />
                <meta name="description" content="O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida." />
                <meta name="image" content="/assets/imagens/logos/ranguinho/07.png" />
                <meta name="keywords" content="Ranguinho, Hamburgueria, Hamburguer, Hamburgueres, Comida, Lanches, Cardápio, Interior de São Paulo" />

                <meta property="og:title" content="Ranguinho" />
                <meta property="og:description" content="O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida." />
                <meta property="og:image" content="/assets/imagens/logos/ranguinho/07.png" />
                <meta property="og:url" content="https://ranguinho.com.br/" />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="pt_BR" />

                <meta name="twitter:title" content="Ranguinho" />
                <meta name="twitter:description" content="O Ranguinho preza por um atendimento atencioso, afinal comer é um dos melhores prazeres da vida." />
                <meta name="twitter:image" content="/assets/imagens/logos/ranguinho/07.png" />
            </Helmet>

            <div className='min-h-screen flex flex-col'>
                <Navbar />
                <div className="grow h-full overflow-auto container mx-auto">
                    <h1 className="my-8 text-center uppercase text-gray-700 font-bold border-bottom text-4xl">
                        <span data-aos="fade-down" className="border-bottom-custom-orange">Unidades</span>
                    </h1>
                    <p className='text-zinc-600 text-center text-lg my-2'>Selecione uma das unidades para visualizar o cardápio.</p>

                    {alerts[""]?.map(alert => <Alert key={alert.message + alert.type} message={alert.message} type={alert.type} />)}

                    {
                        RequestsData["franquias"].state === "success" &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 py-8">
                            {RequestsData["franquias"].data?.map((franquia: Franquia) => (
                                <div key={franquia?.id.toString()}>
                                    <div style={{ maxWidth: "20rem" }} className="bg-gray-300 pt-8 width-full mx-auto rounded-xl cursor-pointer" onClick={() => navigate(`/franquias/${franquia.linkCardapio}/cardapio`)}>
                                        <img className='w-64 mx-auto' src="/assets/imagens/logos/ranguinho/07.png" alt="logo" />
                                        <h2 className='text-center pt-5 pb-8 font-bold text-gray-800'> {franquia?.cidade} - {franquia?.uf}</h2>
                                        <div className="bg-custom-orange rounded-b-xl text-center text-white p-3">
                                            <p className='text-xs flex gap-1 items-center justify-center'><FaMapMarkerAlt />{franquia?.endereco}</p>
                                            <p className='font-bold mt-1'> {franquia?.telefone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    {
                        RequestsData["franquias"]?.state === "error" &&
                        <div className='mx-4'>
                            <Alert message='Erro ao carregar franquias.' type='error' />
                        </div>
                    }

                    {
                        RequestsData["franquias"]?.state == "loading" &&
                        <div className="py-10">
                            <VscLoading size={30} className='mx-auto animate-spin' />
                        </div>
                    }
                </div>

                <Footer />
            </div>
        </>
    );
}


export default Franquias