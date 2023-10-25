
<template>
  <header>

    <div class="wrapper">
      <el-button @click="startLocal(1)">开启视频</el-button>
      <el-button @click="startLocal(2)">开启麦克风</el-button>
      <el-button @click="createPeer">创建peerConnection实例</el-button>
      <el-button @click="addTrack">往实例添加流轨道</el-button>
      <el-button @click="createOffer">createOffer创建本地媒体描述</el-button>
    </div>
  </header>

  <!-- <RouterView /> -->
</template>
<script setup>
import { ref, onMounted } from 'vue'

const ws = ref(null)
const localStrem = ref(null)
const pcInstance = ref(null)

onMounted(() => {
  ws.value = new WebSocket("ws://localhost:8888");
})
// 获取本地流
const startLocal = (type) => {
  
  let options = {}
  if (type === 1) {
    options.video = true
  }
  if (type === 2) {
    options.audio = true
  }
  navigator.mediaDevices.getUserMedia(options).then(stream => {
    console.log(stream)
    localStrem.value = stream
  })
}
// createPeer
const createPeer = () => {
  window.pcInstance = pcInstance.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }] })
  console.log(pcInstance.value)
  pcInstance.value.onicecandidate = (event) => {
    console.log('onicecandidate', event)
  }
  pcInstance.value.oniceconnectionstatechange = (event) => {
    console.log('oniceconnectionstatechange', event)
  }
  pcInstance.value.onicegatheringstatechange = (event) => {
    console.log('onicegatheringstatechange', event)
  };
}
// 往连接注入流轨道
const addTrack = () => {
  for (const track of localStrem.value.getTracks()) {
    pcInstance.value.addTrack(track, localStrem.value);
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
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
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
