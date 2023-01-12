import React, { useEffect, useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { CheckMany } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface ProtectedRouteOptions extends CheckMany {
    redirectTo: string;
}

export interface ProtectedRouteProps extends RouteProps {
    options: ProtectedRouteOptions;
    computedMatch: any;
}

const ProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({
    options: {
        op,
        warrants,
        redirectTo,
        consistentRead,
        debug,
    },
    component,
    computedMatch,
    ...rest
}) => {
    const { sessionToken, checkMany } = useWarrant();
    const [showWrappedComponent, setShowWrappedComponent] = useState<boolean | null>(null);

    useEffect(() => {
        const checkForWarrants = async (check: CheckMany) => {
            setShowWrappedComponent(await checkMany(check));
        };

        if (sessionToken) {
            let warrantsToCheck = [...warrants].map(warrant => ({...warrant}));
            warrantsToCheck.forEach((warrant) => {
                if (computedMatch.params[warrant.object.getObjectId()]) {
                    /** @ts-ignore */
                    warrant.objectId = computedMatch.params[warrant.objectId];
                }

                if (!warrant.object.getObjectId()) {
                    throw new Error("Invalid or no objectId provided for ProtectedRoute");
                }
            })

            checkForWarrants({ op, warrants: warrantsToCheck, consistentRead, debug });
        }
    }, [sessionToken, JSON.stringify(warrants)]);

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
