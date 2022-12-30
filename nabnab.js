var gs = 0
async function handleInventoryCommand(client, token, channel, message, gs) {
  await message.channel.sendSlash(botid, "inventory");
  setTimeout(async () => {
    var [name, quantity] = message.embeds[0]?.description?.split("\n")[0].split("** ─ ");
    name = name?.split("> ")[1];
    console.log(chalk.blue(client.user.tag + " " + name + ": " + quantity));
    isInventoryEmpty = name != undefined;
    // INFO: if serverEventsDonateMode enabled
    if (config.serverEventsDonateMode) {
        if (config.TradeBlacklistItems.includes(name)) {
          gs = gs + 3
          var [name, quantity] = message.embeds[0]?.description?.split("\n")[gs].split("** ─ ");
          name = name?.split("> ")[1];
          console.log(chalk.blue(client.user.tag + " " + name + ": " + quantity));
          await message.channel.sendSlash(botid, "serverevents donate", quantity, name);
      } else {
        await message.channel.sendSlash(botid, "serverevents donate", quantity, name);
      }
    }
    // INFO: when autoGift is enabled and user is not main account
    else if (config.autoGift && token != config.mainAccount) {
        if (config.TradeBlacklistItems.includes(name)) {
        gs = gs + 3
        var [name, quantity] = message.embeds[0]?.description?.split("\n")[gs].split("** ─ ");
        name = name?.split("> ")[1];
        console.log(chalk.blue(client.user.tag + " " + name + ": " + quantity));
        await channel.sendSlash(botid, "friends share items", client1.user.id, quantity, name);
        console.log(chalk.red(client.user.tag + " Shared " + quantity + " " + name + " to main account"));
        } else {
        await channel.sendSlash(botid, "friends share items", client1.user.id, quantity, name);
        console.log(chalk.red(client.user.tag + " Shared " + quantity + " " + name + " to main account"));
        }
      }  
  }, randomInteger(300, 700));
}