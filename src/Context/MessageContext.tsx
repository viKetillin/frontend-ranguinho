import { createContext, ReactNode, useState } from "react";

export type Message = {
    id: string,
    message: string
}


type MessageContextType = {
    GetMessage: (id: string) => Promise<string[]>;
    AddMessage: (id: string, message: string) => void;
}

export const MessageContext = createContext({} as MessageContextType);

type MessageContextProviderProps = {
    children: ReactNode
}

export function MessageContextProvider(props: MessageContextProviderProps) {
    const [messages, setMessages] = useState<Message[]>([])

    async function GetMessage(id: string) {
        let result = messages.filter(message => message.id === id).map(message => message.message)
        setMessages(messages.filter(message => message.id !== id))
        return result
    }

    async function AddMessage(id: string, message: string) {
        setMessages([...messages, { id, message }])
    }

    return (
        <MessageContext.Provider value={{ GetMessage, AddMessage }}>
            {props.children}
        </MessageContext.Provider>
    );
}