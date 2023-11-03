import { PropertiesContext } from "@/contexts/PropertiesContext";
import { useContext } from "react";

export const useSetProperties = () => {
    return useContext(PropertiesContext)?.setProperties;
};