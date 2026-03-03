export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  isBlocked?: boolean;
  sortBy: 'createdAt' | 'lastActiveDate' | 'email';
  sortOrder: 'asc' | 'desc';
}