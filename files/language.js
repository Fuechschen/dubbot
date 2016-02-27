module.exports = {
    momentjs: {
        locale: 'en'
    },
    blacklist: {
        blacklisted: "@&{dj}, the track '&{track}' was blacklisted by &{moderator}",
        blacklisted_reason: "@&{dj}, the track '&{track}' was blacklisted by &{moderator} for: &{reason}",
        is_blacklisted: "@{dj}, the track &{track} is blacklisted!",
        is_blacklisted_reason: "@{dj}, the track &{track} is blacklisted for: &{reason}",
        unblacklisted: "&{username} removed &{track} from the blacklist.",
        queueblacklist: "@&{dj}, your track '&{track}' was added to the blacklist and will be removed from the queue.",
        queueblacklist_reason: "@&{dj}, your track '&{track}' was added to the blacklist for '&{reason}' and will be removed from the queue.",
        id_blacklist: "&{moderator} added '&{track}' to the blacklist.",
        id_blacklist_reason: "&{moderator} added '&{track}' to the blacklist for: &{reason}"
    },
    commands_reloaded: {
        default: "Reloaded commands!"
    },
    error: {
        argument: "Error in arguments",
        default: "An error occured while performing this command!",
        track_not_found: "The track wasn't found!",
        check_console: "Error during execution. Check the console for more details.",
        user_not_in_queue: "The given user wasn't found in the queue.",
        user_not_found: "No user could be found for the given username"
    },
    ping: {
        default: "Pong!"
    },
    welcome_users: {
        default: "Welcome &{username}",
        new: "Welcome @&{username}. Have fun and don't be rude!"
    },
    afk: {
        warning: "Seems like you are AFK? Stay active in chat or you will be removed from the queue!",
        remove: "You have been afk for too long! You will now be removed from the queue. Remember to chat next time!",
        kick: "You have been removed from the queue for being AFK once. You will now be kicked out of the room!",
        kick_msg: "You have been removed from the queue for being AFK once. You now have been kicked out of the room!",
        check: "Currently AFK: &{afks}",
        reset: "Time reset for '&{username}.",
        enable: "Afk-Removal is now enabled!",
        disable: "Afk-Removal is now disabled!"
    },
    help: {
        default: "Need help? @mods",
        no_one_here: "Unfortunately, there is no mod here... Sorry"
    },
    define: {
        no_definition_found: "No definition for &{word} found",
        definition_found: "[ &{word} ] &{definition}"
    },
    autoskip: {
        history: {
            default: "@&{username}, your track &{track} was already played recently.",
            enable: "Historyskip is now enabled!",
            disable: "Historyskip is now disabled!"
        },
        stuck_song: "&{track} seems to broken. Skipping...",
        vote: {
            reach_limit: "@&{username}, your track &{track} has reached the downvotelimit.",
            disable: "Voteskip is now disabled!",
            enable: "Voteskip is now enabled!"
        },
        timelimit: {
            default: "@&{username}, your track &{track}is too long!",
            disable: "Timeguard is now disabled!",
            enable: "Timeguard is now enabled!"
        },
        resdjskip: {
            not_enough_votes: "&{more} more votes required to skip.",
            skip: "Our residents decided to skip.",
            too_many_mods: "Currently, the amount of mods in the room is high enough, so this function is disabled",
            already_voted: "You already voted to skip!",
            enable: "ResDjSkip is now enabled!",
            disable: "ResDjSkip is now disabled!"
        }
    },
    queuecheck: {
        blacklisted_reason: "@&{username}, your song is on our blacklist for \"&{reason}\" and will be removed!",
        blacklisted: "@&{username}, your song is on our blacklist and will be removed!",
        history: "@&{username}, the track &{track} was played recently and will be removed!",
        length: "@&{username}, your song '&{track}' is too long and will be removed!",
        removed_for_leave: "&{username} will be removed from the queue because he left the room.",
        enable: "Queuecheck is now enabled!",
        disable: "Queuecheck is now disabled!"
    },
    link: {
        default: "Link to the current song: &{link}",
        no_media: "There is no song playing",
        iframe: "We are currently hosting a custom, embeded player. Click here: &{link}"
    },
    chatfilter: {
        dubtrackroom: "@&{username} You are not allowed to post links to other dubtrack-rooms here!",
        youtube: "@&{username} You are not allowed to post youtube-links here!",
        word_blacklist: "@&{username} You are not allowed to use that word here!",
        link_protection: "@&{username} you are not yet allowed to post links.",
        spam: {
            warning: "@&{username} Please don't spam!",
            mute: "@&{username} was muted for spamming."
        }
    },
    clearchat: {
        default: "&{username} cleared the chat."
    },
    lottery: {
        started: "Lottery in &{time} minutes. Join the queue to have a chance to get moved to position 1",
        no_winner: "No winner could be determined",
        victory: "@&{username} won the lottery"
    },
    roulette: {
        started: "Roulette in &{time} minutes. Join the queue to have a chance to get moved up to a random position!",
        no_winner: "No winner could be determined",
        victory: "@&{username} won the roulette"
    },
    duell: {
        start: "@&{challenged}, &{challenger} wants to duell. Type '!duell accept' to accept. Warning: The loser gets kicked from the queue!",
        accepted: "&{challenged} has accepted the duell. Let the dices roll",
        decline: "&{challenged} has declined the duell.",
        winner: "@&{winner} has won the duell! @&{loser} bye...",
        no_open_duells: "You have no open duells.",
        no_points: "You aren't having enough &{points_name} to start a duell!",
        pending_duell: "You already started a duell. Wait unitl it's over to start a new one!"
    },
    randommessage: {
        delete: "Deleted message with id &{id}.",
        add: "Message added!",
        disable: "Disabled message &{id}",
        enable: "Enabled message &{id}"
    },
    callmod: {
        errors: {
            unconfigured: "Error in configuration. Please report this to a staff memeber.",
            request: "An error occured while calling a mod, sorry...",
            no_message: "Please provide a messages to send like this: !callmod spammer in the room"
        },
        mod_called: "A moderator has been informed and will come as fast as possible if he is available",
        message: "&{username} needs help in &{roomname}! \n Message: `&{message}`"
    },
    pm2: {
        restart_now: "Restarting...",
        restart_time: "Restarting in &{minutes} minutes..."
    },
    resetPlay: {
        default: "Reset play for '&{track}'"
    },
    findtrack: {
        notracksfound: "No tracks found for that name.",
        list: "[&{id}] - '&{name}' - '&{sourceid}' - '&{type}' - '&{length}' - '&{blacklisted}'"
    },
    clearqueue: {
        default: "@djs, &{moderator} cleared and locked the queue. You will be removed within the next few seconds. If you don't want to loose your personal queue, pause it NOW!"
    },
    commands: {
        default: "Available commands: &{commands}",
        desc: "Alias: '&{alias}', &{desc}",
        not_found: "Command not found."
    },
    commanddesc: {
        skip: "Skips the current song and send reason if provided.",
        blacklist: "Skips the current song, adds the song to the blacklist and sends a provided reason.",
        queueblacklist: "Adds the track at the given position to the blacklist and removes it.",
        idblacklist: "Adds the given song to the blacklist.",
        unblacklist: "Removes the given song from the blacklist",
        move: "Moves the given user to the given position.",
        clearchat: "Deletes last 512 messages from the chat.",
        delchat: "Deletes all messages from the given user.",
        sudo: "Sends the given message in the chat.",
        reload: "Reloads config/language.",
        restart: "Restarts the bot in the given time.",
        addcustomtext: "Adds or updates a customtext.",
        randommessage: "List or edits randommessages.",
        resetplay: "Resets the last_played value for the given songs.",
        findtrack: "Searches a song in the database by name.",
        afkcheck: "Lists all afks in the community.",
        lottery: "Starts a lottery.",
        roulette: "Starts a roulette.",
        ping: "Pong!",
        voteskip: "Votes for a skip.",
        help: "Mentions all mods.",
        callmod: "Calls a mod over an external messenger.",
        link: "Send a link to the current song.",
        define: "Defines the given word over wordnik.",
        duell: "Starts or accepts a duell.",
        clearqueue: "Locks and clears the queue.",
        lock: "Locks the queue.",
        unlock: "Unlocks the queue.",
        commands: "List all commands/Provides their descriptions.",
        afkreset: "Resets AFK-time for the given user.",
        points: "Commands to use for points.",
        afkmsg: "Commands for managing the integrated afkmessage.",
        queueban: "Command for managing QueueBans.",
        kick: "Kicks the given user, reomving his rank if necessaray",
        lastplayed: "Gives the last time a song was played.",
        shufflequeue: "Suffles the room queue.",
        toggle: "Toggles various functions.",
        reconnect: "Disconnects the bot and reconnects it again. Useful to refresh the userlist."
    },
    points: {
        award: "&{username} was arwarded &{amount} &{points_name}.",
        remove: "&{username} had &{amount} &{points_name} removed.",
        command: {
            default: "You have &{amount} &{points_name}.",
            no_negative_gift: "You can't gift a negative amount of &{points_name}.",
            gift: "&{gifter} gifted &{amount} &{points_name} to &{reciever}",
            gift_failed: "You aren't having enough &{points_name} for that."
        }
    },
    afk_message: {
        enabled: "@&{username}, your afk message is now enabled and will disabled the next time you chat.",
        message_set: "@&{username}, your afk message was set to: \"&{message}\"",
        reset: "@&{username}, your message is now empty.",
        mod_reset: "AFK-Message for '&{username}' cleared.",
        no_message: "[&{afk}] @&{username}, I'm currently afk.",
        with_message: "[&{afk}] @&{username} &{msg}"
    },
    queueban: {
        banned: "@&{username}, you are banned from joining the queue and you will therefore be removed!",
        banned_reason: "@&{username}, you are banned from joining the queue for \"&{reason}\" and you will therefore be removed!",
        check: {
            negative: "@&{username}, you are not banned from the queue.",
            positive_reason: "@&{username}, you are currently banned from the queue for: &{reason}.",
            positive: "@&{username}, you are currently banned from the queue.",
            expires: {
                never: "The ban is permanent.",
                time: "The ban will expire in &{time}"
            }
        },
        mod: {
            unban: "Removeing all queuebans from &{username}.",
            ban: {
                permanent: "&{banned} was permanently banned from the queue by &{mod}.",
                permanent_reason: "&{banned} was permanently banned from the queue by &{mod} for: &{reason}.",
                time: "&{banned} was banned from the queue by &{mod}. Run !qban to check your ban!",
                time_reason: "&{banned} was banned from the queue by &{mod} for: \"&{reason}\". Run !qban to check your ban!"
            }
        }
    },
    customtext: {
        add: "CustomText successfully added.",
        delete: "Customtext successfully deleted.",
        disable: "Customtext successfully disabled.",
        enable: "Customtext successfully enabled.",
        update: "Customtext successfully updated.",
        append: "Customtext successfully updated."
    },
    lastplayed: {
        error: "Track wasn't found in database.",
        not_played_before: "This track wasn't played before.",
        default: "This track was played &{time} before."
    },
    sufflequeue: {
        default: "@djs, the queue will be shuffled in a few moments. Prepare..."
    },
    countryblocks: {
        play: {
            skip: "@&{username}, your track '&{track}' was skipped, because it's blocked in the following countries: &{countries}",
            blacklist: "@&{username}, you track '&{track}' was added to the blacklist because it's blocked in one of the following countries: &{countries}"
        },
        queue: {
            remove: "@&{username}, your track '&{track}' was removed from the queue because it's blocked in one of the following countries: &{countries}",
            blacklist: "@&{username} you track '&{track}' was added to the blacklist and removed from the queue because it's blocked in one of the following countries: &{countries}"
        },
        blacklist_reason: "Blocked in one of the following countries: &{countries}"
    },
    userinfo: {
        default: "&{username} | &{userid} | &{dubs} | &{points} &{points_name} | &{last_seen}"
    },
    event: {
        no_event: "There is currently no event.",
        event_running: "&{eventname} - &{eventdesc}",
        no_sheduled_events: "No shedules events found.",
        sheduled_events: {
            default: "Upcoming events:",
            event: "[&{#}] &{eventname} - &{eventdesc}"
        }
    },
    uptime: {
        default: "Bot running for &{time}"
    }
};
