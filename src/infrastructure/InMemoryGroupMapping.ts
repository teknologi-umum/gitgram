import type { IGroupMapping, Pair } from "~/application/interfaces/IGroupMapping";

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
  private _groupMapping: GroupMap[] = [];
  private readonly _supportedProviders = ["github.com", "gitlab.com"];
  private readonly _defaultGroupId: number[] = [];

  constructor(defaultGroupId?: number[]) {
    if (defaultGroupId !== undefined) {
      this._defaultGroupId.push(...defaultGroupId);
    }
  }

  private groupExists(groupId: number, repositoryUrl: string) {
    return this._groupMapping.findIndex((item) => item.groupId === groupId && item.repositoryUrl === repositoryUrl) > 0;
  }

  addMultiple(pairs: Pair[]) {
    for (const pair of pairs) {
      this.add(pair.repositoryUrl, pair.groupId);
    }
  }

  add(repositoryUrl: string, groupId: number) {
    if (repositoryUrl === "") {
      throw new Error("Please provide a valid repository URL. Example: https://github.com/teknologi-umum/gitgram");
    }

    // Check if it has been registered before
    if (this.groupExists(groupId, repositoryUrl)) {
      throw new Error(`Group ${groupId} is already registered for ${repositoryUrl}`);
    }

    const url = new URL(repositoryUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Protocol is not supported. Please use http or https as the repository URL protocol.");
    }

    if (!this._supportedProviders.includes(url.hostname)) {
      const supported = this._supportedProviders.join(",");
      throw new Error(`${url.hostname} git provider is not supported yet. This bot currently supports ${supported}.`);
    }

    const hasSubscribed = this.has(repositoryUrl, groupId);
    if (hasSubscribed) {
      throw new Error(`A group ID of ${groupId} is already exists.`);
    }

    this._groupMapping.push({
      repositoryUrl: repositoryUrl,
      groupId: groupId,
      activeSince: new Date()
    });
  }

  remove(repositoryUrl: string, groupId: number) {
    if (!this.groupExists(groupId, repositoryUrl)) {
      throw new Error(`Group ${groupId} is not registered for ${repositoryUrl}`);
    }

    const removedIndex = this._groupMapping.findIndex(
      (item) => item.groupId === groupId && item.repositoryUrl === repositoryUrl
    );
    this._groupMapping.splice(removedIndex, 1);
  }

  has(repositoryUrl: string, groupId: number): boolean {
    return this.groupExists(groupId, repositoryUrl);
  }

  findGroupsIn(repositoryUrl: string): number[] {
    const groupIds = this._groupMapping.filter((g) => g.repositoryUrl === repositoryUrl).map((g) => g.groupId);
    if (this._defaultGroupId.length > 0 && groupIds.length === 0) {
      return this._defaultGroupId;
    }

    return groupIds;
  }
}
