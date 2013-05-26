meblog
======

## Installation
To install meblog, you should have installed git(if not installed git, you can download the [zip](https://github.com/VitoLau/meblog/archive/master.zip) directly and unpack it) [Node.js](http://nodejs.org/) V0.10+ and [MongoDB](http://www.mongodb.org/) V2.4.1+.

if you have done above, see below please

### For Linux
1. clone the repo

        git clone git://github.com/VitoLau/meblog.git

2. cd meblog directory and install the dependences

        cd meblog & npm install

3. open a terminal and start the **mongoDB** daemon. **\*\*NOT**** close the terminal

        ./mongodb

4. open another terminal and start the app. **\*\*NOT**** close the terminal

        ./start

5. access <http://localhost:3000> for meblog :)

### For Windows
1. clone the repo

        git clone git://github.com/VitoLau/meblog.git

2. open a cmd, cd meblog directory and install the dependences

        cd /d meblog
        npm install

3. start the mongoDB daemon : double click **mongodb.bat**. **\*\*NOT**** close the window
4. start the app : double click **start.bat**. **\*\*NOT**** close the window
5. access <http://localhost:3000> for meblog :)

## TODO:
- [x] redister
- [x] login and logout
- [x] add kindEditor
- [x] post article
- [x] archive pagination for indexpage and userpage
- [x] post comment for visitor
- [x] comment page navigation
- [x] add comment gravatar
- [x] if the user has login, not show visitor input form
- [-] add post tags
- [-] user setting page to update own info
- [-] Visitor Gravatar cache
- [-] index show comment count

## License
Released under the MIT and GPL Licenses.