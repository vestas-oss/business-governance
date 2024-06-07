import * as React from "react";
import clsx from "clsx";
import { HorizontalLine } from "./HorizontalLine";
import { TreeNode } from "./TreeNode";
import { VerticalLine } from "./VerticalLine";
import { useProperties } from "@/hooks/useProperties";

export type Node = {
    title: string;
    color: string;
    icon: string;
    children?: number;
    expanded?: boolean;
    onClick?: () => void;
    onExpand?: () => void;
};

export type Group = {
    title: string;
    nodes: Array<Node>;
};

type Props = {
    path?: Array<Node>;
    groups: Array<Group>;
    nodeTitleClassName?: string;
};

export function Tree(props: Props) {
    const { path, nodeTitleClassName } = props;
    const properties = useProperties();

    const hasChildren = props.groups.length > 0;

    const pathElements = path?.map((node, index) => {
        const isLast = index === path.length - 1;
        return (
            <div key={`path-${index}`} className="flex items-center flex-col">
                <TreeNode {...node} expanded={true} titleClassName={nodeTitleClassName} />
                {!isLast || (isLast && hasChildren) ? <VerticalLine /> : null}
            </div>
        );
    });

    const groups = props.groups;
    const singleNode = groups.length === 1 && groups[0].nodes.length === 1;

    return (
        <div className="text-sm text-white w-full">
            <div className="flex items-center flex-col">
                {pathElements}
                {singleNode && <TreeNode {...groups[0].nodes[0]} titleClassName={nodeTitleClassName} />}
            </div>
            {groups?.length > 0 && !singleNode && (
                <>
                    {pathElements && pathElements.length > 0 ? <HorizontalLine /> : null}
                    <div className="flex flex-col gap-3">
                        {groups.map((group, index) => {
                            const nodes = group.nodes;
                            return (
                                <div key={`group-${index}`}>
                                    {group.title ? (
                                        <div className={`text-slate-500 text-${properties.groupTitleTextSize ?? "xs"} pb-1`}>
                                            {group.title}:
                                        </div>
                                    ) : null}
                                    <div
                                        className={clsx(
                                            "flex flex-row gap-3 flex-wrap justify-center"
                                        )}>
                                        {nodes?.map((node, index) => (
                                            <TreeNode key={`node-${index}`} {...node} titleClassName={nodeTitleClassName} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
