import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useEntities } from "@/hooks/useEntities";
import { SearchBox } from "@fluentui/react";
import { Result, Results, create, insertMultiple, search } from "@orama/orama";
import { useCallback, useMemo, useState } from "react";

type Props = {
    onResults?: (results: Results<Result[]> | undefined) => void;
};

export function Search(props: Props) {
    const { onResults } = props;

    const configuration = useConfiguration();
    const [databasePopulated, setDatabasePopulated] = useState(false);
    const [databaseReady, setDatabaseReady] = useState(false);

    const { isFetched, data: entities } = useEntities();

    const db = useMemo(async () => {
        return await create({
            schema: {
                id: "string",
                parent: "string",
                title: "string",
            },
        });
    }, []);

    const onFocus = useCallback(async () => {
        if (!databasePopulated && isFetched) {
            setDatabasePopulated(true);

            const idSet = new Set(entities?.map((e) => e.Id.toString()));

            const documents =
                entities?.map((e) => {
                    let parent = e[`${configuration?.parentColumn}Id`]?.toString() || "";
                    if (parent && !idSet.has(parent)) {
                        // Note: if parent is not in the list of entities, set to empty
                        parent = "";
                    }

                    return {
                        id: e.Id.toString(),
                        parent,
                        title: e.Title,
                    };
                }) || [];

            await insertMultiple(await db, documents, 100);

            setDatabaseReady(true);
        }
    }, [configuration?.parentColumn, databasePopulated, db, entities, isFetched]);

    const onSearch = useCallback(
        async (query: string) => {
            if (!databaseReady) {
                return;
            }
            if (!query) {
                onResults?.(undefined);
                return;
            }

            const results = await search(await db, {
                term: query,
                properties: ["title"],
                limit: 5000,
            });
            onResults?.(results);
        },
        [databaseReady, db, onResults]
    );

    return (
        <SearchBox
            placeholder={`Search ${configuration?.entityListTitle || ""}`}
            className="w-56"
            underlined={true}
            onFocus={onFocus}
            onSearch={onSearch}
            onClear={() => onResults?.(undefined)}
        />
    );
}
