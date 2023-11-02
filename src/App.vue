
<template>
  <header>
    <div class="wrapper">
      <el-row style="margin-top: 20px;">信令消息发送：</el-row>
      <el-row style="margin-top: 20px;">
        <el-button @click="clickUser('user1')">通知websocket我的身份1</el-button>
        <el-button @click="clickUser('user2')">通知websocket我的身份2</el-button>
        <el-button @click="sendSDP">发送媒体描述</el-button>
        <el-button @click="sendIce">发送ice信息</el-button>
      </el-row>
      <el-row style="margin-top: 20px;">媒体采集：</el-row>
      <el-row style="margin-top: 20px;">
        <el-button @click="startLocal(1)">采集视频</el-button>
        <el-button @click="startLocal(2)">采集麦克风</el-button>
        <el-button @click="startLocal(3)">采集屏幕</el-button>
      </el-row>
      <el-row style="margin-top: 20px;">媒体协商：</el-row>
      <el-row style="margin-top: 20px;">
        <el-button @click="createPeer">创建peerConnection实例</el-button>
        <el-button @click="addTrack">往实例添加媒体轨道</el-button>
        <el-button @click="createOffer">createOffer创建本地媒体描述</el-button>
      </el-row>
      <el-row style="margin-top: 20px;">
        <el-button @click="addRemoteSDP">添加对端媒体描述</el-button>
        <el-button @click="createAnswer">createAnswer应答对方媒体描述</el-button>
      </el-row>
      <el-row style="margin-top: 20px;">ICE交互：</el-row>
      <el-row style="margin-top: 20px;">
        <el-button @click="addRemoteIce">添加对端ice</el-button>
      </el-row>

      
      <el-row style="margin-top: 50px;">
        <span>对端流：</span>
        <video id="remoteVideo"></video>
      </el-row>
    </div>
  </header>

  <!-- <RouterView /> -->
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'

const ws = ref(null)
const userName = ref(null)
const pcInstance = ref(null)
const localStream = ref(null)
const localIceList = ref(null)

const remoteSDP = ref(null)
const remoteIceList = ref(null)

const remoteUser = computed(() => userName.value === 'user1' ? 'user2' : 'user1')

onMounted(() => {
  ws.value = new WebSocket("ws://localhost:9999");
  const iceList = []
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log('data', data)
    if (data.type === 'offer') {
      remoteSDP.value = data.offer
    }
    if (data.type === 'answer') {
      remoteSDP.value = data.offer
    }
    if (data.type === 'candidate') {
      iceList.push(data.candidate)
      remoteIceList.value = iceList
    }
  }
})
// clickUser
const clickUser = (user) => {
  userName.value = user
  ws.value.send(JSON.stringify({ type: 'login', name: user }))
}
// 获取本地流
const startLocal = (type) => {

  let options = {}
  if (type === 1) {
    options.video = true
  }
  if (type === 2) {
    options.audio = true
  }
  if (type === 3) {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then(stream => {
      console.log(stream)
      window.localStream = localStream.value = stream
    })
    return
  }
  navigator.mediaDevices.getUserMedia(options).then(stream => {
    console.log(stream)
    window.localStream = localStream.value = stream
  })
}
// 创建pc实例
const createPeer = () => {
  window.pcInstance = pcInstance.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }] })
  console.log(pcInstance.value)
  const iceList = []
  pcInstance.value.onicecandidate = (event) => {
    console.log('onicecandidate', event)
    if (event.candidate) {
      iceList.push(event.candidate)
      localIceList.value = iceList
    }
  }
  pcInstance.value.oniceconnectionstatechange = (event) => {
    console.log('oniceconnectionstatechange', event)
  }
  pcInstance.value.onicegatheringstatechange = (event) => {
    console.log('onicegatheringstatechange', event)
  };

  pcInstance.value.ontrack = (event) => {
    console.log('ontrack', event)
    const remoteVideo = document.getElementById('remoteVideo')
    remoteVideo.srcObject = event.streams[0]
    remoteVideo.onloadedmetadata = function (e) {
      remoteVideo.play();
    };
    event.track.onmute = function (ev) {
      console.log("Remote track muted:", ev);
    };
    event.track.onunmute = function (ev) {
      console.log("Remote track flowing again:", ev);
    };
  }
}
// 往连接注入流轨道
const addTrack = () => {
  for (const track of localStream.value.getTracks()) {
    pcInstance.value.addTrack(track, localStream.value);
  }
  console.log(pcInstance.value.getTransceivers())
}
// createOffer
const createOffer = () => {
  pcInstance.value.createOffer().then(offer => {
    console.log(offer)
    pcInstance.value.setLocalDescription(offer)
  })
}
// createAnswer
const createAnswer = () => {
  pcInstance.value.createAnswer().then(answer => {
    console.log(answer)
    pcInstance.value.setLocalDescription(answer)
  })
}

// 发送媒体描述给对端
const sendSDP = () => {
  ws.value.send(JSON.stringify({ type: 'offer', name: remoteUser.value, offer: pcInstance.value.localDescription }))
}
// 发送ice到对端
const sendIce = () => {
  localIceList.value.forEach(candidate => {
    ws.value.send(JSON.stringify({ type: 'candidate', name: remoteUser.value, candidate }))
  })
}


// 添加对端sdp
const addRemoteSDP = () => {
  pcInstance.value.setRemoteDescription(remoteSDP.value)
}
// 添加对端ice
const addRemoteIce = () => {
  remoteIceList.value.forEach(candidate => {
    pcInstance.value.addIceCandidate(candidate)
  })
}

</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    width: 90vw;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
