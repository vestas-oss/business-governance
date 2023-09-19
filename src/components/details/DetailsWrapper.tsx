import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { DetailsViewProvider } from "@/providers/DetailsViewProvider";
import { Services } from "@/services/Services";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { useQuery } from "react-query";
import { Details } from "./Details";

type Props = Omit<React.ComponentProps<typeof Details>, "entity"> & { entity: string };

export function DetailsWrapper(props: Props) {
    const { sp } = useSP();
    const configuration = useConfiguration();

    const { data } = useQuery(
        ["entity", props.entity],
        () => {
            return Services.entityService.getEntity(sp, configuration!, props.entity);
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
