import * as React from "react";
import { SPFx, spfi } from "@pnp/sp";
import { BusinessGovernance } from "@/components/BusinessGovernance";
import { SharePointContext } from "@/contexts/SharePointContext";
import { ConfigurationProvider } from "@/providers/ConfigurationProvider";
import { EntityLayoutsProvider } from "@/providers/EntityLayoutsProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import { PropertiesProvider } from "@/providers/PropertiesProvider";
import { EditEntityButton } from "@/components/buttons/EditEntityButton";
import { DetailsWrapper } from "@/components/details/DetailsWrapper";
import { DisplayMode } from "@/types/DisplayMode";
import { Properties } from "@/types/Properties";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { EditUserRolesButton } from "@/components/buttons/EditUserRolesButton";
import { EditMode } from "@/components/lazy/EditMode";
import { BusinessGovernanceProvider } from "@/providers/BusinessGovernanceProvider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            useErrorBoundary: true,
            retry: (failureCount, error) => {
                if (failureCount >= 3) {
                    return false;
                }
                if (
                    error &&
                    typeof error === "object" &&
                    "status" in error &&
                    (error as any).status === 404
                ) {
                    // Do not retry on 404
                    return false;
                }
                if (error) {
                    return true;
                }
                return false;
            },
        },
    },
});

type Props = {
    context: WebPartContext;
    displayMode: DisplayMode;
    properties: Properties;
};

export function BusinessGovernanceComponent(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <SharePointContext.Provider
                value={{
                    sp: spfi().using(SPFx(props.context)),
                    displayMode: props.displayMode,
                }}>
                <PropertiesProvider
                    properties={props.properties}
                    setProperties={(p) => {
                        Object.assign(props.properties, p);
                    }}>
                    {props.displayMode === DisplayMode.Edit ? <EditMode /> : null}
                    <ConfigurationProvider>
                        <BusinessGovernanceProvider>
                            <EntityLayoutsProvider>
                                <BusinessGovernance
                                    details={(id, onDismiss) => {
                                        return (
                                            <DetailsWrapper
                                                entity={id}
                                                open={true}
                                                onDismiss={onDismiss}
                                                headerButtons={[
                                                    <EditEntityButton key="edit-button" id={id} />,
                                                    <EditUserRolesButton key="edit-user-roles-button" />,
                                                ]}
                                            />
                                        );
                                    }}
                                />
                            </EntityLayoutsProvider>
                        </BusinessGovernanceProvider>
                    </ConfigurationProvider>
                </PropertiesProvider>
            </SharePointContext.Provider>
        </QueryClientProvider>
    );
}
