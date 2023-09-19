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

    let members = entity.memberRoles?.filter((memberRole) => memberRole.roleId === roleId);
    if (!members || members.length === 0) {
        return <></>;
    }
    members = members.sort((a, b) => a.title.localeCompare(b.title));
    let more: JSX.Element = <></>;
    if (members.length > 25) {
        members = members.slice(0, 25);
        more = <div>more...</div>;
    }
    const elements = members.map((mr, index) => {
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
