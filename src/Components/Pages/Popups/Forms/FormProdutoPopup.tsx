import OpaqueBackground from "../OpaqueBackground";
import FormProduto from "../../Adm/Forms/FormProduto";

import Produto, { Categoria } from "../../../../Types/Produto";

interface FormProdutoProps {
    onClose: () => void,
    onSuccess?: () => void,
    categorias?: Categoria[],
    produto?: Produto,
    franquiaId: number,
    open: boolean,
}

const FormProdutoPopup = ({ open, franquiaId, produto, categorias, onSuccess, onClose }: FormProdutoProps) => {
    return (
        <OpaqueBackground callback={onClose} open={open}>
            <div data-aos="fade-down" className="bg-white max-h-screen max-w-[44rem] w-full rounded flex flex-col">
                <FormProduto produto={produto} idFranquia={franquiaId} categorias={categorias} onSuccess={onSuccess} CloseCallback={onClose} />
            </div>
        </OpaqueBackground>
    )
}

export default FormProdutoPopup;