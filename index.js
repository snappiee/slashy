var version = "1.8.62";
// Version 1.8.62
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const chalk = require("chalk");
const config = process.env.JSON ? JSON.parse(process.env.JSON) : require("./config.json");
const {
  Webhook,
  MessageBuilder
} = require("discord-webhook-node");
const hook = new Webhook(config.webhook);
axios.get("https://raw.githubusercontent.com/TahaGorme/slashy/main/index.js").then(function(response) {
  var d = response.data;
  let v = d.match(/Version ([0-9]*\.?)+/)[0]?.replace("Version ", "");
  if (v) {
    console.log(chalk.bold("Version " + version));
    if (v !== version) {
      console.log(chalk.bold.bgRed("There is a new version available: " + v + "           \nPlease update. " + chalk.underline("https://github.com/TahaGorme/slashy")));
    }
  }
}).catch(function(error) {
  console.log(error);
});
process.on("unhandledRejection", (reason, p) => {
  const ignoreErrors = ["MESSAGE_ID_NOT_FOUND", "INTERACTION_TIMEOUT", "BUTTON_NOT_FOUND", ];
  if (ignoreErrors.includes(reason.code || reason.message)) return;
  console.log(" [Anti Crash] >>  Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (e, o) => {
  console.log(" [Anti Crash] >>  Uncaught Exception/Catch");
  console.log(e, o);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [AntiCrash] >>  Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [AntiCrash] >>  Multiple Resolves");
  console.log(type, promise, reason);
});
const fs = require("fs-extra");
const botid = "270904126974590976";
var bank = 0;
var wallet = 0;
var net = 0;
// const config = require("./config.json");
// INFO: Load batch token file if enabled
if (config.isBatchTokenFile) {
  let data = process.env.TOKENS;
  if (!data) data = fs.readFileSync("./batch_token.cfg", "utf-8");
  config.tokens = data.split("\n").reduce((previousTokens, line) => {
    let [channelId, token] = line.replace("\r", "").split(" ");
    return [...previousTokens, {
      channelId,
      token
    }];
  }, []);
}
var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.enable("trust proxy");
app.use(cors());
// set the view engine to ejs
app.get("/", async (req, res) => {
  res.render(path.resolve("./static"), {
    //   "progressValue": pr
  });
});
app.get("/api", async (req, res) => {
  res.json({
    bank: bank,
    wallet: wallet,
    net: net,
  });
});
app.listen(7500);
console.log(chalk.bold.red("Server started on " + chalk.underline("http://localhost:7500")));
const {
  Client
} = require("discord.js-selfbot-v13");
const {
  randomInt
} = require("crypto");
const client1 = new Client({
  checkUpdate: false,
  readyStatus: false
});
client1.on("ready", async () => {
  console.log(chalk.bold.magenta(`Logged in to Main Account as ${client1.user.tag}!`));
  client1.user.setStatus("invisible");
  hook.send(new MessageBuilder().setTitle("Started Slashy").setURL("https://github.com/TahaGorme/Slashy").setDescription("Started grinding on " + config.tokens.length + " accounts.").setColor("#2e3236")
    //.setTimestamp()
  );
  // autoBuyLife(channel1);
});
client1.on("messageCreate", async (message) => {
  // INFO: Pending Confirmation
  if (message.embeds[0]?.title?.includes("Pending Confirmation") && message.interaction?.user == client1.user) {
    highLowRandom(message, 1);
  }
});
client1.login(config.mainAccount);
start();
async function start() {
  for (var i = 0; i < config.tokens.length; i++) {
    await doEverything(config.tokens[i].token, Client, client1, config.tokens[i].channelId);
  }
}
async function doEverything(token, Client, client1, channelId) {
  var isServerPoolEmpty = false;
  var isInventoryEmpty = false;
  var channel;
  var acc_bal = 0;
  var acc_bank = 0;
  var isBotFree = true;
  var ongoingCmd = false;
  const client = new Client({
    checkUpdate: false,
    readyStatus: false
  });
  var commandsUsed = [];
  var ongoingCommand = false;
  async function findAnswer(question) {
    const file = config.useDarkendTrivia ? "./darkend-trivia.json" : "./trivia.json";
    const trivia = await fs.readJson(file);
    if (config.useDarkendTrivia) {
      return trivia[question];
    } else {
      for (let i = 0; i < trivia.database.length; i++) {
        if (trivia.database[i].question.includes(question)) {
          return trivia.database[i].correct_answer;
        }
      }
    }
  }
  client.on("ready", async () => {
    client.user.setStatus("invisible");
    // 		console.log(
    // 			chalk.yellow(
    // 				figlet.textSync("Slashy", { horizontalLayout: "full" })
    // 			)
    // 		);
    console.log(chalk.green(`Logged in as ${chalk.cyanBright(client.user.tag)}`));
    channel = client.channels.cache.get(channelId);
    if (!channel) return console.log(chalk.red("Channel not found! " + channelId));
    // console.log(chalk.magenta("Playing Dank Memer in " + channel.name));
    // !config["dontLogUselessThings"] &&
    // hook.send("Started. Playing Dank Memer in <#" + channel.id + ">");
    if (config.transferOnlyMode || config.serverEventsDonateMode) {
      console.log(chalk.red("Transfer Only Mode or Server Events Donate is enabled."));
      inv(botid, channel);
      return;
    }
    await channel.sendSlash(botid, "use", "apple");
    await channel.sendSlash(botid, "daily");
    setTimeout(async () => {
      if (config.autoBuyItems.includes("Life Saver")) await channel.sendSlash(botid, "item", "Life Saver");
    }, randomInteger(1000, 3000));
    main(channel);
    config.autoUse.forEach((item) => {
      setTimeout(async () => {
        await channel.sendSlash(botid, "use", item);
      }, randomInteger(3000, 6000));
    });
  });
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (newMessage.interaction?.user !== client.user) return;
    if (newMessage.author?.id !== botid || newMessage.channel.id != channelId) return;
    playMiniGames(newMessage, true);
    playFGame(newMessage, channelId);
    // INFO: Caught :
    let isCaught = newMessage.embeds[0]?.description?.match(/(Dragon|Kraken|Legendary Fish), nice (shot|catch)!/); //null or Array eg. ["Dragon, nice shot!","Dragon","shot"] => [whole match,group1,group2]
    if (isCaught) {
      let [_, item, action] = isCaught; //yeah dragon, fish and kraken are item in dank memer
      // action : shot or catch
      hook.send(new MessageBuilder().setTitle("Minigame Boss: " + item).setURL(newMessage.url).setDescription(client.user.username + " just caught a **" + item + "**!").setColor("#2e3236").setTimestamp());
    }
    // INFO: confirm donate
    if (newMessage.embeds[0]?.title?.includes("Action Confirmed") && newMessage.embeds[0].description?.includes("Are you sure you want to donate your items?") && newMessage.interaction?.user == client.user) {
      setTimeout(async () => {
        if (isInventoryEmpty) {
          if (isServerPoolEmpty) return;
          if (config.serverEventsDonatePayout) await newMessage.channel.sendSlash(botid, "serverevents pool");
        } else {
          await newMessage.channel.sendSlash(botid, "inventory");
        }
      }, randomInteger(config.cooldowns.serverEvents.minDelay, config.cooldowns.serverEvents.maxDelay));
    }
    // INFO: when posted memes is dead meme ( /postmemes )
    if (newMessage.embeds[0]?.description?.includes("dead meme")) {
      commandsUsed.push("postmemes");
      setTimeout(() => {
        removeAllInstances(commandsUsed, "postmemes");
      }, 5.01 * 1000 * 60);
    }
  });
  client.on("messageCreate", async (message) => {
    if (!message?.embeds[0]?.description?.includes("986396363707281468") && config.autoBuyItems.includes("Lucky Horseshoe") && randomInteger(1, 5) == 2) {
      if (message?.embeds[0]?.description?.includes("You cast out your line and brought back") || message?.embeds[0]?.description?.includes("You went hunting and brought back") || message?.embeds[0]?.description?.includes("You dig in the dirt and brought")) {
        if (acc_bal >= 75000) {
          await channel.sendSlash(botid, "shop buy", "Lucky Horseshoe");
          !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Lucky Horseshoe! ").setColor("#2e3236"));
        } else if (acc_bank >= 75000 && acc_bal < 75000) {
          await channel.sendSlash(botid, "withdraw", "75000");
          setTimeout(async () => {
            await channel.sendSlash(botid, "shop buy", "Lucky Horseshoe");
            !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Lucky Horseshoe! ").setColor("#2e3236"));
          }, randomInteger(2000, 2500));
        }
        setTimeout(async () => {
          await channel.sendSlash(botid, "use", "Lucky Horseshoe");
          !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Used a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully used a Lucky Horseshoe! ").setColor("#2e3236"));
        }, randomInteger(6000, 8000));
      }
    }
    // You don't own a single Lucky Horseshoe, therefore cannot use it.
    if (!message?.guild && message?.author?.id == botid && config.autoUse.includes("Lucky Horseshoe") && message?.embeds[0]?.description?.includes("Lucky Horseshoe expired!")) {
      await channel.sendSlash(botid, "use", "Lucky Horseshoe");
      !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Used Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully used a Lucky Horseshoe! ").setColor("#2e3236"));
    }
    if (!message?.guild && message?.author?.id == botid && config.autoUse.includes("Apple") && message?.embeds[0]?.description?.includes("Apple expired!")) {
      await channel.sendSlash(botid, "use", "Apple");
      if (message?.embeds[0]?.description?.includes("You can run this command in")) {
        setTimeout(async () => {
          await channel.sendSlash(botid, "use", "apple");
        }, randomInteger(3000, 7000));
      }!config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Used Apple").setURL(message.url).setDescription(client.user.username + ": Succesfully used an Apple! ").setColor("#2e3236"));
    }
    if (!message?.guild && message?.author?.id == botid && config.autoUse.includes("Pizza") && message?.embeds[0]?.description?.includes("Pizza expired!")) {
      await channel.sendSlash(botid, "use", "Pizza");
      !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Used Pizza").setURL(message.url).setDescription(client.user.username + ": Succesfully used a Pizza! ").setColor("#2e3236"));
    }
    // Your lifesaver protected you!
    if (!message?.guild && message?.author?.id == botid && message?.embeds[0]?.title?.includes("Your lifesaver protected you") && config.autoBuyItems.includes("Life Saver")) {
      // await channel.sendSlash(botid, "use", "Apple");
      if (acc_bal >= 100000) {
        await channel.sendSlash(botid, "shop buy", "Life Saver");
        !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Life Saver").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Life Saver! ").setColor("#2e3236"));
      } else if (acc_bank >= 100000 && acc_bal < 100000) {
        await channel.sendSlash(botid, "withdraw", "100000");
        setTimeout(async () => {
          await channel.sendSlash(botid, "shop buy", "Life Saver");
          !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Life Saver").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Life Saver! ").setColor("#2e3236"));
        }, randomInteger(2000, 2500));
      }
    }
    if (message.interaction?.user == client.user && message?.embeds[0]?.description?.includes("You don't own a single Lucky Horseshoe, therefore cannot use it.") && config.autoBuyItems.includes("Lucky Horseshoe") && config.autoUse.includes("Lucky Horseshoe")) {
      if (acc_bal >= 75000) {
        await channel.sendSlash(botid, "shop buy", "Lucky Horseshoe");
        !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Lucky Horseshoe! ").setColor("#2e3236"));
      } else if (acc_bank >= 75000 && acc_bal < 75000) {
        await channel.sendSlash(botid, "withdraw", "75000");
        setTimeout(async () => {
          await channel.sendSlash(botid, "shop buy", "Lucky Horseshoe");
          !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully bought a Lucky Horseshoe! ").setColor("#2e3236"));
          setTimeout(async () => {
            await channel.sendSlash(botid, "use", "Lucky Horseshoe");
            !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Used a Lucky Horseshoe").setURL(message.url).setDescription(client.user.username + ": Succesfully used a Lucky Horseshoe! ").setColor("#2e3236"));
          }, randomInteger(3000, 5000));
        }, randomInteger(2000, 2500));
      }
    }
    // INFO: read alerts
    if (message.embeds[0]?.title?.includes("You have an unread alert!") && message.content?.includes(client.user.id)) {
      await channel.sendSlash(botid, "alert");
    }
    playFGame(message, channelId);
    // playFGame(message,channel.id);
    // INFO: when /serverevents payout used and "Only event managers can payout from the server's pool!" is displayed
    // TODO: move to dedicated function
    if (message.interaction?.user == client.user && message?.embeds[0]?.description?.includes("To start your streaming journey, you need following")) {
      // console.log(acc_bal)
      // console.log(acc_bank)
      if (Number(acc_bal) >= 200000) {
        await message.channel.sendSlash(botid, "shop buy", "Mouse", "1");
        setTimeout(async () => {
          await message.channel.sendSlash(botid, "shop buy", "Keyboard", "1");
        }, randomInteger(2000, 4000));
      } else if (Number(acc_bal) < 200000 && Number(acc_bank) >= 200000) {
        await message.channel.sendSlash(botid, "withdraw", "200k");
        setTimeout(async () => {
          await message.channel.sendSlash(botid, "shop buy", "Mouse", "1");
        }, randomInteger(2000, 4000));
        setTimeout(async () => {
          await message.channel.sendSlash(botid, "shop buy", "Keyboard", "1");
        }, randomInteger(2000, 4000));
      }
    }
    if (message.embeds[0]?.description?.includes("from the server's pool!")) {
      if (isServerPoolEmpty) {
        inv(botid, channel);
      } else {
        setTimeout(async () => {
          // await message.channel.sendSlash(botid, "inventory")
          if (config.serverEventsDonatePayout) await channel.sendSlash(botid, "serverevents pool");
        }, randomInteger(config.cooldowns.serverEvents.minDelay, config.cooldowns.serverEvents.maxDelay));
      }
    }
    if (message.interaction?.user !== client.user || message.author.id !== botid || !channel) return;
    // autoBuyItem(message, client, acc_bal, acc_bank);
    autoToolBuyer(message, client, acc_bal, acc_bank);
    autoBuyLife(message, client, acc_bal, acc_bank);
    // autoUseHorse(message, client);
    if (message.author.id !== botid || message.channel.id !== channel.id) return;
    // }
    playMiniGames(message);
    playFGame(message, channel.id);
    if (message?.flags?.has("EPHEMERAL") && message?.embeds[0]?.description?.includes("You have an ongoing command running.")) {
      ongoingCmd = true;
      isBotFree = false;
      setTimeout(async () => {
        isBotFree = true;
        ongoingCmd = false;
      }, randomInteger(config.cooldowns.commandInterval.minDelay * 3.5, config.cooldowns.commandInterval.maxDelay * 5.5));
    }
    if (commandsUsed.includes("postmemes") && message.embeds[0]?.description?.includes("Pick a meme type and a platform to post a meme on!")) {
      postMeme(message);
    }
    // INFO: when inventory is empty
    // TODO: move to dedicated function
    if (message.embeds[0]?.description?.includes("Yikes, you have nothing")) {
      isInventoryEmpty = true;
      if (config.serverEventsDonateMode) {
        setTimeout(async () => {
          // await message.channel.sendSlash(botid, "inventory")
          if (!(isInventoryEmpty && isServerPoolEmpty)) {
            if (config.serverEventsDonatePayout) await message.channel.sendSlash(botid, "serverevents pool");
          }
        }, randomInteger(config.cooldowns.serverEvents.minDelay, config.cooldowns.serverEvents.maxDelay));
      }
      if (config.serverEventsDonateMode || config.transferOnlyMode) {
        if (isInventoryEmpty && isServerPoolEmpty) {
          console.log(chalk.green(client.user.tag + " - All items transferred :D"));
          return;
        }
        // return;
      }
    }
    if (message.embeds[0]?.author?.name.includes(client.user.username + "'s Scratch-Off")) {
      // await new Promise(resolve => setTimeout(resolve, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay)));
      await clickRandomButtonScratch(message, 4, false)
      await clickRandomButtonScratch(message, 4, false)
      await clickRandomButtonScratch(message, 4, false)
    }
    // INFO: when current account inventory is displayed
    if (message.embeds[0]?.author?.name.includes(client.user.username + "'s inventory")) {
      handleInventoryCommand(client, token, channel, message);
    }
    // INFO: when /serverevents pool and event items are shown
    // TODO: move to dedicated function
    if (message.embeds[0]?.title?.includes("Server Pool") && config.serverEventsDonateMode) {
      setTimeout(async () => {
        if (!message.embeds[0].description.includes("> ")) {
          isServerPoolEmpty = true;
          inv(botid, channel);
          return;
        }
        var name = message.embeds[0].description.split("\n")[7].split("> ")[1];
        var quantity = message.embeds[0].description.split("\n")[7].split("x`")[0].split("`")[1];
        console.log(name + ": " + quantity);
        if (!name) return;
        if (!quantity) return;
        var main_accId = client1.user.id;
        isServerPoolEmpty = false;
        await message.channel.sendSlash(botid, "serverevents payout", main_accId, quantity, name);
      }, randomInteger(config.cooldowns.serverEvents.minDelay, config.cooldowns.serverEvents.maxDelay));
    }
    // INFO: Register captcha
    handleCaptcha(message);
    // INFO: Return if transferOnlyMode is enabled
    if (config.transferOnlyMode) return;
    if (message.embeds[0]?.title === "Pending Confirmation" && message.interaction?.user == client.user) {
      highLowRandom(message, 1);
    }
    // INFO: When receive response of /balance command
    if (message.embeds[0]?.title?.includes(client.user.tag + "'s Balance")) {
      wallet = message.embeds[0].description.split("\n")[0].replace("**Wallet**: ", "");
      acc_bal = Number(wallet.replace("⏣ ", "").replace(/,/g, ''));
      bank = message.embeds[0].description.split("\n")[1].replace("**Bank**: ", "");
      acc_bank = Number(bank.replace("⏣ ", "").replace(/,/g, '').replace(" ", "").split("/")[0]);
      net = message.embeds[0].description.split("\n")[6].replace("**Total Net**: ", "");
    }
    // INFO: Handle Search Command
    if (commandsUsed.includes("search") && message.embeds[0]?.description?.includes("Where do you want to search?")) {
      handleSearch(message);
    }
    // INFO: Handle Crime Command
    if (commandsUsed.includes("crime") && message.embeds[0]?.description?.includes("What crime do you want to commit?")) {
      clickRandomButton(message, 0);
    }
    // INFO: Handle Trivia Command
    if (commandsUsed.includes("trivia") && message.embeds[0]?.description?.includes(" seconds to answer*")) {
      var time = message.embeds[0].description;
      var question = message.embeds[0].description.replace(/\*/g, "").split("\n")[0].split('"')[0];
      let answer = await findAnswer(question);
      if (answer) selectTriviaAnswers(message, answer);
      else {
        clickRandomButton(message, 0);
        !config["dontLogUselessThings"] && console.log("Unknown trivia found");
      }
    }
    // INFO: Handle HighLow Command
    if (message.embeds[0]?.description?.includes("I just chose a secret number between 1 and 100.")) {
      var c = parseInt(message.embeds[0].description.split(" **")[1].replace("**?", "").trim());
      highLowRandom(message, c > 50 ? 0 : 2);
    }
    // INFO: Handle Stream Command
    if (commandsUsed.includes("stream") && message.embeds[0]?.author?.name.includes(" Stream Manager")) {
      try {
        if (message.embeds[0].fields[1].name !== "Live Since") {
          const components = message.components[0]?.components;
          if (components[0].type !== "SELECT_MENU" && components[0].label.includes("Go Live")) {
            // console.log("CLICKING BUTTON")
            await message.clickButton(components[0].customId);
            setTimeout(async () => {
                if (message.components[0].components[0].type == "SELECT_MENU") {
                  const Games = ["Apex Legends", "COD MW2", "CS GO", "Dead by Daylight", "Destiny 2", "Dota 2", "Elden Ring", "Escape from Tarkov", "FIFA 22", "Fortnite", "Grand Theft Auto V", "Hearthstone", "Just Chatting", "League of Legends", "Lost Ark", "Minecraft", "PUBG Battlegrounds", "Rainbox Six Siege", "Rocket League", "Rust", "Teamfight Tactics", "Valorant", "Warzone 2", "World of Tanks", "World of Warcraft", ];
                  const Game = Games[Math.floor(Math.random() * Games.length)];
                  const GamesMenu = message.components[0].components[0].customId;
                  await message.selectMenu(GamesMenu, [Game]);
                } else {
                  return;
                }
                setTimeout(async () => {
                    const components2 = message.components[1]?.components;
                    setTimeout(async () => {
                        if (components2[0]) {
                          await message.clickButton(components2[0].customId);
                        } else {
                          await message.clickButton(components2[0].customId);
                        }
                      },
                      1000,
                      1600);
                  },
                  config.cooldowns.buttonClick.minDelay,
                  config.cooldowns.buttonClick.maxDelay);
                setTimeout(async () => {
                    const check = randomInteger(0, 6);
                    if (check == 0 || check == 1) {
                      await message.clickButton(message.components[0]?.components[0].customId);
                    } else if (check == 2 || check == 3 || check == 4 || check == 5) {
                      await message.clickButton(message.components[0]?.components[1]?.customId);
                    } else if (check == 6) {
                      await message.clickButton(message.components[0]?.components[2].customId);
                    }
                  },
                  config.cooldowns.buttonClick.minDelay,
                  config.cooldowns.buttonClick.maxDelay);
              },
              config.cooldowns.buttonClick.minDelay,
              config.cooldowns.buttonClick.maxDelay * 1.5);
          }
        } else if (message.embeds[0].fields[1].name == "Live Since") {
          const check = randomInteger(0, 6);
          if (check == 0 || check == 1) {
            await message.clickButton(message.components[0]?.components[0].customId);
          } else if (check == 2 || check == 3 || check == 4 || check == 5) {
            await message.clickButton(message.components[0]?.components[1].customId);
          } else if (check == 6) {
            await message.clickButton(message.components[0]?.components[2].customId);
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
  });
  client.login(token);
  async function main(channel) {
    var a = randomInteger(config.cooldowns.commandInterval.minDelay, config.cooldowns.commandInterval.maxDelay);
    var b = randomInteger(config.cooldowns.shortBreak.minDelay, config.cooldowns.shortBreak.maxDelay);
    var c = randomInteger(config.cooldowns.longBreak.minDelay, config.cooldowns.longBreak.maxDelay);
    randomCommand(client, channel, commandsUsed, true, ongoingCmd);
    // INFO: Deposit money
    if (config.autoDeposit && randomInteger(0, 50) === 7) {
      await channel.sendSlash(botid, "deposit", "max");
      !config["dontLogUselessThings"] && console.log(chalk.yellow("Deposited all coins in the bank."));
      setTimeout(async () => {
        await channel.sendSlash(botid, "balance");
      }, randomInteger(30000, 70000));
    }
    // INFO: if autoGift is on send inventory command
    if (!config.transferOnlyMode && config.autoGift && token != config.mainAccount && randomInteger(0, 50) === 7) {
      await channel.sendSlash(botid, "inventory");
    }
    if (!config.transferOnlyMode && randomInteger(0, 30) === 3) {
      await channel.sendSlash(botid, "balance");
    }
    if (config.autoSell && token != config.mainAccount && randomInteger(0, 4) === 100) {
      await channel.sendSlash(botid, "sell all");
    }
    // INFO: Logic of taking break
    if (randomInteger(0, 190) == 50) {
      !config["dontLogUselessThings"] && console.log(client.user.tag + "\x1b[34m", " - Taking a break for " + b / 1000 + " seconds.");
      !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle(client.user.tag + " - Taking a break for " + b / 1000 + " seconds.").setColor('#9bdef6'));
      setTimeout(async function() {
        main(channel);
      }, b);
    } else if (randomInteger(0, 800) == 450) {
      !config["dontLogUselessThings"] && console.log(client.user.tag + "\x1b[35m", " - Sleeping for " + c / 1000 / 60 + " minutes.");
      !config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle(client.user.tag + " - Sleeping for " + c / 1000 / 60 + " minutes.").setColor('##ff0000'))
      setTimeout(async function() {
        main(channel);
      }, c);
    } else {
      setTimeout(async function() {
        main(channel);
      }, a);
    }
  }
}
//-------------------------- Utils functions --------------------------\\
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
async function randomCommand(client, channel, commandsUsed, isBotFree, ongoingCmd) {
  if (config.transferOnlyMode) return;
  if (!ongoingCmd) {
    // console.log("TESTING")
    let command = config.commands[random(0, config.commands.length - 1)];
    if (commandsUsed.includes(command)) return;
    ongoingCommand = true;
    if (command === "scratch") {
      await channel.sendSlash(botid, command, config.autoScratch.scratchAmount);
      !config["dontLogUselessThings"] && console.log("\x1b[0m", client.user.tag + " - " + chalk.blue("[DEBUG]") + " /" + command);
      commandsUsed.push(command);
      handleCommand(commandsUsed, command, 15000);
    } else {
      await channel.sendSlash(botid, command);
      !config["dontLogUselessThings"] && console.log("\x1b[0m", client.user.tag + " - " + chalk.blue("[DEBUG]") + " /" + command);
      commandsUsed.push(command);
      handleCommand(commandsUsed, command, 53000);
    }
    if (command === "scratch" || command === "postmemes" || command === "highlow" || command === "trivia" || command === "search" || command === "crime" || command === "stream") {
      isBotFree = false;
    }
    // isBotFree = false;
  }
}

function removeAllInstances(arr, item) {
  for (var i = arr.length; i--;) {
    if (arr[i] === item) arr.splice(i, 1);
  }
}
async function handleCommand(commandsUsed, command, delay) {
  ongoingCommand = false;
  setTimeout(() => {
    removeAllInstances(commandsUsed, command);
  }, delay);
}
async function handleSearch(message) {
  const components = message.components[0]?.components;
  const len = components?.length;
  if (!len) return;
  for (var a = 0; a < 3; a++) {
    let btn = components[a];
    if (config.searchLocations?.includes(btn?.label.toLowerCase())) {
      clickButton(message, btn);
    } else {
      clickRandomButton(message, 0);
    }
  }
}
async function clickRandomButton(message, rows) {
  setTimeout(async () => {
    const components = message.components[randomInteger(0, rows)]?.components;
    const len = components?.length;
    if (!len) return;
    let btn = components[Math.floor(Math.random() * len)];
    return clickButton(message, btn);
  }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
}
async function clickRandomButtonScratch(message, rows) {
  setTimeout(async () => {
    const components = message.components[randomInteger(0, rows)]?.components;
    const len = components?.length;
    if (!len) return;
    let btn = components[Math.floor(Math.random() * len)];
    return clickButton(message, btn, false);
  }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
}
async function highLowRandom(message, number) {
  setTimeout(async () => {
    const components = message.components[0]?.components;
    const len = components?.length;
    if (!len || components[number].disabled) return;
    let btn = components[number];
    return clickButton(message, btn);
  }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
}
async function transfer(message, number, row = 1) {
  setTimeout(async () => {
    const components = message.components[row]?.components;
    const len = components?.length;
    if (!len || components[number].disabled) return;
    let btn = components[number];
    return clickButton(message, btn);
  }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
}
async function selectTriviaAnswers(message, ans) {
  setTimeout(async () => {
    var flag = false;
    const components = message.components[0]?.components;
    const len = components?.length;
    let btn;
    if (len == NaN) return;
    for (var i = 0; i < components.length; i++) {
      if (components[i].label.includes(ans)) {
        btn = components[i];
        flag = true;
        return clickButton(message, btn);
      }
    }
    if (!flag || ans === undefined) {
      btn = components[randomInteger(0, 3)];
      return clickButton(message, btn);
    }
  }, randomInteger(config.cooldowns.trivia.minDelay, config.cooldowns.trivia.maxDelay));
}

function randomInteger(min, max) {
  if (min == max) {
    return min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function inv(botid, channel) {
  await channel.sendSlash(botid, "inventory");
}
async function autoToolBuyer(message, client, acc_bal, acc_bank) {
  if (config.autoBuy) {
    if (message.flags.has("EPHEMERAL") && message.embeds[0].description) {
      if (message.embeds[0].description?.includes("You don't have a ")) {
        const item = ["Fishing Pole", "Hunting Rifle", "Shovel"].find(
          (e) => message.embeds[0]?.description?.includes(`don't have a ${e.toLowerCase()}`));
        if (!item) {
          return;
        }
        if (acc_bal <= 25000 && acc_bank >= 25000) {
          await message.channel.sendSlash(botid, "withdraw", "25000");
          setTimeout(async () => {
            await message.channel.sendSlash(botid, "shop buy", item, "1");
          }, randomInteger(3000, 5000));
        } else {
          await message.channel.sendSlash(botid, "shop buy", item, "1");
        }
        /*!*/
        config["dontLogUselessThings"] && hook.send(new MessageBuilder().setTitle("Bought Tool: " + item).setURL(message.url).setDescription(client.user.username + ": Succesfully bought a new " + item.toLowerCase()).setColor("#2e3236"));
      }
    }
  }
}

async function clickButton(message, btn, once = true) {
  if (once) {
    try {
      let r = await message.clickButton(btn.customId);
      // if(btn.type === 'BUTTON')
      // isBotFree = true;
      return r;
    } catch (err) {
      return false;
    }
  }
  // INFO: try until success
  let interval = setInterval(async () => {
      try {
        // if (btn.disabled) return clearInterval(interval);
        await message.clickButton(btn.customId);
        clearInterval(interval);
      } catch (err) {}
    },
    config.cooldowns.buttonClick.minDelay * 1.5,
    config.cooldowns.buttonClick.maxDelay * 1.2);
}
async function playBossGame(message) {
  const btn = message.components[0]?.components[0];
  let interval = setInterval(async () => {
    if (btn.disabled) return interval.clearInterval();
    clickButton(message, btn);
  }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
}
async function playFGame(message, channel) {
  if (message.channel.id === channel) {
    if (message.embeds[0] && message.embeds[0].description?.includes("F")) {
      const btn = message.components[0]?.components[0];
      if (btn?.label === "F") {
        clickButton(message, btn);
      } else if (message.embeds[0]?.description?.includes("Attack the boss by clicking")) {
        playBossGame(message);
      }
    }
  }
}
async function postMeme(message) {
  const PlatformMenu = message.components[0].components[0];
  const MemeTypeMenu = message.components[1].components[0];
  // options
  const Platforms = PlatformMenu.options.map((opt) => opt.value);
  const MemeTypes = MemeTypeMenu.options.map((opt) => opt.value);
  // selected option
  const Platform = Platforms[Math.floor(Math.random() * Platforms.length)];
  const MemeType = MemeTypes[Math.floor(Math.random() * MemeTypes.length)];
  setTimeout(async () => {
      await message.selectMenu(PlatformMenu.customId, [Platform]);
    },
    config.cooldowns.buttonClick.minDelay,
    config.cooldowns.buttonClick.maxDelay);
  setTimeout(async () => {
      await message.selectMenu(MemeTypeMenu.customId, [MemeType]);
      const btn = message.components[2]?.components[0];
      await clickButton(message, btn, false);
    },
    config.cooldowns.buttonClick.minDelay * 1.2,
    config.cooldowns.buttonClick.maxDelay);
}
async function handleInventoryCommand(client, token, channel, message) {
  await message.channel.sendSlash(botid, "inventory")
  setTimeout(async () => {
    var [name, quantity] = message.embeds[0]?.description?.split("\n")[0].split("** ─ ");
    name = name?.split("> ")[1];
    console.log(chalk.blue(client.user.tag + " " + name + ": " + quantity));
    isInventoryEmpty = name != undefined;
    // INFO: if serverEventsDonateMode enabled
    if (config.serverEventsDonateMode) {
      await message.channel.sendSlash(botid, "serverevents donate", quantity, name);
    }
    // INFO: when autoGift is enabled and user is not main account
    else if (config.autoGift && token != config.mainAccount) {
      await channel.sendSlash(botid, "friends share items", client1.user.id, quantity, name);
      console.log(chalk.blue(client.user.tag + " Shared " + quantity + " " + name + " to main account."));
    }
  }, randomInteger(300, 700));
}
async function handleCaptcha(message) {
  // INFO: Match image captcha
  if (message.embeds[0]?.title?.toLowerCase().includes("captcha") && message.embeds[0].description?.toLowerCase().includes("matching image")) {
    console.log(chalk.red("Captcha!"));
    // var captcha = message.embeds[0].image.url;
    //get embed thubmnail
    var captcha = message.embeds[0].image.url;
    console.log("image" + captcha);
    const components = message.components[0]?.components;
    hook.send(captcha);
    for (var a = 0; a <= 3; a++) {
      var buttomEmoji = components[a].emoji.id;
      console.log("buttonEMoji" + buttomEmoji);
      hook.send(buttomEmoji);
      if (captcha.includes(buttomEmoji)) {
        console.log(components[a].customId);
        clickButton(message, components[a]);
        console.log(chalk.green("Captcha Solved :)"));
        break;
      }
    }
  }
  // INFO: All pepe find captcha
  if (message.embeds[0]?.title?.toLowerCase().includes("captcha") && message.embeds[0].description?.toLowerCase().includes("pepe")) {
    var pepe = ["819014822867894304", "796765883120353280", "860602697942040596", "860602923665588284", "860603013063507998", "936007340736536626", "933194488241864704", "680105017532743700", ];
    for (var i = 0; i <= 3; i++) {
      const components = message.components[i]?.components;
      for (var a = 0; a <= 2; a++) {
        var buttomEmoji = components[a].emoji.id;
        if (pepe.includes(buttomEmoji)) {
          let btn = components[a];
          setTimeout(async () => {
            clickButton(message, btn);
          }, randomInteger(config.cooldowns.buttonClick.minDelay, config.cooldowns.buttonClick.maxDelay));
        }
      }
    }
  }
}
async function playMiniGames(message, edited = false) {
  let description = message.embeds[0]?.description?.replace(/<a?(:[^:]*:)\d+>/g, "$1"); // format emoji <:id:severId> to :id:
  let positions = description?.split("\n").slice(1) //remove first line
    .map((e) => e.split(":").filter((e) => e !== "")); // split by : and remove blank string
  // INFO: Dodge the Fireball!
  if (description?.includes("Dodge the Fireball!")) {
    let fireballPosition = positions[1].length - 1; // 1 is fireball line and length-1 will be postion where fireball is
    let safePosition = ["Left", "Middle", "Right"].filter(
      (e, idx) => idx !== fireballPosition);
    let buttons = message.components[0]?.components;
    let btn = buttons.filter((e) => safePosition.includes(e.label))[randomInteger(0, 1)]; // filter and remove unsafe position button and select random from 0 or 1 (total 3 button 1 is unsafe other is safe so)
    await clickButton(message, btn, true);
  } else if (description?.includes("Catch the fish!")) {
    let fishPosition = positions[0].length - 1; // here 0 because 2nd line was fish not a dragon like has in dodge fireball
    let btn = message.components[0]?.components[fishPosition];
    await clickButton(message, btn, true);
  } else if (description?.includes("Hit the ball!")) {
    let ballPosition = positions[1].length - 1; // ball kick pos
    let kickPosition = ["Left", "Middle", "Right"].filter(
      (e, idx) => idx !== ballPosition);
    let buttons = message.components[0]?.components;
    let btn = buttons.filter((e) => kickPosition.includes(e.label))[randomInteger(0, 1)]; //filter, remove non kickable pos
    await clickButton(message, btn, true);
  } else if (description?.includes("Dunk the ball!")) {
    let basketballPosition = positions[0].length - 1;
    let btn = message.components[0]?.components[basketballPosition];
    await clickButton(message, btn, true);
  }
}
var log = console.log;
console.log = function() {
  var first_parameter = arguments[0];
  var other_parameters = Array.prototype.slice.call(arguments, 1);

  function formatConsoleDate(date) {
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return chalk.magenta('[' + ((hour < 10) ? '0' + hour : hour) + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds) + '] ')
  }
  log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
};
