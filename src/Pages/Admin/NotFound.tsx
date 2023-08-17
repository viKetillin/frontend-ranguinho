import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import Admin from "../../Layout/Admin"

const Index = () => {
    return (
        <>
            <Admin>
                <Helmet>
                    <title>Página não encontrada.</title>
                </Helmet>
                <div className="text-center pt-10">
                    <h1 className="text-5xl font-semibold text-zinc-600">404</h1>
                    <h2 className="text-xl font-thin text-zinc-600 my-3">Oops, a página que você procura não foi encontrada.</h2>
                    <Link to={"/admin/"} className="text-blue-600 hover:texat-blue-700 hover:underline"> Ir para Dashboard</Link>
                </div>
            </Admin>
        </>
    )
}

export default Index