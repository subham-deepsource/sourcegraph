package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/policies"
)

type (
	DependencyService dependencies.Service
	PoliciesService   policies.Service
)

var (
	GetDependenciesService = dependencies.GetService
	GetPoliciesService     = policies.GetService
)
