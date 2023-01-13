import React, { useCallback, useEffect, useState } from "react";
import { WarrantClient, CheckMany, Check, PermissionCheck, FeatureCheck } from "@warrantdev/warrant-js";

import WarrantContext from "./WarrantContext";

export interface AuthorizationProvider {
    clientKey: string;
    endpoint?: string;
    children: React.ReactNode;
}

const LOCAL_STORAGE_KEY_SESSION_TOKEN = "__warrantSessionToken";

const WarrantProvider = (options: AuthorizationProvider): JSX.Element => {
    const { clientKey, endpoint, children } = options;
    const [sessionToken, setSessionToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const storedSessionToken = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION_TOKEN);
        if (storedSessionToken) {
            setSessionToken(storedSessionToken);
        }
    }, []);

    const updateSessionToken = (newSessionToken: string) => {
        setSessionToken(newSessionToken);

        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION_TOKEN, newSessionToken);
    };

    const check = useCallback(async (check: Check): Promise<boolean> => {
        if (!sessionToken) {
            throw new Error("No session token provided to Warrant. You may have forgotten to call setSessionToken with a valid session token to finish initializing Warrant.");
        }

        setIsLoading(true);
        const isAuthorized = await new WarrantClient({ clientKey, sessionToken, endpoint }).check(check);
        setIsLoading(false);

        return isAuthorized;
    }, [sessionToken]);

    const checkMany = useCallback(async (check: CheckMany): Promise<boolean> => {
        if (!sessionToken) {
            throw new Error("No session token provided to Warrant. You may have forgotten to call setSessionToken with a valid session token to finish initializing Warrant.");
        }

        setIsLoading(true);
        const isAuthorized = await new WarrantClient({ clientKey, sessionToken, endpoint }).checkMany(check);
        setIsLoading(false);

        return isAuthorized;
    }, [sessionToken]);

    const hasPermission = useCallback(async (check: PermissionCheck): Promise<boolean> => {
        if (!sessionToken) {
            throw new Error("No session token provided to Warrant. You may have forgotten to call setSessionToken with a valid session token to finish initializing Warrant.");
        }

        setIsLoading(true);
        const hasPermission = await new WarrantClient({ clientKey, sessionToken, endpoint }).hasPermission(check);
        setIsLoading(false);

        return hasPermission;
    }, [sessionToken]);

    const hasFeature = useCallback(async (check: FeatureCheck): Promise<boolean> => {
        if (!sessionToken) {
            throw new Error("No session token provided to Warrant. You may have forgotten to call setSessionToken with a valid session token to finish initializing Warrant.");
        }

        setIsLoading(true);
        const hasFeature = await new WarrantClient({ clientKey, sessionToken, endpoint }).hasFeature(check);
        setIsLoading(false);

        return hasFeature;
    }, [sessionToken]);

    return <WarrantContext.Provider value={{
        clientKey,
        sessionToken,
        setSessionToken: updateSessionToken,
        check,
        checkMany,
        hasPermission,
        hasFeature,
        isLoading,
    }}>
        {children}
    </WarrantContext.Provider>;
};

export default WarrantProvider;
