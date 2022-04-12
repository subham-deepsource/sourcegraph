package luasandbox

import (
	"context"
	"fmt"
	"regexp"

	lua "github.com/yuin/gopher-lua"
	luar "layeh.com/gopher-luar"
)

type autoindexAPI struct {
	// TODO
}

type recognizer struct {
	patterns []*pathPattern
	generate *lua.LFunction
	fallback []*recognizer
}

type pathPattern struct {
	pattern string
	exclude []*pathPattern
}

//
// Inference queue runner

func (api autoindexAPI) Run(ctx context.Context, sandbox *Sandbox, recognizers []*recognizer) error {
	return api.run(ctx, sandbox, recognizers)
}

func (api autoindexAPI) run(ctx context.Context, sandbox *Sandbox, recognizers []*recognizer) error {
	fmt.Printf("! %v\n", recognizers)
	if len(recognizers) == 0 {
		return nil
	}

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

	// TODO
	contentByPaths := map[string]string{}

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

		values, err := sandbox.CallGenerator(ctx, RunOptions{}, recognizer.generate, paths, subAPI, contentByPaths)
		if err != nil {
			return err
		}

		for _, value := range values {
			fmt.Printf("> `%v`\n", value)
		}

		return nil
	}

	for _, recognizer := range recognizers {
		if err := runGenerate(recognizer); err != nil {
			return err
		}
	}

	return api.run(ctx, sandbox, subAPI.recognizers)
}

//
// Recognizer constructors

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

//
// Lua API definition

func (api autoindexAPI) LuaAPI() map[string]lua.LGFunction {
	return map[string]lua.LGFunction{
		"dirname": func(state *lua.LState) int {
			path := state.CheckString(1)
			state.Push(luar.New(state, path)) // TODO
			return 1
		},
		"ancestors": func(state *lua.LState) int {
			path := state.CheckString(1)
			state.Push(luar.New(state, []string{path})) // TODO
			return 1
		},
		"literalPatern": func(state *lua.LState) int {
			pattern := state.CheckString(1)
			state.Push(luar.New(state, &pathPattern{pattern: regexp.QuoteMeta(pattern)})) // TODO
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
			patterns, err := decodePathPatterns(value)
			if err != nil {
				// TODO
				return 2
				// return errors.Newf("wrong type")
			}

			state.Push(luar.New(state, &pathPattern{exclude: patterns}))
			return 1
		},
		"NewPathRecognizer":     api.NewPathRecognizer,
		"NewFallbackRecognizer": api.NewFallbackRecognizer,
	}
}

//
// Stub API

type subAPI struct {
	recognizers []*recognizer
}

func (api *subAPI) Callback(recognizer *recognizer) {
	fmt.Printf("CB: %v\n", recognizer)
	api.recognizers = append(api.recognizers, recognizer)
}
