import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import { Entity } from "@/types/Entity";
import { useEffect, useState } from "react";

type Props = {
    wssId: string;
    entity: Entity;
};

// Repair label
// https://sympmarc.com/2017/06/19/retrieving-multiple-sharepoint-managed-metadata-columns-via-rest/
export const TermLabel = (props: Props) => {
    const { wssId, entity } = props;
    const [taxCatchAll, setTaxCatchAll] = useState<any>();
    const { sp } = useSP();
    const configuration = useConfiguration();

    useEffect(() => {
        (async () => {
            const selects = ["TaxCatchAll/ID", "TaxCatchAll/Term"];
            const expands = ["TaxCatchAll"];
            const itemInfo = await Services.entityService.getEntityDetails(
                sp,
                configuration!,
                entity.id,
                selects,
                expands
            );
            setTaxCatchAll(itemInfo.TaxCatchAll);
        })();
    }, [wssId, entity.id, sp, configuration]);

    if (!taxCatchAll) {
        return <></>;
    }

    const term = taxCatchAll.find((t: { ID: string }) => t.ID === wssId);
    if (term) {
        return <>{term.Term}</>;
    }

    return null;
};
