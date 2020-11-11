(function() {

const tasks = {
    prime: {
        params: ['number'],
        code: `
            local candidate = ...
            factors = {}
            local current = candidate
            checkValue = function()
                local bound = math.sqrt(current)
                for i = 2, bound do
                    local div = current / i
                    if div == math.floor(div) then
                        table.insert(factors, i)
                        current = div
                        return checkValue()
                    end
                end
                table.insert(factors, current)
            end
            checkValue()
            return factors
        `
    }
};

async function loadRuntime() {
    const module = await Module();
    return {
        createContext: module.cwrap('luajs_createContext', 'number'),
        compileExpression: module.cwrap('luajs_compileExpression', 'number', ['number', 'string']),
        getExpression: module.cwrap('luajs_getExpression', null, ['number', 'number']),
        pushNumber: module.cwrap('luajs_pushNumber', null, ['number', 'number']),
        call: module.cwrap('luajs_call', null, ['number', 'number']),
        resultLen: module.cwrap('luajs_resultLen', 'number', ['number']),
        getResult: module.cwrap('luajs_getResult', 'number', ['number', 'number']),
        finishResult: module.cwrap('luajs_finishResult', null, ['number']),
        runExpressionBoolean: module.cwrap('luajs_runExpressionBoolean', 'boolean', ['number', 'number', 'array', 'number']),
        runExpressionNumber: module.cwrap('luajs_runExpressionNumber', 'number', ['number', 'number', 'array', 'number']),
        runExpressionString: module.cwrap('luajs_runExpressionString', 'string', ['number', 'number', 'array', 'number']),
        runDecodeExpression: module.cwrap('luajs_runDecodeExpression', 'string', ['number', 'number', 'array', 'number']),
        loadScript: module.cwrap('luajs_loadScript', null, ['number', 'string']),
        destroyContext: module.cwrap('luajs_destroyContext', null, ['number']),
    };
}

async function compileExpression(expression) {
    const interface = await runtimeInterface; 
    if (!interface) {
        throw new Error('Runtime was not initialized');
    }

    const L = interface.createContext();
    try {
        interface.loadScript(L, "print(math.floor(32)) print('bar') ");
    } catch (e) {
        console.error(e);
    }
    const expr = interface.compileExpression(L, expression.code);

    return function(...args) {
        interface.getExpression(L, expr);
        expression.params.forEach((param, i) => {
            switch (param) {
                case 'number':
                    interface.pushNumber(L, args[i]);
                    break;
                default:
                    throw new Error('Invalid param type: ' + param);
            }
        });
        interface.call(L, expression.params.length);

        const len = interface.resultLen(L);
        const results = new Array(len);
        for (let i = 0 ; i < len ; i++) {
            results[i] = interface.getResult(L, i);
        }
        interface.finishResult(L);
        return results;
    };
}

window.luaEmscripten = function(task) {
    const config = tasks[task];
    if (config == null) {
        throw new Error(task + ' not implemented for luaEmscripten');
    }

    return compileExpression(config);
}

const runtimeInterface = loadRuntime();

function compileForFengari(expression) {

    const L = fengari.lauxlib.luaL_newstate();
    fengari.lualib.luaL_openlibs(L);

    const expressionName = uniqId();

    const result = fengari.lauxlib.luaL_loadstring(L, fengari.to_luastring(expression.code));
    if (result != fengari.lua.LUA_OK) {
        const msg = fengari.lua.lua_tojsstring(L, -1);
        throw new Error(`lua: ${msg}`);
    }
    fengari.lua.lua_setglobal(L, fengari.to_luastring(expressionName));

    return function(...args) {
        fengari.lua.lua_getglobal(L, fengari.to_luastring(expressionName));

        expression.params.forEach((param, i) => {
            switch (param) {
                case 'number':
                    fengari.lua.lua_pushnumber(L, args[i]);
                    break;
                default:
                    throw new Error('Invalid param type: ' + param);
            }
        });
        fengari.lua.lua_call(L, expression.params.length, 1);

        fengari.lauxlib.luaL_checktype(L,1, fengari.lua.LUA_TTABLE);
        fengari.lua.lua_len(L, -1);
        const len = fengari.lua.lua_tonumber(L, -1);
        fengari.lua.lua_pop(L, 1);
        const results = new Array(len);
        for (let i = 0 ; i < len ; i++) {
            fengari.lauxlib.luaL_checktype(L,1, fengari.lua.LUA_TTABLE);
            fengari.lua.lua_geti(L, -1, i + 1);
            results[i] = fengari.lua.lua_tonumber(L, -1);
            fengari.lua.lua_pop(L, 1);
        }
        fengari.lua.lua_pop(L, 1);
        return results;
    }
}

window.luaFengari = function(task) {
    const config = tasks[task];
    if (config == null) {
        throw new Error(task + ' not implemented for luaEmscripten');
    }

    return compileForFengari(config);
}

function uniqId() {
    return randomSegment() + randomSegment() + randomSegment() + randomSegment();
}

function randomSegment() {
    return Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
}

})();