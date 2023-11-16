import { BusinessGovernanceService } from "@business-governance/api";
import { createContext } from "react";

type BusinessGovernance = BusinessGovernanceService | undefined;

export const BusinessGovernanceContext = createContext<BusinessGovernance>(undefined);