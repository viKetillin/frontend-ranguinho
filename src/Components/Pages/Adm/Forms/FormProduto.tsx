import React, { useEffect, useState } from 'react';

import { useAuth } from '../../../../Hooks/Auth';
import api from '../../../../Services/api';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import { TextField } from '@mui/material';
import Switch from "react-switch";
import IngredienteFilter from './IngredienteFilter';
import Alert from '../../../Utils/Alert';

import { IoMdClose } from 'react-icons/io';

import Produto, { Categoria } from "../../../../Types/Produto"
import { Ingrediente } from '../../../../Types/Ingrediente';

type ProdutoModalProps = {
    produto?: Produto,
    CloseCallback: () => void,
    onSuccess?: () => void,
    idFranquia: number,
    categorias: Categoria[]
}

const Index = ({ produto, CloseCallback, idFranquia, categorias, onSuccess }: ProdutoModalProps) => {
    const { cookies } = useAuth()

    const [form, setForm] = useState<Produto>({
        id: produto?.id || 0,
        descricao: produto?.descricao || "",
        description: produto?.description || "",
        imagem: produto?.imagem || "",
        nome: produto?.nome || "",
        valor: produto?.valor || 0,
        valorPromocional: produto?.valorPromocional || 0,
        ativo: produto?.ativo || true,
        categoria: produto?.categoria || categorias[0],
        linkCardapio: produto?.linkCardapio || "",
    })

    const [ingredientes, setIngredientes] = useState<Ingrediente[]>()
    const [ingredientesSelecionados, setIngredientesSelecionados] = useState<Ingrediente[]>([])

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    const [formStatus, setFormStatus] = useState<"success" | "error" | "loading" | "input-warning" | "initial">()

    const [selectedImage, setSelectedImage] = useState(null);

    const FormSubmit = async (evt?: React.FormEvent<HTMLFormElement>) => {
        evt && evt?.preventDefault()
        if (formStatus === "loading") return;

        if (["nome-input-warnings", "valorPromocional-input-warnings", "valor-input-warnings"].some(input => alerts[input]?.length > 0)) {
            setFormStatus("input-warning")
        } else {
            try {
                setFormStatus("loading");

                let data = {
                    Id: form.id,
                    EstabelecimentoId: idFranquia,
                    LinkCardapio: form.linkCardapio,
                    Ativo: form.ativo,
                    ValorProduto: form?.valor,
                    NomeProduto: (form.nome || "").trim(),
                    ImagemProduto: selectedImage,
                    LinkImagemProduto: form.imagem,
                    DescricaoProduto: (form.descricao || "").trim(),
                    CategoriaId: form?.categoria?.id,
                    ProductDescription: (form.description || "").trim(),
                    ValorPromocional: form?.valorPromocional,
                    Ingredientes: ingredientesSelecionados.map(ingrediente => ({ Id: ingrediente.id, quantidade: 1 }))
                }

                const formData = new FormData();

                for (let key in data) {
                    if (key === "Ingredientes") {
                        const ingredientes = data[key];
                        ingredientes.forEach((ingrediente, index) => {
                            for (let ingredienteKey in ingrediente) {
                                formData.append(`${key}[${index}].${ingredienteKey}`, ingrediente[ingredienteKey]);
                            }
                        });
                    } else {
                        formData.append(key, data[key]);
                    }
                }

                const headers = { Authorization: `Bearer ${cookies.authentication}`, "Content-Type": "multipart/form-data", }

                if (data?.Id)
                    await api.put("/api/admin/Cardapio/produto", formData, { headers })
                else
                    await api.post("/api/admin/Cardapio/produto", formData, { headers })


                onSuccess()
                setFormStatus("success")
                CloseCallback()
            } catch (err) {
                console.error(err)
                setFormStatus("error");
            }
        }
    }

    useEffect(() => {
        if (produto?.id)
            api.get("/api/admin/Cardapio/produto", { headers: { Authorization: `Bearer ${cookies.authentication}` }, params: { idEstabelecimento: idFranquia, idProduto: produto?.id } })
                .then(res => {
                    setIngredientesSelecionados(res.data.data.ingredientes.map(ingrediente => ({ id: ingrediente.idIngrediente, nome: ingrediente.nomeIngrediente })))
                }).catch(err => { console.error(err) })
    }, [])

    useEffect(() => {
        if (!(form.nome.length > 0)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome é obrigatório`] }))
        } else if (!(form.nome.length >= 3)) {
            setAlerts(a => ({ ...a, "nome-input-warnings": [`Nome precisa ter pelo menos 3 caracteres`] }))
        } else
            setAlerts(a => ({ ...a, "nome-input-warnings": [] }))

        if (!(form.valor > 0)) {
            setAlerts(a => ({ ...a, "valor-input-warnings": [`Valor é obrigatório`] }))
        } else
            setAlerts(a => ({ ...a, "valor-input-warnings": [] }))

        if (form.valorPromocional > form.valor) {
            setAlerts(a => ({ ...a, "valorPromocional-input-warnings": [`Valor promocional não pode ser maior do que o valor padrão`] }))
        } else
            setAlerts(a => ({ ...a, "valorPromocional-input-warnings": [] }))
    }, [form])

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && isImageFile(file)) {
            setSelectedImage(event.target.files[0]);
        } else {
            console.error('Arquivo inválido. Selecione uma imagem.');
        }
    };

    const isImageFile = (file: { [x: string]: any }) => {
        const fileType = file['type'];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        return validImageTypes.includes(fileType);
    };

    return (
        <div className="w-full h-screen sm:h-full bg-white rounded max-h-screen flex flex-col">
            <div className='flex justify-between items-center text-lg font-semibold p-3 bg-custom-orange text-white'>
                <h2>{produto?.nome || "Novo produto"}</h2>
                <span className='text-3xl cursor-pointer' onClick={() => CloseCallback()}><IoMdClose /></span>
            </div>
            <div className='p-5 grow overflow-auto'>

                <form onSubmit={FormSubmit}>
                    <div className='sm:flex gap-4 justify-between items-center'>
                        <div className="w-32 h-32 sm:order-1 object-contain">
                            <img className='w-full' onError={evt => { evt.currentTarget.src = "" }} src={form.imagem} alt={form.nome} />
                        </div>
                        <div className="my-4 flex flex-col gap-4">
                            <div>
                                <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["nome-input-warnings"]?.length > 0} className="w-full" defaultValue={form.nome} helperText={alerts["nome-input-warnings"]} onChange={evt => setForm(f => ({ ...f, nome: evt.target.value }))} label="Nome" variant="standard" />
                            </div>
                            <div>
                                {categorias !== undefined &&
                                    <select onChange={evt => setForm({ ...form, categoria: categorias.filter(categoria => categoria.id === Number(evt.target.value))[0] })} defaultValue={produto?.categoria?.id || categorias[0]?.id} className="form-select px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-gray-600 focus:outline-none">
                                        {
                                            categorias?.map(categoria => <option key={categoria.id + categoria.descricao} value={categoria.id}>{categoria.descricao}</option>)
                                        }
                                    </select>
                                }
                                {alerts["categoria-input-warnings"]?.map(msg =>
                                    <div className='mt-2' key={msg}>
                                        <Alert message={msg} type="error" />
                                    </div>)}
                            </div>
                            <div>
                                <CurrencyTextField
                                    sx={{ input: { color: '#555' } }} className="w-full" variant="standard"
                                    error={formStatus === "input-warning" && alerts["valor-input-warnings"]?.length > 0}
                                    defaultValue={form.valor}
                                    helperText={alerts["valor-input-warnings"]}
                                    label="Valor"
                                    onChange={evt => setForm({ ...form, valor: Number(evt.target.value.replace(",", ".")) })}
                                    maximumValue="300" minimumValue="0"
                                    decimalCharacter="," digitGroupSeparator="."
                                    currencySymbol="R$" outputFormat="string" />
                            </div>
                            <div>
                                <CurrencyTextField
                                    sx={{ input: { color: '#555' } }} className="w-full" variant="standard"
                                    error={formStatus === "input-warning" && alerts["valorPromocional-input-warnings"]?.length > 0}
                                    defaultValue={form.valorPromocional}
                                    helperText={alerts["valorPromocional-input-warnings"]}
                                    label="Valor promocional"
                                    onChange={evt => setForm({ ...form, valorPromocional: Number(evt.target.value.replace(",", ".")) })}
                                    maximumValue="300" minimumValue="0"
                                    decimalCharacter="," digitGroupSeparator="."
                                    currencySymbol="R$" outputFormat="string" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-600 pb-1" htmlFor="ativo">Ativo</label>
                                    <Switch onChange={value => setForm({ ...form, ativo: value })} height={20} width={40} checked={form.ativo} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <img className="w-80" src={(form?.imagem === "" ? undefined : form?.imagem)} alt="icone filtro" />
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div className="my-4">
                        <TextField
                            sx={{ input: { color: '#555' } }} variant="standard" className='w-full'
                            defaultValue={produto?.descricao || ""}
                            label="Descrição do produto"
                            onChange={evt => setForm({ ...form, descricao: evt.target.value })}
                            multiline minRows={2} maxRows={6} />
                    </div>
                    <div className="my-4">
                        <TextField
                            sx={{ input: { color: '#555' } }} variant="standard" className='w-full'
                            defaultValue={produto?.descricao || ""}
                            label="Descrição em inglês"
                            onChange={evt => setForm({ ...form, description: evt.target.value })}
                            multiline minRows={2} maxRows={6} />
                    </div>
                    <button className='hidden' type='submit'>Criar produto</button>
                </form>
                <hr />
                <div className="bg-white border-x border-b shadow shadow-gray-600/10 rounded">
                    <IngredienteFilter estabelecimentoId={idFranquia} returnFilteredIngredientes={setIngredientes} ignoreIds={ingredientesSelecionados.map(ingSelected => ingSelected.id)} SelectIngrediente={ing => setIngredientesSelecionados(IngSelected => [...IngSelected, ing])} />
                    <div className='h-40 max-w-full py-2 overflow-auto'>
                        {ingredientesSelecionados?.map(ing =>
                            <div key={ing.id} className="p-1 inline-block">
                                <input type="button" value={ing.nome} onClick={() => setIngredientesSelecionados(ingredientesSelecionados.filter(ingSelected => ingSelected.id !== ing.id))}
                                    className="px-2 py-1 cursor-pointer rounded border-green-600 bg-green-50 text-green-600 hover:bg-green-100 hover:border-green-700 hover:text-green-700 border" />
                            </div>)}
                        {ingredientes?.filter(ing => !ingredientesSelecionados.some(ingselected => ingselected.id === ing.id)).map(ing =>
                            <div key={ing.id} className="p-1 inline-block">
                                <input type="button" value={ing.nome} onClick={() => setIngredientesSelecionados(IngSelected => [...IngSelected, ing])}
                                    className="px-2 py-1 cursor-pointer rounded border-gray-400 text-gray-600 hover:border-gray-500 hover:text-gray-700 border" />
                            </div>)}
                    </div>
                </div>
            </div>
            <hr className='my-1' />
            <div className='my-3 mx-6'>
                <button onClick={() => FormSubmit()} className='bg-green-600 hover:bg-green-700 text-white px-2 py-1 font-semibold rounded'>
                    {formStatus === "loading" ? "Carregando..." : produto?.id ? "Salvar alterações" : "Salvar produto"}
                </button>
            </div>
        </div>
    )
}

export default Index