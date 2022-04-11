// Code generated by go-mockgen 1.1.5; DO NOT EDIT.

package job

import (
	"context"
	"sync"

	database "github.com/sourcegraph/sourcegraph/internal/database"
	search "github.com/sourcegraph/sourcegraph/internal/search"
	streaming "github.com/sourcegraph/sourcegraph/internal/search/streaming"
)

// MockJob is a mock implementation of the Job interface (from the package
// github.com/sourcegraph/sourcegraph/internal/search/job) used for unit
// testing.
type MockJob struct {
	// NameFunc is an instance of a mock function object controlling the
	// behavior of the method Name.
	NameFunc *JobNameFunc
	// RunFunc is an instance of a mock function object controlling the
	// behavior of the method Run.
	RunFunc *JobRunFunc
}

// NewMockJob creates a new mock of the Job interface. All methods return
// zero values for all results, unless overwritten.
func NewMockJob() *MockJob {
	return &MockJob{
		NameFunc: &JobNameFunc{
			defaultHook: func() string {
				return ""
			},
		},
		RunFunc: &JobRunFunc{
			defaultHook: func(context.Context, database.DB, streaming.Sender) (*search.Alert, error) {
				return nil, nil
			},
		},
	}
}

// NewStrictMockJob creates a new mock of the Job interface. All methods
// panic on invocation, unless overwritten.
func NewStrictMockJob() *MockJob {
	return &MockJob{
		NameFunc: &JobNameFunc{
			defaultHook: func() string {
				panic("unexpected invocation of MockJob.Name")
			},
		},
		RunFunc: &JobRunFunc{
			defaultHook: func(context.Context, database.DB, streaming.Sender) (*search.Alert, error) {
				panic("unexpected invocation of MockJob.Run")
			},
		},
	}
}

// NewMockJobFrom creates a new mock of the MockJob interface. All methods
// delegate to the given implementation, unless overwritten.
func NewMockJobFrom(i Job) *MockJob {
	return &MockJob{
		NameFunc: &JobNameFunc{
			defaultHook: i.Name,
		},
		RunFunc: &JobRunFunc{
			defaultHook: i.Run,
		},
	}
}

// JobNameFunc describes the behavior when the Name method of the parent
// MockJob instance is invoked.
type JobNameFunc struct {
	defaultHook func() string
	hooks       []func() string
	history     []JobNameFuncCall
	mutex       sync.Mutex
}

// Name delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockJob) Name() string {
	r0 := m.NameFunc.nextHook()()
	m.NameFunc.appendCall(JobNameFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the Name method of the
// parent MockJob instance is invoked and the hook queue is empty.
func (f *JobNameFunc) SetDefaultHook(hook func() string) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// Name method of the parent MockJob instance invokes the hook at the front
// of the queue and discards it. After the queue is empty, the default hook
// function is invoked for any future action.
func (f *JobNameFunc) PushHook(hook func() string) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *JobNameFunc) SetDefaultReturn(r0 string) {
	f.SetDefaultHook(func() string {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *JobNameFunc) PushReturn(r0 string) {
	f.PushHook(func() string {
		return r0
	})
}

func (f *JobNameFunc) nextHook() func() string {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *JobNameFunc) appendCall(r0 JobNameFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of JobNameFuncCall objects describing the
// invocations of this function.
func (f *JobNameFunc) History() []JobNameFuncCall {
	f.mutex.Lock()
	history := make([]JobNameFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// JobNameFuncCall is an object that describes an invocation of method Name
// on an instance of MockJob.
type JobNameFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 string
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c JobNameFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c JobNameFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// JobRunFunc describes the behavior when the Run method of the parent
// MockJob instance is invoked.
type JobRunFunc struct {
	defaultHook func(context.Context, database.DB, streaming.Sender) (*search.Alert, error)
	hooks       []func(context.Context, database.DB, streaming.Sender) (*search.Alert, error)
	history     []JobRunFuncCall
	mutex       sync.Mutex
}

// Run delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockJob) Run(v0 context.Context, v1 database.DB, v2 streaming.Sender) (*search.Alert, error) {
	r0, r1 := m.RunFunc.nextHook()(v0, v1, v2)
	m.RunFunc.appendCall(JobRunFuncCall{v0, v1, v2, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the Run method of the
// parent MockJob instance is invoked and the hook queue is empty.
func (f *JobRunFunc) SetDefaultHook(hook func(context.Context, database.DB, streaming.Sender) (*search.Alert, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// Run method of the parent MockJob instance invokes the hook at the front
// of the queue and discards it. After the queue is empty, the default hook
// function is invoked for any future action.
func (f *JobRunFunc) PushHook(hook func(context.Context, database.DB, streaming.Sender) (*search.Alert, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *JobRunFunc) SetDefaultReturn(r0 *search.Alert, r1 error) {
	f.SetDefaultHook(func(context.Context, database.DB, streaming.Sender) (*search.Alert, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *JobRunFunc) PushReturn(r0 *search.Alert, r1 error) {
	f.PushHook(func(context.Context, database.DB, streaming.Sender) (*search.Alert, error) {
		return r0, r1
	})
}

func (f *JobRunFunc) nextHook() func(context.Context, database.DB, streaming.Sender) (*search.Alert, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *JobRunFunc) appendCall(r0 JobRunFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of JobRunFuncCall objects describing the
// invocations of this function.
func (f *JobRunFunc) History() []JobRunFuncCall {
	f.mutex.Lock()
	history := make([]JobRunFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// JobRunFuncCall is an object that describes an invocation of method Run on
// an instance of MockJob.
type JobRunFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 database.DB
	// Arg2 is the value of the 3rd argument passed to this method
	// invocation.
	Arg2 streaming.Sender
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 *search.Alert
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c JobRunFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1, c.Arg2}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c JobRunFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}
