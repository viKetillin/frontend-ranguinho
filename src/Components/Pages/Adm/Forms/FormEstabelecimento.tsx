import React, { useEffect, useReducer, useState } from "react"
import states from "../../../../data/Estados.json"
import api from "../../../../Services/api"

import { FaClock, FaInfoCircle, FaList, FaPlusCircle, FaTrashAlt } from "react-icons/fa"
import { IoIosBrowsers } from "react-icons/io"
import { VscLoading } from "react-icons/vsc"

import Franquia from "../../../../Types/Franquia"
import { Link, useNavigate } from "react-router-dom"
import { useMessage } from "../../../../Hooks/Message"
import Alert, { AlertReducer } from "../../../Utils/Alert"
import { useAuth } from "../../../../Hooks/Auth"
import { TextField, Tooltip } from "@mui/material"
import CategoriaEstabelecimento from "../../../../Types/CategoriaEstabelecimento"

interface EstabelecimentoFormProps {
    franquia?: Franquia,
    categoriaEstabelecimento?: CategoriaEstabelecimento
}

type Horario = {
    Id?: number,
    DiaInicio: string,
    DiaFim: string,
    HoraInicio: string,
    HoraFim: string
}

const FormEstabelecimento = ({ franquia }: EstabelecimentoFormProps) => {
    const { cookies } = useAuth()

    const { AddMessage } = useMessage()

    let navigate = useNavigate()

    const [form, setForm] = useState<Franquia>(franquia)

    const [alerts, alertsDispatch] = useReducer(AlertReducer, {});

    const [getHorarios, setGetHorarios] = useState<{ status: "success" | "error" | "input-warning" | "loading" | "initial", data: Horario[] }>({ status: "initial", data: [] })

    const [horarios, setHorarios] = useState<Horario[]>([])
    const [categoriasEstabelecimento, setCategoriasEstabelecimento] = useState<CategoriaEstabelecimento[]>([])

    const [selectedImage, setSelectedImage] = useState(null);

    const [selectedImagemCapa, setSelectedImagemCapa] = useState(null);

    const LoadHorarios = () => {
        setGetHorarios({ status: undefined, data: [] });
        const headers = { Authorization: `Bearer ${cookies.authentication}` };

        if (franquia?.id) {
            api.get("/api/admin/HorarioFuncionamento/horario-funcionamento" + franquia?.id, { headers })
                .then(resp => {
                    let horarios = resp.data.data?.map((dataHorario: { id: any; diaInicio: any; diaFim: any; horaInicio: any; horaFim: any }) => ({
                        Id: dataHorario.id,
                        DiaInicio: dataHorario.diaInicio,
                        DiaFim: dataHorario.diaFim,
                        HoraInicio: dataHorario.horaInicio,
                        HoraFim: dataHorario.horaFim
                    })).sort((a: { DiaInicio: number }, b: { DiaInicio: number }) => a.DiaInicio - b.DiaInicio)
                    setGetHorarios({ status: "success", data: horarios })
                    setHorarios(horarios)
                }).catch(err => {
                    console.error(err.message);
                    setGetHorarios({ status: "error", data: [] });
                })
        } else {
            setGetHorarios({ status: "success", data: horarios })
            setHorarios(horarios)
        }
    }

    const LoadData = async () => {
        let headers = { Authorization: `Bearer ${cookies.authentication}` };
        try {
            await api.get("/api/admin/CategoriaEstabelecimento/categorias-estabelecimento", { headers })
                .then(resp => {
                    const data = resp.data.data;
                    setCategoriasEstabelecimento(data)
                    setForm({ ...form, categoriaEstabelecimento: form.categoriaEstabelecimento.id || Array.isArray(data) ? data.find((categoriaEstabelecimento: { nome: string; }) => categoriaEstabelecimento.nome === form.nome)?.id : 0 || data[0]?.id || 0 })
                })
        } catch (err) {
            console.error(err)
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Erro ao carregar categorias de estabelecimentos`, type: "error" }], origin: "estabelecimento" });
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (file && isImageFile(file)) {
            reader.onload = (e) => {
                const base64Data = e.target.result;
                setSelectedImage(base64Data);
            };

            reader.readAsDataURL(file);
        } else {
            console.error('Arquivo inválido. Selecione uma imagem.');
        }
    };

    const handleImageCapaChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (file && isImageFile(file)) {
            reader.onload = (e) => {
                const base64Data = e.target.result;
                setSelectedImagemCapa(base64Data);
            };

            reader.readAsDataURL(file);
        } else {
            console.error('Arquivo inválido. Selecione uma imagem.');
        }
    };

    const isImageFile = (file) => {
        const fileType = file['type'];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        return validImageTypes.includes(fileType);
    };

    useEffect(() => {
        LoadHorarios();
        LoadData();
    }, [franquia?.id])

    const [formStatus, setFormStatus] = useState<"success" | "error" | "input-warning" | "loading" | "initial">("initial")

    const FormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault()

        if (formStatus === "loading") return;

        if (["cidade-input-warnings", "endereco-input-warnings", "telefone-input-warnings", "linkCardapio-input-warnings", "horarios-input-warnings"].some(input => alerts[input]?.length > 0)) {
            setFormStatus("input-warning")
        } else {
            try {
                setFormStatus("loading");

                let data = {
                    Id: form?.id ?? 0,
                    Uf: form.uf,
                    Nome: form.nome,
                    Cidade: form.cidade?.trim(),
                    Endereco: form.endereco?.trim(),
                    Telefone: form.telefone?.trim(),
                    Whatsapp: form.whatsapp?.trim(),
                    Facebook: form.facebook?.trim(),
                    Instagram: form.instagram?.trim(),
                    LinkCardapio: form.linkCardapio?.trim(),
                    HorarioFuncionamento: horarios.map(horario => ({
                        ...horario,
                        HoraFim: horario.HoraFim,
                        HoraInicio: horario.HoraInicio,
                        FranquiaId: franquia?.id
                    })),
                    LinkLogo: selectedImage ? selectedImage : form?.logo,
                    ImagemCapa: selectedImagemCapa ? selectedImagemCapa : form?.imagemCapa,
                    CategoriaEstabelecimentoId: form.categoriaEstabelecimento?.id || categoriasEstabelecimento[0].id,
                }

                const formData = new FormData();

                for (let key in data) {
                    if (key === "HorarioFuncionamento") {
                        const horarios = data[key];
                        horarios.forEach((horario, index) => {
                            for (let horarioKey in horario) {
                                formData.append(`${key}[${index}].${horarioKey}`, horario[horarioKey]);
                            }
                        });
                    } else {
                        formData.append(key, data[key]);
                    }
                }

                const headers = { Authorization: `Bearer ${cookies.authentication}`, "Content-Type": "multipart/form-data", };

                if (form?.id)
                    await api.put("/api/admin/Estabelecimento/estabelecimento", formData, { headers })
                else
                    await api.post("/api/admin/Estabelecimento/estabelecimento", formData, { headers })

                AddMessage('/admin/cadastro/estabelecimento', `Estabelecimento ${form?.id ? "alterado" : "adicionado"} com sucesso!`)
                navigate('/admin/cadastro/estabelecimento')
            } catch (err) {
                console.error(err)
                setFormStatus("error");
                alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Erro ao  ${form?.id ? "alterar" : "adicionar"} estabelecimento`, type: "error" }], origin: "estabelecimento" });
            }
        }
    }

    useEffect(() => {
        alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "cidade-input-warnings" });
        alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "endereco-input-warnings" });
        alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "telefone-input-warnings" });
        alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "linkCardapio-input-warnings" });

        if (!(form.cidade?.length > 0)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Cidade é obrigatório`, type: "warning" }], origin: "cidade-input" })
        } else if (!(form.cidade.length >= 3)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Cidade precisa ter pelo menos 3 caracteres`, type: "warning" }], origin: "cidade-input" })
        }

        if (!(form.endereco?.length > 0)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Endereço é obrigatório`, type: "warning" }], origin: "endereco-input" })
        } else if (!(form.endereco.length >= 3)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Endereço precisa ter pelo menos 3 caracteres`, type: "warning" }], origin: "endereco-input" })
        }

        if (!(form.telefone?.length > 0)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Telefone é obrigatório`, type: "warning" }], origin: "telefone-input" })
        } else if (!(form.telefone.length >= 3)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Telefone precisa ter pelo menos 8 caracteres`, type: "warning" }], origin: "telefone-input" })
        }

        if (!(form.linkCardapio?.length > 0)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Link do cardapio é obrigatório`, type: "warning" }], origin: "linkCardapio-input" })
        } else if (!(form.telefone.length >= 3)) {
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: `Link do cardapio precisa ter pelo menos 3 caracteres`, type: "warning" }], origin: "linkCardapio-input" })
        }
    }, [form])

    useEffect(() => {
        if (!(horarios.length > 0))
            alertsDispatch({ type: "ADD-FROM-ORIGIN", alerts: [{ message: "Horário de funcionamento é obrigatório.", type: "warning" }], origin: "horarios-input" })
        else
            alertsDispatch({ type: "REMOVE-FROM-ORIGIN", alerts: [], origin: "horarios-input" })

    }, [horarios])

    return (
        <form onSubmit={FormSubmit}>
            <div style={{ width: "600px" }} className="max-w-full">
                {alerts["estabelecimento-error"]?.map(alert => <Alert {...alert} />)}
                <div className="my-4">
                    <div className="text-zinc-700 flex items-center gap-2 my-2">
                        <FaList />
                        <span className="font-semibold">Dados Gerais</span>
                    </div>
                    <div className="max-w-full">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full">
                                <div className="my-2">
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["nome-input-warnings"]?.length > 0} className="w-full" defaultValue={form.nome} helperText={alerts["nome-input-warnings"] ? alerts["nome-input-warnings"][0].message : ""} onChange={evt => setForm(f => ({ ...f, nome: evt.target.value }))} label="Nome" variant="standard" />
                                </div>
                                <div className="my-2 flex flex-start gap-2">
                                    {categoriasEstabelecimento !== undefined &&
                                        <select onChange={evt => setForm({ ...form, categoriaEstabelecimento: categoriasEstabelecimento.filter(categoria => categoria.id === Number(evt.target.value))[0] })} defaultValue={franquia?.categoriaEstabelecimento?.id || categoriasEstabelecimento[0]?.id} className="form-select px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none">
                                            {
                                                categoriasEstabelecimento?.map(categoria => <option key={categoria.id + categoria.nome} value={categoria.id}>{categoria.nome}</option>)
                                            }
                                        </select>
                                    }
                                </div>
                                <div className="my-2 flex flex-start gap-2">
                                    <div>
                                        <div>
                                            <select onChange={evt => setForm({ ...form, uf: evt.target.value })} defaultValue={franquia?.uf ?? "SP"} className="outline-zinc-300 border px-2 py-1.5 mt-3 rounded text-gray-600 w-16">
                                                {states?.map(state => <option key={state.ID} value={state.Sigla}>{state.Sigla}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grow">
                                        <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["cidade-input-warnings"]?.length > 0} className="w-full" defaultValue={form.cidade} helperText={alerts["cidade-input-warnings"] ? alerts["cidade-input-warnings"][0].message : ""} onChange={evt => setForm(f => ({ ...f, cidade: evt.target.value }))} label="Cidade" variant="standard" />
                                    </div>
                                </div>
                                <div className="my-2">
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["endereco-input-warnings"]?.length > 0} className="w-full" defaultValue={form.endereco} helperText={alerts["cidade-input-warnings"] ? alerts["cidade-input-warnings"][0].message : ""} onChange={evt => setForm(f => ({ ...f, endereco: evt.target.value }))} label="Endereço" variant="standard" />
                                </div>
                                <div className="my-2">
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["telefone-input-warnings"]?.length > 0} className="w-full" value={form.telefone} helperText={alerts["cidade-input-warnings"] ? alerts["cidade-input-warnings"][0].message : ""} onChange={evt => setForm(f => ({ ...f, telefone: evt.target.value }))} label="Telefone" variant="standard" />
                                </div>
                                <div>
                                    <Tooltip title={`Esse é o link que aparecerá no URL do cardápio. (/cardapio/${form.linkCardapio})`}>
                                        <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["linkCardapio-input-warnings"]?.length > 0} className="w-full" value={form.linkCardapio} helperText={alerts["cidade-input-warnings"] ? alerts["cidade-input-warnings"][0].message : ""} onChange={evt => setForm(f => ({ ...f, linkCardapio: evt.target.value }))} label="Link do cardapio" variant="standard" />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="my-2 flex flex-start gap-2">
                                    <label>Logo</label>
                                    <img className="w-80" src={(form?.logo === "" ? undefined : form?.logo)} alt="logo" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                </div>
                                <div className="my-2 flex flex-start gap-2">
                                    <label>Capa</label>
                                    <img className="w-80" src={(form?.imagemCapa === "" ? undefined : form?.imagemCapa)} alt="imagem capa" />
                                    <input type="file" accept="image/*" onChange={handleImageCapaChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div className="text-zinc-700 flex items-center gap-2 my-2">
                        <IoIosBrowsers />
                        <span className="font-semibold">Redes Sociais</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 max-w-full my-2">
                        <div>
                            <TextField sx={{ input: { color: '#555' } }} className="w-full" defaultValue={form.facebook} onChange={evt => setForm({ ...form, facebook: evt.target.value })} label="Facebook" variant="standard" />
                        </div>
                        <div>
                            <TextField sx={{ input: { color: '#555' } }} className="w-full" defaultValue={form.instagram} onChange={evt => setForm({ ...form, instagram: evt.target.value })} label="Instagram" variant="standard" />
                        </div>
                        <div>
                            <TextField sx={{ input: { color: '#555' } }} className="w-full" defaultValue={form.whatsapp} onChange={evt => setForm({ ...form, whatsapp: evt.target.value })} label="Whatsapp" variant="standard" />
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <hr className="my-4" />
                    <div className="text-zinc-700 flex items-center gap-2 my-2">
                        <FaClock />
                        <span className="font-semibold">Horário de funcionamento</span>
                    </div>
                    <div>
                        {getHorarios?.status === "success" &&
                            <>
                                {horarios?.length === 0 &&
                                    <>
                                        <div className="flex items-center gap-2 py-4 my-4 text-sm text-gray-700" role="alert">
                                            <FaInfoCircle />
                                            Nenhum horário de funcionamento adicionado
                                        </div>
                                    </>}

                                {horarios?.map((horario, i) => {
                                    return (
                                        <div className="shadow-lg shadow-zinc-400/10 max-w-full border rounded-md px-3 my-3" key={`${i}-${horario.DiaInicio}-${horario.HoraInicio}`}>
                                            <div className="my-4 flex flex-col lg:flex-row md:items-center gap-4">
                                                <div className="w-64 sm:w-auto max-w-full">
                                                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                                        <span className="w-12">Abre: </span>
                                                        <select onChange={evt => { setHorarios(horarios.map((hor, index) => index === i ? ({ ...hor, DiaInicio: evt.currentTarget.value }) : hor)) }} defaultValue={horario.DiaInicio} className="form-select px-2 py-1 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none" >
                                                            {[
                                                                "Segunda-Feira",
                                                                "Terça-Feira",
                                                                "Quarta-Feira",
                                                                "Quinta-Feira",
                                                                "Sexta-Feira",
                                                                "Sábado",
                                                                "Domingo"
                                                            ].map((dayOfWeek) => <option key={dayOfWeek} value={dayOfWeek}>{dayOfWeek}</option>)}
                                                        </select>
                                                        <input onChange={evt => { setHorarios(horarios.map((hor, index) => index === i ? ({ ...hor, HoraInicio: evt.currentTarget.value }) : hor)) }} defaultValue={horario.HoraInicio} className="form-select px-2 py-0.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none" type="time" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <span className="w-12">Fecha: </span>
                                                        <select onChange={evt => { setHorarios(horarios.map((hor, index) => index === i ? ({ ...hor, DiaFim: evt.currentTarget.value }) : hor)) }} defaultValue={horario.DiaFim} className="form-select px-2 py-1 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none">
                                                            {[
                                                                "Segunda-Feira",
                                                                "Terça-Feira",
                                                                "Quarta-Feira",
                                                                "Quinta-Feira",
                                                                "Sexta-Feira",
                                                                "Sábado",
                                                                "Domingo"
                                                            ].map((dayOfWeek) => <option key={dayOfWeek} value={dayOfWeek}>{dayOfWeek}</option>)}
                                                        </select>
                                                        <input onChange={evt => { setHorarios(horarios.map((hor, index) => index === i ? ({ ...hor, HoraFim: evt.currentTarget.value }) : hor)) }} defaultValue={horario.HoraFim} className="form-select px-2 py-0.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none" type="time" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <button onClick={() => {
                                                        if (getHorarios.data.filter(hor => hor.Id === horario.Id).length > 0) {
                                                            api.delete(`/api/admin/HorarioFuncionamento/horario-funcionamento${horario.Id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } }).then(() => {
                                                                setHorarios(horarios.filter((pos, index) => i !== index));
                                                            }).catch(err => console.error(err))
                                                        } else {
                                                            setHorarios(horarios.filter((pos, index) => i !== index));
                                                        }
                                                    }} type="button" className="bg-red-700 text-sm my-2 text-white px-2 py-1 rounded flex items-center gap-2"><FaTrashAlt /> Remover horário</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                                }
                            </>
                        }

                        {formStatus === "input-warning" && alerts["horarios-input-warnings"].map(msg =>
                            <div key={msg.message} className="mb-6">
                                <Alert message={msg.message} type={msg.type} />
                            </div>)}

                        {getHorarios.status === "error" &&
                            <div className="my-6">
                                <Alert message="Erro ao carregar horários." type="error" />
                            </div>}

                        {getHorarios.status == "loading" &&
                            <div className="py-10">
                                <VscLoading size={30} className='mx-auto animate-spin' />
                            </div>}

                        <button onClick={() => setHorarios([...horarios, {
                            DiaInicio: "Segunda-Feira",
                            DiaFim: "Segunda-Feira",
                            HoraInicio: "18:30",
                            HoraFim: "23:30"
                        }])} type="button" className="bg-zinc-700 text-white px-2 py-1 rounded flex items-center gap-2"><FaPlusCircle /> Inserir novo horário</button>
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="my-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded" type="submit">{"Salvar"}</button>
                <Link to="/admin/cadastro/estabelecimento">
                    <button className="bg-gray-600 hover:bg-gray-700 mx-2 text-white px-2 py-1 rounded">Cancelar</button>
                </Link>
            </div>
        </form>
    )
}

FormEstabelecimento.defaultProps = {
    franquia: {
        id: 0,
        uf: "SP",
        cidade: "",
        endereco: "",
        telefone: "",
        logo: "",
        imagemCapa: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        linkCardapio: "",
        nome: "",
        categoriaEstabelecimento: { id: 0 }
    }
}

export default FormEstabelecimento