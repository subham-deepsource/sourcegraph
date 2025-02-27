// Code generated by go-mockgen 1.1.5; DO NOT EDIT.

package client

import (
	"context"
	"sync"

	search "github.com/sourcegraph/sourcegraph/internal/search"
	job "github.com/sourcegraph/sourcegraph/internal/search/job"
	run "github.com/sourcegraph/sourcegraph/internal/search/run"
	streaming "github.com/sourcegraph/sourcegraph/internal/search/streaming"
	schema "github.com/sourcegraph/sourcegraph/schema"
)

// MockSearchClient is a mock implementation of the SearchClient interface
// (from the package
// github.com/sourcegraph/sourcegraph/internal/search/client) used for unit
// testing.
type MockSearchClient struct {
	// ExecuteFunc is an instance of a mock function object controlling the
	// behavior of the method Execute.
	ExecuteFunc *SearchClientExecuteFunc
	// JobArgsFunc is an instance of a mock function object controlling the
	// behavior of the method JobArgs.
	JobArgsFunc *SearchClientJobArgsFunc
	// PlanFunc is an instance of a mock function object controlling the
	// behavior of the method Plan.
	PlanFunc *SearchClientPlanFunc
}

// NewMockSearchClient creates a new mock of the SearchClient interface. All
// methods return zero values for all results, unless overwritten.
func NewMockSearchClient() *MockSearchClient {
	return &MockSearchClient{
		ExecuteFunc: &SearchClientExecuteFunc{
			defaultHook: func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error) {
				return nil, nil
			},
		},
		JobArgsFunc: &SearchClientJobArgsFunc{
			defaultHook: func(*run.SearchInputs) *job.Args {
				return nil
			},
		},
		PlanFunc: &SearchClientPlanFunc{
			defaultHook: func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error) {
				return nil, nil
			},
		},
	}
}

// NewStrictMockSearchClient creates a new mock of the SearchClient
// interface. All methods panic on invocation, unless overwritten.
func NewStrictMockSearchClient() *MockSearchClient {
	return &MockSearchClient{
		ExecuteFunc: &SearchClientExecuteFunc{
			defaultHook: func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error) {
				panic("unexpected invocation of MockSearchClient.Execute")
			},
		},
		JobArgsFunc: &SearchClientJobArgsFunc{
			defaultHook: func(*run.SearchInputs) *job.Args {
				panic("unexpected invocation of MockSearchClient.JobArgs")
			},
		},
		PlanFunc: &SearchClientPlanFunc{
			defaultHook: func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error) {
				panic("unexpected invocation of MockSearchClient.Plan")
			},
		},
	}
}

// NewMockSearchClientFrom creates a new mock of the MockSearchClient
// interface. All methods delegate to the given implementation, unless
// overwritten.
func NewMockSearchClientFrom(i SearchClient) *MockSearchClient {
	return &MockSearchClient{
		ExecuteFunc: &SearchClientExecuteFunc{
			defaultHook: i.Execute,
		},
		JobArgsFunc: &SearchClientJobArgsFunc{
			defaultHook: i.JobArgs,
		},
		PlanFunc: &SearchClientPlanFunc{
			defaultHook: i.Plan,
		},
	}
}

// SearchClientExecuteFunc describes the behavior when the Execute method of
// the parent MockSearchClient instance is invoked.
type SearchClientExecuteFunc struct {
	defaultHook func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error)
	hooks       []func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error)
	history     []SearchClientExecuteFuncCall
	mutex       sync.Mutex
}

// Execute delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockSearchClient) Execute(v0 context.Context, v1 streaming.Sender, v2 *run.SearchInputs) (*search.Alert, error) {
	r0, r1 := m.ExecuteFunc.nextHook()(v0, v1, v2)
	m.ExecuteFunc.appendCall(SearchClientExecuteFuncCall{v0, v1, v2, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the Execute method of
// the parent MockSearchClient instance is invoked and the hook queue is
// empty.
func (f *SearchClientExecuteFunc) SetDefaultHook(hook func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// Execute method of the parent MockSearchClient instance invokes the hook
// at the front of the queue and discards it. After the queue is empty, the
// default hook function is invoked for any future action.
func (f *SearchClientExecuteFunc) PushHook(hook func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *SearchClientExecuteFunc) SetDefaultReturn(r0 *search.Alert, r1 error) {
	f.SetDefaultHook(func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *SearchClientExecuteFunc) PushReturn(r0 *search.Alert, r1 error) {
	f.PushHook(func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error) {
		return r0, r1
	})
}

func (f *SearchClientExecuteFunc) nextHook() func(context.Context, streaming.Sender, *run.SearchInputs) (*search.Alert, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *SearchClientExecuteFunc) appendCall(r0 SearchClientExecuteFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of SearchClientExecuteFuncCall objects
// describing the invocations of this function.
func (f *SearchClientExecuteFunc) History() []SearchClientExecuteFuncCall {
	f.mutex.Lock()
	history := make([]SearchClientExecuteFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// SearchClientExecuteFuncCall is an object that describes an invocation of
// method Execute on an instance of MockSearchClient.
type SearchClientExecuteFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 streaming.Sender
	// Arg2 is the value of the 3rd argument passed to this method
	// invocation.
	Arg2 *run.SearchInputs
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 *search.Alert
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c SearchClientExecuteFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1, c.Arg2}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c SearchClientExecuteFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}

// SearchClientJobArgsFunc describes the behavior when the JobArgs method of
// the parent MockSearchClient instance is invoked.
type SearchClientJobArgsFunc struct {
	defaultHook func(*run.SearchInputs) *job.Args
	hooks       []func(*run.SearchInputs) *job.Args
	history     []SearchClientJobArgsFuncCall
	mutex       sync.Mutex
}

// JobArgs delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockSearchClient) JobArgs(v0 *run.SearchInputs) *job.Args {
	r0 := m.JobArgsFunc.nextHook()(v0)
	m.JobArgsFunc.appendCall(SearchClientJobArgsFuncCall{v0, r0})
	return r0
}

// SetDefaultHook sets function that is called when the JobArgs method of
// the parent MockSearchClient instance is invoked and the hook queue is
// empty.
func (f *SearchClientJobArgsFunc) SetDefaultHook(hook func(*run.SearchInputs) *job.Args) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// JobArgs method of the parent MockSearchClient instance invokes the hook
// at the front of the queue and discards it. After the queue is empty, the
// default hook function is invoked for any future action.
func (f *SearchClientJobArgsFunc) PushHook(hook func(*run.SearchInputs) *job.Args) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *SearchClientJobArgsFunc) SetDefaultReturn(r0 *job.Args) {
	f.SetDefaultHook(func(*run.SearchInputs) *job.Args {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *SearchClientJobArgsFunc) PushReturn(r0 *job.Args) {
	f.PushHook(func(*run.SearchInputs) *job.Args {
		return r0
	})
}

func (f *SearchClientJobArgsFunc) nextHook() func(*run.SearchInputs) *job.Args {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *SearchClientJobArgsFunc) appendCall(r0 SearchClientJobArgsFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of SearchClientJobArgsFuncCall objects
// describing the invocations of this function.
func (f *SearchClientJobArgsFunc) History() []SearchClientJobArgsFuncCall {
	f.mutex.Lock()
	history := make([]SearchClientJobArgsFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// SearchClientJobArgsFuncCall is an object that describes an invocation of
// method JobArgs on an instance of MockSearchClient.
type SearchClientJobArgsFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 *run.SearchInputs
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 *job.Args
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c SearchClientJobArgsFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c SearchClientJobArgsFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// SearchClientPlanFunc describes the behavior when the Plan method of the
// parent MockSearchClient instance is invoked.
type SearchClientPlanFunc struct {
	defaultHook func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error)
	hooks       []func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error)
	history     []SearchClientPlanFuncCall
	mutex       sync.Mutex
}

// Plan delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockSearchClient) Plan(v0 context.Context, v1 string, v2 *string, v3 string, v4 search.Protocol, v5 *schema.Settings, v6 bool) (*run.SearchInputs, error) {
	r0, r1 := m.PlanFunc.nextHook()(v0, v1, v2, v3, v4, v5, v6)
	m.PlanFunc.appendCall(SearchClientPlanFuncCall{v0, v1, v2, v3, v4, v5, v6, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the Plan method of the
// parent MockSearchClient instance is invoked and the hook queue is empty.
func (f *SearchClientPlanFunc) SetDefaultHook(hook func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// Plan method of the parent MockSearchClient instance invokes the hook at
// the front of the queue and discards it. After the queue is empty, the
// default hook function is invoked for any future action.
func (f *SearchClientPlanFunc) PushHook(hook func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *SearchClientPlanFunc) SetDefaultReturn(r0 *run.SearchInputs, r1 error) {
	f.SetDefaultHook(func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *SearchClientPlanFunc) PushReturn(r0 *run.SearchInputs, r1 error) {
	f.PushHook(func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error) {
		return r0, r1
	})
}

func (f *SearchClientPlanFunc) nextHook() func(context.Context, string, *string, string, search.Protocol, *schema.Settings, bool) (*run.SearchInputs, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *SearchClientPlanFunc) appendCall(r0 SearchClientPlanFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of SearchClientPlanFuncCall objects describing
// the invocations of this function.
func (f *SearchClientPlanFunc) History() []SearchClientPlanFuncCall {
	f.mutex.Lock()
	history := make([]SearchClientPlanFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// SearchClientPlanFuncCall is an object that describes an invocation of
// method Plan on an instance of MockSearchClient.
type SearchClientPlanFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 string
	// Arg2 is the value of the 3rd argument passed to this method
	// invocation.
	Arg2 *string
	// Arg3 is the value of the 4th argument passed to this method
	// invocation.
	Arg3 string
	// Arg4 is the value of the 5th argument passed to this method
	// invocation.
	Arg4 search.Protocol
	// Arg5 is the value of the 6th argument passed to this method
	// invocation.
	Arg5 *schema.Settings
	// Arg6 is the value of the 7th argument passed to this method
	// invocation.
	Arg6 bool
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 *run.SearchInputs
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c SearchClientPlanFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1, c.Arg2, c.Arg3, c.Arg4, c.Arg5, c.Arg6}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c SearchClientPlanFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}
