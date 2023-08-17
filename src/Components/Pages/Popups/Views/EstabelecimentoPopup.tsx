import { useEffect, useState } from "react";

import EstabelecimentoView from "../../Adm/Views/EstabelecimentoView";
import OpaqueBackground from "../OpaqueBackground";

import Franquia from "../../../../Types/Franquia";

interface EstabelecimentoPopupProps {
    open: boolean,
    onClose: () => void,
    franquia: Franquia
}

const EstabelecimentoPopup = ({ franquia, open, onClose }: EstabelecimentoPopupProps) => {
    const [cashedFranquia, setCashedFranquia] = useState(franquia);

    useEffect(() => {
        if (open)
        setCashedFranquia(franquia)
    }, [open, franquia])
    return (
        <OpaqueBackground open={open} callback={onClose}>
            <div data-aos="fade-down" className="w-full bg-gray-200 rounded p-2" style={{ maxWidth: "800px" }}>
                <EstabelecimentoView franquia={cashedFranquia} CloseCallback={onClose} />
            </div>
        </OpaqueBackground>
    )
}

export default EstabelecimentoPopup;