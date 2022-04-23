type GroupMap = {
  repositoryUrl: string,
  groupId: number,
  activeSince: Date
}

export class GroupMapping {
  groupMapping: GroupMap[];

  constructor() {
    this.groupMapping = [];
  }

  add(repositoryUrl: string, groupId: number) {
    // Check if it's registered before
    const index = this.groupMapping.findIndex(item => item.groupId === groupId && item.repositoryUrl === repositoryUrl);
    if (index > 0) {
      throw new Error(`Group ${groupId} is already registered for ${repositoryUrl}`);
    }

    this.groupMapping.push({
      repositoryUrl: repositoryUrl,
      groupId: groupId,
      activeSince: new Date()
    });
  }

  remove(repositoryUrl: string, groupId: number) {
    const index = this.groupMapping.findIndex(item => item.groupId === groupId && item.repositoryUrl === repositoryUrl);
    if (index < 0) {
      throw new Error(`Group ${groupId} is not registered for ${repositoryUrl}`);
    }

    const temporaryMapping = this.groupMapping.filter(item => item.groupId !== groupId && item.repositoryUrl !== repositoryUrl);
    this.groupMapping.length = 0;
    this.groupMapping.push(...temporaryMapping);
  }

  has(repositoryUrl: string, groupId: number): boolean {
    const index = this.groupMapping.findIndex(item => item.groupId === groupId && item.repositoryUrl === repositoryUrl);
    return index > 0;
  }
}
