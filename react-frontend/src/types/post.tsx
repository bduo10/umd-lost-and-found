export interface PostProps {
    id: number;
    itemType: string;
    content: string;
    username?: string; // Make optional since backend might not provide this
    user?: {
        id: number;
        username: string;
        email: string;
    };
    image?: boolean;
}
