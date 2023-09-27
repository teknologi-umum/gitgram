export type Pair = {
  repositoryUrl: string;
  groupId: bigint;
};

export interface IGroupMapping {
  addMultiple(pairs: Pair[]): void;
  add(repositoryUrl: string, groupId: bigint): void;
  remove(repositoryUrl: string, groupId: bigint): void;
  has(repositoryUrl: string, groupId: bigint): boolean;
  findGroupsIn(repositoryUrl: string): bigint[];
}