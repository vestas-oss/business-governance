import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { Entity } from "@/types/Entity";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DetailsRow } from "../DetailsRow";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
};

export const UsersRow = (props: Props) => {
    const { row, entity } = props;

    const roleId = row.value;

    let users = entity.memberRoles?.filter((user) => user.roleId === roleId && !user.isDeleted);
    if (!users || users.length === 0) {
        return null;
    }
    users = users.sort((a, b) => a.title.localeCompare(b.title));
    let more: JSX.Element = <></>;
    if (users.length > 25) {
        users = users.slice(0, 25);
        more = <div>more...</div>;
    }
    const elements = users.map((mr, index) => {
        const username = mr.userName.split("|")[2].split("@")[0].toUpperCase();
        return (
            <div key={`member-${index}`} className="w-full">
                {`${mr.title} (${username}), ${mr.jobTitle}`}
            </div>
        );
    });
    if (more) {
        elements.push(more);
    }

    if (!elements) {
        return null;
    }

    return (
        <DetailsRow {...row}>
            <div className="w-full text-xs">{elements}</div>
        </DetailsRow>
    );
};
