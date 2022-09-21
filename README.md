# SusAlert
SusAlert is an alt1 toolkit app for the croesus bossfight, it keeps track of croesus' attacks and provides you with visual and (optional) audio cues. In addition to that it can also display the state of all 4 statues and show the status of the crystal mask spell, with optional alerts for when it expires.

![SusAlert-MainWindow](/assets/mainscreen-overview.png)
## How to use
SusAlert is easy to setup and use, simply install (instructions below) and open the plugin in alt1 toolkit, and you're good to go! SusAlert will automatically detect when the croesus fight starts and ends. There are also some features that are not enabled by default. These features can be enabled/disabled in the settings, which can be accessed by pressing the cog icon in the top right.

The timer may drift out of sync after the mid energy fungi phase due to the variable nature of this part of the fight, but this can be manually synced by clicking the sync button (or pressing alt + 1) when the mid fungi dies, it's also possible to tweak the timing in the settings if you have very consistent runs.

## Requirements
To function SusAlert needs the following:
- Alt1 toolkit must be installed, you can install that [here](https://runeapps.org/alt1).
- The bosstimer must be visible on-screen, this can be changed in Gameplay Settings > Interfaces > Information Windows > Boss kill timer.
- Interface scaling needs to be at 100% (this is the default).
- Game messages need to be turned on (plugin is tested with fontsize 12).
- Interface transparency is preferably set to 0%, a transparent chatbox WILL cause issues with the statue indicators.

## Installation
To install SusAlert copy & paste this link into your browser:<br/>
[alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json](alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json)

Or go to this URL in the alt1 browser:<br/>
https://raphire.github.io/SusAlert/

## Credits
Special thanks to [ZeroGwafa](https://github.com/ZeroGwafa) for his chat detection function, and [Skillbert](https://github.com/skillbert) for creating alt1 & his help with making the bosstimer detection.
