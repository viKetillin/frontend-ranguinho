import { useEffect, useState } from "react"

import { useAuth } from "../../../../Hooks/Auth"
import api from "../../../../Services/api"

import { TextField } from "@mui/material"
import CurrencyInput from "react-currency-input-field"
import Alert from "../../../Utils/Alert"
import Switch from "react-switch";
import IngredienteFilter from "./IngredienteFilter"

import { FaInfoCircle, FaTrashAlt } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"

import { Categoria } from "../../../../Types/Produto"
import { Ingrediente } from "../../../../Types/Ingrediente"

interface CadastroCategoriaProps {
    CloseCallback: () => any,
    onSuccess?: () => void,
    categoria?: Categoria,
    franquiaId: number
}

type IngredienteAdicional = {
    id?: number,
    idIngrediente: number,
    nome: string,
    valor: number
}

const Index = ({ categoria, franquiaId, CloseCallback, onSuccess }: CadastroCategoriaProps) => {
    const { cookies } = useAuth()

    const [form, setForm] = useState<Categoria>({
        id: categoria?.id,
        exibirCardapio: categoria?.exibirCardapio || true,
        descricao: categoria?.descricao || '',
        imagemFiltro: categoria?.imagemFiltro || '',
        description: categoria?.description || ''
    })

    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])

    const [ingredientesAdicionais, setIngredientesAdicionais] = useState<IngredienteAdicional[]>([])

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    const [formStatus, setFormStatus] = useState<"success" | "error" | "input-warning" | "loading" | "initial">()

    const [ingredienteAdicionaisStatus, setIingredienteAdicionaisStatus] = useState<"success" | "error" | "loading" | "initial">("initial")

    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (!(form.descricao.length > 0)) {
            setAlerts(a => ({ ...a, "descricao-input-warnings": [`Descrição é obrigatório`] }))
        } else if (!(form.descricao.length >= 3)) {
            setAlerts(a => ({ ...a, "descricao-input-warnings": [`Descrição precisa ter pelo menos 3 caracteres`] }))
        } else
            setAlerts(a => ({ ...a, "descricao-input-warnings": [] }))

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

    const FormSubmit = async (evt?: React.FormEvent<HTMLFormElement>) => {
        (evt) && evt?.preventDefault();
        if (formStatus === "loading") return;

        if (["descricao-input-warnings", "description-input-warnings", "imagemFiltro-input-warnings"].some(input => alerts[input]?.length > 0)) {
            setFormStatus("input-warning")
        } else {
            try {
                setFormStatus("loading")

                const data = {
                    Id: form?.id || 0,
                    NomeCategoriaProduto: form.descricao.trim(),
                    CategoryName: form.description.trim(),
                    LinkImagemFiltro: form.imagemFiltro.trim(),
                    ExibirCardapio: form.exibirCardapio,
                    ImagemFiltro: selectedImage,
                    EstabelecimentoId: franquiaId,
                    Adicionais: ingredientesAdicionais.map(ingrediente => ({
                        IngredienteId: ingrediente.idIngrediente,
                        Valor: ingrediente.valor,
                        Id: ingrediente.id
                    }))
                }

                const formData = new FormData();

                for (let key in data) {
                    if (key === "Adicionais") {
                        const adicionais = data[key];
                        adicionais.forEach((adicional, index) => {
                            for (let adicionalKey in adicional) {
                                formData.append(`${key}[${index}].${adicionalKey}`, adicional[adicionalKey]);
                            }
                        });
                    } else {
                        formData.append(key, data[key]);
                    }
                }

                const headers = { Authorization: `Bearer ${cookies.authentication}`, "Content-Type": "multipart/form-data", }

                if (form?.id) {
                    await api.put("/api/admin/CategoriaProduto/categoria-produto", formData, { headers })
                } else {
                    await api.post("/api/admin/CategoriaProduto/categoria-produto", formData, { headers })
                }

                onSuccess()
                setFormStatus("success")
                CloseCallback()
            } catch (err) {
                console.error(err)
                setFormStatus("error")
                setAlerts(a => ({ ...a, "categoria-error": [`Erro ao ${form?.id ? "editar" : "criar"} categoria`] }))
            }
        }
    }

    const RemoveIngredienteAdicional = (index: number) => {
        if (ingredientesAdicionais[index]?.id) {
            api.delete(`/api/admin/Adicional/adicional${ingredientesAdicionais[index].id}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } })
                .then(resp => {
                    HandleLoadIngredienteAdicionais()
                    setAlerts(a => ({ ...a, "adicionais-success": [`Ingrediente adicional ${ingredientesAdicionais[index].nome} excluido com sucesso`] }))
                }).catch(err => {
                    console.error(err)
                    setAlerts(a => ({ ...a, "adicionais-error": [`Erro ao excluir ingrediente adicional ${ingredientesAdicionais[index].nome}`] }))
                })
        } else {
            setIngredientesAdicionais(ingAdc => ingAdc.filter((ing, i) => i !== index))
        }
    }

    const HandleLoadIngredienteAdicionais = () => {
        if (categoria?.id) {
            setIingredienteAdicionaisStatus("loading")
            api.get("/api/admin/Adicional/adicionais", { params: { idEstabelecimento: franquiaId, idCategoria: categoria?.id }, headers: { Authorization: `Bearer ${cookies.authentication}` } })
                .then(resp => {
                    setIingredienteAdicionaisStatus("success")
                    let newIngAdcs: IngredienteAdicional[] = resp.data.data?.map(ingrediente => ({
                        id: ingrediente.idAdicional,
                        idIngrediente: ingrediente.idIngrediente,
                        nome: (ingrediente.nomeAdicional || "").trim(),
                        valor: ingrediente.valor
                    }))

                    setIngredientesAdicionais(ingAdcs => ([...newIngAdcs, ...ingAdcs.filter(ing => !ing.id && !newIngAdcs.some(newingadc => newingadc.idIngrediente === ing.idIngrediente))]))
                }).catch(err => {
                    console.error(err)
                    setIingredienteAdicionaisStatus("error")
                    setAlerts(a => ({ ...a, "adicionais-error": [`Erro ao carregar adicionais`] }))
                })
        }
    }

    useEffect(() => {
        HandleLoadIngredienteAdicionais()
    }, [])

    return (
        <>
            <div className='flex justify-between items-center text-lg font-semibold p-3 bg-custom-orange text-white'>
                <h2>{categoria?.descricao || "Nova categoria"}</h2>
                <span className='text-3xl cursor-pointer' onClick={() => CloseCallback()}><IoMdClose /></span>
            </div>
            <div className="px-4 grow flex flex-col overflow-auto">
                {alerts["categoria-error"]?.map(msg => <Alert message={msg} type="error" />)}
                <form onSubmit={FormSubmit}>
                    <div>
                        <div className="my-4">
                            <div className="flex flex-col sm:flex-row gap-4 my-4">
                                <div>
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["descricao-input-warnings"]?.length > 0} className="w-full" defaultValue={form.descricao} helperText={alerts["descricao-input-warnings"]} onChange={evt => setForm(f => ({ ...f, descricao: evt.target.value }))} label="Descrição" variant="standard" />
                                </div>
                                <div>
                                    <TextField sx={{ input: { color: '#555' } }} error={formStatus === "input-warning" && alerts["description-input-warnings"]?.length > 0} className="w-full" defaultValue={form.description} helperText={alerts["description-input-warnings"]} onChange={evt => setForm(f => ({ ...f, description: evt.target.value }))} label="Description" variant="standard" />
                                </div>
                            </div>
                            <div>
                                <img className="w-80" src={(form?.imagemFiltro === "" ? undefined : form?.imagemFiltro)} alt="icone filtro" />
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <label className="text-gray-600 pb-1" htmlFor="ativo">Exibir Cardapio</label>
                                <Switch onChange={value => setForm(f => ({ ...f, exibirCardapio: value }))} height={20} width={40} checked={form.exibirCardapio} />
                            </div>
                        </div>

                    </div>
                </form>



                <hr className="mb-2" />
                <h2 className="text-zinc-600 font-semibold">Adicionais</h2>
                {!!alerts["adicionais-error"] &&
                    alerts["adicionais-error"].map((msg, i) => <Alert key={i} message={msg} type="error" />)}
                {!!alerts["adicionais-success"] &&
                    alerts["adicionais-success"].map((msg, i) => <Alert key={i} message={msg} type="success" />)}

                <div className="grow min-h-[8rem] max-h-full mt-1 overflow-auto px-1">
                    {(ingredienteAdicionaisStatus === "success" && ingredientesAdicionais.length === 0) &&
                        <div className="flex items-center gap-2 py-4 my-4 text-sm text-gray-700" role="alert">
                            <FaInfoCircle />
                            Nenhum ingrediente adicional adicionado
                        </div>}

                    {ingredientesAdicionais?.map((ingredienteAdicional, index) =>
                        <div key={ingredienteAdicional.idIngrediente}>
                            <hr className="my-1" />
                            <div className="flex justify-between my-2 items-center">
                                <div className="flex h-8 items-center">
                                    <div className='bg-custom-orange h-full px-2 rounded-l items-center flex'>
                                        <span className='text-white font-semibold'>R$</span>
                                    </div>
                                    <CurrencyInput maxLength={2} onChange={e => setIngredientesAdicionais(ingredientesAdicionais.map((ingAdc, i) => i === index ? { ...ingAdc, valor: Number(e.target.value), nome: ingredienteAdicional.nome, idIngrediente: ingredienteAdicional.idIngrediente, id: ingredienteAdicional.id || 0 } : ingAdc))} defaultValue={ingredienteAdicional.valor || 0} prefix='' decimalScale={2} className="border rounded-r text-gray-600 h-full px-2 w-16 outline-none"
                                        decimalsLimit={2} allowNegativeValue={false} groupSeparator=" " decimalSeparator="," placeholder="Valor do adicional" type="text" />
                                    <label htmlFor="valor" className='px-2 text-zinc-600'>{ingredienteAdicional?.nome}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => RemoveIngredienteAdicional(index)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><FaTrashAlt /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white border-x border-y shadow shadow-gray-600/10 rounded my-4">
                    <IngredienteFilter estabelecimentoId={franquiaId} returnFilteredIngredientes={setIngredientes} ignoreIds={ingredientesAdicionais.map(ingAdc => ingAdc.idIngrediente || 0)} SelectIngrediente={ing => {
                        setIngredientesAdicionais(ingAdc => [...ingAdc, { idIngrediente: ing.id, nome: ing.nome, valor: 0 }])
                    }} />
                    <div className='h-20 max-w-full py-2 overflow-auto'>
                        {
                            ingredientes.map(ingrediente => {
                                return (
                                    <div key={`ingrediente-${ingrediente.id}`} className={`p-1 inline-block`}>
                                        <input type="button" value={ingrediente.nome} onClick={() => {
                                            setIngredientesAdicionais(ingAdc => [...ingAdc, { idIngrediente: ingrediente.id, nome: ingrediente.nome, valor: 0 }])
                                        }} className={`px-2 py-1 cursor-pointer rounded border-gray-400 text-gray-600 hover:border-gray-500 hover:text-gray-700 border`} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

            </div>
            <hr className='my-2' />
            <div className='my-3 mx-4'>
                <button onClick={() => FormSubmit()} className='bg-green-600 hover:bg-green-700 text-white px-2 py-1 font-semibold rounded'>{formStatus === "loading" ? "Carregando..." : categoria?.id ? "Salvar alterações" : "Salvar categoria"}</button>
            </div>
        </>
    )
}

export default Index