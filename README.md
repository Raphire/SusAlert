# SusAlert
SusAlert is an alt1 toolkit plugin for the croesus fight, it keeps track of croesus' attacks and warns you before they happen.

**Please note that this plugin is still in a pre-release state and may contain bugs.**

![SusAlert-MainWindow](https://user-images.githubusercontent.com/9938813/136677639-16636582-ebe3-4c5e-8e64-192c30c90361.png)

## How to use
SusAlert is very easy to use, simply install and open the plugin in alt1 toolkit. The plugin will automatically detect when the croesus fight starts or ends, but it does have a manual start/stop button if you need it.

If the timer drifts after the first mid energy fungi you can synchronize it by clicking the 'Mid Down' button or pressing alt+1 when the mid energy fungi dies, another solution may be to edit the delay after mid in the settings. 

Lastly, you can use the + and - buttons on the timer to 'nudge' the timer forward or back in 1s increments.

## Requirements
To function SusAlert needs the following:
- Alt1 toolkit must be installed, you can install that [here](https://runeapps.org/alt1).
- Chatwindow MUST be opaque, this can be changed in the RuneScape Settings > 
Interfaces > Appearance > Transparency
- Chat font must be 12 or higher (plugin is tested with fontsize 12).
- The bosstimer must be visible on-screen.
- At least one chat window needs to be on-screen with game messages turned on.

## Installation
To install SusAlert copy & paste this link into your browser:<br/>
[alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json](alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json)

Or go to this URL in the alt1 browser:<br/>
https://raphire.github.io/SusAlert/

## Known issues
- The timer can go out of sync after the mid energy fungi appears. (Can be manually recalibrated by clicking the 'Mid Down' button or pressing alt + 1 when the mid energy fungi dies)
- Old messages can sometimes trigger again.
- The manual startbutton currently only works when a bosstimer is visible. (The timer will start automatically)

## Credits
Special thanks to [ZeroGwafa](https://github.com/ZeroGwafa) for his chat detection function, and [Skillbert](https://github.com/skillbert) for his help with making the bosstimer detection.