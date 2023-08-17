import { useEffect, useState } from "react";

import Produto from "../../../../Types/Produto";

import ProdutoView from "../../Adm/Views/ProdutoView";
import OpaqueBackground from "../OpaqueBackground";

interface ProdutoPopupProps {
    open: boolean,
    onClose: () => void,
    idFranquia: number,
    produto: Produto,
}

const ProdutoPopup = ({ open, onClose, idFranquia, produto }: ProdutoPopupProps) => {
    const [cashedData, setCashedData] = useState({ produto, idFranquia });

    useEffect(() => {
        if (open)
            setCashedData({ produto, idFranquia })
    }, [open, idFranquia, produto])
    return (
        <OpaqueBackground open={open} callback={onClose}>
            <div data-aos="fade-down" className="w-full bg-gray-200 rounded p-2" style={{ maxWidth: "800px" }}>
                <ProdutoView {...{ open, ...cashedData }} CloseCallback={onClose} />
            </div>
        </OpaqueBackground>
    )
}

export default ProdutoPopup;