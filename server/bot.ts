import { Client, GatewayIntentBits, Partials, Routes, REST, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from "discord.js";
import { LAW_CODES } from "./laws";
import { storage } from "./storage";

// Configuration
const TOKEN = "MTQ2NTQxMzEzNzIyMTAyOTkzOQ.GEWOoP.xEeA5bi30azKBml9G4VZkvZ1pRDt9CcByUI_-g";
const ARREST_LOG_CHANNEL_ID = "1414634603611947089";
const CLIENT_ID = "1346541313722102993"; // Extracted from token (first part base64 decoded) or just use the bot application ID if available. 
// Actually, I can't easily extract client ID from token reliably without decoding. 
// I'll trust the token works and fetch the client ID from the client once logged in, 
// OR I'll use a placeholder and rely on the client.user.id for registration if needed, 
// but REST registration needs it beforehand.
// Wait, the first part of the token IS the client ID base64 encoded.
// MTQ2NTQxMzEzNzIyMTAyOTkzOQ == 1346541313722102993 (decoded)
// Let's decode it to be safe.
const decodedClientId = Buffer.from(TOKEN.split('.')[0], 'base64').toString('utf-8');

interface ArrestSession {
  agency: string;
  charges: string[];
  selectedTitle?: string;
}

// Session storage (In-memory)
const sessions = new Map<string, ArrestSession>();

export async function startBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
  });

  client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    // Register slash commands
    const rest = new REST({ version: "10" }).setToken(TOKEN);
    try {
      console.log("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationCommands(decodedClientId), {
        body: [
          {
            name: "arrest-report",
            description: "Submit an arrest report",
          },
        ],
      });
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "arrest-report") {
        // Init session
        sessions.set(interaction.user.id, {
          agency: "TES",
          charges: [],
        });

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_title")
            .setPlaceholder("Select Law Title")
            .addOptions(
              Object.keys(LAW_CODES).map((title) => ({
                label: title,
                value: title,
              }))
            )
        );

        await interaction.reply({
          content: "Select Law Title:",
          components: [row],
          ephemeral: true,
        });
      }
    } else if (interaction.isStringSelectMenu()) {
      const session = sessions.get(interaction.user.id);
      if (!session) return;

      if (interaction.customId === "select_title") {
        const selectedTitle = interaction.values[0];
        session.selectedTitle = selectedTitle;
        
        const charges = LAW_CODES[selectedTitle];
        
        // Select menus have a max of 25 options.
        // Some titles might have more (though looking at the list, they seem under 25).
        // If > 25, we'd need pagination, but let's assume < 25 for now based on the data.
        
        const options = charges.map(([code, name]) => ({
          label: `${code} – ${name}`,
          value: `${code} – ${name}`,
        })).slice(0, 25); // Safety clip

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_charges")
            .setPlaceholder("Select Charge(s)")
            .setMinValues(1)
            .setMaxValues(options.length)
            .addOptions(options)
        );

        await interaction.update({
          content: `Select Charge(s) from **${selectedTitle}**:`,
          components: [row],
        });
      } else if (interaction.customId === "select_charges") {
        const selectedCharges = interaction.values;
        // Add unique charges
        for (const charge of selectedCharges) {
          if (!session.charges.includes(charge)) {
            session.charges.push(charge);
          }
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("add_more")
            .setLabel("Add More Charges (Same Title)")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("back_titles")
            .setLabel("Back to Titles")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("finish_arrest")
            .setLabel("Finish Arrest")
            .setStyle(ButtonStyle.Success)
        );

        await interaction.update({
          content: "Charges added. What would you like to do next?",
          components: [row],
        });
      }
    } else if (interaction.isButton()) {
      const session = sessions.get(interaction.user.id);
      if (!session) return;

      if (interaction.customId === "add_more") {
        if (!session.selectedTitle) return;
        
        // Re-show charges for the current title
        const charges = LAW_CODES[session.selectedTitle];
        const options = charges.map(([code, name]) => ({
          label: `${code} – ${name}`,
          value: `${code} – ${name}`,
        })).slice(0, 25);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_charges")
            .setPlaceholder("Select Charge(s)")
            .setMinValues(1)
            .setMaxValues(options.length)
            .addOptions(options)
        );

        await interaction.update({
          content: `Select Charge(s) from **${session.selectedTitle}**:`,
          components: [row],
        });

      } else if (interaction.customId === "back_titles") {
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_title")
            .setPlaceholder("Select Law Title")
            .addOptions(
              Object.keys(LAW_CODES).map((title) => ({
                label: title,
                value: title,
              }))
            )
        );

        await interaction.update({
          content: "Select Law Title:",
          components: [row],
        });

      } else if (interaction.customId === "finish_arrest") {
        const modal = new ModalBuilder()
          .setCustomId("arrest_modal")
          .setTitle("Arrest Report");

        const suspectInput = new TextInputBuilder()
          .setCustomId("suspect")
          .setLabel("Suspect Username")
          .setStyle(TextInputStyle.Short);

        const descriptionInput = new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Arrest Description")
          .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(suspectInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "arrest_modal") {
        const session = sessions.get(interaction.user.id);
        if (!session) {
           await interaction.reply({ content: "Session expired.", ephemeral: true });
           return;
        }

        const suspect = interaction.fields.getTextInputValue("suspect");
        const description = interaction.fields.getTextInputValue("description");

        // 1. Log to Channel
        try {
          const channel = await client.channels.fetch(ARREST_LOG_CHANNEL_ID);
          if (channel && channel.isSendable()) {
            const embed = new EmbedBuilder()
              .setTitle("🚓 Arrest Log")
              .setColor(0x2b2d31) // Dark Grey
              .addFields(
                { name: "Suspect", value: suspect, inline: false },
                { name: "Agency", value: session.agency, inline: true },
                { name: "Officer", value: `<@${interaction.user.id}>`, inline: true },
                { name: "Charges", value: session.charges.join("\n") || "No charges selected", inline: false },
                { name: "Description", value: description, inline: false }
              );

            await channel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error("Failed to send log to channel:", error);
        }

        // 2. Save to DB
        try {
          await storage.createArrest({
            suspect,
            agency: session.agency,
            officerDiscordId: interaction.user.id,
            officerName: interaction.user.username,
            charges: session.charges,
            description,
          });
        } catch (error) {
          console.error("Failed to save arrest to DB:", error);
        }

        // Clear session
        sessions.delete(interaction.user.id);

        await interaction.reply({ content: "✅ Arrest logged.", ephemeral: true });
      }
    }
  });

  try {
    await client.login(TOKEN);
  } catch (error) {
    console.error("Failed to login:", error);
  }
}
