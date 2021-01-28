const lookaymyscore = require("lookatmyscore")
const osu = require('node-osu');
const apikey = require("./config.json").apikey
const token = require("./config.json").token
const Discord = require("discord.js")

const client = new Discord.Client();
client.login(token);

let commandprefix = "osu!"

const osuApi = new osu.Api(apikey, {
    notFoundAsError: false, // Throw an error on not found instead of returning nothing. (default: true)
    completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
    parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (!message.content.startsWith(commandprefix) || message.author.bot) return;
    const args = message.content.slice(commandprefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const user = message.content.slice(commandprefix.length + command.length + 1);

    switch (command) {
        case("profile"):
            osuApi.apiCall('/get_user', { u: user }).then(users => {
                message.channel.startTyping()
                if (!users[0]) return message.reply("this username does not exist!").then(() => {message.channel.stopTyping()})
                let username = users[0].username;
                username = encodeURIComponent(username.trim())
                message.channel.send(`https://lemmmy.pw/osusig/sig.php?colour=hexff66aa&uname=${username}&pp=1&avatarrounding=4`).then(() => {
                    message.channel.stopTyping()
                })
                
            });
            break
        case("topplay"):
            osuApi.getUserBest({ u: user }).then(async (score) => {
                message.channel.startTyping()
                if (!score[0]) return message.reply("this username does not exist!").then(() => {message.channel.stopTyping()})
                const json = {
                    "mode": 0,
                    "beatmap_id": score[0].beatmapId,
                    "score": {
                      "username": user,
                          "date": score[0].raw_date,
                          "enabled_mods": score[0].raw_mods,
                          "score": score[0].score,
                          "maxcombo": score[0].maxCombo,
                          "rank": score[0].rank,
                          "count50": score[0].counts['50'],
                          "count100": score[0].counts['100'],
                          "count300": score[0].counts['300'],
                          "countmiss": score[0].counts.miss,
                          "countkatu": score[0].counts.katu,
                          "countgeki": score[0].counts.geki,
                          "pp": score[0].pp
                    }
                }
                const res = await lookaymyscore(json);
                message.channel.send(res.image.url).then(() => {
                    message.channel.stopTyping()
                })
            });
            break
        case ("help"):
            message.channel.send({
                embed: {
                    color: "#ff66aa",
                    title: "osu! commands!",
                    thumbnail: {
                        url: client.user.displayAvatarURL(),
                    },
                    fields: [{
                        name: "**Profile:**",
                        value: "Shows a users playercard",
                        },
                        {
                        name: "**Topplay:**",
                        value: "Shows a users top play",
                        },
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: message.author.displayAvatarURL(),
                        text:  message.author.tag
                    }        
                }
            })
            break   
    }
});