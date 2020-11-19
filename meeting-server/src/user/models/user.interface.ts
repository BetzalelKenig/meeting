import { UserRole } from "./user.entity";

export interface User{
    id?: number;
    username?: string;
    password?: string;
    role?: UserRole;

}