package bitbucketcloud

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/sourcegraph/sourcegraph/lib/errors"
)

// GetPullRequest retrieves a single pull request.
func (c *Client) GetPullRequest(ctx context.Context, repo *Repo, id int64) (*PullRequest, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("/2.0/repositories/%s/pullrequests/%d", repo.FullName, id), nil)
	if err != nil {
		return nil, errors.Wrap(err, "creating request")
	}

	var pr PullRequest
	if err := c.do(ctx, req, &pr); err != nil {
		return nil, errors.Wrap(err, "sending request")
	}

	return &pr, nil
}

// PullRequest represents a single pull request, as returned by the API.
type PullRequest struct {
	Links             Links                     `json:"links"`
	ID                int64                     `json:"id"`
	Title             string                    `json:"title"`
	Rendered          RenderedPullRequestMarkup `json:"rendered"`
	Summary           RenderedMarkup            `json:"summary"`
	State             PullRequestState          `json:"state"`
	Author            Account                   `json:"author"`
	Source            PullRequestEndpoint       `json:"source"`
	Destination       PullRequestEndpoint       `json:"destination"`
	MergeCommit       *PullRequestCommit        `json:"merge_commit,omitempty"`
	CommentCount      int64                     `json:"comment_count"`
	TaskCount         int64                     `json:"task_count"`
	CloseSourceBranch bool                      `json:"close_source_branch"`
	ClosedBy          *Account                  `json:"account,omitempty"`
	Reason            *string                   `json:"reason,omitempty"`
	CreatedOn         time.Time                 `json:"created_on"`
	UpdatedOn         time.Time                 `json:"updated_on"`
	Reviewers         []Account                 `json:"reviewers"`
	Participants      []Participant             `json:"participants"`
}

type PullRequestBranch struct {
	Name                 string          `json:"name"`
	MergeStrategies      []MergeStrategy `json:"merge_strategies"`
	DefaultMergeStrategy MergeStrategy   `json:"default_merge_strategy"`
}

type PullRequestCommit struct {
	Hash string `json:"hash"`
}

type PullRequestEndpoint struct {
	Repo   Repo              `json:"repository"`
	Branch PullRequestBranch `json:"branch"`
	Commit PullRequestCommit `json:"commit"`
}

type RenderedPullRequestMarkup struct {
	Title       RenderedMarkup `json:"title"`
	Description RenderedMarkup `json:"description"`
	Reason      RenderedMarkup `json:"reason"`
}

type RenderedMarkup struct {
	Raw    string `json:"raw"`
	Markup string `json:"markup"`
	HTML   string `json:"html"`
}

type MergeStrategy string
type PullRequestState string

const (
	MergeStrategyMergeCommit MergeStrategy = "merge_commit"
	MergeStrategySquash      MergeStrategy = "squash"
	MergeStrategyFastForward MergeStrategy = "fast_forward"

	PullRequestStateMerged     PullRequestState = "MERGED"
	PullRequestStateSuperseded PullRequestState = "SUPERSEDED"
	PullRequestStateOpen       PullRequestState = "OPEN"
	PullRequestStateDeclined   PullRequestState = "DECLINED"
)
