import { useEffect, useState } from "react"
import { useAuth } from "../../../../Hooks/Auth"

import api from "../../../../Services/api"
import removeAccent from "../../../../utils/removeAccent"

import { Ingrediente } from "../../../../Types/Ingrediente"
import { Alert } from "../../../Utils"

interface IngredienteFilterProps {
    ignoreIds?: number[];
    SelectIngrediente: (ingredientes: Ingrediente) => void;
    returnFilteredIngredientes: (ingredientes: Ingrediente[]) => void;
    estabelecimentoId: number;
}

const IngredienteFilter = ({ ignoreIds, estabelecimentoId, SelectIngrediente, returnFilteredIngredientes }: IngredienteFilterProps) => {
    const { cookies } = useAuth()

    const [ignoredIds, setIgnoredIds] = useState(ignoreIds)

    useEffect(() => {
        if (ignoredIds.join("-") !== ignoreIds.join("-"))
            setIgnoredIds(ignoreIds)
    }, [ignoreIds, ignoredIds])

    const [alerts, setAlerts] = useState<{ [key: string]: string[] }>({})

    const [filter, setFilter] = useState<{ search: string }>({ search: "" })

    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])

    const [filteredIngredientes, setFilteredIngredientes] = useState<Ingrediente[]>([])

    const CreateIngrediente = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        api.post("/api/admin/Ingrediente/ingrediente", { nomeIngrediente: filter.search.trim() }, { headers: { Authorization: `Bearer ${cookies.authentication}` } }).then(resp => {
            LoadIngredientes()
        }).catch(err => {
            console.error(err)
            setAlerts(a => ({ ...a, "ingredientes": ["Ocorreu um erro ao adicionar ingrediente"] }))
        })
    }

    const LoadIngredientes = () => {
        api.get(`/api/admin/Ingrediente/ingredientes${estabelecimentoId}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(res => {
                setIngredientes(res.data.data?.map(ing => ({ id: ing.id, nome: ing.nomeIngrediente, idIngrediente: ing?.idIngrediente, descricao: ing?.descricaoIngrediente ?? "" })))
            }).catch(err => {
                console.error(err);
                setAlerts(a => ({ ...a, "ingredientes": ["Ocorreu um erro ao carregar ingredientes"] }))
            })
    }

    useEffect(() => {
        LoadIngredientes();
    }, [])

    useEffect(() => {
        if (ingredientes.some(ing => ing.name === filter.search))
            SelectIngrediente(ingredientes.find(ing => ing.name === filter.search))
        setFilter({ search: "" })
    }, [ingredientes])

    useEffect(() => {
        const filtered = ingredientes.filter(ingrediente => removeAccent(ingrediente.nome || "").toLowerCase().includes(filter.search)).filter(ing => !ignoredIds.includes(ing.id))
        setFilteredIngredientes(filtered)
        returnFilteredIngredientes(filtered)
    }, [filter, ingredientes, ignoredIds])

    return (
        <form onSubmit={CreateIngrediente} className='border-b'>
            {!!alerts["ingredientes"] &&
                alerts["ingredientes"].map((msg, i) =>
                    <div className='mt-2' key={i}>
                        <Alert key={i} message={msg} type="error" />
                    </div>)}
            <input onChange={evt => setFilter({ search: evt.target.value.toLowerCase() })} value={filter.search} placeholder="Procurar ingredientes" className='px-2 py-1 outline-none w-full text-gray-500' type="text" />
            {(filteredIngredientes.length === 0 && filter.search.length >= 3) &&
                <div className="w-full relative">
                    <p className="rounded absolute font-thin text-sm text-gray-600 bg-zinc-100 w-full w-64 max-w-screen px-2 py-1">
                        Ingrediente <span className="text-gray-700 font-semibold">{filter.search}</span> inexistente. Pressione enter para criar novo ingrediente
                    </p>
                </div>}
        </form>
    )
}

IngredienteFilter.defaultProps = {
    ignoreIds: []
}

export default IngredienteFilter;