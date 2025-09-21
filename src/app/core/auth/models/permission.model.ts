export interface Permission {
    id: number;
    name: string;
    description?: string;
    resource: string;
    action: string;
    isActive: boolean;
    createdAt: string;
}