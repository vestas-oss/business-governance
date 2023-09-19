import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import { Entity } from "@/types/Entity";
import { useEffect, useState } from "react";

type Props = {
    field: string;
    entity: Entity;
};

export const Users = (props: Props) => {
    const { field, entity } = props;
    const [itemInfo, setItemInfo] = useState<any>();
    const { sp } = useSP();
    const configuration = useConfiguration();

    useEffect(() => {
        (async () => {
            const selects = [`${field}/Title`, `${field}/Name`, `${field}/Id`];
            const expands = [field];
            const itemInfo = await Services.entityService.getEntityDetails(
                sp,
                configuration!,
                entity.id,
                selects,
                expands
            );
            setItemInfo(itemInfo);
        })();
    }, [field, entity.id, sp, configuration]);

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
