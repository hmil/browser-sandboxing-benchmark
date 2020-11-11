include ./env.mk

.PHONY: lua-bindings emscripten-baseline clean

lua-bindings:
	$(MAKE) CC='$(CC)' -C lua-bindings build

emscripten-baseline:
	$(MAKE) -C emscripten-baseline build

clean:
	$(MAKE) -C lua clean
