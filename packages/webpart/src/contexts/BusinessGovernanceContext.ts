import { BusinessGovernanceService } from "api";
import { createContext } from "react";

type BusinessGovernance = BusinessGovernanceService | undefined;

export const BusinessGovernanceContext = createContext<BusinessGovernance>(undefined);