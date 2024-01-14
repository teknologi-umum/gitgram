import { readFile } from "fs/promises";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parse as parseGura } from "gura";
import { DiscussionEventHandler } from "~/presentation/event-handlers/Discussion";
import { appConfigSchema } from "~/schema";
import { ConsolePresenter } from "~/presentation/ConsolePresenter";
import type {
  Discussion,
  DiscussionComment,
  Reactions,
  Repository,
  Sender,
  TEvent
} from "~/application/webhook/types";

// configurations
const configFile = await readFile(path.resolve("config", "config.ura"), { encoding: "utf-8" });
const config = appConfigSchema.parse(parseGura(configFile));

describe("it should handle discussion events", () => {
  const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const hub = new ConsolePresenter();
  const handler = new DiscussionEventHandler(config.templates.discussion, hub);

  afterEach(() => {
    consoleMock.mockClear();
  });

  // base payload
  const sender = {
    name: "manusia_bernapas"
  } satisfies Sender;
  const repository = {
    fullName: "teknologi-umum/gitgram",
    description: "something",
    gitUrl: "https://github.com:teknologi-umum/gitgram.git",
    sshUrl: "git@github.com:teknologi-umum/gitgram.git",
    isPrivate: false,
    name: "gitgram",
    owner: {
      name: "teknologi-umum"
    }
  } satisfies Repository;
  const reactions = {
    "+1": 1,
    "-1": 0,
    confused: 0,
    eyes: 0,
    heart: 5,
    hooray: 0,
    laugh: 0,
    rocket: 10,
    total_count: 16
  } satisfies Reactions;
  const discussion = {
    number: 1,
    title: "Rewrite Gitgram in Rust",
    body: "I think this is a nobrainer decision for the future of Gitgram",
    answerUrl: null,
    url: "https://github.com/teknologi-umum/gitgram/discussions/1",
    category: {
      name: "ideas",
      description: "Ideas for Gitgram",
      emoji: "💡",
      slug: "ideas"
    },
    reactions: reactions,
    state: "open",
    user: sender
  } satisfies Discussion;
  const comment = {
    url: "https://github.com/teknologi-umum/gitgram/discussions/1#discussioncomment-1",
    body: "I don't think this is a good idea",
    user: sender,
    replyCount: 0,
    reactions: reactions
  } satisfies DiscussionComment;

  it("should handle discussion.created", () => {
    const event = {
      type: "created",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.created">["payload"];

    handler.created()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.created"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🗣️ New discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was opened by manusia_bernapas</b>

I think this is a nobrainer decision for the future of Gitgram

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.closed", () => {
    const event = {
      type: "closed",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.closed">["payload"];

    handler.closed()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.closed"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🚫 Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was closed by manusia_bernapas</b>

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.reopened", () => {
    const event = {
      type: "reopened",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.reopened">["payload"];

    handler.reopened()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.reopened"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🗣️ Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was reopened by manusia_bernapas</b>

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.edited", () => {
    const event = {
      type: "edited",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.edited">["payload"];

    handler.edited()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.edited"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🗣️ Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was edited by manusia_bernapas</b>

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.deleted", () => {
    const event = {
      type: "deleted",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.deleted">["payload"];

    handler.deleted()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.deleted"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🗑️ Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was deleted by manusia_bernapas</b>

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.answered", () => {
    const event = {
      type: "answered",
      sender: sender,
      repository: repository,
      discussion: discussion,
      answer: comment
    } satisfies TEvent<"discussion.answered">["payload"];

    handler.answered()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.answered"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>🗣️ Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was answered by manusia_bernapas</b>

I don't think this is a good idea

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion.pinned", () => {
    const event = {
      type: "pinned",
      sender: sender,
      repository: repository,
      discussion: discussion
    } satisfies TEvent<"discussion.pinned">["payload"];

    handler.pinned()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion.pinned"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>📌 Discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1">#1 Rewrite Gitgram in Rust</a> was pinned by manusia_bernapas</b>

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas`
    );
  });

  it("should handle discussion_comment.created", () => {
    const event = {
      type: "created",
      sender: sender,
      repository: repository,
      discussion: discussion,
      comment: comment
    } satisfies TEvent<"discussion_comment.created">["payload"];

    handler.commentCreated()({
      targetsId: [BigInt(1)],
      payload: event,
      type: "discussion_comment.created"
    });

    expect(consoleMock).toHaveBeenCalledWith(
      `<b>💬 New comment on discussion <a href="https://github.com/teknologi-umum/gitgram/discussions/1#discussioncomment-1">#1 Rewrite Gitgram in Rust</a> by manusia_bernapas</b>

I don't think this is a good idea

<b>Repo</b>: <a href="https://github.com/teknologi-umum/gitgram">teknologi-umum/gitgram</a>
<b>Category</b>: 💡 ideas
<b>Replies</b>: 0`
    );
  });
});