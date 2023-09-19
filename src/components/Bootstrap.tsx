import * as React from "react";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
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
            await Services.importService.import(sp, {
                title: "Entities",
                items: [
                    {
                        Title: "Directors",
                    },
                    {
                        Title: "Management",
                        Parent: "Directors",
                    },
                    {
                        Title: "Finance",
                        Parent: "Directors",
                    },
                ],
                fields: [
                    {
                        title: "Parent",
                        type: "Lookup",
                    },
                ],
            });

            const entitiesList = sp.web.lists.getByTitle("Entities");
            const entitiesListContentTypes = await entitiesList.contentTypes();

            await Services.importService.import(sp, {
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
                    },
                ],
            });

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
