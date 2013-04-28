$(document).ready(function(){
    $("#loginDiv").show();
    $("#loginBtn")
        .click(function(){
            var username = $("#loginText").val();
            console.log("ASD",username);
            login(username,function(err){
                if (error(err)){
                    return;
                }
                startGame();
            });
        })
        .removeAttr("disabled");

    function apiReq(data,cb){
        $.ajax("/api",{
            data:JSON.stringify(data),
            dataType:"json",
            contents:"json",
            cache:false,
            type:"POST",
            success:function(data,status,res){
                cb(null,data);
            },
            error:function(data,status,res){
                cb(new Error("AJAX status: "+status));
            }
        });
    }

    var username = "";

    function login(name,cb){
        apiReq({login:{username:name}},function(err,res){
            if (err){
                cb(err);
                return;
            }
            if (res.error || ! res.username){
                cb(new Error("bad res"));
            }

            console.log(res);
            username = res.username;

            cb(null,res);
        });
    }

    function startGame(){
        console.log("startGame");
        $("#gameDiv").show();
        $("#loginDiv").hide();
        story("Welcome, "+username);
        story("You are new here, and your total value is 10 for now");
        setInterval(ping,60*1000);
        getMyValue();
        showLogout();
        getOnline();
        $("#searchMonster").click(function(){
            findMonster();
        });
    }

    function showLogout(){
        $("#logoutBtn").click(function(){
            logout();
        })
            .show();
    }

    function getMyValue(){
        apiReq({getValue:{username:username}},function(err,res){
            if (error(err)) return;
            $("#myValueColon").show();
            $("#myValue").text(res.value);
        });
    }

    function logout(){
        apiReq({logout:{username:username}},function(err,res){
            $("#gameDiv").hide();
            $("#logoutBtn").hide();
            $("#loginDiv").show();
            $("#myValue").text();
            $("#story > .storyLine").remove();
            username = "";
            $("#loginText").val("");
        });
    }

    function error(err){
        if (!err) return false;
        console.log("ERR");
        $("#errorText").text(err.toString());
        return true;
    }

    function ping(){
        apiReq({ping:{username:username}},function(){});
    }

    function findMonster(){
        story("Searching for monsters");
        apiReq({findMonster:{username:username}},function(err,res){
            if (error(err)) return;

            if (! res.monster.found){
                story("No monster found");
                return;
            }

            story("Found monster ["+res.monster.unit.value + "]");
            if (res.monster.fight.winner == "player"){
                story("You win!");
                story("In loot you found ["+res.monster.fight.loot.value + "]");
            }
            else
                story("You lose!");

            getMyValue();
        });
    }

    function story(s){
        var n = $('<span class="storyLine"></span>');
        n.text(s);

        var storyO =$("#story");

        storyO.prepend(n);
        while (storyO.children().length > 16){
            $(storyO.children()[storyO.children().length - 1]).remove();
        }
    }

    function getOnline(){
        getOnlinePlayers(function(err,res){
            if (error(err)) return;

            $(".onlinePlayer").remove();

            var a = $();

            for (var i in res.players){
                console.log(i);
                a = a.add('<li class="onlinePlayer">'+i+'['+res.players[i].value+']</li>');
            }
            console.log("RRR",a);

            $("#onlinePlayers").append(a);
        });

        setTimeout(getOnline,60*1000);
    }

    function getOnlinePlayers(cb){
        apiReq({getOnlinePlayers:{}},cb);
    }
});