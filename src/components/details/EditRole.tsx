import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useDetailsView } from "@/hooks/useDetailsView";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import { RoleItem } from "@/types/items/RoleItem";
import { DefaultButton, IPersonaProps, PrimaryButton } from "@fluentui/react";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { useCallback, useMemo, useState } from "react";
import { PeoplePicker } from "../people-picker/PeoplePicker";

export function EditRole() {
    const { view, entity, setView } = useDetailsView();
    const { sp } = useSP();
    const [selectedUsers, setSelectedUsers] = useState<Array<IPersonaProps> | undefined>();
    const configuration = useConfiguration();

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
        const roleKeyId = role?.KeyId;
        const users = entity.memberRoles?.filter(
            (user) => user.roleId === roleKeyId.toString() && !user.isDeleted
        );

        return users.map((m) => m.name);
    }, [entity, role?.KeyId]);

    const onSave = useCallback(async () => {
        if (!entity || !configuration?.entityMemberList) {
            return;
        }
        if (selectedUsers === undefined) {
            // No changes
            setView({ view: "details" });
            return;
        }

        const currentUsersSet = new Set(defaultSelectedUsers);
        const users = selectedUsers.map((u) => u.id!).filter((u) => u);
        const usersSet = new Set(users);

        const removes = defaultSelectedUsers.filter((u) => !usersSet.has(u));
        const adds = users.filter((u) => !currentUsersSet.has(u));

        await Services.entityUserService.removeUsers(sp, configuration, entity, role, removes);
        await Services.entityUserService.addUsers(sp, configuration, entity, role, adds);

        // Reload users
        entity.memberRoles =
            (await Services.entityUserService.getUsers(sp, configuration, entity.id)) || [];

        setView({ view: "details" });
    }, [configuration, defaultSelectedUsers, entity, role, selectedUsers, setView, sp]);

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
                    text="Save"
                    disabled={selectedUsers === undefined}
                    onClick={onSave}
                />
            </div>
        </div>
    );
}
