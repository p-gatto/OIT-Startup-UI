export interface CreateGroup {
    name: string;
    description?: string;
    isActive?: boolean;
    permissionIds?: number[];
}