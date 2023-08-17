import { FaAngleDown, FaAngleRight, FaAngleUp, FaList, FaListUl, FaStore, FaUtensils } from "react-icons/fa"
import { AiFillDashboard } from "react-icons/ai"
import { FiUser } from "react-icons/fi"
import { MdClose, MdMenuBook, MdOutlineMenu } from "react-icons/md"
import { Link, useNavigate } from "react-router-dom"
import { Collapse, Outclick } from "../Components/Utils"
import { useState } from "react"
import { useAuth } from "../Hooks/Auth"

const Index = ({ children }) => {
    const [collapseCadastros, setCollapseCadastros] = useState<boolean>(false)

    const [displaySidebar, setDisplaySidebar] = useState<boolean>(false)

    const navigate = useNavigate();

    const { user, SignOut, removeCookie } = useAuth()

    return (
        <div className="flex h-screen">
            <nav className={`${!displaySidebar ? "max-w-0 " : ""}shrink-0 overflow-hidden z-20 admin-nav  w-64 sm:w-auto lg:w-64 sm:max-w-none fixed sm:relative transition-all h-full bg-zinc-800 max-w-screen`}>
                <div className="px-5 w-full">
                    <div className="sm:hidden text-3xl pt-4 text-zinc-300 hover:text-white flex justify-end cursor-pointer"><MdClose onClick={() => setDisplaySidebar(!displaySidebar)} className="ml-full" /></div>
                    <h1 className="text-white cursor-pointer text-md px-3 py-6 font-bold flex gap-5 items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base uppercase"><FaUtensils className="sm:text-3xl" /><span> <span>RANGUINHO</span><br /> <span className="text-sm font-thin">{user?.username}</span></span></h1>
                    <hr className="border-zinc-700" />
                    <Link className="flex gap-2 text-zinc-300 hover:text-white items-center cursor-pointer py-5 font-semibold  sm:flex-col lg:flex-row sm:text-sm lg:text-base" to="/admin/dashboard"><AiFillDashboard size={17} /> Dashboard</Link>
                    <hr className="border-zinc-700" />
                    <div>
                        <Collapse collapsed={collapseCadastros} CollapseClass='collapse' toggleClass='hid'>
                            <h2 onClick={() => setCollapseCadastros(!collapseCadastros)} className={`${collapseCadastros ? "text-zinc-300" : "text-white"} hover:text-white cursor-pointer py-5 flex gap-2 items-center justify-between sm:justify-center lg:justify-between gap-2`}>
                                <span className="flex gap-2 items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base"><FaList className="sm:text-3xl lg:text-base" />Cadastros</span>
                                {collapseCadastros ?
                                    <span><FaAngleRight className="text-zinc-400" /></span> :
                                    <span><FaAngleDown className="text-zinc-400" /></span>}
                            </h2>
                            <div className="collapse overflow-auto">
                                <div className="text-zinc-300 flex flex-col gap-4 pl-4 sm:pl-0 lg:pl-6">
                                    {user.role == "Admin" && <Link className="flex gap-2 hover:text-white items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base" to="/admin/cadastro/usuarios"><FiUser className="sm:text-3xl lg:text-base" /> Usuários</Link>}
                                    <Link className="flex gap-2 hover:text-white items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base" to="/admin/cadastro/estabelecimento"><FaStore className="sm:text-3xl lg:text-base" /> Estabelecimentos</Link>
                                    <Link className="flex gap-2 hover:text-white items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base" to="/admin/cadastro/cardapio"><MdMenuBook className="sm:text-3xl lg:text-base" /> Cardápio</Link>
                                    <Link className="flex gap-2 hover:text-white items-center sm:flex-col lg:flex-row sm:text-sm lg:text-base" to="/admin/cadastro/ingrediente"><FaListUl className="sm:text-3xl lg:text-base" /> Ingredientes</Link>
                                </div>
                            </div>
                        </Collapse>
                    </div>
                </div>
            </nav>
            <div className="grow overflow-auto flex flex-col">
                <div className="bg-white py-4 w-full shadow-lg shadow-zinc-500/10">
                    <div className="flex justify-between items-center">
                        <div className="px-4">
                            <span onClick={() => setDisplaySidebar(!displaySidebar)} className="sm:hidden text-4xl cursor-pointer text-zinc-500 hover:text-zinc-700"><MdOutlineMenu /></span>
                        </div>
                        <div className="py-1 pr-8 pl-5 text-zinc-600 text-sm border-l border-zinc-300 flex items-center gap-4">
                            {
                                (function () {
                                    const [dropdown, setDropdown] = useState<boolean>()
                                    return (
                                        <Outclick callback={() => setDropdown(false)}>
                                            <span className="relative">
                                                <button onClick={() => setDropdown(!dropdown)} className="flex gap-1 items-center">
                                                    {user?.username}
                                                    {dropdown ?
                                                        <FaAngleUp /> :
                                                        <FaAngleDown />}
                                                </button>
                                                {dropdown &&
                                                    <div className="absolute bg-white rounded w-16 border right-0">
                                                        <button onClick={async () => { await SignOut(); await removeCookie("authentication"); navigate("/"); }} className="hover:bg-gray-50 transition rounded px-2 w-full text-left font-semibold py-0.5 text-gray-600 hover:text-gray-800">Sair</button>
                                                    </div>}
                                            </span>
                                        </Outclick>
                                    )
                                }())
                            }
                            {/*  <img className="w-10 h-10 p-1 object-contain bg-gray-600 rounded-full" src="/assets/imagens/logoBrasaBranco.png" alt="Logo Brasa" />*/}
                        </div>
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Index