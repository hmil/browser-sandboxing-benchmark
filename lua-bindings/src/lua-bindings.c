#include <stdlib.h>
#include <stdio.h>

#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"

// A lot of stuff is this file is dead code from previous experiments.

static int expression_counter = 0;

extern "C" void* luajs_createContext() {
    lua_State *L = luaL_newstate(); /* create state */
    if (L == NULL)
    {
        printf("lua: cannot create state: not enough memory\n");
        return NULL;
    }

    // TODO: Selectively opening like this doesn't work:
    // luaopen_base(L);
    // luaopen_math(L);
    // luaopen_string(L);
    // luaopen_utf8(L);
    luaL_openlibs(L);

    return L;
}

extern "C" int luajs_compileExpression(lua_State *L, const char* expr) {
    char expressionName[32];
    int result = luaL_loadstring(L, expr);
    if (result != LUA_OK) {
        const char *msg = lua_tostring(L, -1);
        printf("lua: %s\n", msg);
        lua_pop(L, 1);
        return NULL;
    }
    snprintf(expressionName, 32, "expr_%d", expression_counter);
    expression_counter++;
    lua_setglobal(L, expressionName);

    return expression_counter - 1;
}

extern "C" void luajs_pushNumber(lua_State *L, int number) {
    lua_pushnumber(L, number);
}

extern "C" void luajs_getExpression(lua_State *L, int exprNumber) {
    char expressionName[32];
    snprintf(expressionName, 32, "expr_%d", exprNumber);
    lua_getglobal(L, expressionName);
}

extern "C" void luajs_call(lua_State *L, int n_params) {
    lua_call(L, n_params, 1);
}

extern "C" const uint8_t* luajs_getArray(lua_State *L) {
    luaL_checktype(L,1, LUA_TTABLE);
    int len = luaL_len(L, 1);
    uint32_t nums[len + 1];
    nums[0] = len;
    for (int i = 0 ; i < len ; i++) {
        lua_geti(L, 1, i);
        nums[i+1] = lua_tonumber(L, 1);
        lua_pop(L, 1);
    }
    lua_pop(L, 1);
    return (uint8_t*)nums;
}

extern "C" int luajs_resultLen(lua_State *L) {
    luaL_checktype(L,1, LUA_TTABLE);
    lua_len(L, -1);
    int len = lua_tonumber(L, -1);
    lua_pop(L, 1);
    return len;
}

extern "C" int luajs_getResult(lua_State *L, int index) {
    luaL_checktype(L,1, LUA_TTABLE);
    lua_geti(L, -1, index + 1);
    int result = lua_tonumber(L, -1);
    lua_pop(L, 1);
    return result;
}

extern "C" void luajs_finishResult(lua_State *L) {
    lua_pop(L, 1);
}

/**
 * A decode expression is an expression which takes a byte array as input and returns a string.
 */
extern "C" const char* luajs_runDecodeExpression(lua_State *L, int exprNumber, const uint8_t* bytes, int n_bytes) {
    char expressionName[32];
    snprintf(expressionName, 32, "expr_%d", exprNumber);

    lua_getglobal(L, expressionName);
    lua_pushlstring(L, (const char*)bytes, n_bytes);
    lua_call(L, 1, 1);
    const char* result = lua_tostring(L, -1);
    lua_pop(L, 1);
    return result;
}

void _luajs_runExpression(lua_State *L, int exprNumber, const uint32_t* params, int n_params) {
    char expressionName[32];
    snprintf(expressionName, 32, "expr_%d", exprNumber);

    lua_getglobal(L, expressionName);
    for (int i = 0 ; i < n_params ; i++) {
        lua_pushnumber(L, params[i]);
    }
    lua_call(L, n_params, 1);
}

extern "C" const char* luajs_runExpressionString(lua_State *L, int exprNumber, const uint32_t* params, int n_params) {
    _luajs_runExpression(L, exprNumber, params, n_params);
    const char* result = lua_tostring(L, -1);
    lua_pop(L, 1);
    return result;
}

extern "C" int luajs_runExpressionNumber(lua_State *L, int exprNumber, const uint32_t* params, int n_params) {
    _luajs_runExpression(L, exprNumber, params, n_params);
    int result = (int)lua_tonumber(L, -1);
    lua_pop(L, 1);
    return result;
}

extern "C" int luajs_runExpressionBoolean(lua_State *L, int exprNumber, const uint32_t* params, int n_params) {
    _luajs_runExpression(L, exprNumber, params, n_params);
    int result = lua_toboolean(L, -1);
    lua_pop(L, 1);
    return result;
}

extern "C" void luajs_destroyContext(lua_State *L) {
    lua_close(L);
}

extern "C" void luajs_loadScript(lua_State *L, const char *script) {
    int result = luaL_dostring(L, script);
    if (result != LUA_OK) {
        const char *msg = lua_tostring(L, -1);
        printf("lua: %s\n", msg);
        lua_pop(L, 1);
    }
}