const socket = io('http://localhost:8080', {
    autoConnect: false
})

//이벤트가 발생시맏 어떠한 이벤트와 args가 넘어오는지 모니터링용 로그
socket.onAny((event, ...args) => {
    console.log(event, ...args);
})

//전역변수들 선언
const chatBody = document.querySelector('.chat-body');
const userTitle = document.querySelector('#user-title');
const loginContainer = document.querySelector('.login-container');
const userTable = document.querySelector('.users');
const userTagline = document.querySelector('#users-tagline');
const title = document.querySelector('#active-user');
const messages = document.querySelector('.messages');
const messageDiv = document.querySelector('.msg-form'); 

//로그인 폼 핸들러
const loginForm = document.querySelector('.user-login');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username');
    createSession(username.value.toLowerCase());
    username.value = '';
})

const createSession = async (username) => {
    const options = {
        method: 'Post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    }
    await fetch('/session', options)
    .then(res => res.json())
    .then(data => {
       
        socketConnect(data.username, data.userID);

        //세션 데이터를 로컬스토리지에 저장
        localStorage.setItem('session-username', data.username);
        localStorage.setItem('session-userID', data.userID);
        
        loginContainer.classList.add('d-none');
        chatBody.classList.remove('d-none');
       
        userTitle.innerHTML = data.username;
    })
    .catch(err => console.log(err));
}

const socketConnect = async (username, userID) => {
  
    socket.auth = {username, userID};
    await socket.connect();
}

const setActiveUser = (element, username, userID) => {
    title.innerHTML = username;
    title.setAttribute('userID', userID);

    const lists = document.getElementsByClassName('socket-users');
    for(let i=0; i<lists.length; i++) {
        lists[i].classList.remove('table-active');
    }

    element.classList.add('table-active');

    //사용자 선택후 메세지 영역 표시
    messageDiv.classList.remove('d-none');
    messages.classList.remove('d-none');
    messages.innerHTML = '';
    socket.emit('fetch-messages', {receiver: userID});

    const notify = document.getElementById(userID);
    notify.classList.add('d-none');

}

const appendMessage = ({message, time, background, position}) => {
    console.log('time:'+time);
    let  div = document.createElement('div');
    div.classList.add('message', 'bg-opacity-25', 'm-2', 'px-2', 'py-1', background, position);
    div.innerHTML = `<span class="msg-text">${message}</span><span class="msg-time">${time}</span>`;
    messages.append(div);
    messages.scrollTo(0, messages.scrollHeight);
}


socket.on('users-data', ({ users }) => {
    // 자신은 제거하기  
    const index = users.findIndex(user => user.userID === socket.id);
    if (index > -1) {
        users.splice(index, 1);
    }

    // user table list 생성하기
    userTable.innerHTML = '';
    let ul = `<table class="table table-hover">`;
    for (const user of users) {
        ul += `<tr class="socket-users" onclick="setActiveUser(this, '${user.username}', '${user.userID}')"><td>${user.username}<span class="text-danger ps-1 d-none" id="${user.userID}">!</span></td></tr>`
    }
    ul += `</table>`;
    if (users.length > 0) {
        userTable.innerHTML = ul;
        userTagline.innerHTML = '접속 중인 유저';
        userTagline.classList.remove('text-danger');
        userTagline.classList.add('text-success');
    } else {
        userTagline.innerHTML = '접속 중인 유저 없음';
        userTagline.classList.remove('text-success');
        userTagline.classList.add('text-danger');
    }
})

socket.on('user-away', userID => {
    const to = title.getAttribute('userID');
    if (to === userID) {
        title.innerHTML = '&nbsp;';
        messageDiv.classList.add('d-none');
        messages.classList.add('d-none');
    }
})
const sessionUsername = localStorage.getItem('session-username');
const sessionUserID = localStorage.getItem('session-userID');


console.log('sessionUsername::'+sessionUsername);
console.log('sessionUserID:::'+sessionUserID);

if(sessionUsername && sessionUserID) {
    socketConnect(sessionUsername, sessionUserID);

    loginContainer.classList.add('d-none');
    chatBody.classList.remove('d-none');
    userTitle.innerHTML = sessionUsername;
}


const msgForm = document.querySelector('.msgForm');
const message = document.getElementById('message');

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const to = title.getAttribute('userID');
    const time = new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    })

    //메세지 payload 만들기
    const payload = {
        from: socket.id,
        to,
        message: message.value,
        time
    }

    console.log('payload:'+ payload)
    socket.emit('message-to-server', payload);

    appendMessage({
        ...payload, background:'bg-success', position:'right'
    })

    message.value = '';
    message.focus(); 
    message.scrollTo(0,messages.scrollHeight);

})

socket.on('message-to-client', ({from, message, time}) => {
    const receiver = title.getAttribute('userID');
    const notify = document.getElementById(from);

    if(receiver === null ) {
        notify.classList.remove('d-none');

    }else if(receiver === from) {
        //상대방일 경우에만 메세지를 append 해준다
        appendMessage({
            message: message,
            time,
            background: 'bg-secondary',
            position: 'left'
        })
    }else{
        notify.classList.remove('d-none');
    }


})

socket.on('stored-messages', ({messages}) => {
    console.log(message);
    console.log(messages.length);
    if(messages.length > 0 ){
        messages.forEach(msg => {
            const payload = {
                message: msg.message,
                time: msg.time
            }
            //내가 보낸거
            if(msg.from === socket.id) {
                appendMessage({
                    ...payload,
                    background: 'bg-success',
                    position: 'right'
                })
            }else{
                //상대방이 보낸거
                appendMessage({
                    ...payload,
                    background: 'bg-secondary',
                    position: 'left'
                })
            }
        });
    }
})