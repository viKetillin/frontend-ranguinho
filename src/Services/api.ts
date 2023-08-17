import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: false,
});

export async function ResponseHandler(data, errors?: { data: any, errors: { [key: string]: { message: string } } }) {
    const errorCode = String(data.resultadoExecucaoEnum);
    const defaultErrors = {
        "-1": {
            type: "not specified",
            message: "Ocorreu um erro não especificado",
            alertType: "error"
        },
        "1": {
            type: "sucess",
            message: "Requisição realizada com sucesso",
            alertType: "success"
        },
        "2": {
            type: "error",
            message: "Ocorreu um erro na requisição",
            alertType: "error"
        },
        "3": {
            type: "invalid",
            message: "Requição inválida",
            alertType: "error"
        },
        "4": {
            type: "unauthorized",
            message: "Usuário não autorizado",
            alertType: "error"
        },
        "5": {
            type: "alert",
            message: "",
            alertType: "warning"
        },
    }


    const message = data?.mensagem ?? (errors === undefined ? undefined : errors[errorCode]?.message) ?? defaultErrors[errorCode]?.message

    const alertType = defaultErrors[errorCode]?.alertType

    return { message, alertType }
}

export default api