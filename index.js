const fs = require('fs');
const path = require('path');

const { Client, Events, GatewayIntentBits, Collection, PartialTextBasedChannel } = require('discord.js');
const { token } = require('./config.json');

const parser = require('./utils/parser')
const solver = require('./utils/solver')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, msg => {
    if (msg.content.slice(-1) !== '$' || msg.content.slice(0, 1) !== '$') return

    let content = msg.content.slice(1, -1)

    const parsedContent = parser(content)

    if (typeof parsedContent === 'string') {
        msg.reply(`${parsedContent}`)
        return
    }

    const solvedContent = solver(parsedContent)

    msg.reply(`${solvedContent}`)
});

client.login(token);