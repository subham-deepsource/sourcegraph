// Code generated by go-mockgen 1.1.5; DO NOT EDIT.

package server

import (
	"context"
	"sync"

	store "github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies/store"
)

// MockDependenciesStore is a mock implementation of the DependenciesStore
// interface (from the package
// github.com/sourcegraph/sourcegraph/cmd/gitserver/server) used for unit
// testing.
type MockDependenciesStore struct {
	// ListDependencyReposFunc is an instance of a mock function object
	// controlling the behavior of the method ListDependencyRepos.
	ListDependencyReposFunc *DependenciesStoreListDependencyReposFunc
}

// NewMockDependenciesStore creates a new mock of the DependenciesStore
// interface. All methods return zero values for all results, unless
// overwritten.
func NewMockDependenciesStore() *MockDependenciesStore {
	return &MockDependenciesStore{
		ListDependencyReposFunc: &DependenciesStoreListDependencyReposFunc{
			defaultHook: func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
				return nil, nil
			},
		},
	}
}

// NewStrictMockDependenciesStore creates a new mock of the
// DependenciesStore interface. All methods panic on invocation, unless
// overwritten.
func NewStrictMockDependenciesStore() *MockDependenciesStore {
	return &MockDependenciesStore{
		ListDependencyReposFunc: &DependenciesStoreListDependencyReposFunc{
			defaultHook: func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
				panic("unexpected invocation of MockDependenciesStore.ListDependencyRepos")
			},
		},
	}
}

// NewMockDependenciesStoreFrom creates a new mock of the
// MockDependenciesStore interface. All methods delegate to the given
// implementation, unless overwritten.
func NewMockDependenciesStoreFrom(i DependenciesStore) *MockDependenciesStore {
	return &MockDependenciesStore{
		ListDependencyReposFunc: &DependenciesStoreListDependencyReposFunc{
			defaultHook: i.ListDependencyRepos,
		},
	}
}

// DependenciesStoreListDependencyReposFunc describes the behavior when the
// ListDependencyRepos method of the parent MockDependenciesStore instance
// is invoked.
type DependenciesStoreListDependencyReposFunc struct {
	defaultHook func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error)
	hooks       []func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error)
	history     []DependenciesStoreListDependencyReposFuncCall
	mutex       sync.Mutex
}

// ListDependencyRepos delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockDependenciesStore) ListDependencyRepos(v0 context.Context, v1 store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
	r0, r1 := m.ListDependencyReposFunc.nextHook()(v0, v1)
	m.ListDependencyReposFunc.appendCall(DependenciesStoreListDependencyReposFuncCall{v0, v1, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the ListDependencyRepos
// method of the parent MockDependenciesStore instance is invoked and the
// hook queue is empty.
func (f *DependenciesStoreListDependencyReposFunc) SetDefaultHook(hook func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// ListDependencyRepos method of the parent MockDependenciesStore instance
// invokes the hook at the front of the queue and discards it. After the
// queue is empty, the default hook function is invoked for any future
// action.
func (f *DependenciesStoreListDependencyReposFunc) PushHook(hook func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *DependenciesStoreListDependencyReposFunc) SetDefaultReturn(r0 []store.DependencyRepo, r1 error) {
	f.SetDefaultHook(func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *DependenciesStoreListDependencyReposFunc) PushReturn(r0 []store.DependencyRepo, r1 error) {
	f.PushHook(func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
		return r0, r1
	})
}

func (f *DependenciesStoreListDependencyReposFunc) nextHook() func(context.Context, store.ListDependencyReposOpts) ([]store.DependencyRepo, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *DependenciesStoreListDependencyReposFunc) appendCall(r0 DependenciesStoreListDependencyReposFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of
// DependenciesStoreListDependencyReposFuncCall objects describing the
// invocations of this function.
func (f *DependenciesStoreListDependencyReposFunc) History() []DependenciesStoreListDependencyReposFuncCall {
	f.mutex.Lock()
	history := make([]DependenciesStoreListDependencyReposFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// DependenciesStoreListDependencyReposFuncCall is an object that describes
// an invocation of method ListDependencyRepos on an instance of
// MockDependenciesStore.
type DependenciesStoreListDependencyReposFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 store.ListDependencyReposOpts
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 []store.DependencyRepo
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c DependenciesStoreListDependencyReposFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c DependenciesStoreListDependencyReposFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}
