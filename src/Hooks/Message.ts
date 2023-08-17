import { useContext } from "react";
import { MessageContext } from "../Context/MessageContext";

export function useMessage() {
    return useContext(MessageContext)
}