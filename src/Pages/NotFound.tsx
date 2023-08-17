import { Link } from "react-router-dom"
import { Footer, Navbar } from "../Components/Pages"
import { Helmet } from "react-helmet-async";

const Index = () => {
    return (
        <>
            <Helmet>
                <title>Página não encontrada.</title>
                <meta name="title" content="Página não encontrada." />
                <meta name="description" content="A página que você estava tentando procurar não foi encontrada." />
                <meta name="image" content="/assets/imagens/logos/ranguinho/02.png" />
                <meta name="keywords" content="Hamburgueria, Hamburguers, Hamburgueres" />

                <meta property="og:title" content="Página não encontrada." />
                <meta property="og:description" content="A página que você estava tentando procurar não foi encontrada." />
                <meta property="og:image" content="/assets/imagens/logos/ranguinho/02.png" />
                <meta property="og:locale" content="pt_BR" />

                <meta name="twitter:title" content="Página não encontrada." />
                <meta name="twitter:description" content="A página que você estava tentando procurar não foi encontrada." />
                <meta name="twitter:image" content="/assets/imagens/logos/ranguinho/02.png" />
            </Helmet>

            <div className="flex flex-col h-screen w-screen">
                <Navbar />
                <div className="grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-5xl font-semibold text-zinc-600">404</h1>
                        <h2 className="text-xl font-thin text-zinc-600 my-3">Oops, a página que você procura não foi encontrada.</h2>
                        <Link to={"/"} className="text-blue-600 hover:texat-blue-700 hover:underline"> Ir para a páginal inicial</Link>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Index