# Awesome Project Build with Sequelize

Steps to run this project:

1. Run `npm run dev` command


# Private 채팅앱 만들기
    필요 모듈 설치 :npm install express mongoose socket.io 
    npm install -D nodemon
    bootstrap 통화 ui 화면 구성
    
# express app 에 socketio 연동하기
    const http = require('http');
    const {Server} = require('socket.io');
    const server = http.createServer(app);
    const io = new Server(server);

# 클라이언트에서 서버 http 핸드쉐이크
    autoConnect 옵션 false : 클라이언트 접속시 바로 채팅서버 커넥션이 되면 안됨
    html 구성요소들 가져오는 전역변수들 생성

# MongoDb 연결
    mongoose.connect 통해 db 연결 
    mongoose 메세지 스키마 생성

# 유저 세션 생성
    유저 이름 입력 -> 채팅방입장 -> 서버에 유저세션 데이터 생성 -> 세션데이터를 이용해서 소캣 커넥트 -> 유저 리스트 나열
    로그인 폼 핸들러 작성
    입력한 유저아이디로 세션을 만들어 주고 성공시 소켓 커넥션을 시도한다
    io.use 로 socketio에 대한 미들웨어를 만들어서 username 과 userid를 socket객체에 넣어서 next한다
    
# 메세지 보낼 상대 선택하기
    사용자 리스트에서 특정 유저를 클릭하면 해당 유저의 액티브 클래스 스타일을 바꾸어 주고 메세지 입력창이 활성화 된다

# 메세지 보내기
    socket을 통해 메세지를 보내고 메세지 db에 넣기 위한 토큰 생성후 db에 메세지 저장후 메세지 영역에 표현한다
    그다음 리시버에게 메세지를 보낸다.
    리시버에세 notify 표현을 해준다.

# 채팅방 나가기
    채팅방을 나가는 message 타입을 선언하여 해당 메세지 타입을 받았을시
    해당 유저를 유저 리스트에서 없애고 대화 중이라면 대화창도 없앤다.

# 데이터베이스 대화내용 가져와서 보여주기
    fetch-message라는 이벤트로 db에서 가져온다
