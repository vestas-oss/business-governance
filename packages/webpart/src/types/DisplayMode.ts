/**
 * Indicates whether a visual control should display itself for reading or for editing.
 *
 * @public
 */
export enum DisplayMode {
    /**
     * The page, control, or editing surface is in a mode intended for reading.  It may have some interactive
     * features, but the authoring controls are not enabled.
     */
    Read = 1,
    /**
     * The page, control, or editing surface is in a mode intended for authoring new content.  It may display
     * editing panels or other controls that are not part of the normal reading experience.
     */
    Edit = 2,
    /* Excluded from this release type: Preview */
}