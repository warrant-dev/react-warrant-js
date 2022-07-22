import React, { useEffect, useState } from "react";
import { WarrantCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface WithWarrantOptions extends WarrantCheck {
    redirectTo: string;
}

/**
 * A higher order component (HOC) to wrap around any component that should only be visible to users with the appropriate warrant
 *
 * @param WrappedComponent The component to be rendered if the user has the appropriate warrant
 * @param options The options used to construct the warrant to check for
 * @returns
 */
const withWarrant = (WrappedComponent: React.ComponentClass, options: WithWarrantOptions) => {
    return (props: any) => {
        const { op, warrants, redirectTo } = options;
        const { sessionToken, hasWarrant } = useWarrant();
        const [showWrappedComponent, setShowWrappedComponent] = useState<boolean>(false);

        useEffect(() => {
            const checkWarrant = async () => {
                setShowWrappedComponent(await hasWarrant({ op, warrants }));
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

export default withWarrant;
