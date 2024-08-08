import * as React from "react";
import { EntityLayoutsContext } from "@/contexts/EntityLayoutsContext";
import { useConfiguration } from "@/hooks/useConfiguration";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useCallback } from "react";
import { useQuery } from "react-query";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";

type Props = {
    children: ReactNode;
};

export function EntityLayoutsProvider(props: Props) {
    const { children } = props;
    const configuration = useConfiguration();
    const bg = useBusinessGovernance();

    const { data: layouts, isFetched } = useQuery({
        queryKey: ["layouts"],
        queryFn: () => {
            return bg.entityLayoutService.getLayouts();
        },
        enabled: Boolean(configuration?.entityLayoutListTitle),
        useErrorBoundary: false,
    });

    const getLayout = useCallback(
        (entity: any) => {
            return bg.entityLayoutService.getLayout(entity, layouts);
        },
        [layouts]
    );

    if (!Boolean(configuration?.entityLayoutListTitle)) {
        console.log("business governance: Warning entityLayoutListTitle not set");
    }

    return (
        <EntityLayoutsContext.Provider value={{ layouts: layouts || [], getLayout }}>
            {(isFetched || !Boolean(configuration?.entityLayoutListTitle)) && children}
        </EntityLayoutsContext.Provider>
    );
}
