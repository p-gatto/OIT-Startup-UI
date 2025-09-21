export interface CreateUser {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    isActive?: boolean;
    emailConfirmed?: boolean;
    groupIds?: number[];
}