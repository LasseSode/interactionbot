
module.exports = {
  log:function(info){
    // info.message,info.type
    // console.log(info.type,info.message);
  },
  botCommands: [
    {
      command: 'help',
      callback: require('./src/help.js')
    },
    {
      command:'question',
      callback:require('./src/question.js')
    },
    {
      command:'like',
      callback:require('./src/like.js')
    },
    {
      command:'reexplain',
      callback:require('./src/reexplain.js')
    },
    {
      command:'lag',
      callback:require('./src/lag.js')
    },
    {
      command:'owner',
      callback:require('./src/owner.js')
    },
    {
      callback:require('./src/noCommand.js') // no right command,will call this function
    },
  ],
  apis: [
    { url: '/command', method: 'post', zoomType: 'command' },
    {
      url: '/auth',
      method: 'get',
      callback: require('./src/auth'),
      zoomType: 'auth'
    },
    {
      url:'/test',
      method:'get',
      callback:function(req,res){
        res.send('test success');
      }
    }
  ]
};
