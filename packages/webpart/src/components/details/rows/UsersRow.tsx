import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { Entity } from "@business-governance/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DetailsRow } from "../DetailsRow";
import { useState } from "react";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
};

export const UsersRow = (props: Props) => {
    const { row, entity } = props;
    const [expanded, setExpanded] = useState(false);

    const roleId = row.value;

    let users = entity.users?.filter((user) => user.roleId === roleId && !user.isDeleted);
    if (!users || users.length === 0) {
        return null;
    }
    users = users.sort((a, b) => a.title.localeCompare(b.title));
    let more: JSX.Element = <></>;
    const size = 25;
    if (users.length > size && !expanded) {
        users = users.slice(0, size);
        more = (
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setExpanded(true);
                }}>
                more...
            </a>
        );
    }
    const elements = users.map((user, index) => {
        const username = user.userName.split("|")[2].split("@")[0].toUpperCase();
        let title = `${user.title} (${username})`;
        if (user.jobTitle) {
            title += `, ${user.jobTitle}`;
        }
        return (
            <div key={`member-${index}`} className="w-full">
                {title}
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
