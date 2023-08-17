import React, { useEffect, useState } from "react";
import Outclick from "../../Utils/Outclick";

interface Props {
    children?: React.ReactNode;
    open: boolean;
    callback: () => void;
}

const OpaqueBackground = ({ open, callback, children }: Props) => {
    const [opened, setOpened] = useState<boolean>(open);

    useEffect(() => {
        if (open)
            setOpened(open)
        else
            setTimeout(() => { setOpened(open) }, 300);
    }, [open])

    return opened ?
        <div className={`fixed h-screen ${open !== true ? "backdrop-filter-none blur opacity-0" : "backdrop-blur-sm bg-black/60 blur-none opacity-100"} transition duration-300 w-screen top-0 left-0 flex items-center justify-center z-30`}>
            <Outclick callback={callback}>
                {children}
            </Outclick>
        </div>
        : <></>
}

OpaqueBackground.defaultProps = {
    open: false,
    callback: () => { }
}

export default OpaqueBackground;