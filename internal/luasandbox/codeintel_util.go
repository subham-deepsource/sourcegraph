package luasandbox

import (
	lua "github.com/yuin/gopher-lua"

	"github.com/sourcegraph/sourcegraph/lib/errors"
)

//
// Module definition helpers

// TODO - use in other tests
func createModule(api map[string]lua.LGFunction) lua.LGFunction {
	return func(state *lua.LState) int {
		t := state.NewTable()
		state.SetFuncs(t, api)
		state.Push(t)
		return 1
	}
}

//
// Decoders

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
