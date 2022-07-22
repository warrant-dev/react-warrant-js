import React, { useEffect, useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { WarrantCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface ProtectedRouteOptions extends WarrantCheck {
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
    },
    component,
    computedMatch,
    ...rest
}) => {
    const { sessionToken, hasWarrant } = useWarrant();
    const [showWrappedComponent, setShowWrappedComponent] = useState<boolean | null>(null);

    useEffect(() => {
        const checkForWarrant = async (warrantCheck: WarrantCheck) => {
            setShowWrappedComponent(await hasWarrant(warrantCheck));
        };

        if (sessionToken) {
            let warrantsToCheck = [...warrants].map(warrant => ({...warrant}));
            warrantsToCheck.forEach((warrant) => {
                if (computedMatch.params[warrant.objectId]) {
                    /** @ts-ignore */
                    warrant.objectId = computedMatch.params[warrant.objectId];
                }

                if (!warrant.objectId) {
                    throw new Error("Invalid or no objectId provided for ProtectedRoute");
                }
            })   

            checkForWarrant({ op, warrants: warrantsToCheck });
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
