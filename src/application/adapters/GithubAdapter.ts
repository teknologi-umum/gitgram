import type { WebhookEvent } from "@octokit/webhooks-types";
import { trace } from "@opentelemetry/api";
import type {
  Comment,
  CommentChanges,
  Deployment,
  EventPayload,
  Issue,
  PullRequest,
  Release,
  Repository,
  Review,
  Sender,
  WebhookEventName
} from "~/application/webhook/types";

const tracer = trace.getTracer("application.adaptersGithubAdapter");

export class GithubAdapter {
  private readonly _repository?: Repository;
  private readonly _issue?: Issue;
  private readonly _sender?: Sender;
  private readonly _pullRequest?: PullRequest;
  private readonly _review?: Review;
  private readonly _comment?: Comment;
  private readonly _deploymentStatus?: Deployment;
  private readonly _release?: Release;
  private readonly _changes?: CommentChanges;

  constructor(payload: WebhookEvent) {
    if ("repository" in payload && payload.repository !== undefined) {
      const ghRepository = payload.repository;
      this._repository = {
        name: ghRepository.name,
        fullName: ghRepository.full_name,
        description: ghRepository.description ?? "<i>Not Available</i>",
        gitUrl: ghRepository.git_url,
        owner: {
          name: ghRepository.owner.login
        },
        isPrivate: ghRepository.private,
        sshUrl: ghRepository.ssh_url,
        homepage: ghRepository.homepage ?? "<i>Not Available</i>",
        language: ghRepository.language ?? "<i>Unknown</i>",
        license: ghRepository.license?.name ?? "<i>Not Available</i>"
      };
    }

    if ("issue" in payload && payload.issue !== undefined) {
      const ghIssue = payload.issue;
      this._issue = {
        url: ghIssue.html_url,
        labels: ghIssue.labels ?? [],
        number: ghIssue.number,
        title: ghIssue.title,
        user: {
          name: ghIssue.user.login
        },
        assignee: {
          name: ghIssue.assignee?.login ?? "<i>Unknown</i>"
        },
        body: ghIssue.body ?? "<i>Empty body</i>"
      };
    }

    if ("sender" in payload && payload.sender !== undefined) {
      this._sender = {
        name: payload.sender.login
      };
    }

    if ("pull_request" in payload && payload.pull_request !== undefined) {
      const ghPullRequest = payload.pull_request;
      this._pullRequest = {
        url: ghPullRequest.html_url,
        assignee: {
          name: ghPullRequest.assignee?.login ?? "<i>Not available</i>"
        },
        body: ghPullRequest.body ?? "<i>Empty body</i>",
        labels: ghPullRequest.labels,
        isMerged: ghPullRequest.merged_at !== null,
        number: ghPullRequest.number,
        title: ghPullRequest.title,
        user: {
          name: ghPullRequest.user.login
        }
      };
    }

    if ("comment" in payload && payload.comment !== undefined && typeof payload.comment !== "string") {
      this._comment = {
        url: payload.comment.html_url,
        body: payload.comment.body,
        user: {
          name: payload.comment.user.login
        }
      };
    }

    if ("changes" in payload && payload.changes !== undefined) {
      const changes = payload.changes as CommentChanges;
      this._changes = {
        body: {
          from: changes.body.from
        }
      };
    }

    if ("review" in payload && payload.review !== undefined) {
      const ghReview = payload.review;
      this._review = {
        body: ghReview.body ?? "<i>Empty body</i>",
        state: ghReview.state,
        url: ghReview.html_url
      };
    }

    if ("deployment_status" in payload && payload.deployment_status !== undefined) {
      const ghDeployment = payload.deployment_status;
      this._deploymentStatus = {
        targetUrl: ghDeployment.target_url,
        description: ghDeployment.description,
        environment: ghDeployment.environment,
        state: ghDeployment.state
      };
    }

    if ("release" in payload && payload.release !== undefined) {
      const ghRelease = payload.release;
      this._release = {
        body: ghRelease.body ?? "<i>Empty body</i>",
        name: ghRelease.name,
        tagName: ghRelease.tag_name,
        url: ghRelease.html_url
      };
    }
  }

  get(eventName: WebhookEventName) {
    return tracer.startActiveSpan("get", (span) => {
      span.setAttribute("event_name", eventName);

      // issue related events
      if (eventName.startsWith("issue")) {
        const payload = {
          issue: this._issue,
          repository: this._repository,
          sender: this._sender
        };
  
        switch (eventName) {
          case "issues.opened":
            return payload as EventPayload["issues.opened"];
          case "issues.closed":
            return payload as EventPayload["issues.closed"];
          case "issues.edited":
            return payload as EventPayload["issues.edited"];
          case "issues.reopened":
            return payload as EventPayload["issues.reopened"];
          case "issue_comment.created":
            return { ...payload, comment: this._comment } as EventPayload["issue_comment.created"];
          case "issue_comment.edited":
            return { ...payload, comment: this._comment, changes: this._changes } as EventPayload["issue_comment.edited"];
        }
      }
  
      // pull request related events
      if (eventName.startsWith("pull_request.")) {
        const payload = {
          pullRequest: this._pullRequest,
          repository: this._repository,
          review: this._review,
          sender: this._sender
        };
        switch (eventName) {
          case "pull_request.opened":
            return payload as EventPayload["pull_request.opened"];
          case "pull_request.closed":
            return payload as EventPayload["pull_request.closed"];
          case "pull_request.edited":
            return payload as EventPayload["pull_request.edited"];
        }
      }
  
      // pr review related events
      if (eventName.startsWith("pull_request_review")) {
        const payload = {
          pullRequest: this._pullRequest,
          repository: this._repository,
          review: this._review,
          sender: this._sender
        };
        switch (eventName) {
          case "pull_request_review.edited":
            return { ...payload, review: this._review } as EventPayload["pull_request_review.edited"];
          case "pull_request_review.submitted":
            return { ...payload, sender: this._sender } as EventPayload["pull_request_review.submitted"];
          case "pull_request_review_comment.created":
            return {
              ...payload,
              sender: this._sender,
              comment: this._comment
            } as EventPayload["pull_request_review_comment.created"];
        }
      }
  
      // deployment related events
      if (eventName.startsWith("deployment")) {
        switch (eventName) {
          case "deployment_status":
            return {
              repository: this._repository,
              deploymentStatus: this._deploymentStatus
            } as EventPayload["deployment_status"];
        }
      }
  
      // release related events
      if (eventName.startsWith("release.")) {
        switch (eventName) {
          case "release.published":
            return {
              release: this._release,
              repository: this._repository,
              sender: this._sender
            } as EventPayload["release.published"];
        }
      }
  
      throw new Error(`Unhandle event. Event name: ${eventName}`);
    });
  }
}