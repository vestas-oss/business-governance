import * as React from "react";
import { useSP } from "@/hooks/useSP";
import { Entity } from "@/types/Entity";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { useMemo } from "react";
import { useQuery } from "react-query";

type Props = {
    entity: Entity;
};

export function LastModified(props: Props) {
    const { entity } = props;
    const { sp } = useSP();

    const { modified, modifiedById } = useMemo(() => {
        let array = new Array<{ modified: Date; modifiedById: number }>();

        if (entity.item.Modified && entity.item.EditorId) {
            array.push({
                modified: new Date(entity.item.Modified),
                modifiedById: parseInt(entity.item.EditorId),
            });
        }

        array = array.concat(
            entity.memberRoles?.map((m) => {
                return {
                    modifiedById: parseInt(m.editorId),
                    modified: new Date(m.modified),
                };
            }) || []
        );

        array.sort((a, b) => b.modified.getTime() - a.modified.getTime());

        if (array.length === 0) {
            return {
                modified: undefined,
                modifiedById: undefined,
            };
        }

        const latest = array[0];

        return {
            modified: latest.modified,
            modifiedById: latest.modifiedById,
        };
    }, [entity.item.EditorId, entity.item.Modified, entity.memberRoles]);

    const { data: modifiedBy } = useQuery({
        queryKey: ["user", modifiedById],
        queryFn: () => {
            if (!modifiedById) {
                return undefined;
            }
            return sp.web.siteUsers.getById(modifiedById)();
        },
    });

    const returnModifiedDate = (objValue: string | undefined) => {
        if (!objValue) {
            return "";
        }
        const dateValue = objValue.split("T")[0];
        const split = dateValue.split("-");
        const modifiedDate = split[2] + "-" + split[1] + "-" + split[0];

        return modifiedDate;
    };

    return (
        <div className="text-xs">
            <div className="w-fit">
                <div
                    className="font-bold"
                    style={{
                        borderBottom: "1px solid #000000",
                    }}>
                    LAST MODIFIED
                </div>
                <div className="flex flex-row gap-5">
                    <div>
                        <div className="font-bold">Modified</div>
                        <div className="whitespace-nowrap">
                            {returnModifiedDate(modified?.toISOString())}
                        </div>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        <div className="font-bold whitespace-nowrap">Modified By</div>
                        <div>{modifiedBy?.Title}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
