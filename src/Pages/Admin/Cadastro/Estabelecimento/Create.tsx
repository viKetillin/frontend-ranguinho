import Admin from "../../../../Layout/Admin"
import { Helmet } from "react-helmet-async"

import FormEstabelecimento from "../../../../Components/Pages/Adm/Forms/FormEstabelecimento"

const Index = () => {
    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Adicionar novo estabelecimento</title>
            </Helmet>

            <div className="container mx-auto p-2 lg:p-6">
                <div className="p-4 bg-white shadow-lg shadow-zinc-500/10">
                    <h1 className="text-xl my-2 font-semibold text-zinc-700">Novo estabelecimento</h1>
                    <hr />
                    <FormEstabelecimento />
                </div>
            </div>
        </Admin>
    )
}

export default Index