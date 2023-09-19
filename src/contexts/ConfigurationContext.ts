import { Configuration } from "@/types/Configuration";
import { createContext } from "react";

type ConfigurationContext = Configuration | undefined;

export const ConfigurationContext = createContext<ConfigurationContext>(undefined);