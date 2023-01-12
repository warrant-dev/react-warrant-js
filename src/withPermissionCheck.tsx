import React, { useEffect, useState } from "react";
import { PermissionCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface WithPermissionOptions extends PermissionCheck {
    redirectTo: string;
}

/**
 * A higher order component (HOC) to wrap around any component that should only be visible to users with the appropriate warrant
 *
 * @param WrappedComponent The component to be rendered if the user has the appropriate warrant
 * @param options The options containing the permissionId to check for and a redirectTo path for unauthorized access.
 * @returns
 */
const withPermissionCheck = (WrappedComponent: React.ComponentClass, options: WithPermissionOptions) => {
    return (props: any) => {
        const { permissionId, consistentRead, debug, redirectTo } = options;
        const { sessionToken, hasPermission } = useWarrant();
        const [showWrappedComponent, setShowWrappedComponent] = useState<boolean>(false);

        useEffect(() => {
            const checkWarrant = async () => {
                setShowWrappedComponent(await hasPermission({ permissionId, consistentRead, debug }));
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

export default withPermissionCheck;
