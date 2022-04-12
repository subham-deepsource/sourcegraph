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

	generate = function(paths, api)
        api:callback(sg.NewPathRecognizer {
            patterns = {
                sg.literalPatern("lsif-java.json"),
            },

            generate = function(paths)
                return {
                    indexer = "sourcegraph/lsif-java",
                    indexer_args = { "lsif-java index --build-tool=lsif" },
                    outfile = "dump.lsif",
                    root = "",
                    steps = {},
                }
            end
        })
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
    local root = sg.dirname(path)
    local ancestor_dirs = sg.ancestors(root)

    api:callback(sg.NewPathRecognizer {
        patterns = {
            sg.basenamePattern("yarn.lock"),
            sg.basenamePattern("package.json"),
            sg.basenamePattern(".nvmrc"),
            sg.basenamePattern(".node-version"),
            sg.basenamePattern(".n-node-version"),
        },

        patterns_for_content = {
            sg.basenamePattern("learna.json"),
        },

        generate = function(paths, api, content_by_path)
            print(paths)

            api:callback(sg.NewPathRecognizer{
                generate = function(paths, api)
                    api:callback(sg.NewPathRecognizer{
                        generate = function(paths, api)
                            api:callback(sg.NewPathRecognizer{
                                generate = function(paths, api)
                                    api:callback(sg.NewPathRecognizer{
                                        generate = function(paths, api)
                                            print("foo 123")
                                        end,
                                    })
                                end,
                            })
                        end,
                    })
                end,
            })

            -- for k, v in pairs(content_by_path) do
            --     print(k, v)
            -- end
        end,
    })
end

local typescript_recognizer = sg.NewPathRecognizer {
	pataterns = {
		sg.basenamePattern("tsconfig.json"),
		sg.exclude(typescript_exclude_paths),
	},

	generate = function(paths, api)
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

	generate = function(path, api)
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
