export type Properties = {
    entityListTitle?: string;
    startNode?: string;
    filter?: string;
    select?: string;
    group?: boolean;
    legend?: boolean;
    search?: boolean;
    multilineTitles?: boolean;
    // TODO: rename to parentColumn ?
    parentColName?: string;
}