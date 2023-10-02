import * as React from "react";
import { EntityLayoutsContext } from "@/contexts/EntityLayoutsContext";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useCallback } from "react";
import { useQuery } from "react-query";
import { evalExpression } from "sp-formatting";

type Props = {
    children: ReactNode;
};

export function EntityLayoutsProvider(props: Props) {
    const { children } = props;
    const configuration = useConfiguration();
    const { sp } = useSP();

    const { data: layouts, isFetched } = useQuery({
        queryKey: ["layouts"],
        queryFn: () => {
            return Services.entityLayoutService.getLayouts(sp, configuration);
        },
        enabled: Boolean(configuration?.entityLayoutListTitle),
        useErrorBoundary: false,
    });

    const getLayout = useCallback(
        (entity: any) => {
            if (!layouts) {
                return undefined;
            }
            return layouts?.find((layout) => {
                // Check content type condition
                const contentType = layout.contentType;
                if (
                    contentType &&
                    (entity.ContentTypeId.indexOf(contentType) === 0 ||
                        entity.ContentType === contentType)
                ) {
                    return true;
                }

                // Check custom condition
                let condition = layout.condition;
                if (condition) {
                    if (condition.indexOf("=") !== 0) {
                        condition = `=${condition}`;
                    }

                    if (evalExpression(condition, { item: entity }) === "true") {
                        return true;
                    }
                }

                return false;
            });
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
