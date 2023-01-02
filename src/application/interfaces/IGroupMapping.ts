export type Pair = {
  repositoryUrl: string;
  groupId: BigInt;
};

export interface IGroupMapping {
  addMultiple(pairs: Pair[]): void;
  add(repositoryUrl: string, groupId: BigInt): void;
  remove(repositoryUrl: string, groupId: BigInt): void;
  has(repositoryUrl: string, groupId: BigInt): boolean;
  findGroupsIn(repositoryUrl: string): BigInt[];
}
