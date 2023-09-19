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
        const members = entity.memberRoles?.filter(
            (memberRole) => memberRole.roleId === roleKeyId.toString()
        );

        return members.map((m) => m.name);
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

        // Removes
        // console.log("Removes:");
        // console.dir(removes);
        for (let i = 0; i !== removes.length; i++) {
            const member = entity.memberRoles?.find(
                (memberRole) =>
                    memberRole.roleId === role.KeyId.toString() && memberRole.name === removes[i]
            );
            if (!member) {
                continue;
            }
            await sp.web.lists
                .getByTitle(configuration.entityMemberList)
                .items.getById(member.id)
                .delete();
        }

        // Add
        // console.log("Add:");
        // console.dir(adds);
        for (let i = 0; i !== adds.length; i++) {
            const user = await sp.web.ensureUser(adds[i]);
            const itemProperties = {
                MemberId: user.data.Id,
                RoleId: role.Id,
                EntityNameId: entity.id,
            };

            await sp.web.lists.getByTitle(configuration.entityMemberList).items.add(itemProperties);
        }

        location.reload();
    }, [configuration, defaultSelectedUsers, entity, role, selectedUsers, setView, sp.web]);

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
