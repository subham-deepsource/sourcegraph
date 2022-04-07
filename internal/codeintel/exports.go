package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/uploads"
)

type (
	DependencyService dependencies.Service
	UploadsService    uploads.Service
)

var (
	GetDependenciesService = dependencies.GetService
	GetUploadsService      = uploads.GetService
)
