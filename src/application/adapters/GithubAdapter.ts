import type { WebhookEvent } from "@octokit/webhooks-types";
import type {
  Comment,
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

export class GithubAdapter {
  private readonly _repository?: Repository;
  private readonly _issue?: Issue;
  private readonly _sender?: Sender;
  private readonly _pullRequest?: PullRequest;
  private readonly _review?: Review;
  private readonly _comment?: Comment;
  private readonly _deploymentStatus?: Deployment;
  private readonly _release?: Release;

  constructor(payload: WebhookEvent) {
    if ("repository" in payload && payload.repository !== undefined) {
      const ghRepository = payload.repository;
      this._repository = {
        name: ghRepository.name,
        fullName: ghRepository.full_name,
        description: ghRepository.description ?? "Not Available",
        gitUrl: ghRepository.git_url,
        owner: {
          name: ghRepository.owner.login
        },
        isPrivate: ghRepository.private,
        sshUrl: ghRepository.ssh_url,
        homepage: ghRepository.homepage ?? "Not Available",
        language: ghRepository.language ?? "Unknown",
        license: ghRepository.license?.name ?? "Not Available"
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
          name: ghIssue.assignee?.login ?? "Unknown"
        },
        body: ghIssue.body ?? "Empty body"
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
          name: ghPullRequest.assignee?.login ?? "Not available"
        },
        body: ghPullRequest.body ?? "Empty body",
        labels: ghPullRequest.labels,
        isMerged: ghPullRequest.merged_at !== null,
        number: ghPullRequest.number,
        title: ghPullRequest.title,
        user: {
          name: ghPullRequest.user.login
        }
      };
    }

    if ("comment" in payload && payload.comment !== undefined) {
      this._comment = {
        url: payload.comment.html_url,
        body: payload.comment.body,
        user: {
          name: payload.comment.user.login
        }
      };
    }

    if ("review" in payload && payload.review !== undefined) {
      const ghReview = payload.review;
      this._review = {
        body: ghReview.body ?? "Empty body",
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
        body: ghRelease.body ?? "Empty body",
        name: ghRelease.name,
        tagName: ghRelease.tag_name,
        url: ghRelease.html_url
      };
    }
  }

  get(eventName: WebhookEventName) {
    // issue related events
    if (eventName.startsWith("issue")) {
      const payload = {
        issue: this._issue,
        repository: this._repository,
        sender: this._sender
      };

      switch (eventName) {
        case "issue.opened":
          return payload as EventPayload["issue.opened"];
        case "issue.closed":
          return payload as EventPayload["issue.closed"];
        case "issue.edited":
          return payload as EventPayload["issue.edited"];
        case "issue.reopened":
          return payload as EventPayload["issue.reopened"];
        case "issue_comment.created":
          return { ...payload, comment: this._comment } as EventPayload["issue_comment.created"];
        case "issue_comment.edited":
          return { ...payload, comment: this._comment } as EventPayload["issue_comment.edited"];
      }
    }

    // pull request related events
    if (eventName.startsWith("pull_request.")) {
      const payload = {
        pullRequest: this._pullRequest,
        repository: this._repository,
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
  }
}
