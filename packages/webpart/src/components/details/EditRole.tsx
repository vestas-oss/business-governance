import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useDetailsView } from "@/hooks/useDetailsView";
import { useSP } from "@/hooks/useSP";
import { RoleItem } from "@/types/items/RoleItem";
import { DefaultButton, IPersonaProps, PrimaryButton } from "@fluentui/react";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { useCallback, useMemo, useState } from "react";
import { PeoplePicker } from "../people-picker/PeoplePicker";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";

export function EditRole() {
    const { view, entity, setView } = useDetailsView();
    const { sp } = useSP();
    const [selectedUsers, setSelectedUsers] = useState<Array<IPersonaProps> | undefined>();
    const configuration = useConfiguration();
    const bg = useBusinessGovernance();
    const [isSaving, setIsSaving] = useState(false);

    const role = useMemo(() => {
        if (view.view === "details") {
            return {} as RoleItem;
        }
        return view.role;
    }, [view]);

    const defaultSelectedUsers = useMemo(() => {
        if (!entity) {
            return [];
        }
        const roleKeyId = "RoleId" in role ? role.RoleId : role.KeyId;
        const users = entity.users?.filter(
            (user) => user.roleId === roleKeyId.toString() && !user.isDeleted
        );

        return users.map((user) => user.name);
    }, [entity, role]);

    const onSave = useCallback(async () => {
        if (!entity || !configuration?.entityUserRolesList) {
            return;
        }
        if (selectedUsers === undefined) {
            // No changes
            setView({ view: "details" });
            return;
        }

        setIsSaving(true);

        const currentUsersSet = new Set(defaultSelectedUsers);
        const users = selectedUsers.map((u) => u.id!).filter((u) => u);
        const usersSet = new Set(users);

        const removes = defaultSelectedUsers.filter((u) => !usersSet.has(u));
        const adds = users.filter((user) => !currentUsersSet.has(user));

        await bg.entityUserService.removeUsers(entity, role, removes);
        await bg.entityUserService.addUsers(entity, role, adds);

        // Reload users
        entity.users = (await bg.entityUserService.getUsers(entity.id)) || [];

        setIsSaving(false);

        setView({ view: "details" });
    }, [configuration, defaultSelectedUsers, entity, role, selectedUsers, setView]);

    if (!entity) {
        return null;
    }

    return (
        <div className="p-6 flex gap-2 flex-col">
            <h4>
                <div className="font-bold">{entity?.title}</div>
                <div>{role.Title}</div>
            </h4>
            {/* default: {JSON.stringify(defaultSelectedUsers)} */}
            <div>
                <PeoplePicker
                    context={sp}
                    defaultSelectedUsers={defaultSelectedUsers}
                    onChange={(items) => {
                        setSelectedUsers(items);
                    }}
                />
            </div>
            {/* selected: {selectedUsers === undefined ? "undef" : JSON.stringify(selectedUsers)} */}
            <div className="flex gap-2 justify-end">
                <DefaultButton text="Cancel" onClick={() => setView({ view: "details" })} />
                <PrimaryButton
                    text={isSaving ? "Saving" : "Save"}
                    disabled={isSaving || selectedUsers === undefined}
                    onClick={onSave}
                />
            </div>
        </div>
    );
}
