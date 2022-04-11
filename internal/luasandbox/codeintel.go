package luasandbox

import (
	"context"
	"fmt"
	"os"
	"regexp"

	lua "github.com/yuin/gopher-lua"
	luar "layeh.com/gopher-luar"

	"github.com/sourcegraph/sourcegraph/lib/errors"
)

func Playground() {
	if err := playground(); err != nil {
		panic(err.Error())
	}
}

type autoindexAPI struct{}

type recognizer struct {
	patterns []*pathPattern
	generate *lua.LFunction
	fallback []*recognizer
}

type pathPattern struct {
	pattern string
	exclude []*pathPattern
}

func (api autoindexAPI) Run(ctx context.Context, sandbox *Sandbox, recognizers []*recognizer) error {
	return api.run(ctx, sandbox, recognizers)
}

type subAPI struct {
	registered []string
}

func (api *subAPI) Register(paths []string) {
	api.registered = append(api.registered, paths...)
}

func (api autoindexAPI) run(ctx context.Context, sandbox *Sandbox, recognizers []*recognizer) error {
	var patterns []*pathPattern

	subAPI := &subAPI{}

	var gatherPaths func(recognizer *recognizer) error
	gatherPaths = func(recognizer *recognizer) error {
		if len(recognizer.fallback) != 0 {
			for _, recognizer := range recognizer.fallback {
				if err := gatherPaths(recognizer); err != nil {
					return err
				}
			}

			return nil
		}

		patterns = append(patterns, recognizer.patterns...)
		return nil
	}

	for _, recognizer := range recognizers {
		if err := gatherPaths(recognizer); err != nil {
			return err
		}
	}

	// TODO - evaluate patterns
	paths := []lua.LValue{
		luar.New(sandbox.state, "foo"),
		luar.New(sandbox.state, "bar"),
		luar.New(sandbox.state, "baz"),
	}

	var runGenerate func(recognizer *recognizer) error
	runGenerate = func(recognizer *recognizer) error {
		if len(recognizer.fallback) != 0 {
			for _, recognizer := range recognizer.fallback {
				if err := runGenerate(recognizer); err != nil {
					return err
				}
			}

			return nil
		}

		values, err := sandbox.CallGenerator(ctx, RunOptions{}, recognizer.generate, paths, subAPI)
		if err != nil {
			return err
		}

		fmt.Printf("> %v\n", values)
		return nil
	}

	for _, recognizer := range recognizers {
		if err := runGenerate(recognizer); err != nil {
			return err
		}
	}

	// TODO
	fmt.Printf("DONE, BUT: %v\n", subAPI.registered)
	return nil
}

// 	var paths = []string{"foo", "bar", "baz"} // TODO

// 	for _, recognizer := range recognizers {
// 		if recognizer.generate != nil {
// 			values, err := sandbox.CallGenerator(ctx, RunOptions{}, recognizer.generate, paths)
// 			if err != nil {
// 				return err
// 			}

// 			if len(values) > 0 {
// 				fmt.Printf("> VALUES: %v\n", values)
// 				continue
// 			}
// 		}

// 		for _, recognizer := range recognizer.fallback {
// 			values, err := sandbox.CallGenerator(ctx, RunOptions{}, recognizer.generate, paths)
// 			if err != nil {
// 				return err
// 			}

// 			if len(values) > 0 {
// 				fmt.Printf("> VALUES: %v\n", values)
// 				break
// 			}
// 		}
// 	}

// 	return nil
// }

func (api autoindexAPI) LuaAPI() map[string]lua.LGFunction {
	return map[string]lua.LGFunction{
		"dirname": func(state *lua.LState) int {
			path := state.CheckString(1)
			state.Push(luar.New(state, path)) // TODO
			return 1
		},
		"segmentPattern": func(state *lua.LState) int {
			pattern := state.CheckString(1)
			state.Push(luar.New(state, &pathPattern{pattern: regexp.QuoteMeta(pattern)})) // TODO
			return 1
		},
		"basenamePattern": func(state *lua.LState) int {
			pattern := state.CheckString(1)
			state.Push(luar.New(state, &pathPattern{pattern: regexp.QuoteMeta(pattern)})) // TODO
			return 1
		},
		"extensionPattern": func(state *lua.LState) int {
			pattern := state.CheckString(1)
			state.Push(luar.New(state, &pathPattern{pattern: "(^|/)[^/]+." + regexp.QuoteMeta(pattern)})) // TODO
			return 1
		},
		"exclude": func(state *lua.LState) int {
			value := state.CheckAny(1)
			var patterns []*pathPattern

			table, ok := value.(*lua.LTable)
			if !ok {
				// TODO
				return 2
				// return errors.Newf("wrong type")
			}
			table.ForEach(func(key, value lua.LValue) {
				userData, ok := value.(*lua.LUserData)
				if !ok {
					// TODO
					return
					// return errors.Newf("wrong type")
				}

				pattern, ok := userData.Value.(*pathPattern)
				if !ok {
					// TODO
					return
					// return errors.Newf("wrong type")
				}

				patterns = append(patterns, pattern)
			})

			state.Push(luar.New(state, &pathPattern{exclude: patterns}))
			return 1
		},
		"NewPathRecognizer":     api.NewPathRecognizer,
		"NewFallbackRecognizer": api.NewFallbackRecognizer,
	}
}

func (api autoindexAPI) NewPathRecognizer(state *lua.LState) int {
	var patterns []*pathPattern
	var generate *lua.LFunction

	prototype := state.CheckTable(1)
	prototype.ForEach(func(key, value lua.LValue) {
		switch lua.LVAsString(key) {
		case "patterns":
			tmp, err := decodePathPatterns(value)
			if err != nil {
				// TODO
				return
			}
			patterns = tmp

		case "generate":
			f, ok := value.(*lua.LFunction)
			if !ok {
				// TODO
				return
				// return errors.Newf("wrong type")
			}

			generate = f

		default:
			// TODO - error
		}
	})

	state.Push(luar.New(state, &recognizer{patterns: patterns, generate: generate}))
	return 1
}

func (api autoindexAPI) NewFallbackRecognizer(state *lua.LState) int {
	var recognizers []*recognizer

	prototype := state.CheckTable(1)
	prototype.ForEach(func(_, value lua.LValue) {
		recognizer, err := decodeRecognizer(value)
		if err != nil {
			// TODO
			return
			// return errors.Newf("wrong type")
		}

		recognizers = append(recognizers, recognizer)
	})

	state.Push(luar.New(state, &recognizer{fallback: recognizers}))
	return 1
}

func playground() error {
	autoindexAPI := &autoindexAPI{}

	ctx := context.Background()
	svc := GetService()
	sandbox, err := svc.CreateSandbox(ctx, CreateOptions{
		Modules: map[string]lua.LGFunction{
			"sg.autoindex": createModule(autoindexAPI.LuaAPI()),
		},
	})
	if err != nil {
		return err
	}
	defer sandbox.Close()

	rawRecognizers, err := sandbox.RunScript(ctx, RunOptions{}, codeintelScript)
	if err != nil {
		return err
	}
	recognizers, err := decodeRecognizers(rawRecognizers)
	if err != nil {
		return err
	}

	if err := autoindexAPI.Run(ctx, sandbox, recognizers); err != nil {
		return err
	}

	return nil
}

func decodeRecognizers(value lua.LValue) ([]*recognizer, error) {
	values, err := decodeSlice(value)
	if err != nil {
		return nil, err
	}

	recognizers := make([]*recognizer, 0, len(values))
	for _, value := range values {
		recognizer, err := decodeRecognizer(value)
		if err != nil {
			return nil, err
		}

		recognizers = append(recognizers, recognizer)
	}

	return recognizers, nil
}

func decodePathPatterns(value lua.LValue) ([]*pathPattern, error) {
	values, err := decodeSlice(value)
	if err != nil {
		return nil, err
	}

	patterns := make([]*pathPattern, 0, len(values))
	for _, value := range values {
		pattern, err := decodePathPattern(value)
		if err != nil {
			return nil, err
		}

		patterns = append(patterns, pattern)
	}

	return patterns, nil
}

func decodeSlice(value lua.LValue) (values []lua.LValue, _ error) {
	table, ok := value.(*lua.LTable)
	if !ok {
		return nil, errors.Newf("wrong type")
	}

	table.ForEach(func(_, value lua.LValue) {
		values = append(values, value)
	})
	return values, nil
}

func decodeRecognizer(value lua.LValue) (*recognizer, error) {
	userData, ok := value.(*lua.LUserData)
	if !ok {
		return nil, errors.Newf("wrong type")
	}

	recognizer, ok := userData.Value.(*recognizer)
	if !ok {
		return nil, errors.Newf("wrong type")
	}

	return recognizer, nil
}

func decodePathPattern(value lua.LValue) (*pathPattern, error) {
	userData, ok := value.(*lua.LUserData)
	if !ok {
		return nil, errors.Newf("wrong type")
	}

	pattern, ok := userData.Value.(*pathPattern)
	if !ok {
		return nil, errors.Newf("wrong type")
	}

	return pattern, nil
}

var codeintelScript = func() string {
	contents, err := os.ReadFile("builtins.lua")
	if err != nil {
		panic(err.Error())
	}

	return string(contents)
}()

// TODO - use in other tests
func createModule(api map[string]lua.LGFunction) lua.LGFunction {
	return func(state *lua.LState) int {
		t := state.NewTable()
		state.SetFuncs(t, api)
		state.Push(t)
		return 1
	}
}
