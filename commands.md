# Commands for dubbot

|Command|Alias|Argumants|Role|Description|
|----|----|----|----|----|
|!skip|!fs|[reason]|VIP|Skips the current song and send reason when defined. Reasons can be defined in config.js|
|!blacklist|!bl|[reason]|Mod|Skips the current song and adds the song to the blacklist. Reason is optianal and can be any string|
|!queueblacklist|!qbl|position [reason]|Mod|Adds the track at the given position to the blacklist and removes it|
|!idblacklist|!idbl|id [reason]|Mod|Adds the given song to the blacklist|
|!unblacklist|!unbl|db_id|Mod|Removes the given song from the blacklist|
|!move||username position|Mod|Moves the specified user to the specified position|
|!clearchat|||Mod|Deletes last 512 messages sinc bot joined the room|
|!clearqueue|||Mod|Locks and clears the queue|
|!lock|||Mod|Locks the queue|
|!unlock|||Mod|Unlocks the queue|
|!delchat||username|Mod|Deletes all messages from specified user in the last 512 messages since bot joined|
|!sudo||various|Manager|Let the bot send your arguments in chat|
|!reload||[config/lang]|Manager|Reloads config/langfile|
|!restart||[time]|Manager|Restarts the bot (requires pm2)|
|!addcustomtext|!addct|Manager|trigger message|Adds a custom chat command which is triggers when .trigger is send in chat|
|!randommessage|!rndmsg|list/add/del/disable/enable|Manager|Edits random messages sent all 2-10 Minutes|
|!resetplay||id|Mod|Resets the last play for the given song|
|!findtrack||name|VIP|Searches the databse for the given songname|
|!afkcheck| | |VIP|Lists all afks in the community|
|!afkreset||username|Mod|Resets AFK-time for the given user|
|!lottery| |[time]|Mod|Starts a lottery with the given time in minutes. Time defaults to 2 minutes|
|!roulete| |[time]|Mod|Starts a roulette with the given time in minutes. Time defaults to 2 minutes|
|!ping| | |ResidengDj|Pong!|
|!voteskip| | |Dj|Votes for skip, only usable when to low mods in the room|
|!help| | |User|Mentions all mods in the room|
|!callmod||message|User|Informs a mod to join the room|
|!link| | |User|Sends a link to the current song|
|!define| |word|User|Defines the given word|
|!duell| |accept/decline/username|User|Accepts a duell, declines a duell or starts one|
|!commands| |[command]|User|Lists unhidden commands and provides their description|


[  ] = optional argument
