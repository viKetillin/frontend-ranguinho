import { useState } from "react";
import { Link } from "react-router-dom"

const Navbar = () => {

    const [showMenu, setShowMenu] = useState<Boolean>(false);

    return (
        <nav className="bg-white px-2 sm:px-4 py-2.5">
            <div className="container flex flex-wrap justify-between items-center mx-auto">
                <Link className="flex items-center pl-8" to="/">
                    <img src="/assets/imagens/logos/ranguinho/07.png" className="mr-3 h-8 sm:h-20" alt="logo" />
                </Link>
                <button onClick={() => setShowMenu(!showMenu)} data-collapse-toggle="mobile-menu" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-500 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className={`${showMenu && "hidden"} w-6 h-6`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                    <svg className={`${!showMenu && "hidden"} w-6 h-6`} fill="currentColor" viewBox="0 0 20 20" xmlns="hsttp://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                <div className={`${!showMenu && "hidden"} w-full md:block md:w-auto`} id="mobile-menu">
                    <ul className="flex flex-col pr-8 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                        {[
                            { path: "/", value: "HOME" },
                            // { path: "/#QUEM-SOMOS", value: "QUEM SOMOS" },
                            // { path: "/#SEJA-FRANQUEADO", value: "SEJA FRANQUEADO" },
                            // { path: "/#CONTATOS", value: "CONTATOS" },
                        ].map(item => {
                            return (
                                <li key={item.path + item.value}>
                                    <Link className={`${window.location.pathname + window.location.hash === item.path ? "text-black font-normal" : "font-thin text-gray-700"}`}
                                        to={item.path}>{item.value}</Link>
                                </li>
                            )
                        })
                        }
                    </ul>
                </div>
            </div>
        </nav >


    )
}

export default Navbar