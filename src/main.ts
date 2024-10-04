import { run } from "node:test";
import * as fs from "fs";
import { Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";
import { StringParameter } from "@crowbartools/firebot-custom-scripts-types/types/modules/firebot-parameters";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { CommandDefinition } from "@crowbartools/firebot-custom-scripts-types/types/modules/command-manager";

interface Params {
    tagName: StringParameter;
}

type tagDefinition = {
    id: string;
    name: string;
}

function readTags(): tagDefinition[] {
    //return [{ name: "a" }];
    const tagsFile = __dirname + '/../sort-tags.json';
    //console.debug(tagsFile);
    const tagContents = fs.readFileSync(tagsFile, 'utf8');
    const tags = JSON.parse(tagContents).commands;
    return tags;
}

const script: Firebot.CustomScript<Params> = {

    getScriptManifest: () => {
        return {
            name: "Firebot Drop List Command",
            description: "Finds all commands with a specific tag and returns it in chat.",
            author: "Michael C. Bazarewsky",
            version: "2.0.0",
            firebotVersion: "5",
        };
    },

    getDefaultParameters: () => {
        const tagList: string[] = readTags().map(tag => tag.name);

        return {
            tagName: {
                type: "enum",
                default: "",
                description: "Desired tag",
                secondaryDescription: "The tag on the commands to return",
                options: tagList
            }
        }
    },

    run: (runRequest) => {
        return new Promise<ScriptReturnObject>((resolve, reject) => {
            const { logger } = runRequest.modules;
            logger.debug("Custom drop list command starting");

            const requestedTag = runRequest.parameters.tagName.toString();

            logger.debug("... Reading tags and finding selected one");
            const tagId = readTags().filter(tag => tag.name == requestedTag)[0].id;
            logger.debug("... Found:", tagId);

            // pull out the list of commands from the manager
            let commands = runRequest.modules.commandManager.getAllCustomCommands();
            logger.debug("... Command count: ", commands.length);

            // get the ones tagged with the requested tag
            const taggedCommands: CommandDefinition[] = [];
            commands.forEach(function (thisCommand) {
                if (thisCommand.sortTags) {
                    // this could be done with a map but I found this easier to understand
                    if (thisCommand.sortTags.indexOf(tagId) != -1) {
                        if (!thisCommand.hidden) {
                            taggedCommands.push(thisCommand);
                        }
                    }
                }
            });
            logger.debug("... Found: ", taggedCommands.length);
            taggedCommands.sort((a, b) => a.trigger.localeCompare(b.trigger));

            // break it up to chunks as necessary
            const chunkSize = 30;
            const chunkedCommands = Array.from({ length: Math.ceil(taggedCommands.length / chunkSize) }, (_, i) => taggedCommands.slice(i * chunkSize, i * chunkSize + chunkSize));

            // build the replies
            let effects: Effects.Effect<Effects.KnownEffectType>[] = [];
            let didFirst = false;

            chunkedCommands.forEach(function (thisChunk) {
                // the open message for the reply
                let replyString = "";
                if (!didFirst) {
                    replyString = `Commands tagged '${requestedTag}' for this channel are: `;
                    didFirst = true;
                } else {
                    replyString = "(continued) ";
                }
                // the actual list
                let needComma = false;
                thisChunk.forEach(function (thisCommand) {
                    if (needComma) {
                        replyString += ", ";
                    } else {
                        needComma = true;
                    }
                    replyString += thisCommand.trigger.replace('!', '');
                    // @ts-expect-error
                    const aliases: string[] = thisCommand.aliases ?? [];
                    if (aliases.length > 0) {
                        replyString += " (";
                        let needAliasComma = false;
                        aliases.forEach(function (thisAlias) {
                            if (needAliasComma) {
                                replyString += ", ";
                            } else {
                                needAliasComma = true;
                            }
                            replyString += thisAlias.replace('!', '');
                        });
                        replyString += ")";
                    }
                });
                logger.debug("... ", replyString);
                // the effect object
                const thisEffect: Effects.Effect<Effects.KnownEffectType> = {
                    type: "firebot:chat",
                    message: replyString,
                    chatter: "Bot"
                };
                effects.push(thisEffect);
            });

            logger.debug("... Effects: ", effects.length);

            logger.debug("Done.");

            const response: ScriptReturnObject = {
                success: true,
                errorMessage: "Sorry, failed to get the drops.",
                effects: effects
            }

            resolve(response);
        });
    }
};

export default script;
