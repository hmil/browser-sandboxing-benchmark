FLAGS= \
	-s WASM=1 \
	-s DISABLE_EXCEPTION_CATCHING=0 \
	-s MODULARIZE \
	-s EXPORTED_FUNCTIONS="['_luajs_finishResult', '_luajs_getResult', '_luajs_resultLen', '_luajs_call', '_luajs_getExpression', '_luajs_pushNumber', '_luajs_createContext', '_luajs_compileExpression', '_luajs_runExpressionNumber', '_luajs_runExpressionString', '_luajs_runExpressionBoolean', '_luajs_destroyContext', '_luajs_loadScript', '_luajs_runDecodeExpression']" \
	-s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT=web \
	-s FILESYSTEM=0 \
	-s DYNAMIC_EXECUTION=0

CC=em++ $(FLAGS)
