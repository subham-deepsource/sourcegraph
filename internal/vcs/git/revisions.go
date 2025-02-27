package git

import (
	"bytes"
	"context"
	"fmt"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/gitserver"
	"github.com/sourcegraph/sourcegraph/internal/gitserver/gitdomain"
	"github.com/sourcegraph/sourcegraph/internal/trace/ot"
	"github.com/sourcegraph/sourcegraph/lib/errors"
)

// IsAbsoluteRevision checks if the revision is a git OID SHA string.
//
// Note: This doesn't mean the SHA exists in a repository, nor does it mean it
// isn't a ref. Git allows 40-char hexadecimal strings to be references.
func IsAbsoluteRevision(s string) bool {
	if len(s) != 40 {
		return false
	}
	for _, r := range s {
		if !(('0' <= r && r <= '9') ||
			('a' <= r && r <= 'f') ||
			('A' <= r && r <= 'F')) {
			return false
		}
	}
	return true
}

// ResolveRevisionOptions configure how we resolve revisions.
// The zero value should contain appropriate default values.
type ResolveRevisionOptions struct {
	NoEnsureRevision bool // do not try to fetch from remote if revision doesn't exist locally
}

var resolveRevisionCounter = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "src_resolve_revision_total",
	Help: "The number of times we call internal/vcs/git/ResolveRevision",
}, []string{"ensure_revision"})

// ResolveRevision will return the absolute commit for a commit-ish spec. If spec is empty, HEAD is
// used.
//
// Error cases:
// * Repo does not exist: gitdomain.RepoNotExistError
// * Commit does not exist: gitdomain.RevisionNotFoundError
// * Empty repository: gitdomain.RevisionNotFoundError
// * Other unexpected errors.
func ResolveRevision(ctx context.Context, db database.DB, repo api.RepoName, spec string, opt ResolveRevisionOptions) (api.CommitID, error) {
	if Mocks.ResolveRevision != nil {
		return Mocks.ResolveRevision(spec, opt)
	}

	labelEnsureRevisionValue := "true"
	if opt.NoEnsureRevision {
		labelEnsureRevisionValue = "false"
	}
	resolveRevisionCounter.WithLabelValues(labelEnsureRevisionValue).Inc()

	span, ctx := ot.StartSpanFromContext(ctx, "Git: ResolveRevision")
	span.SetTag("Spec", spec)
	span.SetTag("Opt", fmt.Sprintf("%+v", opt))
	defer span.Finish()

	if err := checkSpecArgSafety(spec); err != nil {
		return "", err
	}
	if spec == "" {
		spec = "HEAD"
	}
	if spec != "HEAD" {
		// "git rev-parse HEAD^0" is slower than "git rev-parse HEAD"
		// since it checks that the resolved git object exists. We can
		// assume it exists for HEAD, but for other commits we should
		// check.
		spec = spec + "^0"
	}

	cmd := gitserver.NewClient(db).Command("git", "rev-parse", spec)
	cmd.Repo = repo
	cmd.EnsureRevision = spec

	// We don't ever need to ensure that HEAD is in git-server.
	// HEAD is always there once a repo is cloned
	// (except empty repos, but we don't need to ensure revision on those).
	if opt.NoEnsureRevision || spec == "HEAD" {
		cmd.EnsureRevision = ""
	}

	return runRevParse(ctx, cmd, spec)
}

// runRevParse sends the git rev-parse command to gitserver. It interprets
// missing revision responses and converts them into RevisionNotFoundError.
func runRevParse(ctx context.Context, cmd *gitserver.Cmd, spec string) (api.CommitID, error) {
	stdout, stderr, err := cmd.DividedOutput(ctx)
	if err != nil {
		if gitdomain.IsRepoNotExist(err) {
			return "", err
		}
		if bytes.Contains(stderr, []byte("unknown revision")) {
			return "", &gitdomain.RevisionNotFoundError{Repo: cmd.Repo, Spec: spec}
		}
		return "", errors.WithMessage(err, fmt.Sprintf("git command %v failed (stderr: %q)", cmd.Args, stderr))
	}
	commit := api.CommitID(bytes.TrimSpace(stdout))
	if !IsAbsoluteRevision(string(commit)) {
		if commit == "HEAD" {
			// We don't verify the existence of HEAD (see above comments), but
			// if HEAD doesn't point to anything git just returns `HEAD` as the
			// output of rev-parse. An example where this occurs is an empty
			// repository.
			return "", &gitdomain.RevisionNotFoundError{Repo: cmd.Repo, Spec: spec}
		}
		return "", gitdomain.BadCommitError{Spec: spec, Commit: commit, Repo: cmd.Repo}
	}
	return commit, nil
}
