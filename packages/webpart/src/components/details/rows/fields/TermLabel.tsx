import * as React from "react";
import { Entity } from "@business-governance/api";
import { useEffect, useState } from "react";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";

type Props = {
    wssId: string;
    entity: Entity;
};

// Repair label
// https://sympmarc.com/2017/06/19/retrieving-multiple-sharepoint-managed-metadata-columns-via-rest/
export const TermLabel = (props: Props) => {
    const { wssId, entity } = props;
    const [taxCatchAll, setTaxCatchAll] = useState<any>();
    const bg = useBusinessGovernance();

    useEffect(() => {
        (async () => {
            const selects = ["TaxCatchAll/ID", "TaxCatchAll/Term"];
            const expands = ["TaxCatchAll"];
            const itemInfo = await bg.entityService.getEntityDetails(entity.id, selects, expands);
            setTaxCatchAll(itemInfo.TaxCatchAll);
        })();
    }, [wssId, entity.id]);

    if (!taxCatchAll) {
        return <></>;
    }

    const term = taxCatchAll.find((t: { ID: string }) => t.ID === wssId);
    if (term) {
        return <>{term.Term}</>;
    }

    return null;
};
