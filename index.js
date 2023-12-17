
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const parser = require('./utils/parser')
const commands = require('./utils/commands')
const solver = require('./utils/solver');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

function parseExpression(uuid, expression) {
    return parser(uuid, expression)
}

function solveExpression(uuid, expression) {
    return solver(uuid, expression)
}

function solveMessage(msg, content) {
    let expressions = content.split('\n')
    let fullMessage = ""   

    for (let i in expressions) {
        if (expressions[i] === "" || expressions[i] === "\$" || expressions[i] === " ") continue

        expressions[i] = expressions[i].replace(/\$/g, '')

        const parsedContent = parseExpression(msg.author.id, expressions[i])

        if (typeof parsedContent === 'string') {
            msg.reply(`${parsedContent}`)
            continue
        }

        fullMessage = fullMessage + "**" + parsedContent.join(' ') + " = "

        const solvedContent = solveExpression(msg.author.id, parsedContent)

        fullMessage = fullMessage + solvedContent + "**\n"
    }

    if (fullMessage.trim() === '') {
        return
    }

   msg.reply(`${fullMessage}`)
}

function solveReply(msg) {
    let expressions = msg.content.split('\n')
    let fullMessage = ""    

    for (let i in expressions) {
        if (expressions[i] === "" || expressions[i] === "\$" || expressions[i] === " ") continue

        expressions[i] = expressions[i].replace(/\$/g, '')

        const parsedContent = parseExpression(msg.author.id, expressions[i])

        if (typeof parsedContent === 'string') {
            msg.reply(`${parsedContent}`)
            continue
        }

        fullMessage = fullMessage + "**" + parsedContent.join(' ') + " = "

        const solvedContent = solveExpression(msg.author.id, parsedContent)

        fullMessage = fullMessage + solvedContent + "**\n"
    } 

    if (fullMessage.trim() === '') {
        return
    }

   msg.reply(`${fullMessage}`)
}

function execCommand(msg) {
    msg.content = msg.content.replace('<@1183084705374023780> ', '')
    let args = msg.content.split(' ') 
    const command = args[0]
    args.shift()

    const response = commands(command, msg.author.id, args)

    msg.reply(`${response}`)
    console.log(response)    
}

client.on(Events.MessageCreate, msg => {    

    if (msg.content.match(/\$(.*?)\$/)) solveMessage(msg, msg.content.match(/\$(.*?)\$/)[1])
    else if (msg.reference !== null && msg.content.includes("<@1183084705374023780>")) {
        msg.channel.messages.fetch(msg.reference.messageId)
        .then(message => solveReply(message))
        .catch(console.error);
    } 
    else if ((msg.content.includes("<@1183084705374023780>") || msg.users && msg.users["1183084705374023780"]) && msg.content.split(' ').length > 1) execCommand(msg)  
});

client.login(token);