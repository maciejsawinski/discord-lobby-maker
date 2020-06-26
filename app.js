import Discord from "discord.js";
import dotenv from "dotenv";

import supportedGames from "./supportedGames.js";
import emojis from "./emojis.js";

import {
  defaultMessage,
  lobbyMessage,
  startMessage,
  cancelMessage,
} from "./commands.js";

dotenv.config({ path: "./.env" });

const client = new Discord.Client();

client.once("ready", () => {
  console.log("Bot ready...");
});

client.on("message", async (message) => {
  const prefix = process.env.DISCORD_PREFIX;

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  try {
    // get command arguments
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args[1];

    // send default command
    if (!command) {
      await message.channel.send(defaultMessage(supportedGames));

      return;
    }

    // check if command is supported
    const filteredGames = supportedGames.filter(
      (game) => game.name === command
    );
    if (!filteredGames.length) return;

    // prepare game object and players array
    const game = filteredGames[0];
    let players = [message.author.id];

    // send an initial lobby message
    const lobby = await message.channel.send(lobbyMessage(game, players));

    // react on the lobby message
    await lobby.react(emojis.thumbsUp);
    await lobby.react(emojis.thumbsDown);
    await lobby.react(emojis.checkMark);

    // setup a reactions collector for the lobby message
    const filter = (reaction, user) =>
      [emojis.thumbsUp, emojis.thumbsDown, emojis.checkMark].includes(
        reaction.emoji.name
      ) && !user.bot;

    const reactionCollector = lobby.createReactionCollector(filter, {
      time: 1800000,
    });

    reactionCollector.on("collect", async (reaction, user) => {
      // add user to players list
      if (reaction.emoji.name === emojis.thumbsUp) {
        if (!players.includes(user.id)) {
          players.push(user.id);

          await lobby.edit(lobbyMessage(game, players));
        }

        // remove user from players list or cancel the lobby
      } else if (reaction.emoji.name === emojis.thumbsDown) {
        if (user.id === players[0]) {
          await reactionCollector.stop();
          await lobby.delete();
          await message.channel.send(cancelMessage());
        } else if (players.includes(user.id)) {
          players = players.filter((player) => player !== user.id);

          await lobby.edit(lobbyMessage(game, players));
        }

        // mention players
      } else if (reaction.emoji.name === emojis.checkMark) {
        if (user.id === players[0]) {
          await reactionCollector.stop();
          await message.channel.send(startMessage(game, players));
        }
      }
    });

    reactionCollector.on("end", (collected) =>
      console.log(
        `Lobby watcher ended. Collected ${collected.size} reactions...`
      )
    );
  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.DISCORD_TOKEN);
