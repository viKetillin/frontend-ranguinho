import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../Hooks/Auth";

import Admin from "../../../../Layout/Admin";
import api from "../../../../Services/api";

import Franquia from "../../../../Types/Franquia";
import { VscLoading } from "react-icons/vsc";
import { Alert } from "../../../../Components/Utils";
import { Helmet } from "react-helmet-async";
import FormEstabelecimento from "../../../../Components/Pages/Adm/Forms/FormEstabelecimento";

const Index = () => {
    const { cookies } = useAuth()

    const { link } = useParams()

    const [franquia, setFranquia] = useState<{ state: "loading" | "success" | "error" | "initial", data: Franquia }>({ state: "initial", data: undefined })

    useEffect(() => {
        setFranquia({ state: "loading", data: undefined })

        api.get(`/api/admin/Estabelecimento/estabelecimento${link}`, { headers: { Authorization: `Bearer ${cookies.authentication}` } })
            .then(response => {
                setFranquia({ state: "success", data: response.data?.data })
            })
            .catch(err => {
                console.error(err)
                setFranquia({ state: "error", data: undefined })
            })
    }, [link])

    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Editar estabelecimento {franquia.data?.cidade || ""}</title>
            </Helmet>

            <div className="container mx-auto p-2 lg:p-6">
                <div className="p-4 bg-white shadow-lg shadow-zinc-500/10">
                    <h1 className="text-xl my-2 font-semibold text-zinc-700">Editar estabelecimento</h1>
                    <hr />
                    {franquia.state === "success" &&
                        <FormEstabelecimento franquia={franquia.data} />}
                    {franquia.state === "error" &&
                        <div className="my-6">
                            <Alert message="Erro ao carregar estabelecimento." type="error" />
                        </div>}
                    {franquia.state === "loading" &&
                        <div className="container mx-auto mt-20 py-10">
                            <VscLoading size={30} className='mx-auto animate-spin' />
                        </div>}
                </div>
            </div>
        </Admin >
    )
}

export default Index