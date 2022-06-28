import type { IGroupMapping } from "../application/interfaces/IGroupMapping";

type GroupMap = {
  repositoryUrl: string;
  groupId: number;
  activeSince: Date;
};

/**
 * A group mapping for multiple repositories and groups support. This version stores
 * the group mapping using an array in memory.
 */
export class InMemoryGroupMapping implements IGroupMapping {
  groupMapping: GroupMap[];

  constructor() {
    this.groupMapping = [];
  }

  private groupExists(groupId: number, repositoryUrl: string) {
    return (
      this.groupMapping.findIndex(
        (item) =>
          item.groupId === groupId && item.repositoryUrl === repositoryUrl
      ) > 0
    );
  }

  add(repositoryUrl: string, groupId: number) {
    // Check if it's registered before
    if (this.groupExists(groupId, repositoryUrl)) {
      throw new Error(
        `Group ${groupId} is already registered for ${repositoryUrl}`
      );
    }

    this.groupMapping.push({
      repositoryUrl: repositoryUrl,
      groupId: groupId,
      activeSince: new Date()
    });
  }

  remove(repositoryUrl: string, groupId: number) {
    if (!this.groupExists(groupId, repositoryUrl)) {
      throw new Error(
        `Group ${groupId} is not registered for ${repositoryUrl}`
      );
    }

    const removedIndex = this.groupMapping.findIndex(
      (item) => item.groupId === groupId && item.repositoryUrl === repositoryUrl
    );
    this.groupMapping.splice(removedIndex, 1);
  }

  has(repositoryUrl: string, groupId: number): boolean {
    return this.groupExists(groupId, repositoryUrl);
  }
}
