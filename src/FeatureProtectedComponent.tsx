import React, { useEffect, useState } from "react";
import { FeatureCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface FeatureProtectedComponentProps extends FeatureCheck {
    children: React.ReactNode;
}

const FeatureProtectedComponent: React.FunctionComponent<FeatureProtectedComponentProps> = ({ children, featureId, consistentRead, debug }) => {
    const [showChildren, setShowChildren] = useState<boolean>(false);
    const { sessionToken, hasFeature } = useWarrant();

    useEffect(() => {
        if (!featureId) {
            throw new Error("Invalid or no featureId provided to FeatureProtectedComponent");
        }

        const checkWarrant = async () => {
            setShowChildren(await hasFeature({ featureId, consistentRead, debug }));
        }

        if (sessionToken) {
            checkWarrant();
        }
    }, [sessionToken, JSON.stringify(featureId)]);

    if (showChildren) {
        return <>
            {children}
        </>;
    }

    return null;
};

export default FeatureProtectedComponent;
