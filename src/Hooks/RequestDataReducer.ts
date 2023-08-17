export type RequestDataProps = {
    state: "loading" | "error" | "success" | "initial";
    data?: any;
}

export const RequestReducer = (state: { [key: string]: RequestDataProps }, action: { reqURL: string, requestData: RequestDataProps }) => {
    let newRequestData = {}
    newRequestData[action.reqURL] = action.requestData
    return { ...state, ...newRequestData }
};
