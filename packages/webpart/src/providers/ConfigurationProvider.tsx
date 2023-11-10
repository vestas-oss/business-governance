import * as React from "react";
import { Debug } from "@/components/Debug";
import { Bootstrap } from "@/components/lazy/Bootstrap";
import { ConfigurationContext } from "@/contexts/ConfigurationContext";
import { useProperties } from "@/hooks/useProperties";
import { useSP } from "@/hooks/useSP";
import { Configuration } from "api";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useMemo } from "react";
import { useQuery } from "react-query";
import { ConfigurationService } from "api";

type Props = {
    children: ReactNode;
};

/**
 * Gets configuration from props, guess or search params
 */
export function ConfigurationProvider(props: Props) {
    const { children } = props;
    const { sp } = useSP();

    const properties = useProperties();

    const searchParamsConfiguration = useMemo(() => {
        const urlSearchParams = new URLSearchParams(document.location.search);

        const searchParamsConfiguration = {} as Configuration;
        if (urlSearchParams.has("filter")) {
            const filter = urlSearchParams.get("filter");
            searchParamsConfiguration.filter = filter || "";
        }

        if (urlSearchParams.has("start-node")) {
            const startNode = urlSearchParams.get("start-node");
            searchParamsConfiguration.startNode = startNode || "";
        }

        if (urlSearchParams.has("search")) {
            const startNode = urlSearchParams.get("search");
            searchParamsConfiguration.search = startNode === "true";
        }

        return searchParamsConfiguration;
    }, []);

    const { data: configuration, isFetched } = useQuery({
        queryKey: ["business-governance", "configuration", searchParamsConfiguration, properties],
        queryFn: async () => {
            const selectFirst = <T,>(...args: Array<T>) => {
                const array = args.filter((o) => o !== undefined);
                if (array.length > 0) {
                    return array[0];
                }
                return undefined;
            };

            const presets = {
                select: properties?.select,
                filter: selectFirst(searchParamsConfiguration.filter, properties?.filter),
                search: selectFirst(searchParamsConfiguration.search, properties?.search),
                startNode: selectFirst(searchParamsConfiguration.startNode, properties?.startNode),
                parentColumn: properties.parentColName,
            };

            const service = new ConfigurationService(sp, presets);
            return await service.getConfiguration();
        },
    });

    if (isFetched && !configuration?.entityListTitle) {
        return <Bootstrap />;
    }

    return (
        <ConfigurationContext.Provider value={configuration}>
            {isFetched && children}
            <Debug title="Configuration" data={configuration} />
        </ConfigurationContext.Provider>
    );
}
