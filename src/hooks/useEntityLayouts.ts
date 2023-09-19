import { EntityLayoutsContext } from "@/contexts/EntityLayoutsContext";
import { useContext } from "react";

export const useEntityLayouts = () => {
    return useContext(EntityLayoutsContext);
};