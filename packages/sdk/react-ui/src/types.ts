// Exported to clients so they can remain aligned with
// future additions to the template parameters.
export interface TinadTemplateProps {
    tinadContent: string;
    tinadType: string;
    dismiss?: () => void;
}

export interface TinadNotificationsComponentProps {
    pageId?: string;
    template?: React.ComponentType<TinadTemplateProps>;
    clientDismissFunction?: () => void;
}
