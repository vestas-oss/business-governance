import * as React from "react";
import { Bootstrap } from "@/components/lazy/Bootstrap";
import { ConfigurationContext } from "@/contexts/ConfigurationContext";
import { useProperties } from "@/hooks/useProperties";
import { useSP } from "@/hooks/useSP";
import { Configuration } from "@/types/Configuration";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useMemo } from "react";
import { useQuery } from "react-query";

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

            const listInfos = await sp.web.lists.filter(
                "BaseTemplate eq 100 and Hidden eq false"
            )();

            const getEntityList = async () => {
                let title = properties?.entityListTitle;
                if (!title) {
                    // Try to guess the list
                    let lists = listInfos.filter((listInfo) => listInfo.ItemCount > 0);

                    lists = lists.filter(
                        (list) =>
                            list.Title !== "EntityType" &&
                            list.Title !== "Configuration" &&
                            list.Title !== "Entity Layouts"
                    );

                    if (lists.length > 0) {
                        lists = lists.sort((a, b) => b.ItemCount - a.ItemCount);
                        title = lists[0].Title;

                        console.log(
                            `business-governance: Warning entity list not set, guessed '${title}'`
                        );
                    }
                }

                return title;
            };

            const configuration: Configuration = {
                select: properties?.select,
                entityListTitle: await getEntityList(),
                entityLayoutListTitle: listInfos.find(
                    (l) =>
                        l.Title === "Entity Layouts" ||
                        l.Title === "EntityType" ||
                        l.Title === "EntityTypes"
                )?.Title,
                entityEventsList: listInfos.find(
                    (l) => l.Title === "Meetings" || l.Title === "Events"
                )?.Title,
                entityUserRolesList: listInfos.find((l) => l.Title === "Roles")?.Title,
                entityRolesList: listInfos.find((l) => l.Title === "MemberRoles")?.Title,
                filter: selectFirst(searchParamsConfiguration.filter, properties?.filter),
                search: selectFirst(searchParamsConfiguration.search, properties?.search),
                startNode: selectFirst(searchParamsConfiguration.startNode, properties?.startNode),
            };

            if (
                listInfos.find((l) => l.Title === "Roles") &&
                listInfos.find((l) => l.Title === "User Roles")
            ) {
                configuration.entityUserRolesList = "User Roles";
                configuration.entityRolesList = "Roles";
            }

            const getParentColumn = async () => {
                if (properties?.parentColName) {
                    return properties.parentColName;
                }

                if (configuration.entityListTitle) {
                    // Guess parent column
                    try {
                        const list = sp.web.lists.getByTitle(configuration.entityListTitle);
                        const listInfo = await list();
                        const lookupFields = await list.fields.filter(
                            `TypeAsString eq 'Lookup' and (LookupList eq '${listInfo.Id}' or LookupList eq '{${listInfo.Id}}')`
                        )();

                        if (lookupFields?.length > 0) {
                            const name = lookupFields[0].InternalName;
                            console.log(`business-governance: Guessed parent column  to '${name}'`);
                            return name;
                        }
                    } catch {
                        // Ignore
                    }
                }

                console.log(
                    "business-governance: Warning parent column not set, fallback to 'Parent'"
                );
                return "Parent";
            };

            configuration.parentColumn = await getParentColumn();

            return configuration;
        },
    });

    if (isFetched && !configuration?.entityListTitle) {
        return <Bootstrap />;
    }

    return (
        <ConfigurationContext.Provider value={configuration}>
            {isFetched && children}
        </ConfigurationContext.Provider>
    );
}
