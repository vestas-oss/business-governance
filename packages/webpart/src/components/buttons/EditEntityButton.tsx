import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { IconButton } from "@fluentui/react";
import { PageType } from "@pnp/sp";
import "@pnp/sp/forms";
import { PermissionKind } from "@pnp/sp/security";
import { useCallback } from "react";
import { useQuery } from "react-query";

type Props = {
    id: string | number;
};

export function EditEntityButton(props: Props) {
    const { id } = props;
    const configuration = useConfiguration();
    const { sp } = useSP();

    const { data: currentUserHasPermissions } = useQuery({
        queryKey: ["currentUserHasPermissions", id, configuration?.entityListTitle],
        queryFn: () => {
            const listTitle = configuration?.entityListTitle;
            if (!listTitle) {
                return;
            }
            return sp?.web.lists
                .getByTitle(listTitle)
                .items.getById(parseInt(id.toString()))
                .currentUserHasPermissions(PermissionKind.EditListItems);
        },
        enabled: configuration?.entityListTitle !== undefined,
    });

    const { data: editForm } = useQuery({
        queryKey: ["forms", configuration?.entityListTitle],
        queryFn: async () => {
            const listTitle = configuration?.entityListTitle;
            if (!listTitle) {
                return;
            }

            const forms = await sp?.web.lists.getByTitle(listTitle).forms();
            return forms?.find((f) => f.FormType === PageType.EditForm);
        },
        enabled: configuration?.entityListTitle !== undefined && currentUserHasPermissions,
    });

    const onClick = useCallback(() => {
        const url = `${editForm?.ServerRelativeUrl}?ID=${id}&Source=${encodeURIComponent(
            window.location.href.toString()
        )}`;
        window.location.href = url;
    }, [id, editForm]);

    if (!currentUserHasPermissions) {
        return null;
    }

    return (
        <IconButton
            iconProps={{ iconName: "Edit" }}
            onClick={onClick}
            ariaLabel="Edit"
            title="Edit"
        />
    );
}
