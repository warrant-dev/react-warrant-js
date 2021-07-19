import React, { useEffect, useState } from "react";
import useWarrant from "./useWarrant";

export interface ProtectedComponentProps {
    objectType: string;
    objectId: string;
    relation: string;
    children: React.ReactChildren;
}

const ProtectedComponent: React.FunctionComponent<ProtectedComponentProps> = ({ objectType, objectId, relation, children }) => {
    const [showChildren, setShowChildren] = useState<boolean>(false);
    const { sessionToken, hasWarrant } = useWarrant();

    useEffect(() => {
        if (!objectId) {
            throw new Error("Invalid or no objectId provided to ProtectedComponent");
        }

        const checkWarrant = async () => {
            setShowChildren(await hasWarrant(objectType, objectId, relation));
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
