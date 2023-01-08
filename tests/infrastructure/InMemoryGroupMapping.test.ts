import { beforeAll, describe, it, expect, test } from "vitest";
import { InMemoryGroupMapping } from "~/infrastructure/InMemoryGroupMapping";

describe("invalid add validations", () => {
  const groupMapping = new InMemoryGroupMapping();

  it("should throw on empty repository url", () => {
    expect(() => groupMapping.add("", BigInt(0)))
      .toThrowError(new Error("Please provide a valid repository URL. Example: https://github.com/teknologi-umum/gitgram"));
  });

  it("should throw on unsupported protocol", () => {
    expect(() => groupMapping.add("ssh://github.com/teknologi-umum/gitgram", BigInt(0)))
      .toThrowError(new Error("Protocol is not supported. Please use http or https as the repository URL protocol."));
  });

  it("should throw error on unsupported providers", () => {
    expect(() => groupMapping.add("https://gitea.com/teknologi-umum/gitgram", BigInt(0)))
      .toThrowError(new Error("gitea.com git provider is not supported yet. This bot currently supports github.com,gitlab.com."));
  });

  it("should throw error on duplicate combination", () => {
    groupMapping.add("https://github.com/teknologi-umum/main", BigInt(42));

    expect(() => groupMapping.add("https://github.com/teknologi-umum/main", BigInt(42)))
      .toThrowError(new Error("Group 42 is already registered for https://github.com/teknologi-umum/main"));
  });
});
describe("find groups", () => {
  const groupMapping = new InMemoryGroupMapping();

  beforeAll(() => {
    groupMapping.add("https://github.com/teknologi-umum/gitgram", BigInt(42));
    groupMapping.add("https://github.com/teknologi-umum/pesto", BigInt(12));
    groupMapping.add("https://github.com/teknologi-umum/blog", BigInt(30));
  });

  it("should be able to find group", () => {
    const groupIds = groupMapping.findGroupsIn("https://github.com/teknologi-umum/gitgram");

    expect(groupIds).toStrictEqual([BigInt(42)]);
  });

  it("should return empty array because of no default value", () => {
    const groupIds = groupMapping.findGroupsIn("https://github.com/teknologi-umum/botnet");
    expect(groupIds).toBeTypeOf("object");
    expect(groupIds).toHaveLength(0);
  });
});

describe("remove groups", () => {
  const groupMapping = new InMemoryGroupMapping();

  groupMapping.add("https://github.com/teknologi-umum/gitgram", BigInt(42));
  groupMapping.add("https://github.com/teknologi-umum/pesto", BigInt(12));
  groupMapping.add("https://github.com/teknologi-umum/blog", BigInt(30));

  it("not exists", () => {
    expect(() => groupMapping.remove("https://github.com/teknologi-umum/botnet", BigInt(12)))
      .toThrowError(new Error("Group 12 is not registered for https://github.com/teknologi-umum/botnet"));
  });

  it("normal", () => {
    groupMapping.remove("https://github.com/teknologi-umum/blog", BigInt(30));
    const exists = groupMapping.has("https://github.com/teknologi-umum/blog", BigInt(30));

    expect(exists).toStrictEqual(false);
  });
});

test("default group", () => {
  const groupMapping = new InMemoryGroupMapping([BigInt(200)]);

  groupMapping.add("https://github.com/teknologi-umum/gitgram", BigInt(42));
  groupMapping.add("https://github.com/teknologi-umum/pesto", BigInt(12));
  groupMapping.add("https://github.com/teknologi-umum/blog", BigInt(30));

  expect(groupMapping.findGroupsIn("not-exists"))
    .toStrictEqual([BigInt(200)]);
});
