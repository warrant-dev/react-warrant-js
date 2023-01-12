import React, { useEffect, useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { PermissionCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface PermissionProtectedRouteOptions extends PermissionCheck {
    redirectTo: string;
}

export interface ProtectedRouteProps extends RouteProps {
    options: PermissionProtectedRouteOptions;
    computedMatch: any;
}

const PermissionProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({
    options: {
        permissionId,
        redirectTo,
        consistentRead,
        debug,
    },
    component,
    computedMatch,
    ...rest
}) => {
    const { sessionToken, hasPermission } = useWarrant();
    const [showWrappedComponent, setShowWrappedComponent] = useState<boolean | null>(null);

    useEffect(() => {
        const checkForPermission = async (check: PermissionCheck) => {
            setShowWrappedComponent(await hasPermission(check));
        };

        if (sessionToken) {
            checkForPermission({ permissionId, consistentRead, debug });
        }
    }, [sessionToken, JSON.stringify(permissionId)]);

    return <Route
        {...rest}
        render={(props: RouteProps) => {
            if (!sessionToken || showWrappedComponent === null) {
                return <></>;
            }

            if (showWrappedComponent) {
                return React.createElement(component, {...props});
            }

            return <Redirect to={redirectTo}/>;
        }}
    />;
};

export default PermissionProtectedRoute;
