# Twitch TV Show Game
Let's start with a special thanks to [Deinoka](https://www.twitch.tv/deinoka) for his request for this tool!

## What does it do?
The Twitch TV Show Game is a tool free to use by streamers to host the equivalent of TV Game shows with their viewers!

## How to use?
You can either [use the version I am hosting](http://jabe.ca/Tools/TwitchTVShow/) (use it for free) which will most-likely be the latest functionnal version or download everything and host it yourself! Personally, I really like using Laragon as a lightweb web server

## Import format
To use the new import function, you just have to upload a textfile, here are the available options:
- `#` Start a line with this to make a comment
- `channel=` This is the twitch channel to listen to
- `NEW` This adds a question
- `q=` This is the question
- `aX=` Where X ranges from 1 to 4, these are the answers, you need at least 2 answers but can add up to 4
- `value=` The value is the amount of point the question is worth
- `good=` This is the good answer, can be 1 to 4

Here's an example
```txt
# Config example
channel=fredyjabe
#
NEW
q=How many answers can you add?
a1=1
a2=2
a3=3
a4=4
value=2
good=4
# NEW creates a new question, but nothing else has a specific order
NEW
a2=False
good=1
q=Fredy is amazing.
value=5
a1=True
#
# Also, if you define a parameter more than once, the last one will be the one in effect
```

### Want to contribute?
Feel free to open Issues and Pull Requests if you see something wrong, I did that mostly as a learning experience to experiment with JavaScript.


Thank you for your interest and have fun hosting TV Shows! If you do a special event using this tool, feel free to hit me up either here of on discord so I can come by and say hi!

Discord: FredyJabe#5137
