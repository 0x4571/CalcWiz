
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const parser = require('./utils/parser')
const solver = require('./utils/solver');

const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

function parseExpression(expression) {
    return parser(expression)
}

function solveExpression(expression) {
    return solver(expression)
}

function solveMessage(msg) {
    let expressions = msg.content.split('\n')
    let fullMessage = ""    

    for (let i in expressions) {
        if (expressions[i] === "" || expressions[i] === "\$" || expressions[i] === " ") continue

        expressions[i] = expressions[i].replace(/\$/g, '')

        const parsedContent = parseExpression(expressions[i])

        if (typeof parsedContent === 'string') {
            msg.reply(`${parsedContent}`)
            continue
        }

        fullMessage = fullMessage + "**" + parsedContent.join(' ') + " = "

        const solvedContent = solveExpression(parsedContent)

        fullMessage = fullMessage + solvedContent + "**\n"
    }

   msg.reply(`${fullMessage}`)
}

function solveReply(msg) {
    let expressions = msg.content.split('\n')
    let fullMessage = ""    

    for (let i in expressions) {
        if (expressions[i] === "" || expressions[i] === "\$" || expressions[i] === " ") continue

        expressions[i] = expressions[i].replace(/\$/g, '')

        const parsedContent = parseExpression(expressions[i])

        if (typeof parsedContent === 'string') {
            msg.reply(`${parsedContent}`)
            continue
        }

        fullMessage = fullMessage + "**" + parsedContent.join(' ') + " = "

        const solvedContent = solveExpression(parsedContent)

        fullMessage = fullMessage + solvedContent + "**\n"
    } 

   msg.reply(`${fullMessage}`)
}

client.on(Events.MessageCreate, msg => {
    if (msg.content.slice(-1) == '$' && msg.content.slice(0, 1) == '$') solveMessage(msg)

    const fs = require('fs');
    const path = require('path');
    
    if (msg.content.includes("<@1183084705374023780>.UPDATE")) {
        console.log("Updating to latest GitHub commit...");
    
        const scriptPath = path.join(__dirname, 'update_folder.sh');
    
        if (fs.existsSync(scriptPath)) {
            const pm2Process = spawn('pm2', ['start', scriptPath, '--name', 'update_folder']);

            pm2Process.on('close', (code) => {
                console.log(`pm2 process exited with code ${code}`);
            });
        } else {
            console.log("update_folder.sh does not exist. Skipping update...");
        }
    
        return;
    }

    if (msg.reference !== null && msg.content.includes("<@1183084705374023780>")) {
        msg.channel.messages.fetch(msg.reference.messageId)
        .then(message => solveReply(message))
        .catch(console.error);
    } 
});

client.login(token);