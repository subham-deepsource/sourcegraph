package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/documents"
)

type (
	DependencyService dependencies.Service
	DocumentsService  documents.Service
)

var (
	GetDependenciesService = dependencies.GetService
	GetDocumentsService    = documents.GetService
)
