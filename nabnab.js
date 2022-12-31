const Blacklist = config.BlacklistItems
async function handleInventoryCommand(client, token, channel, message, gs = 0) {
  console.log(message.embeds[0])
  setTimeout(async () => {
    var [name, quantity] = message.embeds[0]?.description?.split("\n")[gs].split("** ─ ");
    name = name?.split("> ")[1];
    console.log(chalk.blue(client.user.tag + " " + name + ": " + quantity));
    isInventoryEmpty = name != undefined;
    // INFO: if serverEventsDonateMode enable
    if (config.serverEventsDonateMode) {
      if (!Blacklist.includes(name)) {
        await message.channel.sendSlash(
          botid,
          "serverevents donate",
          quantity,
          name
        );
      } else {
        gs = gs + 3;
        handleInventoryCommand(client, token, channel, message, gs)
    if (config.autoGift) {
      if (!Blacklist.includes(name)) {
        await message.channel.sendSlash(
          botid,
          "friends share items",
          client1.user.id,
          quantity,
          name
        );
        console.log(chalk.red(client.user.tag + " Shared " + quantity + " " + name + " to main account"));
      } else {
        gs = gs + 3;
        handleInventoryCommand(client, token, channel, message, gs)
      }
    }
  }, randomInteger(300, 700));
}