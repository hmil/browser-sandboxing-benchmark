include ../lua/src/Makefile

CFLAGS +=-I$(CURDIR)/../lua/src
LUA_JS=lua-bindings.js
BINDING_O=src/lua-bindings.o

$(LUA_JS): $(patsubst %.o,../lua/src/%.o,$(BASE_O)) $(BINDING_O)
	$(CC) -o $@ $(LDFLAGS) $^

build: $(LUA_JS)

.PHONY: build
