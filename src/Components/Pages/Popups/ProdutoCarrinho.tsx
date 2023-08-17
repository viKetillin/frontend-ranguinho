import { useState } from "react";
import { FaAngleDown, FaAngleUp, FaMinus, FaPencilAlt } from "react-icons/fa"
import { ProdutoCart } from "../../../Context/CartContext"
import { useCart } from "../../../Hooks/Cart";
import Collapse from "../../Utils/Collapse"

interface MyProps {
    produto: ProdutoCart,
    index: number,
    callbackEdit(): void;
    idFranquia: number;
    lang: "pt_BR" | "en_US";
}

const Index = ({ produto, index, idFranquia, callbackEdit, lang }: MyProps) => {

    const [collapse, setCollapse] = useState<boolean>(false)
    const [collapsePontoCarne, setCollapsePontoCarne] = useState<boolean>(false)
    const [collapseIngrediente, setCollapseIngrediente] = useState<boolean>(false)
    const [collapseAdicionais, setCollapseAdicionais] = useState<boolean>(false)

    const { EditProduct, RemoveProduct } = useCart();
    return (
        <Collapse collapsed={collapse} CollapseClass='collapse' toggleClass='hid'>
            <div className='cursor-pointer collapse-btn px-2 py-1 flex items-center gap-4 justify-between bg-custom-orange font-semibold text-white'>
                <span onClick={() => setCollapse(!collapse)} className="grow justify-between flex items-center">
                    <span>{produto.nome} - <b>R$ {produto.valor?.toFixed(2).toString().replace(".", ",")}</b></span>
                    <span>{(produto.ingredientesAdicionais?.length > 0 ||
                        produto.pontoCarne !== undefined ||
                        produto.removerIngrediente?.length > 0)
                        && (collapse ? <FaAngleDown /> : <FaAngleUp />)}</span>
                </span>
                <span className='text-custom-orange flex items-center gap-3'>
                    {[0, 1, 3].includes(produto.categoria) && <FaPencilAlt className='px-0.5 bg-white rounded' size={17} onClick={() => callbackEdit()} />}
                    <FaMinus className='px-0.5 bg-white rounded' size={17} onClick={() => RemoveProduct(idFranquia, index)} />
                </span>
            </div>
            <div className='collapse overflow-auto'>
                {produto.pontoCarne &&
                    <Collapse collapsed={collapsePontoCarne} CollapseClass='collapse' toggleClass='hid'>
                        <div className='px-2 flex items-center justify-between py-1 font-semibold bg-gray-50 text-gray-800 text-sm border-b' onClick={() => setCollapsePontoCarne(!collapsePontoCarne)}>
                            <span>{{ "pt_BR": "Ponto da Carne", "en_US": "How would you like your steak?" }[lang]}</span>
                            <span>{collapsePontoCarne ? <FaAngleDown /> : <FaAngleUp />}</span>
                        </div>
                        <div className='collapse overflow-auto'>
                            <div className='px-2 py-1'>
                                <input id={`pontoCarne-${produto.pontoCarne.nome}`} type="radio" defaultChecked={true} />
                                <label className='px-2 py-1 text-sm text-gray-800 font-thin' htmlFor={`pontoCarne-${produto.pontoCarne.nome}`}>
                                    {produto.pontoCarne.nome}
                                </label>
                            </div>
                        </div>
                    </Collapse>}

                {produto.ingredientesAdicionais?.length > 0 &&
                    <Collapse collapsed={collapseAdicionais} CollapseClass='collapse' toggleClass='hid'>
                        <div className='px-2 flex items-center justify-between py-1 font-semibold bg-gray-50 text-gray-800 text-sm border-b' onClick={() => setCollapseAdicionais(!collapseAdicionais)}>
                            <span>{{ "pt_BR": "Adicionais", "en_US": "Additionals" }[lang]}</span>
                            <span>{collapseAdicionais ? <FaAngleDown /> : <FaAngleUp />}</span>
                        </div>
                        <div className="collapse h-auto overflow-auto">
                            {produto.ingredientesAdicionais.map(ingrediente => {
                                return (
                                    <div className='px-2 py-1' key={`${produto.id}-${ingrediente.id}-${index}`}>
                                        <input id={`ingrediente-${ingrediente.nome}`} type="checkbox" defaultChecked={true} onChange={evt => {
                                            !evt.target.checked && EditProduct(idFranquia,
                                                {
                                                    ...produto, ingredientesAdicionais: produto.ingredientesAdicionais.filter(i => i.id != ingrediente.id),
                                                }, index)
                                        }} />
                                        <label className='px-2 py-1 text-sm text-gray-800 font-thin' htmlFor={`ingrediente-${ingrediente.nome}`}>
                                            {ingrediente.nome} - <b>R$ {ingrediente.valor?.toFixed(2).toString().replace(".", ",")}</b>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </Collapse>}
                {produto.removerIngrediente?.length > 0 &&
                    <Collapse collapsed={collapseIngrediente} CollapseClass='collapse' toggleClass='hid'>
                        <div className='px-2 flex items-center justify-between py-1 font-semibold bg-gray-50 text-gray-800 text-sm border-b' onClick={() => setCollapseIngrediente(!collapseIngrediente)}>
                            <span>{{ "pt_BR": "Remover Ingredientes", "en_US": "Remove Ingredients" }[lang]}</span>
                            <span>{collapseIngrediente ? <FaAngleDown /> : <FaAngleUp />}</span>
                        </div>
                        <div className="collapse h-auto overflow-auto">
                            {produto.removerIngrediente.map(ingrediente => {
                                return (
                                    <div className='px-2 py-1' key={`${produto.id}-${ingrediente.id}-${index}`}>
                                        <input id={`ingrediente-${ingrediente.nome}`} type="checkbox" defaultChecked={true} onChange={evt => {
                                            !evt.target.checked && EditProduct(idFranquia,
                                                { ...produto, removerIngrediente: produto.removerIngrediente.filter(i => i.id != ingrediente.id) },
                                                index)
                                        }} />
                                        <label className='px-2 py-1 text-sm text-gray-800 font-thin' htmlFor={`ingrediente-${ingrediente.nome}`}>
                                            {ingrediente.nome}
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </Collapse>

                }
            </div>
        </Collapse>
    )
}

export default Index