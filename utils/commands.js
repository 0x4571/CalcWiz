const { Agent } = require('http')
const database = require('./database.js')

const commands = {
    "show": (uuid, args) => function() {
        let str = ""

        for (let i in args) {   
            let arg = args[i]

            str += `\n**__${arg.toUpperCase()}__**\n`

            const argData = database.returnData(uuid, arg)

            if (argData) {
                Object.entries(argData).forEach(([key, value]) => {
                    str += `${key}: ${value}\n`;
                });
            } else {
                str += "DATA NOT FOUND"
            }
        }

        return str
    }(),
    "set": (uuid, args) => function() {
        const data = args[0]
        const argData = database.returnData(uuid, data) 
        let key = args[1]
        let val = args.splice(2, 3)

        console.log(`${key}, ${val}`)

        if (!argData) return `Error, ${data} does not exist.`
        if (!key || !val) return `Error: key or value not defined.`

        database.setData(uuid, data, key, [val.join(' ')])

        return `Successfully added **${key} = ${val.join(' ')}** to ${data}`
    }()
}

module.exports = function(cmd, uuid, args) {
    if (commands[cmd]) {
        return commands[cmd](uuid, args)
    } else {
        return 'Error: Command not found'
    }
}