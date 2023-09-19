import { ConfigurationContext } from "@/contexts/ConfigurationContext";
import { useContext } from "react";

export const useConfiguration = () => {
    return useContext(ConfigurationContext);
};