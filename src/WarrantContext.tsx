import { createContext } from "react";

export interface AuthorizationContext {
    clientKey: string;
    sessionToken: string;
    setSessionToken: (sessionToken: string) => void;
    hasWarrant: (warrantName: string) => Promise<boolean>;
    isLoading: boolean;
}

const noop = (): never => {
    throw new Error("You didn't wrap your component in <WarrantProvider>!");
};


const WarrantContext = createContext<AuthorizationContext>({
    clientKey: "",
    sessionToken: "",
    setSessionToken: noop,
    hasWarrant: noop,
    isLoading: false,
});

export default WarrantContext;
