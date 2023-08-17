import { useEffect, useState } from "react"

import api from "../../../../Services/api"

import Alert from "../../../Utils/Alert"
import { useAuth } from "../../../../Hooks/Auth"
import { TextField } from "@mui/material"

import { IoMdClose } from "react-icons/io"

import { Ingrediente } from "../../../../Types/Ingrediente"

type MyProps = {
    CloseCallback: () => any,
    onSuccess?: () => void,
    ingrediente: Ingrediente,
    estabelecimentoId: number
}

const Index = ({ ingrediente, estabelecimentoId, CloseCallback, onSuccess }: MyProps) => {
    const { cookies } = useAuth()

    const [form, setForm] = useState<Ingrediente>({
        id: undefined,
        nome: "",
        name: "",
        descricao: "",
        estabelecimentoId: estabelecimentoId,
        ...ingrediente
    })

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    const [formStatus, setFormStatus] = useState<"success" | "error" | "input-warning" | "loading" | "initial">()

    const FormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (formStatus === "loading") return;

        let data = {
            Id: form?.id,
            NomeIngrediente: (form?.nome || "").trim(),
            NameIngredient: (form?.name || "").trim(),
            DescricaoIngrediente: (form?.descricao || "").trim(),
            EstabelecimentoId: (form?.estabelecimentoId || 0)
        }

        if (["nome-input-warnings", "name-input-warnings", "descricao-input-warnings"].some(input => alerts[input]?.length > 0)) {
            setFormStatus("input-warning")
        } else {
            try {
                setFormStatus("loading");

                const headers = { Authorization: `Bearer ${cookies.authentication}` };

                if (form?.id)
                    await api.put("/api/admin/Ingrediente/ingrediente", data, { headers })
                else
                    await api.post("/api/admin/Ingrediente/ingrediente", data, { headers })

                onSuccess()
                setFormStatus("success");
                CloseCallback()
            } catch (err) {
                console.error(err)
                setAlerts(a => ({ ...a, "ingredientes-error": [`Erro ao ${form?.id ? "editar" : "criar"} ingrediente.`] }))
                setFormStatus("error");
            }
        }
    }

    useEffect(() => {
        if (!(form.nome.length > 0)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome é obrigatório`] }))
        } else if (!(form.nome.length >= 3)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome precisa ter pelo menos 3 caracteres`] }))
        } else
            setAlerts(a => ({ ...a, "nome-input-warnings": [] }))
    }, [form])

    return (
        <>
            <form onSubmit={FormSubmit}>
                <div className='flex justify-between items-center text-lg font-semibold p-3 bg-custom-orange text-white'>
                    <h2>{ingrediente?.nome || "Novo ingrediente"}</h2>
                    <span className='text-3xl cursor-pointer' onClick={() => CloseCallback()}><IoMdClose /></span>
                </div>
                <div className="px-4 grow overflow-auto">
                    {alerts["ingredientes-error"]?.map((msg, i) => <Alert key={i} message={msg} type="error" />)}
                    <div className="my-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["nome-input-warnings"]?.length > 0} className="w-full" defaultValue={form.nome} helperText={alerts["nome-input-warnings"]} onChange={evt => setForm(f => ({ ...f, nome: evt.target.value }))} label="Nome" variant="standard" />
                            </div>
                            <div>
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["nome-input-warnings"]?.length > 0} className="w-full" defaultValue={form.name} helperText={alerts["name-input-warnings"]} onChange={evt => setForm(f => ({ ...f, name: evt.target.value }))} label="Nome em inglês" variant="standard" />
                            </div>
                        </div>
                    </div>

                    <div className="my-4">
                        <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["descricao-input-warnings"]?.length > 0} className="w-full" defaultValue={form.descricao} helperText={alerts["descricao-input-warnings"]} onChange={evt => setForm(f => ({ ...f, descricao: evt.target.value }))} label="Descrição do ingrediente" variant="standard" />
                    </div>
                </div>
                <hr className='my-1' />
                <div className='my-3 mx-4'>
                    <button type="submit" className='bg-green-600 hover:bg-green-700 text-white px-2 py-1 font-semibold rounded'>{formStatus === "loading" ? "Carregando..." : form?.id ? "Salvar alterações" : "Salvar ingrediente"}</button>
                </div>
            </form>
        </>
    )
}

export default Index