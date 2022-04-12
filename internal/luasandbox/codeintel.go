package luasandbox

import (
	"context"
	"os"

	lua "github.com/yuin/gopher-lua"
)

func Playground() {
	if err := playground(); err != nil {
		panic(err.Error())
	}
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

var codeintelScript = func() string {
	contents, err := os.ReadFile("builtins.lua")
	if err != nil {
		panic(err.Error())
	}

	return string(contents)
}()
