import { PropertiesContext } from "@/contexts/PropertiesContext";
import { useContext } from "react";

export const useProperties = () => {
    return useContext(PropertiesContext)?.properties;
};