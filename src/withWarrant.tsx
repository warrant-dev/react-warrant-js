import React, { useEffect, useState } from "react";
import useWarrant from "./useWarrant";

export interface WithWarrantOptions {
    permissionId: string;
    redirectTo: string;
}

/**
 * A higher order component (HOC) to wrap around any component that should only be visible to users with the appropriate permissions
 *
 * @param WrappedComponent The component to be rendered if the user has the specified permissionId
 * @param permissionId The id of the permission required to successfully view the WrappedComponent
 * @param accessDeniedContent Any content to be shown if the user does not have the specified permissionId
 */
const withWarrant = (WrappedComponent: React.ComponentClass, options: WithWarrantOptions) => {
    return (props: any) => {
        const { permissionId, redirectTo } = options;
        const { sessionToken, hasWarrant } = useWarrant();
        const [showWrappedComponent, setShowWrappedComponent] = useState<boolean>(false);

        useEffect(() => {
            const checkWarrant = async () => {
                setShowWrappedComponent(await hasWarrant(permissionId));
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
