package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/autoindexing"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
)

type (
	AutoIndexingService autoindexing.Service
	DependencyService   dependencies.Service
)

var (
	GetAutoindexingService = autoindexing.GetService
	GetDependenciesService = dependencies.GetService
)
