import React, { useEffect, useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { WARRANT_IGNORE_ID } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface ProtectedRouteOptions {
    objectType: string;
    objectIdParam: string;
    relation: string;
    redirectTo: string;
}

export interface ProtectedRouteProps extends RouteProps {
    options: ProtectedRouteOptions;
    computedMatch: any;
}

const ProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({
    options: {
        objectType,
        objectIdParam,
        relation,
        redirectTo,
    },
    component,
    computedMatch,
    ...rest
}) => {
    const { sessionToken, hasWarrant } = useWarrant();
    const [showWrappedComponent, setShowWrappedComponent] = useState<boolean | null>(null);

    useEffect(() => {
        const checkForWarrant = async (objectId: string) => {
            setShowWrappedComponent(await hasWarrant(objectType, objectId, relation));
        };

        if (sessionToken) {
            let objectId = "";
            if (objectIdParam === WARRANT_IGNORE_ID) {
                objectId = WARRANT_IGNORE_ID;
            } else {
                /** @ts-ignore */
                objectId = computedMatch.params[objectIdParam];
            }

            if (!objectId) {
                throw new Error("Invalid or no objectIdParam provided for ProtectedRoute");
            }

            checkForWarrant(objectId);
        }
    }, [sessionToken]);

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

export default ProtectedRoute;
