import { useContext } from "react";
import { CartContext } from "../Context/CartContext";

export function useCart() {
    return useContext(CartContext)
}