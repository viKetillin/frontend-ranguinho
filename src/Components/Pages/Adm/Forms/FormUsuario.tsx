import { useEffect, useState } from 'react';

import api from '../../../../Services/api';
import validator from 'validator';
import { useAuth } from '../../../../Hooks/Auth';

import TextField from '@mui/material/TextField';
import Alert from '../../../Utils/Alert';

import { IoMdClose } from 'react-icons/io';

import Franquia from '../../../../Types/Franquia';
import { Usuario } from '../../../../Pages/Admin/Cadastro/Usuario/Index';

type UsuarioModalProps = {
    usuario?: Usuario,
    CloseCallback: () => void,
    onSuccess?: () => void,
}

const Index = ({ usuario, CloseCallback, onSuccess }: UsuarioModalProps) => {
    const { cookies } = useAuth()

    const [form, setForm] = useState<Usuario & { estabelecimentoId?: number, perfilId?: number }>({
        codigoUsuario: "",
        dataNascimento: new Date(),
        emailUsuario: "",
        endereco: "",
        estabelecimentoId: undefined,
        id: undefined,
        nomeUsuario: "",
        perfilId: undefined,
        whatsapp: "",
        ...usuario,
        senha: ""
    })

    const [franquias, setFranquias] = useState<Franquia[]>([])

    const [perfis, setPerfis] = useState<{ id: number, nomePerfil: string }[]>([])

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    const [formStatus, setFormStatus] = useState<"success" | "error" | "input-warning" | "loading" | "initial">()

    const FormSubmit = async () => {
        if (formStatus === "loading") return;

        if (["codigoUsuario-input-warnings", "senha-input-warnings", "nome-input-warnings", "email-input-warnings"].some(input => alerts[input]?.length > 0)) {
            setFormStatus("input-warning")
        } else {
            try {
                setFormStatus("loading")
                let data = {
                    ...form,
                    nomeUsuario: (form.nomeUsuario || "").trim(),
                    emailUsuario: (form.emailUsuario || "").trim(),
                    codigoUsuario: (form.codigoUsuario || "").trim(),
                    endereco: (form.endereco || "").trim(),
                    whatsapp: (form.whatsapp || "").trim()
                }

                const headers = { Authorization: `Bearer ${cookies.authentication}` }

                if (form?.id)
                    await api.put("/api/admin/Usuario/usuario", data, { headers })
                else
                    await api.post("/api/admin/Usuario/usuario", data, { headers })

                onSuccess()
                setFormStatus("success")
                CloseCallback()
            } catch (err) {
                console.error(err)
                setFormStatus("error")
                setAlerts(a => ({ ...a, "usuario-error": [`Erro ao ${form?.id ? "adicionar" : "editar informações de"} usuário`] }))
            }
        }
    }

    const LoadData = async () => {
        let headers = { Authorization: `Bearer ${cookies.authentication}` };
        try {
            await api.get("/api/admin/Estabelecimento/estabelecimento", { headers })
                .then(resp => {
                    const data = resp.data.data;
                    setFranquias(data)
                    setForm({ ...form, estabelecimentoId: form.estabelecimentoId || Array.isArray(data) ? data.find((franquia: { linkCardapio: string; }) => franquia.linkCardapio === form.linkCardapio)?.id : 0 || data[0]?.id || 0 })
                })
              
            await api.get("/api/admin/Usuario/perfis", { headers })
                .then(resp => {
                    const data = resp.data.data;
                    setPerfis(data)
                    setForm({ ...form, perfilId: form.perfilId || Array.isArray(data) ? data.find((perfil: { nomePerfil: string; }) => perfil.nomePerfil === form.nomePerfil)?.id : 0 || data[0]?.id || 0 })
                })
        } catch (err) {
            console.error(err)
            setAlerts(a => ({ ...a, "loaddata-error": ["Erro ao carregar franquias ou perfis"] }))
        }
    }

    useEffect(() => {
        LoadData();
    }, [])

    useEffect(() => {
        if (!(form.codigoUsuario.length > 0)) {
            setAlerts(a => ({ ...a, "codigoUsuario-input-warnings": [`Login é obrigatório`] }))
        } else if (!(form.codigoUsuario.length >= 3)) {
            setAlerts(a => ({ ...a, "codigoUsuario-input-warnings": [`Login precisa ter pelo menos 3 caracteres`] }))
        } else
            setAlerts(a => ({ ...a, "codigoUsuario-input-warnings": [] }))

        if (!form?.id || form.senha.length > 0) {
            if (!(form.senha.length > 0)) {
                setAlerts(a => ({ ...a, "senha-input-warnings": [`Senha é obrigatório`] }))
            } else if (!(form.senha.length >= 8)) {
                setAlerts(a => ({ ...a, "senha-input-warnings": [`Senha precisa ter pelo menos 8 caracteres`] }))
            } else
                setAlerts(a => ({ ...a, "senha-input-warnings": [] }))
        } else
            setAlerts(a => ({ ...a, "senha-input-warnings": [] }))



        if (!(form.nomeUsuario.length > 0)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome é obrigatório`] }))
        } else if (!(form.nomeUsuario.length >= 3)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome precisa ter pelo menos 3 caracteres`] }))
        } else
            setAlerts(a => ({ ...a, "nome-input-warnings": [] }))

        if (!(form.emailUsuario.length > 0)) {
            setAlerts(a => ({ ...a, "email-input-warnings": [`Email é obrigatório`] }))
        } else if (!validator.isEmail(form.emailUsuario)) {
            setAlerts(a => ({ ...a, "email-input-warnings": [`Email inválido`] }))
        } else
            setAlerts(a => ({ ...a, "email-input-warnings": [] }))
    }, [form])

    return (
        <div className="w-full h-screen sm:h-full bg-white rounded max-h-screen flex flex-col">
            <div className='flex justify-between items-center text-lg font-semibold p-3 bg-custom-orange text-white'>
                <h2>{usuario?.nomeUsuario || "Novo usuario"}</h2>
                <span className='text-3xl cursor-pointer' onClick={() => CloseCallback()}><IoMdClose /></span>
            </div>
            <div className='p-5 px-6 grow overflow-auto'>
                {alerts["usuario-error"]?.map(msg => <Alert message={msg} type="error" />)}
                {alerts["loaddata-error"]?.map(msg => <Alert message={msg} type="error" />)}
                <form onSubmit={evt => { evt.preventDefault(); FormSubmit(); }}>
                    <div className='flex flex-col sm:flex-row gap-8'>
                        <section className='sm:w-52'>
                            <h1 className='text-md font-semibold text-zinc-700 underline'>Informações de login</h1>
                            <div className="my-4">
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["codigoUsuario-input-warnings"]?.length > 0} className="w-full h-[70px]" defaultValue={form.codigoUsuario} helperText={alerts["codigoUsuario-input-warnings"]} onChange={evt => setForm(f => ({ ...f, codigoUsuario: evt.target.value }))} label="Usuário" variant="standard" />
                            </div>
                            <div className="my-4">
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["senha-input-warnings"]?.length > 0} className="w-full h-[70px]" defaultValue={form.senha} helperText={alerts["senha-input-warnings"]} onChange={evt => setForm(f => ({ ...f, senha: evt.target.value }))} label="Senha" type="password" variant="standard" />
                            </div>
                        </section>
                        <section className='grow'>
                            <h1 className='text-md font-semibold text-zinc-700 underline'>Informações gerais</h1>
                            <div className="my-4 flex gap-4">
                                <div className='grow'>
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["nome-input-warnings"]?.length > 0} className="w-full h-[70px]" defaultValue={form.nomeUsuario} helperText={alerts["nome-input-warnings"]} onChange={evt => setForm(f => ({ ...f, nomeUsuario: evt.target.value }))} label="Nome" variant="standard" />
                                </div>
                                <div className='flex items-start'>
                                    <div>
                                        <select onChange={evt => setForm({ ...form, perfilId: Number(evt.target.value || 0) })} value={form.perfilId}
                                            className="mt-3 border text-gray-600 py-1.5 px-2 rounded outline-none w-full h-full overflow-auto">                                            
                                            {perfis?.map(perfil => <option key={perfil.id} value={perfil.id}>{perfil.nomePerfil}</option>)}
                                        </select>
                                    </div>

                                </div>
                            </div>
                            <div className="my-4">
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["email-input-warnings"]?.length > 0} className="w-full h-[70px]" defaultValue={form.emailUsuario} helperText={alerts["email-input-warnings"]} onChange={evt => setForm(f => ({ ...f, emailUsuario: evt.target.value }))} label="Email" type="email" variant="standard" />
                            </div>
                            <div className="my-4 flex items-center gap-4">
                                <div className='grow'>
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["whatsapp-input-warnings"]?.length > 0} className="w-full h-[70px]" defaultValue={form.whatsapp} helperText={alerts["whatsapp-input-warnings"]} onChange={evt => setForm(f => ({ ...f, whatsapp: evt.target.value }))} label="Whatsapp" variant="standard" />
                                </div>
                                <div className='flex items-end'>
                                    <div>
                                        <select onChange={evt => setForm({ ...form, estabelecimentoId: Number(evt.target.value || 0) })} value={form.estabelecimentoId}
                                            className="border text-gray-600 py-1.5 px-2 rounded outline-none w-full h-full overflow-auto">
                                            <option>Nenhuma franquia</option>
                                            {franquias?.map(franquia => <option key={franquia.id} value={franquia.id}>{franquia.cidade}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <TextField sx={{ input: { color: '#555' } }} className="w-full h-[70px]" onChange={evt => setForm({ ...form, endereco: evt.target.value })} defaultValue={usuario?.endereco || ""} label="Endereço" variant="standard" />
                            </div>
                        </section>
                    </div>
                    <input type="submit" className='hidden' />
                </form>
            </div>
            <hr className='mt-2' />
            <div className='my-4 mx-6'>
                <button onClick={() => FormSubmit()} className='bg-green-600 hover:bg-green-700 text-white px-2 py-1 font-semibold rounded'>
                    {formStatus === "loading" ? "Carregando..." : "Salvar"}
                </button>
            </div>
        </div>
    )
}

export default Index