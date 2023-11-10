import * as React from "react";
import { DetailsViewProvider } from "@/providers/DetailsViewProvider";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { useQuery } from "react-query";
import { Details } from "./Details";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";

type Props = Omit<React.ComponentProps<typeof Details>, "entity"> & { entity: string };

export function DetailsWrapper(props: Props) {
    const bg = useBusinessGovernance();

    const { data } = useQuery(
        ["entity", props.entity],
        () => {
            return bg.entityService.getEntity(props.entity);
        },
        {
            onSuccess(data) {
                if (!data) {
                    alert(`Failed to find node '${props.entity}'.`);
                }
            },
        }
    );

    if (!data) {
        return null;
    }

    return (
        <DetailsViewProvider>
            <Details
                entity={data}
                open={props.open}
                onDismiss={props.onDismiss}
                headerButtons={props.headerButtons}
            />
        </DetailsViewProvider>
    );
}
