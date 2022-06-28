export type Pair = {
  repositoryUrl: string;
  groupId: number;
};

export interface IGroupMapping {
  addMultiple(pairs: Pair[]): void;
  add(repositoryUrl: string, groupId: number): void;
  remove(repositoryUrl: string, groupId: number): void;
  has(repositoryUrl: string, groupId: number): boolean;
  findGroupsIn(repositoryUrl: string): number[];
}
