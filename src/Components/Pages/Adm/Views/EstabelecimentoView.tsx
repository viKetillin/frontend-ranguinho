import { useEffect, useState } from "react";

import api from "../../../../Services/api";

import { FaCity, FaClock, FaFacebook, FaInfoCircle, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaRoad, FaWhatsapp, FaIdCard } from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";
import { VscLoading } from "react-icons/vsc";
import { IoMdClose } from "react-icons/io";

import Franquia from "../../../../Types/Franquia"
import { useAuth } from "../../../../Hooks/Auth";
import { Alert } from "../../../Utils";

interface EstabelecimentoViewProps {
    franquia: Franquia;
    CloseCallback: () => any
}

const EstabelecimentoView = ({ franquia, CloseCallback }: EstabelecimentoViewProps) => {
    const [aba, setAba] = useState<"general" | "schedules" | "social">("general")

    const { cookies } = useAuth();

    const [horarios, setHorarios] = useState<{
        status: "success" | "error" | "loading" | "initial", data: {
            diaInicio?: string;
            diaFim?: string,
            horaInicio?: string,
            horaFim?: string
        }[]
    }>({ status: "initial", data: [] })

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    useEffect(() => {
        if (horarios.status === "initial" && aba === "schedules")
            LoadSchedules()
    }, [horarios, aba])

    const LoadSchedules = () => {
        setHorarios({ status: "loading", data: [] })
        api.get(`/api/admin/HorarioFuncionamento/horario-funcionamento${franquia.id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(resp => {
                let horarios = resp.data.data.map(diaEHora => ({
                    diaInicio: diaEHora.diaInicio,
                    diaFim: diaEHora.diaFim,
                    horaInicio: diaEHora.horaInicio,
                    horaFim: diaEHora.horaFim
                }))
                setHorarios({ status: "success", data: horarios })
            }).catch(() => {
                setAlerts({"horarios-load-error": ["Erro ao carregar horários."]})
                setHorarios({ status: "error", data: [] })
            })
    }

    return (
        <>
            <div className="flex justify-between items-start">
                <div className="flex overflow-x-auto text-gray-700 font-semibold translate-y-0.5">
                    <span onClick={() => setAba("general")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "general" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Dados Gerais</span>
                    <span onClick={() => setAba("schedules")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "schedules" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Horários</span>
                    <span onClick={() => setAba("social")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "social" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Redes Sociais</span>
                </div>
                <span className="p-1"><IoMdClose onClick={() => CloseCallback()} className="text-2xl text-gray-600 cursor-pointer" /></span>
            </div>
            <div className="w-full bg-white border border-gray-300 rounded p-4">
                {aba === "general" &&
                    <table className="table-auto w-full">
                        <tbody className="text-zinc-600">
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2">Identificação da franquia</td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.id}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaIdCard />Nome</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.nome}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaCity />Cidade</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.cidade}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaRoad />Endereço</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.endereco}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaMapMarkerAlt />UF</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.uf}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaPhoneAlt />Telefone</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.telefone}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdOutlineMenuBook />Link do cardápio</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.linkCardapio}</td>
                            </tr>
                        </tbody>
                    </table>}

                {aba === "schedules" &&
                    <>
                        {alerts["horarios-load-error"]?.map(msg => <Alert key={msg} message={msg} type="error" />)}
                        {horarios.status === "success" &&
                            <>
                                {horarios?.data?.length > 0 &&
                                    <table className="table-auto w-full">
                                        <tbody className="text-zinc-600">
                                            {horarios.data.map(horario =>
                                                <tr>
                                                    <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaClock />Horário</div></td>
                                                    <td className="border border-zinc-300 py-2 p-2">Abre {horario.diaInicio} às {horario.horaInicio} e fecha {(horario.diaInicio !== horario.diaFim) && horario.diaFim} às {horario.horaFim}.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>}
                                {horarios?.data?.length === 0 &&
                                    <div className="flex items-center gap-2 py-4 my-3 text-sm text-gray-700" role="alert">
                                        <FaInfoCircle />
                                        Nenhum horário de funcionamento adicionado.
                                    </div>}
                            </>}

                        {horarios.status === "loading" &&
                            <div className="w-full py-4">
                                <VscLoading size={30} className='mx-auto animate-spin' />
                            </div>}

                    </>}

                {aba === "social" &&
                    <table className="table-auto w-full">
                        <tbody className="text-zinc-600">
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaFacebook />Facebook</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.facebook ? franquia.facebook : "Facebook não definido."}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaInstagram />Instagram</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.instagram ? franquia.instagram : "Instagram não definido."}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaWhatsapp />Whatsapp</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{franquia.whatsapp ? franquia.whatsapp : "Whatsapp não definido."}</td>
                            </tr>
                        </tbody>
                    </table>}
            </div>
        </>
    )
}

export default EstabelecimentoView