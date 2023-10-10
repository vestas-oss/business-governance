import * as React from "react";
import { DirectionalHint, TooltipDelay, TooltipHost } from "@fluentui/react";
import { ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    children: ReactNode;
    fullWidth?: boolean;
};

export function DetailsRow(props: Props) {
    const { title, description, children } = props;

    let rowTitle = <span>{title}</span>;
    if (description) {
        rowTitle = (
            <TooltipHost
                key={title}
                calloutProps={{ gapSpace: 5 }}
                tooltipProps={{
                    onRenderContent: () => {
                        return <div>{description}</div>;
                    },
                }}
                delay={TooltipDelay.zero}
                directionalHint={DirectionalHint.topCenter}>
                {title}
            </TooltipHost>
        );
    }

    if (props.fullWidth) {
        return <div className="pt-[10px]">{children}</div>;
    }

    return (
        <div className="pt-[10px] flex flex-row gap-1">
            <div className="font-bold flex-[20] truncate">{rowTitle}</div>
            <div className="flex-[55]">{children}</div>
        </div>
    );
}
