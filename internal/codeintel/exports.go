package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/symbols"
)

type (
	DependencyService dependencies.Service
	SymbolsService    symbols.Service
)

var (
	GetDependenciesService = dependencies.GetService
	GetSymbolsService      = symbols.GetService
)
