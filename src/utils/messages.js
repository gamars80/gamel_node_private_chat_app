const messageModel = require("../models/message_model");

const getToken = (sender, receiver) => {
    const key = [sender, receiver].sort().join("_");
    return key;
}

const saveMessages = async ({ from, to, message, time }) => {
    const token = getToken(from, to);
    const data = {
        from, message, time
    }
    messageModel.updateOne({ userToken: token }, {
        $push: { messages: data }
    }, (err, res) => {
        if (err) console.error(err);
        console.log('메시지가 업데이트되었습니다.');
    })

}


const fetchMessages = async (io, sender, receiver) => {
    const token = getToken(sender, receiver);
    const foundToken = await messageModel.findOne({userToken: token});

    console.log('foundToken:::'+foundToken);
    //대화 내역이 있다면
    if(foundToken) {
        console.log('dddddddddddddddd');
        io.to(sender).emit('stored-messages', {messages: foundToken.messages});
    }else{
        //대화를 한번도 한적이 없다면 객체랑 인스턴스 생성후 save한다
        const data = {
            userToken: token,
            messages: []
        }

        const message = new messageModel(data);
        const savedMessage = message.save();

        if(savedMessage) {
            console.log('메세지가 생성되었습니다');

        }else{
            console.log('메세지 생성에 실패했습니다.')
        }

    }
}
module.exports = {
    saveMessages,
    fetchMessages
}