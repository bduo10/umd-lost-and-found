export interface PostProps {
    id: number;
    userId?: number;
    username?: string;
    itemType: string;
    content: string;
    hasImage?: boolean;
    // Optional props for edit/delete functionality
    showEditDelete?: boolean;
    onPostDeleted?: (postId: number) => void;
    onPostUpdated?: (updatedPost: PostProps) => void;
}
