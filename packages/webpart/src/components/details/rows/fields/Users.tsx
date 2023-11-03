import * as React from "react";
import { Entity } from "@/types/Entity";
import { useEffect, useState } from "react";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";

type Props = {
    field: string;
    entity: Entity;
};

export const Users = (props: Props) => {
    const { field, entity } = props;
    const [itemInfo, setItemInfo] = useState<any>();
    const bg = useBusinessGovernance();

    useEffect(() => {
        (async () => {
            const selects = [`${field}/Title`, `${field}/Name`, `${field}/Id`];
            const expands = [field];
            const itemInfo = await bg.entityService.getEntityDetails(
                entity.id,
                selects,
                expands
            );
            setItemInfo(itemInfo);
        })();
    }, [field, entity.id]);

    if (!itemInfo) {
        return <></>;
    }

    const value = itemInfo[field];
    if (!value) {
        return <></>;
    }

    if (Array.isArray(value)) {
        const users: Array<{ Title: string }> = value;
        return <>{users.map((u) => u.Title).join(", ")}</>;
    }

    const user: { Title: string } = value;
    return <>{user.Title}</>;
};
