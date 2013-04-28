var http = require('http');
require('date-utils');

var srv = new http.Server();
srv.on('request',requestClosure);
srv.listen(8888);
console.log("START");

function requestClosure(req,res){
    req.setEncoding('utf8');
    var data = "";
    req.on('data',function(d){data = data + d;})
    req.on('end',function(){
        var obj;
        try{
            obj = JSON.parse(data);
        }
        catch (e){
            var o = {error: e.toString()};
            res.end(JSON.stringify(o));
        }

        for (var i in obj){
            api(i,obj[i],function(err,r){
                if (err){
                    res.end(JSON.stringify({error:err.toString()}));
                    return;
                }
                res.end(JSON.stringify(r));
            });
        }
    })
}

function api(type,data,cb){
    console.log("api",type);
    switch (type){
        case "login":
            if (players[data.username]){
                cb(new Error("already logged in"));
                return;
            }
            players[data.username] = newPlayer(data.username);
            cb(null,{username:data.username});
            break;
        case "ping":
            ping(data);
            cb(null);
            break;
        case 'logout':
            logout(data);
            cb(null);
            break;
        case 'getValue':
            if (! players[data.username]){
                cb(new Error("bad username"));
                return;
            }
            cb(null,{value:players[data.username].value});
            break;
        case 'findMonster':
            if (! players[data.username]){
                cb(new Error("bad username"));
                return;
            }
            findMonster(data.username,cb);
            break;
        case 'getOnlinePlayers':
            cb(null,{players:players});
            break;
    }
}

var players = {};

function newPlayer(name){
    console.log('newPlayer',name);
    return {username:name,value:10,ping:new Date()};
}

function ping(data){
    console.log('ping',data.username);
    if (! players[data.username]) return;

    players[data.username].ping = new Date();
}

function logout(data){
    console.log('logout',data.username);
    delete players[data.username];
}

function logoutPing(){
    console.log('logoutPing');
    for (var i in players){
        if (players[i].ping.isAfter((new Date()).addMinutes(-3))){
            console.log('logoutPing name=',i);
            logout({username:i});
        }
    }
}

setInterval(logoutPing,3*60*1000);

function findMonster(username,cb){
    if (Math.random()<0.2){
        cb(null,{monster:{found:false}});
        return;
    }
    var monster = generateMonster(players[username]);
    var fightRes = fight(players[username],monster);
    cb(null,{monster:{found:true,unit:monster,fight:fightRes}});
}

function rand(l,r){
    return l + Math.random()*(r-l);
}

function generateMonster(player){
    var val = player.value + Math.floor(rand(-10,10));

    return {value:val};
}

function fight(player,opponent){
    var res = {};
    if (player.value > opponent.value){
        res.winner = "player";
        var lootRes = loot(player,opponent);
        player.value += lootRes.value;
        res.loot =  lootRes;
    }
    else {
        res.winner = "opponent";
    }
    return res;
}

function loot(player,opponent){
    return {value:Math.floor(Math.sqrt(opponent.value)) + 1}
}