module.exports = {
    blacklist: {
        blacklisted: "@&{dj}, the track '&{track}' was blacklisted by &{moderator}",
        blacklisted_reason: "@&{dj}, the track '&{track}' was blacklisted by &{moderator} for: &{reason}",
        is_blacklisted: "@{dj}, the track &{track} is blacklisted!",
        is_blacklisted_reason: "@{dj}, the track &{track} is blacklisted for: &{reason}",
        unblacklisted: "&{username} unblacklisted &{track}",
        queueblacklist: "@&{dj}, your track '&{track}' was added to the blacklist and will be removed from the queue.",
        queueblacklist_reason: "@&{dj}, your track '&{track}' was added to the blacklist for '&{reason}' and will be removed from the queue."
    },
    commands_reloaded: {
        default: "Reloaded commands!"
    },
    error: {
        argument: "Error in arguments",
        default: "An error occured while performing this command!"
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
        check: "Currently AFK: &{afks}"
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
        history: "@&{username}, your track &{track} was already played recently.",
        stuck_song: "&{track} seems to broken. Skipping...",
        vote: {
            reach_limit: "@&{username}, your track &{track} has reached the downvotelimit.",
        },
        timelimit: {
            default: "@&{username}, your track &{track}is too long!"
        }
    },
    queuecheck: {
        blacklisted_reason: "@&{username}, your song is on our blacklist for \"&{reason}\" and will be removed!",
        blacklisted: "@&{username}, your song is on our blacklist and will be removed!",
        history: "@&{username}, the track &{track} was played recently and will be removed!"
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
    labels: {
        default: "Set label '&{label}' for &{track}",
        override: "Overrode label to '&{label}' for &{track}",
        existing_label: "&{track} is already labeld with '&{label}'. If you wan't to override it, use !olbl. The current id is &{id}",
        argument_error: "You are using wrong arguments!",
        no_label: "The track '&{track}' has no labels!",
        labels_found: "The track '&{track}' has the following labels: '&{labels}'"
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
        no_open_duells: "You have no open duells."
    },
    randommessage: {
        delete: "Deleted message with id &{id}.",
        add: "Message added!",
        disable: "Disabled message &{id}",
        enable: "Enabled message &{id}"
    },
    skipreasons: [
        {
            reason: "u",
            msg: "@&{dj} Your song wasn't available."
        },
        {
            reason: "o",
            msg: "@&{dj} Your is overplayed."
        },
        {
            reason: "h",
            msg: "@&{dj} Your song was already played recently."
        },
        {
            reason: "t",
            msg: "@&{dj} Your song doesn't fit the theme."
        },
        {
            reason: "n",
            msg: "@&{dj} Your song wasn't safe for work!"
        },
        {
            reason: "q",
            msg: "@&{dj} Your song had a bad quality."
        }
    ]
}
