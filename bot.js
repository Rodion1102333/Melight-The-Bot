const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
let config = require('./botconfig.json');
let token = config.token;
let prefix = config.prefix;
let profile = require('./profile.json');

fs.readdir('./cmds',(err,files)=>{
  if(err) console.log(err);
  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <=0) console.log("Нет комманд для загрузки!!");
  console.log(`Загружено ${jsfiles.lenght} комманд`);
  jsfiles.forEach((f,i) =>{
    let props = require(`./cmds/${f}`);
    console.log(`${i+1}.${f} Загружен!`);
    bot.commands.set(props.help.name,props);
  })
})


bot.on('ready', () => {
  console.log(`Запустился бот ${bot.user.username}`);
  bot.generateInvite(["ADMINISTRATOR"]).then(link => {
    console.log(link);
  })
});
bot.on('guildMemberAdd',(member)=>{
  let role = member.guild.roles.find('name',"[I]Новенький");
  member.addRole(role);
});
bot.on('message', async message => {
  if(message.author.bot) return;
  if(message.channel.type == "dm") return;
  let uid = message.author.id;
  bot.send = function (msg){
    message.channel.send(msg);
  }
  if(!profile[uid]) {
    profile[uid] ={
      coins: 10,
      warns:0,
      xp:0,
      lvl:0,
    };
  };
  let u = profile[uid];
  u.coins ++;
  u.xp++;
  if(u.xp>= (u.lvl * 5)){
    u.xp = 0;
    u.lvl += 1;
  }
  fs.writeFile('./profile.json',JSON.stringify(profile),(err) =>{
    if(err) console.log(err);
  });
  let user = message.author.username;
  let userid = message.author.id;
  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  if(!message.content.startsWith(prefix)) return;
  let cmd = bot.commands.get(command.slice(prefix.length));
  if(cmd) cmd.run(bot,message,args);
});

bot.on('messageUpdate', async (oldmsg, newmsg) => {
  let embed = new Discord.RichEmbed()
    .setAuthor('Сообщение изменено', newmsg.guild.iconURL)
    .addField('Отправитель', oldmsg.member, true)
    .addField('Канал', oldmsg.channel, true)
    .addField('Раньше', oldmsg.content)
    .addField('Сейчас', newmsg.content)
    .setColor('#FF8000')
    .setTimestamp()
  await oldmsg.channel.send(embed);
})

bot.on('guildMemberAdd', async member => {
  let role = member.guild.roles.find(r => r.name == "Community")
  let channel = member.guild.channels.find(c => c.name == 'actions')

})
var timer;
var i = 0;
  timer = bot.setInterval(function () {
    var gamePresence = [
      `Loading..`,
      `Creator : LarEon and Lava.js` ,      
      `Введи m.help и узнаешь мои команды!`,
      `Всего каналов: ${bot.channels.size}`,
      `Пользователей: ${bot.users.size}`,
      `Melight | Bot`,
      `За Сервером`,
      `Update |1.0|`
    ];
    bot.user.setPresence({ game: { name: gamePresence[i%gamePresence.length], type: 3 } });
    i++;
  },7500);

bot.login(token);

bot.on('message', async message => {
  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
  
  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: config.prefix
    };
  }

  let prefix = prefixes[message.guild.id].prefixes
  if(message.author.bot) return;
  if(message.channel.type === 'dm') return;
  if(!message.content.startsWith(prefix)) return;
})

bot.on('guildMemberAdd', member => {
  member.guild.channels.get('506904783039234048').send(`${member}  **залетел к нам , освободите место у стола.**`); 
});
bot.on('guildMemberRemove', member => {
  member.guild.channels.get('506904783039234048').send(`${member} **покинул нас, снимем шляпу.**`); 
});

//THIS MUST BE THIS WAY
bot.login(process.env.BOT_TOKEN)
