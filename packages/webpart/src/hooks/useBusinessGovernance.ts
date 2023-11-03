import { BusinessGovernanceContext } from "@/contexts/BusinessGovernanceContext";
import { useContext } from "react";

export const useBusinessGovernance = () => {
    return useContext(BusinessGovernanceContext);
};