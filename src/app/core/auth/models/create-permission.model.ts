export interface CreatePermission {
    name: string;
    description?: string;
    resource: string;
    action: string;
    isActive?: boolean;
}