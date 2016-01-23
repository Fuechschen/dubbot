# Commands for dubbot

|Command|Alias|Argumants|Role|Description|
|----|----|----|----|----|
|!skip|!fs|[reason]|VIP|Skips the current song and send reason when defined. Reasons can be defined in language.js|
|!blacklist|!bl|[reason]|Mod|Skips the current song and adds the song to the blacklist. Reason is optianal and can be any string|
|!unblacklist|!unbl|db_id|Mod|Removes the given track from the blacklist|
|!move||username position|Mod|Moves the specified user to the specified position|
|!clearchat|||Mod|Deletes last 512 messages sinc bot joined the room|
|!delchat||username|Mod|Deletes all messages from specified user in the last 512 messages since bot joined|
|!sudo||various|Manager|Let the bot send your arguments in chat|
|!addcustomtext|!addct|Manager|trigger message|Adds a custom chat command which is triggers when .trigger is send in chat|
|!randommessage|!rndmsg|list/add/del/disable/enable|Manager|Edits random messages sent all 2-10 Minutes|
|!afkcheck| | |VIP|Lists all afks in the community|
|!lottery| |[time]|Mod|Starts a lottery with the given time in minutes. Time defaults to 2 minutes|
|!roulete| |[time]|Mod|Starts a roulette with the given time in minutes. Time defaults to 2 minutes|
|!ping| | |VIP|Pong!|
|!help| | |User|Mentions all mods in the room|
|!link| | |User|Sends a link to the current song|
|!define| |word|User|Defines the given word|
|!duell| |accept/decline/username|User|Accepts a duell, declines a duell or starts one|


[  ] = optional argument
