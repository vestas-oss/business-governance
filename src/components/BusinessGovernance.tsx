import * as React from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useProperties } from "@/hooks/useProperties";
import { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReadMode } from "./ReadMode";
import { ErrorBoundary } from "./errors/ErrorBoundary";

type Props = {
    details: (id: string, onDismiss?: () => void) => ReactNode;
};

export function BusinessGovernance(props: Props) {
    const configuration = useConfiguration();
    const properties = useProperties();

    return (
        <ErrorBoundary
            resetKeys={[
                "read-mode",
                configuration?.entityListTitle,
                configuration?.startNode,
                properties?.filter,
                properties?.select,
                properties?.parentColName,
            ]}>
            <HashRouter basename="/">
                <Routes>
                    <Route path="/" element={<ReadMode details={props.details} />} />
                    <Route path="/focus/:focus" element={<ReadMode details={props.details} />} />
                    <Route
                        path="/focus/:focus/selected/:selected"
                        element={<ReadMode details={props.details} />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </ErrorBoundary>
    );
}
