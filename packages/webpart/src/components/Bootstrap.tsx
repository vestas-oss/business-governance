import * as React from "react";
import { useSP } from "@/hooks/useSP";
import { EntityLayoutSchema } from "@business-governance/api";
import { ImportService } from "../services/ImportService";
import { PrimaryButton, Spinner, SpinnerSize } from "@fluentui/react";
import "@pnp/sp/content-types";
import { PermissionKind } from "@pnp/sp/security";
import { useCallback, useState } from "react";
import { useQuery } from "react-query";

export function Bootstrap() {
    const { sp } = useSP();

    const { data: currentUserHasPermissions, isFetched } = useQuery({
        queryKey: ["currentUserHasPermissions", "web", "ManageLists"],
        queryFn: () => {
            return sp.web.currentUserHasPermissions(PermissionKind.ManageLists);
        },
    });

    const [bootstrapping, setBootstrapping] = useState<boolean>();
    const bootstrap = useCallback(() => {
        setBootstrapping(true);

        (async () => {
            const currentUserInfo = await sp.web.currentUser();

            await ImportService.import(sp, {
                title: "Entities",
                items: [
                    {
                        Title: "Directors",
                        ChairpersonId: currentUserInfo.Id,
                    },
                    {
                        Title: "Management",
                        Parent: "Directors",
                        ChairpersonId: currentUserInfo.Id,
                    },
                    {
                        Title: "Finance",
                        Parent: "Directors",
                        ChairpersonId: currentUserInfo.Id,
                    },
                ],
                fields: [
                    {
                        title: "Parent",
                        type: "Lookup",
                    },
                    {
                        title: "Chairperson",
                        type: "User",
                    },
                ],
            });

            await ImportService.import(sp, {
                title: "Roles",
                fields: [
                    {
                        title: "Role Id",
                        internalName: "RoleId",
                        type: "Text",
                    },
                    {
                        title: "Description",
                        type: "Text",
                    },
                    {
                        title: "Order",
                        internalName: "bgOrder",
                        type: "Number",
                    },
                ],
                items: [
                    {
                        Title: "Member",
                        RoleId: "Member",
                        bgOrder: 1,
                        Description: "A member of the entity.",
                    },
                ],
            });

            const entitiesList = sp.web.lists.getByTitle("Entities");
            const entitiesListInfo = await entitiesList();

            const rolesList = sp.web.lists.getByTitle("Roles");
            const rolesListInfo = await rolesList();

            await ImportService.import(sp, {
                title: "User Roles",
                fields: [
                    {
                        title: "User",
                        type: "User",
                    },
                    {
                        title: "Entity",
                        type: "Lookup",
                        listId: entitiesListInfo.Id,
                    },
                    {
                        title: "Role",
                        type: "Lookup",
                        listId: rolesListInfo.Id,
                    },
                    {
                        title: "Deleted",
                        type: "Boolean",
                        internalName: "isDeleted",
                    },
                ],
            });

            const entitiesListContentTypes = await entitiesList.contentTypes();

            const layout: EntityLayoutSchema[] = [
                {
                    field: "Title",
                    type: "HeaderItalic",
                    mappings: [],
                },
                {
                    type: "Section",
                    field: "Details",
                    mappings: [
                        {
                            key: "ID",
                            type: "DetailsProvider",
                            value: "ID",
                        },
                        {
                            key: "Chairperson",
                            type: "DetailsProvider",
                            value: "Chairperson",
                        },
                        {
                            key: "Members",
                            type: "MembersProvider",
                            value: "Member",
                        },
                        {
                            key: "Next Meeting",
                            type: "MeetingInfo",
                            value: "Next Meeting",
                        },
                    ],
                },
            ];

            await ImportService.import(sp, {
                title: "Entity Layouts",
                fields: [
                    {
                        title: "Color",
                        internalName: "Color",
                    },
                    {
                        title: "Order",
                        internalName: "bgOrder",
                        type: "Number",
                    },
                    {
                        title: "Content Type",
                        internalName: "bgContentTypeId",
                    },
                    {
                        title: "Icon",
                    },
                    {
                        title: "Layout",
                        type: "Note",
                    },
                    {
                        title: "Description",
                        type: "Note",
                        richText: true,
                    },
                    {
                        title: "Condition",
                    },
                    {
                        title: "Plural",
                    },
                ],
                items: [
                    {
                        Title: "Team",
                        Plural: "Teams",
                        Color: "#E37222",
                        bgContentTypeId: entitiesListContentTypes[0].Id.StringValue,
                        Icon: "People",
                        Description: "Group of individuals working together.",
                        Layout: JSON.stringify(layout, undefined, "  "),
                    },
                ],
            });

            // Add Entity lookup to Events (if exists)
            const listInfos = await sp.web.lists();
            if (listInfos.find((l) => l.Title === "Events")) {
                await ImportService.import(sp, {
                    title: "Events",
                    fields: [
                        {
                            title: "Entity",
                            type: "Lookup",
                            listId: entitiesListInfo.Id,
                        },
                    ],
                });
            }

            window.location.reload();
        })();
    }, [sp]);

    if (!isFetched) {
        return null;
    }

    if (currentUserHasPermissions) {
        return (
            <PrimaryButton
                iconProps={bootstrapping ? undefined : { iconName: "Rocket" }}
                title="Bootstrap"
                disabled={bootstrapping}
                onClick={bootstrap}>
                {bootstrapping ? <Spinner size={SpinnerSize.small} className="mr-1" /> : null}
                Bootstrap
            </PrimaryButton>
        );
    }

    return <>Business Governance web part is not configured.</>;
}
