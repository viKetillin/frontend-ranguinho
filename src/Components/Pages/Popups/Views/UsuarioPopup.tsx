import { useState } from "react";

import moment from "moment";

import { MdDateRange, MdLogin, MdShortText } from "react-icons/md";
import { IoIosPin, IoMdClose } from "react-icons/io";
import { AiFillMail } from "react-icons/ai";
import { FiLink } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import OpaqueBackground from "../OpaqueBackground";

interface UsuarioPopupProps {
    usuario: Usuario,
    onClose: () => any,
    open: boolean,
}

type Usuario = {
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

const UsuarioPopup = ({ usuario, open, onClose }: UsuarioPopupProps) => {
    const [aba, setAba] = useState<"general">("general")

    return (
        <OpaqueBackground open={open} callback={onClose}>
            <div data-aos="fade-down" className="w-full bg-gray-200 max-w-[32rem] rounded p-2">
                <div className="flex justify-between items-start">
                    <div className="flex overflow-x-auto text-gray-700 font-semibold translate-y-0.5">
                        <span onClick={() => setAba("general")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "general" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Dados Gerais</span>
                    </div>
                    <span className="p-1"><IoMdClose onClick={() => onClose()} className="text-2xl text-gray-600 cursor-pointer" /></span>
                </div>
                <div className="w-full bg-white border border-gray-300 rounded p-4">
                    <table className="table-auto w-full">
                        <tbody className="text-zinc-600">
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2 sm:w-1/3">Identificação do usuario</td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.id}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdShortText />Nome</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.nomeUsuario}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><AiFillMail />Email</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.emailUsuario}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdLogin />Login</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.codigoUsuario}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FiLink />Link do cardápio</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.linkCardapio}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><IoIosPin />Endereço</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.endereco}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaWhatsapp />Whatsapp</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{usuario?.whatsapp}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdDateRange />Data de nascimento</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{moment(usuario?.dataNascimento).format("DD-MM-YYYY HH:mm")}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </OpaqueBackground>
    )
}

export default UsuarioPopup