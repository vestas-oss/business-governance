import { SharePointContext } from "@/contexts/SharePointContext";
import { useContext } from "react";

export const useSP = () => {
    return useContext(SharePointContext);
};