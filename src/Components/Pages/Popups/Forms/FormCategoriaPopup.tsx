import { useEffect, useState } from "react";

import OpaqueBackground from "../OpaqueBackground";
import FormCategoria from "../../Adm/Forms/FormCategoria";

import { Categoria } from "../../../../Types/Produto";

interface FormCategoriaPopupProps {
    onClose: () => void,
    onSuccess?: () => void,
    categoria?: Categoria,
    franquiaId: number,
    open: boolean,
}

const FormCategoriaPopup = ({ open, franquiaId, categoria, onSuccess, onClose }: FormCategoriaPopupProps) => {
    const [newCategoria, setNewCategoria] = useState(categoria);

    useEffect(() => {
        if (open)
            setNewCategoria(categoria)
    }, [open, categoria])

    return (
        <OpaqueBackground callback={onClose} open={open}>
            <div data-aos="fade-down" className="bg-white max-h-screen max-w-[32rem] w-full rounded flex flex-col">
                <FormCategoria franquiaId={franquiaId} categoria={newCategoria} onSuccess={onSuccess} CloseCallback={onClose} />
            </div>
        </OpaqueBackground>
    )
}

export default FormCategoriaPopup;