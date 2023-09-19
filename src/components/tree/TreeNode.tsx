import * as React from "react";
import { Icon } from "@fluentui/react";
import clsx from "clsx";
import { MouseEventHandler, useCallback } from "react";
import { Node } from "./Tree";

type Props = Node & {
    expanded?: boolean;
};

export function TreeNode(props: Props) {
    const { title, color, icon, children, expanded, onClick, onExpand } = props;

    const onExpandCallback = useCallback(
        (e) => {
            onExpand?.();
            e.stopPropagation();
        },
        [onExpand]
    ) as MouseEventHandler<HTMLDivElement>;

    return (
        <div
            className={clsx(
                "w-52 h-16 bg-slate-600",
                "flex items-center justify-center gap-2",
                "p-2 relative box-border",
                {
                    "hover:cursor-pointer hover:opacity-90": onClick,
                }
            )}
            style={{ backgroundColor: color }}
            title={title}
            onClick={onClick}>
            <Icon iconName={icon} className="text-lg" />
            <span className="truncate">{title}</span>
            {children !== undefined && children > 0 ? (
                <div
                    className={clsx(
                        "absolute bg-gray-500 rounded-full p-1 px-2 text-xs flex flex-row gap-1 top-[50px]",
                        {
                            "hover:bg-sky-700 hover:cursor-pointer": onExpand,
                        }
                    )}
                    title={onExpand ? `Expand ${title}` : ""}
                    onClick={onExpandCallback}>
                    {children}
                    <Icon
                        className="font-bold text-[10px]"
                        iconName={expanded ? "ChevronDown" : "ChevronUp"}
                    />
                </div>
            ) : null}
        </div>
    );
}
