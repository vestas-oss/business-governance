import { DisplayMode } from "@/types/DisplayMode";
import { SPFI, spfi } from "@pnp/sp";
import { createContext } from "react";

type SharePointContext = {
    sp: SPFI;
    displayMode: DisplayMode;
};

export const SharePointContext = createContext<SharePointContext>({ sp: spfi().using(), displayMode: DisplayMode.Read });