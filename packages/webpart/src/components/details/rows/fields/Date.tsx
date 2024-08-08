import * as React from "react";
import { Entity } from "@business-governance/api";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

type Props =
    | {
          field: string;
          entity: Entity;
      }
    | { value: string };

export const Date = (props: Props) => {
    let value;
    if ("field" in props) {
        const { field, entity } = props;
        value = entity.item?.[field];
    } else {
        value = props.value;
    }

    if (!value) {
        return <></>;
    }

    return <>{dayjs(value).format("LL")}</>;
};
