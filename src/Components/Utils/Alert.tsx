import { MdDone } from "react-icons/md";
import { IoMdAlert } from "react-icons/io";

export type AlertProps = {
    message: string;
    type: "warning" | "error" | "success";
}

const Index = ({ message, type }: AlertProps) => {
    return (
        <>
            {type === "error" &&
                <div className="p-2 px-3 text-sm flex items-center gap-2 text-white bg-red-600 rounded-lg">
                    <IoMdAlert size={17} />
                    <span className="opacity-90">
                        {message}
                    </span>
                </div>}

            {type === "success" &&
                <div className="p-2 px-3 text-sm flex items-center gap-2 text-white bg-green-600 rounded-lg">
                    <MdDone size={17} />
                    <span className="opacity-90">
                        {message}
                    </span>
                </div>}
        </>
    )
}

export const AlertReducer = (state: { [key: string]: AlertProps[] }, action: { type: "ADD-FROM-ORIGIN" | "REMOVE-FROM-ORIGIN" | "REPLACE-ALL-FROM-ORIGIN", origin: string, alerts: AlertProps[] }) => {
    let newOriginAlerts = {}
    switch (action.type) {
        case "ADD-FROM-ORIGIN":
            newOriginAlerts[action.origin] = [...(state[action.origin] ?? []), ...action.alerts]
            return {...state, ...newOriginAlerts}
        case "REPLACE-ALL-FROM-ORIGIN":
            newOriginAlerts[action.origin] = [...action.alerts]
            return {...state, ...newOriginAlerts}
        case "REMOVE-FROM-ORIGIN":
            delete state[action.origin]
            return state
        default:
            return state
    }
};

export default Index