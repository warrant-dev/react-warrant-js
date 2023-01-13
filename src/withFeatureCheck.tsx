import React, { useEffect, useState } from "react";
import { FeatureCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface WithFeatureCheckOptions extends FeatureCheck {
    redirectTo: string;
}

/**
 * A higher order component (HOC) to wrap around any component that should only be visible to users with the appropriate warrant
 *
 * @param WrappedComponent The component to be rendered if the user has the appropriate warrant
 * @param options The options containing the featureId to check for and a redirectTo path for unauthorized access.
 * @returns
 */
const withFeatureCheck = (WrappedComponent: React.ComponentClass, options: WithFeatureCheckOptions) => {
    return (props: any) => {
        const { featureId, consistentRead, debug, redirectTo } = options;
        const { sessionToken, hasFeature } = useWarrant();
        const [showWrappedComponent, setShowWrappedComponent] = useState<boolean>(false);

        useEffect(() => {
            const checkWarrant = async () => {
                setShowWrappedComponent(await hasFeature({ featureId, consistentRead, debug }));
            };

            if (sessionToken) {
                checkWarrant();
            }
        }, [sessionToken]);

        if (!sessionToken) {
            return <></>;
        }

        if (showWrappedComponent) {
            return <WrappedComponent {...props}/>;
        }

        window.history.replaceState({}, document.title, redirectTo);

        return null;
    }
}

export default withFeatureCheck;
