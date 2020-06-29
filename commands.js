import Discord from "discord.js";

import emojis from "./emojis.js";

export const defaultMessage = (supportedGames) => {
  return new Discord.MessageEmbed()
    .setColor("#669900")
    .attachFiles(["./img/lobbyist.png"])
    .setAuthor("Lobbyist", "attachment://lobbyist.png")
    .setTitle("Lobby creator")
    .setDescription("Type 'lobby <command>' to create a game lobby")
    .addField(
      "Available commands:",
      `${supportedGames
        .map((game) => `${game.name} ${game.message}`)
        .join(
          "\n"
        )}\n\nEach lobby is valid for 30 minutes or until lobby creator doesn't remove it`,
      true
    );
};

export const lobbyMessage = (game, players) => {
  const { displayName, name, size } = game;

  return new Discord.MessageEmbed()
    .setColor("#669900")
    .attachFiles(["./img/lobbyist.png", `./img/${name}.png`])
    .setThumbnail(`attachment://${name}.png`)
    .setAuthor("Lobbyist", "attachment://lobbyist.png")
    .setTitle(`${displayName} lobby`)
    .addField("--------------------------", createLobbyList(size, players))
    .addField(
      `--------------------------`,
      `react with ${emojis.thumbsUp} to join the lobby\n\nreact with ${emojis.thumbsDown} to leave the lobby\n\nlobby creator react with ${emojis.checkMark} to ping players`
    );
};

export const startMessage = (game, players) => {
  game.displayName = game.name === "custom" ? "" : game.displayName;
  const { name, displayName, size } = game;

  players.slice(0, size - 1);

  return `Time to play ${displayName} ${players
    .map((player) => `<@${player}>`)
    .join(" ")}`;
};

export const cancelMessage = () => "lobby cancelled";

const createLobbyList = (size, players) => {
  let text = "";
  for (let i = 0; i < size; i++) {
    text += `${emojis[i + 1]} `;

    if (players[i]) {
      text += `<@${players[i]}>`;
    }

    if (i + 1 !== size) {
      text += `\n`;
    }
  }

  return text;
};
