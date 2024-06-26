import * as React from "react";
import { Node, Tree } from "@/components/tree/Tree";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useEntities } from "@/hooks/useEntities";
import { useEntityLayouts } from "@/hooks/useEntityLayouts";
import { useProperties } from "@/hooks/useProperties";
import { Result, Results } from "@orama/orama";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Back } from "./Back";
import { Debug } from "./Debug";
import { Legend } from "./Legend";
import { Search } from "./Search";
import { SearchResults } from "./SearchResults";

type Props = {
    details: (id: string, onDismiss?: () => void) => ReactNode;
};

export function ReadMode(props: Props) {
    const { focus, selected: selectedRaw } = useParams();
    const selected = useMemo(() => {
        const ampersandIndex = selectedRaw?.indexOf("&");
        if (!ampersandIndex || ampersandIndex === -1) {
            return selectedRaw;
        }
        return selectedRaw.substring(0, ampersandIndex);
    }, [selectedRaw]);
    const { details } = props;
    const { isLoading, error, data: entities } = useEntities();
    const configuration = useConfiguration();
    const [currentNode, setCurrentNode] = useState<string | undefined>(
        focus ? focus : configuration?.startNode
    );
    const { getLayout, layouts } = useEntityLayouts();
    const properties = useProperties();
    const [results, setResults] = useState<Results<Result[]>>();

    const defaultIcon = "TaskGroup";
    const defaultColor = "#1F4477";
    const parentColumn = configuration?.parentColumn;
    if (!parentColumn) {
        throw new Error("business-governance: Error parent column not set");
    }

    useEffect(() => {
        setResults(undefined);
    }, [focus, selected]);

    useEffect(() => {
        if (focus === "selected") {
            setCurrentNode(undefined);
        } else {
            setCurrentNode(focus ? focus : configuration?.startNode);
        }
    }, [configuration?.startNode, focus]);

    const map = useMemo(() => {
        const map = new Map<string, any>();
        entities?.forEach((entity) => {
            if (!entity.Id) {
                return;
            }
            map.set(entity.Id.toString(), entity);
        });
        return map;
    }, [entities]);

    const roots = useMemo(() => {
        const parent = (e: any) => e?.[`${parentColumn}Id`]?.toString();
        const values = Array.from(map.values());
        const roots = values.filter((v) => !parent(v));
        return roots;
    }, [map, parentColumn]);

    useEffect(() => {
        // If no current node / start node, select optimistic root
        if (!currentNode && map && map.size > 0 && entities) {
            const parent = (e: any) => e?.[`${parentColumn}Id`]?.toString();

            const values = Array.from(map.values());
            const roots = values.filter((v) => !parent(v));

            if (roots.length === 1) {
                setCurrentNode(roots[0].Id.toString());
            }
        }
    }, [currentNode, map, entities, parentColumn]);

    const getChildren = useCallback(
        (id: number | string) => {
            return entities?.filter((e) => e[`${parentColumn}Id`]?.toString() === id?.toString())
                .length;
        },
        [entities, parentColumn]
    );

    const path = useMemo(() => {
        const getPath = (id: string): Array<Node> => {
            if (!id) {
                return [];
            }
            const entity = map.get(id.toString());
            if (!entity) {
                return [];
            }

            const layout = getLayout(entity);
            const nodeObj = {
                title: entity.Title,
                icon: layout?.icon || defaultIcon,
                color: layout?.color || defaultColor,
                children: getChildren(id),
                onClick: () => {
                    window.location.href = `#/focus/${currentNode}/selected/${id}`;
                },
                onExpand: () => {
                    window.location.href = `#/focus/${id}`;
                },
            } as Node;

            return [...getPath(entity[`${parentColumn}Id`]), nodeObj];
        };

        if (!currentNode) {
            return [];
        }
        const path = getPath(currentNode);
        // Disable expand for the last item in the path
        if (path?.length) {
            path[path.length - 1].onExpand = undefined;
        }
        return path;
    }, [currentNode, map, getLayout, getChildren, parentColumn]);

    const groups = useMemo(() => {
        if (!entities) {
            return [];
        }

        if (!currentNode && roots.length > 1) {
            const groups = new Array<{ title: string; order: number; nodes: Array<Node> }>();
            const nodes = [];
            for (let i = 0; i !== roots.length; i++) {
                const root = roots[i];

                const id = root.Id;
                const layout = getLayout(root);
                const nodeObj: Node = {
                    title: root.Title,
                    icon: layout?.icon || defaultIcon,
                    color: layout?.color || defaultColor,
                    children: getChildren(id),
                    onClick: () => {
                        window.location.href = `#/selected/${id}`;
                    },
                    onExpand: () => {
                        window.location.href = `#/focus/${id}`;
                    },
                };
                nodes.push(nodeObj);
            }

            groups.push({ title: "", order: 0, nodes });
            return groups;
        }

        if (currentNode === "") {
            const groups = new Array<{ title: string; order: number; nodes: Array<Node> }>();
            const nodes = [];
            for (let i = 0; i !== entities.length; i++) {
                const entity = entities[i];

                const id = entity.Id;
                const layout = getLayout(entity);
                const nodeObj: Node = {
                    title: entity.Title,
                    icon: layout?.icon || defaultIcon,
                    color: layout?.color || defaultColor,
                    children: getChildren(id),
                    onClick: () => {
                        window.location.href = `#/selected/${id}`;
                    },
                    onExpand: () => {
                        window.location.href = `#/focus/${id}`;
                    },
                };
                nodes.push(nodeObj);
            }

            groups.push({ title: "", order: 0, nodes });
            return groups;
        }

        if (currentNode === undefined) {
            return [];
        }

        const childEntities = entities?.filter(
            (e) => e[`${parentColumn}Id`]?.toString() === currentNode.toString()
        );

        const parentEntity = path[path.length - 1];
        const groupsMap = new Map<number, Array<Node>>();
        for (let i = 0; i !== childEntities.length; i++) {
            const childEntity = childEntities[i];

            const id = childEntity.Id;
            const layout = getLayout(childEntity);
            const nodeObj: Node = {
                title: childEntity.Title,
                icon: layout?.icon || defaultIcon,
                color: layout?.color || defaultColor,
                children: getChildren(id),
                onClick: () => {
                    window.location.href = `#/focus/${currentNode}/selected/${id}`;
                },
                onExpand: () => {
                    window.location.href = `#/focus/${id}`;
                },
            };

            const group = layout?.id || 0;

            if (!groupsMap.has(group)) {
                groupsMap.set(group, []);
            }
            groupsMap.get(group)?.push(nodeObj);
        }

        let groups = new Array<{ title: string; order: number; nodes: Array<Node> }>();

        groupsMap.forEach((nodes, key) => {
            const layout = layouts.find((l) => l.id === key);
            let title = `'${configuration?.entityListTitle}'`;

            if (properties?.group && layout) {
                title = `'${layout.plural || layout.title}'`;
            }

            if (parentEntity?.title) {
                title += ` under '${parentEntity.title}'`;
            }

            const existingGroup = groups.find((g) => g.title === title);
            if (existingGroup) {
                existingGroup.nodes = existingGroup.nodes.concat(nodes);
            } else {
                groups.push({ title, nodes, order: layout?.order || 0 });
            }

            // Sort groups by order
            groups = groups.sort((a, b) => a.order - b.order);
        });

        return groups;
    }, [
        configuration?.entityListTitle,
        currentNode,
        entities,
        getChildren,
        getLayout,
        layouts,
        parentColumn,
        path,
        properties?.group,
        roots,
    ]);

    const onDismissCallback = useCallback(() => {
        if (currentNode) {
            window.location.href = `#/focus/${currentNode}`;
        } else {
            window.location.href = `#/`;
        }
    }, [currentNode]);

    if (isLoading) {
        return null;
    }

    if (error) {
        console.error(error);
    }

    return (
        <>
            <div className="w-full flex flex-col items-center">
                {properties?.search || properties?.legend ? (
                    <div className="flex justify-between align-middle pb-6 w-full">
                        <div>
                            <Back />
                            {properties?.legend ? <Legend /> : null}
                        </div>
                        {configuration?.search ? <Search onResults={setResults} /> : <div />}
                    </div>
                ) : null}
                {results ? (
                    <SearchResults results={results} />
                ) : (
                    <>
                        <Tree
                            path={path}
                            groups={groups}
                            nodeTitleClassName={
                                properties.multilineTitles ? "line-clamp-2" : "truncate"
                            }
                        />
                        {selected ? details(selected, onDismissCallback) : null}
                    </>
                )}
                {map.size > 0 && path.length === 0 && currentNode ? (
                    <div>
                        Node &#39;{currentNode}&#39; not found,{" "}
                        <a href="#">click here to refresh</a>.
                    </div>
                ) : null}
            </div>
            <Debug title="Path" data={path} />
            <Debug title="Groups" data={groups} />
        </>
    );
}
