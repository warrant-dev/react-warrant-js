import React, { useEffect, useState } from "react";
import useWarrant from "./useWarrant";

export interface ProtectedComponentProps {
    permissionId: string;
    children: React.ReactChildren;
}

const ProtectedComponent: React.FunctionComponent<ProtectedComponentProps> = ({ permissionId, children }) => {
    const [showChildren, setShowChildren] = useState<boolean>(false);
    const { hasWarrant } = useWarrant();

    useEffect(() => {
        const checkWarrant = async () => {
            setShowChildren(await hasWarrant(permissionId));
        }

        checkWarrant();
    }, []);

    if (showChildren) {
        return <>
            {children}
        </>;
    }

    return null;
};

export default ProtectedComponent;
