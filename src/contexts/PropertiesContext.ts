import { Properties } from "@/types/Properties";
import { createContext } from "react";

type PropertiesContext = { properties: Properties | undefined, setProperties?: (properties: Properties) => void } | undefined;

export const PropertiesContext = createContext<PropertiesContext>(undefined);