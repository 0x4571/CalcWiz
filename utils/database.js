const path = require("path");
const fs = require("fs");
const { json } = require("stream/consumers");

const dataPath = path.join(__dirname, "../data.json")

const defaultData = {
    "variables": {"testFunc": "2*x+2"},
    "settings": {
        "orderMode": "PEMDAS", 
        "functions": ["sin", "cos", "tan", "e", "pi", "π", "sqrt", "√", "log", "ln", "!", "cot", "sec", "csc", "asin", "acos", "atan", "acot", "asec",
            "acsc", "sinh", "cosh", "tanh", "coth", "sech", "csch"],
        "angle": "RAD",
    }
}

module.exports = {
    returnData(uuid, data) {
        let newData = JSON.parse(fs.readFileSync(dataPath))

        if (!newData[uuid]) {
            newData[uuid] = defaultData
            fs.writeFileSync(dataPath, JSON.stringify(newData))
        }

        return newData[uuid][data]
    },

    setData(uuid, data, key, value) {
        let newData = JSON.parse(fs.readFileSync(dataPath))

        if (!newData[uuid]) {
            newData[uuid] = defaultData
            return
        }

        if (value == "TURN_NULL") {
            fs.writeFileSync(dataPath, JSON.stringify(newData)) 
            delete newData[uuid][data][key]
            return
        }
        
        newData[uuid][data][key] = value

        fs.writeFileSync(dataPath, JSON.stringify(newData))
    },
}