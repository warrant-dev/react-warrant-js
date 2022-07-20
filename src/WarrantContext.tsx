import { createContext } from "react";
import WarrantCheck from "../types/WarrantCheck";

export interface AuthorizationContext {
    clientKey: string;
    sessionToken: string;
    setSessionToken: (sessionToken: string) => void;
    hasWarrant: (warrantCheck: WarrantCheck) => Promise<boolean>;
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
