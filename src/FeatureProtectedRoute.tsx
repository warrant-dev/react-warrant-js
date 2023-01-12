import React, { useEffect, useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { FeatureCheck } from "@warrantdev/warrant-js";
import useWarrant from "./useWarrant";

export interface FeatureProtectedRouteOptions extends FeatureCheck {
    redirectTo: string;
}

export interface ProtectedRouteProps extends RouteProps {
    options: FeatureProtectedRouteOptions;
    computedMatch: any;
}

const FeatureProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({
    options: {
        featureId,
        redirectTo,
        consistentRead,
        debug,
    },
    component,
    computedMatch,
    ...rest
}) => {
    const { sessionToken, hasFeature } = useWarrant();
    const [showWrappedComponent, setShowWrappedComponent] = useState<boolean | null>(null);

    useEffect(() => {
        const checkForPermission = async (check: FeatureCheck) => {
            setShowWrappedComponent(await hasFeature(check));
        };

        if (sessionToken) {
            checkForPermission({ featureId, consistentRead, debug });
        }
    }, [sessionToken, JSON.stringify(featureId)]);

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

export default FeatureProtectedRoute;
