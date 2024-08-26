import { User } from "@shared/types/entitiesTypes";

export interface UsersDao {
  findUserById(userId: number, selectedFields?: string): Promise<any>;

  findUserByEmail(email: string, selectedFields?: string): Promise<any>;

  findSuperAdmin(selectedFields?: string): Promise<any>;

  findUserByVerificationToken(
    verificationToken: string,
    selectedFields?: string,
  ): Promise<any>;

  findUserByResetPasswordToken(
    resetPasswordToken: string,
    selectedFields?: string,
  ): Promise<any>;

  createUser(user: Partial<User>): Promise<void>;

  updateUser(userId: number, user: Partial<User>): Promise<void>;

  setVerificationToken(
    userId: number,
    verificationToken: string,
  ): Promise<void>;

  setResetPasswordToken(
    userId: number,
    resetPasswordToken: string,
  ): Promise<void>;

  deleteUser(userId: number): Promise<void>;

  getUsers(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;

  searchUsers(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;

  getUnverifiedUsers(selectedFields?: string): Promise<any[]>;
}
