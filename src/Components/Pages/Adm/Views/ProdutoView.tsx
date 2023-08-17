import { useEffect, useState } from "react";
import { useAuth } from "../../../../Hooks/Auth"

import api from "../../../../Services/api";

import Produto from "../../../../Types/Produto";

import { FaRegMoneyBillAlt } from "react-icons/fa";
import { MdFoodBank, MdOutlineTextSnippet, MdShortText } from "react-icons/md";
import { IoMdClose, IoMdImage } from "react-icons/io";

interface ProdutoPopupProps {
    open: boolean,
    produto: Produto,
    idFranquia: number,
    CloseCallback: () => any
}

type ProductInfo = {
    state?: "success" | "error" | "loading" | "initial",
    produto?: Produto & {
        ingredientes?: { id: number, nome: string }[]
    }
}

const Index = ({ produto, idFranquia, CloseCallback }: ProdutoPopupProps) => {
    const { cookies, user } = useAuth()

    const [aba, setAba] = useState<"general" | "ingredientes">("general")

    const [productInfo, setProductInfo] = useState<ProductInfo>({ state: "initial" })

    const LoadData = () => {
        api.get("/api/admin/Cardapio/produto", { headers: { Authorization: `Bearer ${cookies.authentication}` },  params: { idEstabelecimento: idFranquia, idProduto: produto?.id }})
            .then(res => {
                let prod = {
                    id: res.data.data.id,
                    nome: res.data.data.nomeProduto,
                    valor: res.data.data.valorProduto,
                    valorPromocional: res.data.data.valorPromocional,
                    imagem: res.data.data.imagemProduto,
                    descricao: res.data.data.descricaoProduto,
                    description: res.data.data.productDescription,
                    categoria: produto.categoria,
                    ativo: res.data.data.ativo || false,
                    ingredientes: res.data.data?.ingredientes?.map(ing => (
                        {
                            id: ing.idIngrediente,
                            nome: ing.nomeIngrediente
                        })),
                }
                setProductInfo({
                    state: "success",
                    produto: prod
                })
            }).catch(err => { console.error(err); setProductInfo({ state: "error", produto: undefined }) })
    }

    useEffect(() => {
        LoadData()
    }, [])

    return (
        <>
            <div className="flex justify-between items-start">
                <div className="flex overflow-x-auto text-gray-700 font-semibold translate-y-0.5">
                    <span onClick={() => setAba("general")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "general" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Dados Gerais</span>
                    <span onClick={() => setAba("ingredientes")} className={`cursor-pointer py-2 px-4 shrink-0 rounded-t ${aba === "ingredientes" ? "border-t border-x border-gray-300 bg-white" : "hover:bg-gray-300 -translate-y-0.5"}`}>Ingredientes</span>
                </div>
                <span className="p-1"><IoMdClose onClick={() => CloseCallback()} className="text-2xl text-gray-600 cursor-pointer" /></span>
            </div>
            <div className="w-full bg-white border border-gray-300 rounded p-4">
                {aba === "general" &&
                    <table className="table-auto w-full">
                        <tbody className="text-zinc-600">
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2 sm:w-1/3">Identificação do produto</td>
                                <td className="border border-zinc-300 py-2 p-2">{productInfo?.produto?.id}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdShortText />Nome</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{productInfo?.produto?.nome}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdOutlineTextSnippet />Descrição</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{productInfo?.produto?.descricao}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><MdOutlineTextSnippet />Descrição em inglês</div></td>
                                <td className="border border-zinc-300 py-2 p-2">{productInfo?.produto?.description}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><IoMdImage />Imagem</div></td>
                                <td className="border border-zinc-300 py-2 p-2"><img className="w-20" src={productInfo?.produto?.imagem} alt="" /></td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaRegMoneyBillAlt />Valor</div></td>
                                <td className="border border-zinc-300 py-2 p-2">R$ {productInfo?.produto?.valor?.toFixed(2).toString().replace(".", ",")}</td>
                            </tr>
                            <tr>
                                <td className="border border-zinc-300 font-bold p-2"><div className="flex items-center gap-2"><FaRegMoneyBillAlt />Valor Promocional</div></td>
                                <td className="border border-zinc-300 py-2 p-2">R$ {(productInfo?.produto?.valorPromocional || 0)?.toFixed(2).toString().replace(".", ",")}</td>
                            </tr>
                        </tbody>
                    </table>}

                {aba === "ingredientes" &&
                    <>
                        <h2 className="text-lg text-gray-600 font-semibold py-2">Ingredientes</h2>
                        {productInfo?.produto?.ingredientes?.map(ingrediente => {
                            return (
                                <div key={ingrediente.nome} className="text-gray-600">
                                    <hr />
                                    <p className="my-2"><span className="flex items-center gap-2"><MdFoodBank />{ingrediente?.nome}</span></p>
                                </div>
                            )
                        })}
                    </>}
            </div>
        </>
    )
}

export default Index