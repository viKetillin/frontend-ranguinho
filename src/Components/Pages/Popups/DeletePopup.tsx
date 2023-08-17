import { useEffect, useState } from "react";

import OpaqueBackground from "./OpaqueBackground"
import { Alert } from "../../Utils";

import { VscWarning } from "react-icons/vsc";

interface DeletePopupProps {
    open: boolean,
    onCancel: () => void,
    onDelete: () => void,
    status?: string,
    message?: string,
    alerts?: string[],
}

const DeletePopup = ({ open, onDelete, onCancel, status, message, alerts }: DeletePopupProps) => {
    const [msg, setMsg] = useState(message);

    useEffect(() => {
        if (open)
            setMsg(message)
    }, [open, message])

    return (
        <OpaqueBackground open={open} callback={onCancel}>
            <div data-aos="fade-down" className="w-full bg-gray-100 rounded-lg" style={{ maxWidth: "600px" }}>
                <div className="p-6 flex gap-4 items-center">
                    <div>
                        <VscWarning size={75} />
                    </div>
                    <div className="grow">
                        <h2 className="text-2xl">Confirmação</h2>
                        <p className="text-gray-800 mt-3">{msg}</p>
                    </div>
                </div>
                <div className="pb-2 px-4">
                {alerts?.map(msg => <Alert key={msg} message={msg} type="error" />)}
                </div>
                <div className="flex gap-4 justify-end p-4 px-8 bg-zinc-200 rounded-b-lg">
                    <button onClick={onCancel} className="border rounded bg-white hover:bg-zinc-100 text-gray-700 border px-4 py-2">Cancelar</button>
                    <button onClick={onDelete} className="bg-red-600 hover:bg-red-700 rounded text-white px-6 py-2">
                        {status === "loading" ? "Carregando..." : "Sim"}
                    </button>
                </div>
            </div>
        </OpaqueBackground>
    )
}

DeletePopup.defaultProps = {
    alerts: [],
    open: false,
    status: "",
    message: ""
}

export default DeletePopup;