JS=emscripten-baseline.JS
CFLAGS=
CC=emcc


FLAGS= \
	-s WASM=1 \
	-s DISABLE_EXCEPTION_CATCHING=0 \
	-s MODULARIZE \
	-s EXPORTED_FUNCTIONS="['_factorize', '_getResultsCount', '_getResult']" \
	-s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT=web \
	-s EXPORT_NAME="ModuleBaseline"
	-s FILESYSTEM=0 \
	-s DYNAMIC_EXECUTION=0

$(JS): main.o
	$(CC) $(CFLAGS) $(FLAGS) -o $@ $(LDFLAGS) $^

build: $(JS)

.PHONY: build