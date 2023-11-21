import * as React from "react";
import { BusinessGovernanceContext } from "@/contexts/BusinessGovernanceContext";
import { BusinessGovernanceService } from "@business-governance/api";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useState } from "react";
import { useSP } from "@/hooks/useSP";
import { useConfiguration } from "@/hooks/useConfiguration";

type Props = {
    children: ReactNode;
};

export function BusinessGovernanceProvider(props: Props) {
    const { sp } = useSP();
    const configuration = useConfiguration();
    const [bg] = useState(new BusinessGovernanceService(sp, configuration));

    return (
        <BusinessGovernanceContext.Provider value={bg}>
            {props.children}
        </BusinessGovernanceContext.Provider>
    );
}
