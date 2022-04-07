# SusAlert
SusAlert is an alt1 toolkit app for the croesus fight, it keeps track of croesus' attacks and gives you onscreen warnings.

![SusAlert-MainWindow](/assets/mainscreen.png)

## How to use
SusAlert is very easy to use, simply install and open the plugin in alt1 toolkit. The plugin will automatically detect when the croesus fight starts or ends.

The timer may drift after the mid fungi (attack) phase, to prevent this you can manually click the sync button (or press alt + 1) when the mid fungi dies. It's also possible to customize the default delays & timings in the plugin settings.

## Requirements
To function SusAlert needs the following:
- Alt1 toolkit must be installed, you can install that [here](https://runeapps.org/alt1).
- The bosstimer must be visible on-screen, this can be changed in Gameplay Settings > Interfaces > Information Windows > Boss kill timer.
- Chatwindow MUST be opaque (0% transparency), this can be changed in the Gameplay Settings > 
Interfaces > Appearance > Transparency.
- Interface scaling needs to be at 100% (this is the default).
- Game messages need to be turned on (plugin is tested with fontsize 12).

## Installation
To install SusAlert copy & paste this link into your browser:<br/>
[alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json](alt1://addapp/https://raphire.github.io/SusAlert/appconfig.json)

Or go to this URL in the alt1 browser:<br/>
https://raphire.github.io/SusAlert/

## Known issues
- The timer can go out of sync after the mid energy fungus appears. This can be manually synced by clicking the button that appears or pressing alt + 1 when the mid energy fungus dies.

## Credits
Special thanks to [ZeroGwafa](https://github.com/ZeroGwafa) for his chat detection function, and [Skillbert](https://github.com/skillbert) for his help with making the bosstimer detection.
