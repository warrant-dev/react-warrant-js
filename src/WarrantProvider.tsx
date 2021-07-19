import React, { useCallback, useEffect, useState } from "react";
import {Client as WarrantClient} from "@warrantdev/warrant-js";

import WarrantContext, { AuthorizationContext } from "./WarrantContext";

export interface AuthorizationProvider extends AuthorizationContext {
    clientKey: string;
    children: React.ReactNode;
}

const LOCAL_STORAGE_KEY_SESSION_TOKEN = "__warrantSessionToken";

const WarrantProvider = (options: AuthorizationProvider): JSX.Element => {
    const { clientKey, children } = options;
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

    const hasWarrant = useCallback(async (objectType: string, objectId: string, relation: string): Promise<boolean> => {
        if (!sessionToken) {
            throw new Error("No session token provided to Warrant. You may have forgotten to call setSessionToken with a valid session token to finish initializing Warrant.");
        }

        setIsLoading(true);
        const isAuthorized = await new WarrantClient(clientKey, sessionToken).isAuthorized(objectType, objectId, relation);
        setIsLoading(false);

        return isAuthorized;
    }, [sessionToken]);

    return <WarrantContext.Provider value={{
        clientKey,
        sessionToken,
        setSessionToken: updateSessionToken,
        hasWarrant,
        isLoading,
    }}>
        {children}
    </WarrantContext.Provider>;
};

export default WarrantProvider;
