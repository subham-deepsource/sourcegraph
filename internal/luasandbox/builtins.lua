local sg = require("sg.autoindex")

local rust_recognizer = sg.NewPathRecognizer {
	patterns = {
		sg.basenamePattern("Cargo.toml"),
	},

	generate = function(paths)
        return {
            indexer = "sourcegraph/lsif-rust",
            indexer_args = { "lsif-rust", "index" },
            outfile = "dump.lsif",
            root = "",
            steps = {},
        }
	end,
}

local shared_exclude_paths = {
	sg.segmentPattern("example"),
	sg.segmentPattern("examples"),
	sg.segmentPattern("integration"),
	sg.segmentPattern("test"),
	sg.segmentPattern("testdata"),
	sg.segmentPattern("tests"),
}

local go_exclude_paths = {
	sg.segmentPattern("vendor"),
}
for _, v in ipairs(shared_exclude_paths) do
	table.insert(go_exclude_paths, v)
end

local gomod_recognizer = sg.NewPathRecognizer {
	patterns = {
		sg.basenamePattern("go.mod"),
		sg.exclude(go_exclude_paths),
	},

	generate = function(paths)
        local image = "sourcegraph/lsif-go:latest"

        for i = 1, #paths do
            path = paths[i]
            local root = sg.dirname(path)

            coroutine.yield {
                indexer = image,
                indexer_args = { "lsif-go", "--no-animation" },
                outfile = "",
                root = root,
                steps = {
                    root = root,
                    image = image,
                    commands = { "go mod download" },
                },
            }
        end
	end,
}

local goext_recognizer = sg.NewPathRecognizer {
	patterns = {
		sg.extensionPattern("go"),
		sg.exclude(go_exclude_paths),
	},

	generate = function(paths)
		local image = "sourcegraph/lsif-go:latest"

        for i = 1, #paths do
            path = paths[i]
            local root = sg.dirname(path)

            coroutine.yield {
                indexer = image,
                indexer_args = { "GO111MODULE=off", "lsif-go", "--no-animation" },
                outfile = "",
                root = "",
                steps = {},
            }
        end
	end,
}

local go_recognizer = sg.NewFallbackRecognizer {
	gomod_recognizer,
	goext_recognizer,
}

local java_recognizer = sg.NewPathRecognizer {
	patterns = {
		sg.extensionPattern("java"),
		sg.extensionPattern("scala"),
		sg.extensionPattern("kt"),
	},

	generate = function()
		-- TODO
		print('java')
		return {}
	end,
}

local typescript_exclude_paths = {
	sg.segmentPattern("node_modules"),
}
for _, v in ipairs(shared_exclude_paths) do
	table.insert(typescript_exclude_paths, v)
end

local typescript_image = "sourcegraph/lsif-typescript:autoindex"
local typescript_nmusl_command = "N_NODE_MIRROR=https://unofficial-builds.nodejs.org/download/release n --arch x64-musl auto"



local infer_typescript_job = function(api, path, should_infer_config)
end

local typescript_recognizer = sg.NewPathRecognizer {
	pataterns = {
		sg.basenamePattern("tsconfig.json"),
		sg.exclude(typescript_exclude_paths),
	},

	generate = function(paths)
        for i = 1, #paths do
            path = paths[i]
            coroutine.yield(infer_typescript_job(api, path, true))
        end
	end,
}

local javascript_recognizer = sg.NewPathRecognizer {
	pattern = {
		sg.basenamePattern("package.json"),
		sg.exclude(typescript_exclude_paths),
	},

	generate = function()
		return infer_typescript_job(api, "", false)
	end,
}

local tsjs_recognizer = sg.NewFallbackRecognizer {
	typescript_recognizer,
	javascript_recognizer,
}

return {
	["sg.go"] = go_recognizer,
	["sg.java"] = java_recognizer,
	["sg.rust"] = rust_recognizer,
	["sg.typescript"] = tsjs_recognizer,
}
