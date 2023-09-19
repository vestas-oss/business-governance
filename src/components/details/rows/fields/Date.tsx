import * as React from "react";
import { Entity } from "@/types/Entity";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

type Props = {
    field: string;
    entity: Entity;
};

export const Date = (props: Props) => {
    const { field, entity } = props;

    const value = entity.item[field];
    if (!value) {
        return <></>;
    }

    return <>{dayjs(value).format("LL")}</>;
};
