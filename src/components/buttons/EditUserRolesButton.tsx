import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useDetailsView } from "@/hooks/useDetailsView";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import { IContextualMenuItem, IContextualMenuProps, IconButton } from "@fluentui/react";
import "@pnp/sp/forms";
import { PermissionKind } from "@pnp/sp/security";
import { useMemo } from "react";
import { useQuery } from "react-query";

export function EditUserRolesButton() {
    const configuration = useConfiguration();
    const { sp } = useSP();
    const { setView } = useDetailsView();

    const { data: currentUserHasPermissions } = useQuery({
        queryKey: ["currentUserHasPermissions", configuration?.entityMemberList],
        queryFn: () => {
            const listTitle = configuration?.entityMemberList;
            if (!listTitle) {
                return;
            }

            try {
                return sp?.web.lists
                    .getByTitle(listTitle)
                    .currentUserHasPermissions(PermissionKind.EditListItems);
            } catch (error: any) {
                if (error?.status === 404) {
                    return false;
                }
                throw error;
            }
        },
        enabled: configuration?.entityListTitle !== undefined,
    });

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            return Services.entityUserService.getRoles(sp, configuration!);
        },
        enabled: configuration !== undefined,
    });

    const menuProps = useMemo<IContextualMenuProps>(() => {
        const items = new Array<IContextualMenuItem>();

        roles?.forEach((role, index) => {
            items.push({
                key: `role-${index}`,
                text: `Edit '${role.Title}'`,
                onClick: () => {
                    setView({ view: "role", role });
                },
                title: role.Description || "",
            });
        });

        return {
            shouldFocusOnMount: true,
            items,
        };
    }, [roles, setView]);

    if (!currentUserHasPermissions || !roles || roles.length === 0) {
        return null;
    }

    return <IconButton iconProps={{ iconName: "Contact" }} menuProps={menuProps} />;
}
