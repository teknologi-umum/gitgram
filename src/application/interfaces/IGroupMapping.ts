export interface IGroupMapping {
  add(repositoryUrl: string, groupId: number): void;
  remove(repositoryUrl: string, groupId: number): void;
  has(repositoryUrl: string, groupId: number): boolean;
}
