import { createContext, ReactNode, useState } from "react";

export type ProdutoCart = {
    id: number;
    nome: string;
    valor: number;
    categoria: number;
    pontoCarne?: { id: number, nome: string };
    ingredientesAdicionais?: { id: number, nome: string, valor: number }[],
    removerIngrediente?: { id: number, nome: string }[]
}

type Cart = {
    idFranquia: Number;
    produtos: ProdutoCart[];
}

type CartContextType = {
    cart?: Cart;
    LoadCart: (idFranquia: number) => Promise<void>;
    AddProduct: (idFranquia: number, produto: ProdutoCart) => Promise<void>;
    EditProduct: (idFranquia: number, produto: ProdutoCart, index: number) => Promise<void>;
    RemoveProduct: (idFranquia: number, index: number) => Promise<void>;
}

export const CartContext = createContext({} as CartContextType);

type CartContextProviderProps = {
    children: ReactNode
}

export function CartContextProvider(props: CartContextProviderProps) {
    const [cart, setCart] = useState<Cart>()

    async function LoadCart(idFranquia: Number) {
        setCart(JSON.parse(localStorage.getItem(`cart-${idFranquia}`)) || { idFranquia, produtos: [] });
    }

    async function AddProduct(idFranquia: number, produto: ProdutoCart) {
        let produtos = cart.produtos;
        produtos.push(produto);
        setCart({ idFranquia, produtos })
        localStorage.setItem(`cart-${idFranquia}`, JSON.stringify({ idFranquia, produtos }))
    }

    async function EditProduct(idFranquia: number, produto: ProdutoCart, index: number) {
        let produtos = cart.produtos.map((p, i) => i === index ? produto : p);
        setCart({ idFranquia, produtos })
        localStorage.setItem(`cart-${idFranquia}`, JSON.stringify({ idFranquia, produtos }))
    }

    async function RemoveProduct(idFranquia: number, index: number) {
        let produtos = cart.produtos.filter((p, i) => i !== index);
        setCart({ idFranquia, produtos })
        localStorage.setItem(`cart-${idFranquia}`, JSON.stringify({ idFranquia, produtos }))
    }

    return (
        <CartContext.Provider value={{ cart, LoadCart, AddProduct, EditProduct, RemoveProduct }}>
            {props.children}
        </CartContext.Provider>
    );
}