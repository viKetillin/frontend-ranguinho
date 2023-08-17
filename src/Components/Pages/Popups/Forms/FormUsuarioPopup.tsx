import { useEffect, useState } from "react";

import OpaqueBackground from "../OpaqueBackground";
import FormUsuario from "../../Adm/Forms/FormUsuario";
import { Usuario } from "../../../../Pages/Admin/Cadastro/Usuario/Index";

interface FormUsuarioPopupProps {
    onClose: () => void,
    onSuccess?: () => void,
    usuario?: Usuario,
    open: boolean,
}

const FormUsuarioPopup = ({ open, usuario, onSuccess, onClose }: FormUsuarioPopupProps) => {
    return (
        <OpaqueBackground callback={onClose} open={open}>
            <div data-aos="fade-down" className="bg-white max-h-screen max-w-[44rem] w-full rounded flex flex-col">
                <FormUsuario usuario={usuario} onSuccess={onSuccess} CloseCallback={onClose} />
            </div>
        </OpaqueBackground>
    )
}

export default FormUsuarioPopup;