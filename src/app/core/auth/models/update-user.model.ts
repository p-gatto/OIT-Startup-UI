export interface UpdateUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    isActive?: boolean;
    emailConfirmed?: boolean;
    groupIds?: number[];
}