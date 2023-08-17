import { useEffect, useState } from "react";

import OpaqueBackground from "../OpaqueBackground";

import { Ingrediente } from "../../../../Types/Ingrediente";
import FormIngrediente from "../../Adm/Forms/FormIngrediente";

interface FormIngredientePopupProps {
    onClose: () => void,
    onSuccess?: () => void,
    ingrediente?: Ingrediente,
    open: boolean,
    estabelecimentoId: number,
}

const FormIngredientePopup = ({ open, ingrediente, estabelecimentoId, onSuccess, onClose }: FormIngredientePopupProps) => {
    return (
        <OpaqueBackground callback={onClose} open={open}>
            <div data-aos="fade-down" className="bg-white max-h-screen max-w-[32rem] w-full rounded flex flex-col">
                <FormIngrediente ingrediente={ingrediente} onSuccess={onSuccess} CloseCallback={onClose} estabelecimentoId={estabelecimentoId}/>
            </div>
        </OpaqueBackground>
    )
}

export default FormIngredientePopup;