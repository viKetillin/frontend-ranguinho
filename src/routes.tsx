import { Route, BrowserRouter, Routes } from "react-router-dom";

// Pages imports
import Home from "./Pages/Home"
import Cardapio from "./Pages/Franquias/Cardapio"
import NotFoundPage from "./Pages/NotFound"
import NotFoundAdminPage from "./Pages/Admin/NotFound"

// Admin pages imports
import Login from "./Pages/Admin/Login"
import AdmHome from "./Pages/Admin/index"
import CadastroUsuario from "./Pages/Admin/Cadastro/Usuario/Index"
import CadastroCardapio from "./Pages/Admin/Cadastro/Cardapio"
import CadastroIngrediente from "./Pages/Admin/Cadastro/Ingrediente"
import ListCadastroEstabelecimento from "./Pages/Admin/Cadastro/Estabelecimento/Index"
import EditCadastroEstabelecimento from "./Pages/Admin/Cadastro/Estabelecimento/Edit"
import CreateCadastroEstabelecimento from "./Pages/Admin/Cadastro/Estabelecimento/Create"


import { CartContextProvider } from "./Context/CartContext";
import { AuthContextProvider } from "./Context/AuthContext";
import { MessageContextProvider } from "./Context/MessageContext";
import { CookiesProvider } from 'react-cookie';

import { AuthModdleware } from "./Middlewares/AuthenticationMiddleware";
import { HelmetProvider } from "react-helmet-async";
import Franquias from "./Pages/Franquias/Franquias";

export default () => {
    return (
        <CookiesProvider>
            <BrowserRouter>
                <HelmetProvider>
                    <CartContextProvider>
                        <AuthContextProvider>
                            <MessageContextProvider>
                                <Routes>
                                    <Route element={<Home lang={"pt_BR"} />} path="/" />
                                    <Route element={<Franquias />} path="/franquias" />
                                    <Route element={<Cardapio lang="pt_BR" />} path="/franquias/:link/cardapio" />
                                    <Route element={<Cardapio lang="pt_BR" />} path="/franquias/:link/cardapio/pt-BR" />
                                    <Route element={<Cardapio lang="en_US" />} path="/franquias/:link/cardapio/en-US" />

                                    <Route element={<Login />} path="/admin/login" />

                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><AdmHome /></AuthModdleware>} path="/admin/dashboard" />
                                    <Route element={<AuthModdleware roles={["Admin"]} ><CadastroUsuario /></AuthModdleware>} path="/admin/cadastro/usuarios" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><CadastroCardapio /></AuthModdleware>} path="/admin/cadastro/cardapio" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><CadastroIngrediente /></AuthModdleware>} path="/admin/cadastro/ingrediente" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><ListCadastroEstabelecimento /></AuthModdleware>} path="/admin/cadastro/estabelecimento" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><EditCadastroEstabelecimento /></AuthModdleware>} path="/admin/cadastro/estabelecimento/:link/editar" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><CreateCadastroEstabelecimento /></AuthModdleware>} path="/admin/cadastro/estabelecimento/novo-estabelecimento" />
                                    <Route element={<AuthModdleware roles={["Admin", "Proprietário"]} ><NotFoundAdminPage /></AuthModdleware>} path='/admin/*' />
                                    <Route path='*' element={<NotFoundPage />} />
                                </Routes>
                            </MessageContextProvider>
                        </AuthContextProvider>
                    </CartContextProvider>
                </HelmetProvider>
            </BrowserRouter>
        </CookiesProvider>
    );

};
