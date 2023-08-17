import { useEffect, useState } from "react"
import { FaMinus, FaPlus, FaWindowClose } from "react-icons/fa"
import { VscLoading } from "react-icons/vsc"
import { } from "reactstrap"
import { useCart } from "../../../Hooks/Cart"
import api from "../../../Services/api"
import Produto from "../../../Types/Produto"
import { Alert } from "../../Utils"
import Collapse from "../../Utils/Collapse"
import Outclick from "../../Utils/Outclick"

type MyProps = {
    idProduto: number;
    idFranquia: number;
    CloseCallback: () => any;
    cartIndex?: number;
    lang: "pt_BR" | "en_US";
}

type GetSelectedProduct = {
    state?: "success" | "error" | "loading" | "initial",
    produto?: Omit<Produto, 'categoria' | "ativo"> & {
        categoria: number,
        pontosCarne?: { id: number, nome: string, selected?: boolean }[],
        ingredientesAdicionais?: { id: number, nome: string, valor: number, selected?: boolean }[],
        removerIngrediente?: { id: number, nome: string, selected?: boolean }[]
    },
    index?: number
}

const Index = ({ idProduto, idFranquia, CloseCallback, cartIndex, lang }: MyProps) => {

    const { cart } = useCart()

    const [selectedProduct, setSelectedProduct] = useState<GetSelectedProduct>({ state: "initial" })

    const { EditProduct, AddProduct } = useCart();

    const [ingredientesCollapse, setIngredientesCollapse] = useState<boolean>(true)

    const [adicionaisCollapse, setAdicionaisCollapse] = useState<boolean>(false)

    let LoadData = () => {
        setSelectedProduct({
            state: "success"
        })

        setSelectedProduct({})
        if (idProduto) {
            api.get("/api/Cardapio/produto", { params: { idProduto, idFranquia } })
                .then(res => {
                    let produto = {
                        id: res.data.data.idProduto,
                        nome: res.data.data.nomeProduto,
                        valor: res.data.data.valorProduto,
                        imagem: res.data.data.imagemProduto,
                        descricao: res.data.data.descricaoProduto,
                        description: res.data.data.productDescription,
                        categoria: res.data.data.idCategoria,
                        pontosCarne: res.data.data?.lstPontoCarne?.map(pontocarne => (
                            {
                                id: pontocarne.id,
                                nome: pontocarne.nomePontoCarne,
                                selected: cart.produtos[cartIndex]?.pontoCarne.id === pontocarne.id,
                            })).map((pontocarne, index, self) => {
                                if (self.filter(s => s.selected).length === 0)
                                    if (pontocarne.id === 2)
                                        return { ...pontocarne, selected: true }
                                return pontocarne
                            }),
                        ingredientesAdicionais: res.data[0]?.lstAdicionais?.map(ing => (
                            {
                                id: ing.idAdicional,
                                nome: ing.nomeAdicional,
                                valor: ing.valor,
                                selected: cart.produtos[cartIndex]?.ingredientesAdicionais?.map(i => i.id).includes(ing.idAdicional) ?? false
                            })),
                        removerIngrediente: res.data[0]?.lstIngredientes?.map(ing => (
                            {
                                id: ing.idIngrediente,
                                nome: ing.nomeIngrediente,
                                selected: cart.produtos[cartIndex]?.removerIngrediente?.map(i => i.id).includes(ing.idIngrediente) ?? false
                            })),
                    }
                    setSelectedProduct({
                        state: "success",
                        produto,
                        index: cartIndex
                    })
                }).catch(err => { console.error(err); setSelectedProduct({ state: "error", produto: undefined }) })

        }
    }

    useEffect(() => {
        document.querySelector("body").style.overflow = "hidden"
        LoadData()
    }, [])

    return (
        <div className='fixed top-0 left-0 h-screen w-screen z-40 bg-black/50'>
            <div className="relative top-1/2 -translate-y-1/2 mx-auto z-50" style={{ maxWidth: "600px" }}>
                <Outclick callback={() => CloseCallback()}>
                    <div data-aos="fade-down" className="bg-white flex flex-col h-screen sm:h-auto">
                        <div className="bg-custom-orange p-3 flex items-center justify-between">
                            {(selectedProduct?.state === "success" && selectedProduct.produto) &&
                                <h3 className="text-lg text-white font-semibold">{selectedProduct.produto.nome} - <b>R$ {selectedProduct.produto?.valor?.toFixed(2).toString().replace(".", ",")}</b></h3>
                            }

                            {selectedProduct?.state === "loading" &&
                                <h3 className="text-lg text-white font-semibold">{{ "pt_BR": "Carregando...", "en_US": "Loading..." }[lang]}</h3>
                            }
                            <button onClick={() => CloseCallback()} className="text-xl text-white" type="button">
                                <FaWindowClose />
                            </button>

                        </div>
                        <div className="grow h-70vh flex flex-col mb-2 rounded mx-6">
                            {(selectedProduct?.state === "success" && selectedProduct?.produto) &&
                                <>
                                    <div className='sm:flex items-center gap-2 py-3'>
                                        <img className='h-24 mx-auto' src={selectedProduct?.produto?.imagem} alt={String(selectedProduct?.produto?.nome)} />
                                        <p className='hidden sm:block grow text-sm text-gray-700 font-thin'>{{ "pt_BR": selectedProduct.produto.descricao, "en_US": selectedProduct.produto.descricao || selectedProduct.produto.description }[lang]}</p>
                                    </div>

                                    <div className='collapse-btn bg-gray-50 text-gray-700 border flex items-center justify-between px-2 py-1'>
                                        <h2 className='font-semibold mr-2'>{{ "pt_BR": "Ponto da carne", "en_US": "How would you like your steak?" }[lang]}</h2>
                                    </div>

                                    <div className='collapse border-x px-2'>
                                        {selectedProduct?.produto.pontosCarne.map(pontoCarne =>
                                            <div key={pontoCarne.nome + pontoCarne.id} className="inline-block mr-4">
                                                <div className="flex items-center py-1 gap-1">
                                                    <input id={`pontocarne-${pontoCarne.id}`} defaultChecked={pontoCarne.selected ?? false} name="pontoCarne" type="radio" onChange={event => {
                                                        setSelectedProduct({
                                                            ...selectedProduct,
                                                            produto: {
                                                                ...selectedProduct.produto,
                                                                pontosCarne: selectedProduct.produto.pontosCarne.map(item => {
                                                                    return { ...item, selected: item.id === pontoCarne.id }
                                                                })
                                                            }
                                                        })

                                                    }} />
                                                    <label className="pb-1 font-thin text-gray-800" htmlFor={`pontocarne-${pontoCarne.id}`}>
                                                        {pontoCarne.nome}
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    <Collapse collapsed={ingredientesCollapse} CollapseClass='collapse' toggleClass='hid'>
                                        <div onClick={() => {
                                            let collapse = !ingredientesCollapse;
                                            setIngredientesCollapse(collapse)
                                            if (collapse == false)
                                                setAdicionaisCollapse(!collapse)
                                        }} className='collapse-btn bg-gray-50 text-gray-700 border flex items-center justify-between px-2 py-1'>
                                            <h2 className='font-semibold mr-2'>{{ "pt_BR": "Remover Ingredientes", "en_US": "Remove Ingredients" }[lang]}</h2>
                                            {ingredientesCollapse ? <FaPlus /> : <FaMinus />}
                                        </div>
                                        <div className='collapse border-x px-2 h-auto overflow-auto hid'>
                                            {
                                                selectedProduct.produto.removerIngrediente?.map((ingrediente, index) => {
                                                    return (
                                                        <div className='gap-2 flex items-center' key={ingrediente.id.toString()}>
                                                            <input id={`ingrediente-${ingrediente.id}`} defaultChecked={ingrediente.selected ?? false} type="checkbox" onChange={event => {
                                                                setSelectedProduct({
                                                                    ...selectedProduct,
                                                                    produto: {
                                                                        ...selectedProduct.produto,
                                                                        removerIngrediente: selectedProduct.produto.removerIngrediente.map(item => {
                                                                            if (item.id == ingrediente.id) {
                                                                                return {
                                                                                    ...ingrediente,
                                                                                    selected: event.target.checked
                                                                                }
                                                                            }
                                                                            return item
                                                                        })
                                                                    }
                                                                })

                                                            }} />
                                                            <label className="py-1 font-thin text-gray-800" htmlFor={`ingrediente-${ingrediente.id}`}>
                                                                {ingrediente.nome}
                                                            </label>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </Collapse>

                                    <Collapse collapsed={adicionaisCollapse} CollapseClass='collapse' toggleClass='hid'>
                                        <div onClick={() => {
                                            let collapse = !adicionaisCollapse;
                                            setAdicionaisCollapse(collapse)
                                            if (collapse == false)
                                                setIngredientesCollapse(!collapse)
                                        }} className='collapse-btn border bg-gray-50 flex items-center justify-between px-2 py-1 text-gray-700'>
                                            <h2 className='font-semibold mr-2'>{{ "pt_BR": "Ingredientes Adicionais", "en_US": "Additional Ingredients" }[lang]}</h2>
                                            {adicionaisCollapse ? <FaPlus /> : <FaMinus />}
                                        </div>
                                        <div className='h-auto border-x border-b overflow-auto collapse px-2'>
                                            {
                                                selectedProduct.produto.ingredientesAdicionais?.map((ingrediente, index) => {
                                                    return (
                                                        <div className='gap-2 flex items-center' key={ingrediente.id.toString()}>
                                                            <input id={`ingrediente-adicionais-${ingrediente.id}`} defaultChecked={ingrediente.selected ?? false} type="checkbox" onChange={event => {
                                                                setSelectedProduct({
                                                                    ...selectedProduct,
                                                                    produto: {
                                                                        ...selectedProduct.produto,
                                                                        ingredientesAdicionais: selectedProduct.produto.ingredientesAdicionais.map(item => {
                                                                            if (item.id == ingrediente.id) {
                                                                                return {
                                                                                    ...item,
                                                                                    selected: event.target.checked
                                                                                }
                                                                            }
                                                                            return item
                                                                        })
                                                                    }
                                                                })

                                                            }} />
                                                            <label className="py-1 font-thin text-gray-800" htmlFor={`ingrediente-adicionais-${ingrediente.id}`}>
                                                                {ingrediente.nome} - <b>R$ {ingrediente.valor?.toFixed(2).toString().replace(".", ",")}</b>
                                                            </label>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </Collapse>
                                </>
                            }

                            {selectedProduct?.state == "error" &&
                                <Alert message={{ "pt_BR": "Erro ao carregar informações do produto.", "en_US": "Fail to load product informations" }[lang]} type="error" />
                            }

                            {selectedProduct?.state == "loading" &&
                                <div className="my-12">
                                    <VscLoading size={30} className='mx-auto animate-spin' />
                                </div>
                            }

                        </div>
                        <div className="flex justify-center p-4">
                            <button
                                onClick={() => {
                                    let produto = {
                                        ...selectedProduct.produto,
                                        pontoCarne: selectedProduct.produto.pontosCarne.filter(pontoCarne => pontoCarne.selected == true)[0],
                                        ingredientesAdicionais: selectedProduct.produto.ingredientesAdicionais.filter(ingrediente => ingrediente.selected == true),
                                        removerIngrediente: selectedProduct.produto.removerIngrediente.filter(ingrediente => ingrediente.selected == true)
                                    }
                                    selectedProduct.index == undefined ?
                                        AddProduct(idFranquia, produto) : EditProduct(idFranquia, produto, selectedProduct.index)

                                    CloseCallback()
                                }}
                                className="text-white font-semibold px-3 py-1 bg-custom-orange mx-2" type="button">{selectedProduct?.index !== undefined ? { "pt_BR": "Salvar alterações", "en_US": "Save changes" }[lang] : { "pt_BR": "Adicionar ao pedido", "en_US": "Add to cart" }[lang]} (R$ {selectedProduct.produto?.ingredientesAdicionais?.filter(ing => ing.selected).reduce((total, ingrediente) => {
                                    return total + ingrediente.valor
                                }, selectedProduct.produto.valor).toFixed(2).toString().replace(".", ",")})</button>
                        </div>
                    </div>
                </Outclick>
            </div>
        </div>
    )
}

export default Index