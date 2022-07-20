import React, { useEffect, useState } from "react";
import WarrantCheck from "../types/WarrantCheck";
import useWarrant from "./useWarrant";

export interface ProtectedComponentProps extends WarrantCheck {
    children: React.ReactChildren;
}

const ProtectedComponent: React.FunctionComponent<ProtectedComponentProps> = ({ op, warrants, children }) => {
    const [showChildren, setShowChildren] = useState<boolean>(false);
    const { sessionToken, hasWarrant } = useWarrant();

    useEffect(() => {
        if (!warrants) {
            throw new Error("Invalid or no warrants provided to ProtectedComponent");
        }

        const checkWarrant = async () => {
            setShowChildren(await hasWarrant({ op, warrants }));
        }

        if (sessionToken) {
            checkWarrant();
        }
    }, [sessionToken]);

    if (showChildren) {
        return <>
            {children}
        </>;
    }

    return null;
};

export default ProtectedComponent;
