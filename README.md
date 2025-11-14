This is a simple custom Firebot script to use in a command to allow a quick chat message
that summarizes custom commands that start with a "!" and a specified tag.

To use this:
1. Download the [compiled](https://raw.githubusercontent.com/mikebaz/FirebotDropListCommand/refs/heads/master/dist/firebotDropListCommand.js) file.
1. Ensure your [bot connection](https://www.youtube.com/watch?v=QllhrNGFuwM&list=PLKM4AhNKMRk4ecbLtTpCk1nXtVKhiWSqV&t=77s) is configured in Firebot.  If you don't have a bot, you should be able to edit the script (**carefully**) by searching for `chatter:"Bot"` in the script, and replacing `Bot` with `Streamer`.  I have not tested this too much because I do have a bot account.
1. Copy the built version from `dist` into your `scripts` folder to make it available.
	1. On Windows this is `C:\Users\<username>\AppData\Roaming\Firebot\v5\profiles\Main Profile\scripts`.
	1. On MacOS, this is `/Library/Application Support/Firebot/v5/profiles/Main Profile/scripts` in your `HOME` folder.
	1. There is a simple batch file that will do this in most Windows cases in the distribution.
	1. Hint from a kind user (hi, DJ): Go to `New Custom Command`, and then within `Effects`, click on `Add New Effect`.  Then, in the `Scripting` category, select `Run Custom Script`, and press the `Select` button.  There's a link provided that goes directly to the proper folder.
1. Tag all custom commands that should be listed by the trigger with a custom tag - I use `drops`.
1. Create a new custom command with the desired trigger, e.g. `!drops`
1. Add a `Run Custom Script` effect.
1. Select the `firebotDropListCommand.js` entry in the `Script` dropdown list.
1. Set the desired tag under `Settings`.

You should now be able to trigger the list of commands to be sent as your bot user.  

I created this because I have a lot of sound triggers and I wanted to have a more compact view
than !commands gives.

This has minimal error handling; it's quick and dirty, but it does what I need.