#### Overview
This is for my personal usage. I have few React projects (started with `CRA template`) with lot of unused files. 

This project will help me to track all unused files at anytime.

#### Usage
```
# Setup
$ git clone https://github.com/ritwickdey/track-death-js-code.git
$ cd track-death-js-code && yarn install

# Run
node . /Users/<YOUR_PATH>/cra-project/src/index.js  
```

Output for my case

```
...
Checked: 454 files, remaining: 2
Checked: 455 files, remaining: 2
Checked: 456 files, remaining: 1
Checked: 457 files, remaining: 0

Note: Test files are excluded

Used JS Files: 457, ununsed: 81, Total:538

Used JS Files: 457, ununsed: 81, Total:538
Logs are generated into /Users/<GIT_CLONE_PATH>/track-death-js-code/log
```

> Note: by default, Test files are excluded. [... and can be changed from here](./index.js#L8)