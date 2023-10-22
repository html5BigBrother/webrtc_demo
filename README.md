# webrtc 入门
WebRTC（Web Real-Time Communications）是一项实时通讯技术，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流和（或）音频流或者其他任意数据的传输。WebRTC 包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，创建点对点（Peer-to-Peer）的数据分享和电话会议成为可能。

## 音视频通信为什么选择webrtc
### 自研

### webrtc的客户端架构
<img src="https://cdn.avdancedu.com/image/article/select_webrtc/webrtc_arch.jpg">
从WebRTC架构图中你可以了解到，它大体上可以分成四层：即接口层、Session层、核心引擎层和设备层。下面我就向你简要的介绍一下每一层的作用。
接口层包括两部分，一是Web层接口；二是Native层接口。也就是说，你既可以使用浏览器开发音视频直播客户端，也可以使用Native(C++、Android、OC等)开发音视频直播客户端。

Session层的主要作用是控制业务逻辑，如媒体协商、收集Candidate等，这些操作都是在Session层处理的。
核心引擎层包括的内容就比较多了。从大的方面说，它包括音频引擎、视频引擎和网络传输层。音频引擎层包括NetEQ、音频编解码器（如OPUS、iLBC)、3A等。视频引擎包括JitterBuffer、视频编解码器（VP8/VP9/H264)等。网络传输层包括SRTP、网络I/O多路复用、P2P等。

设备层主要与硬件打交道，它涉及的内容包括：在各终端设备上进行音频的采集与播放、视频的采集以及网络层等。这部分内容会在本书的最后一章 \textbf{WebRTC源码分析}中做详细介绍。
## webrtc架构

### NAT

### STUN

### ICE
webRTC的NAT穿透是一整个机制，我们管它叫ICE（Interactive Connectivity Establishment），是一个允许你的浏览器和对端浏览器建立连接的协议框架。在实际的网络当中，有很多原因能导致简单的从 A 端到 B 端直连不能如愿完成。这需要绕过阻止建立连接的防火墙，给你的设备分配一个唯一可见的地址（通常情况下我们的大部分设备没有一个固定的公网地址），如果路由器不允许主机直连，还得通过一台服务器转发数据。

### 生命周期
1. 呼叫者通过 navigator.mediaDevices.getUserMedia() (en-US) 捕捉本地媒体。
2. 呼叫者创建一个RTCPeerConnection 并调用 RTCPeerConnection.addTrack() (注： addStream 已经过时。)
3. 呼叫者调用 RTCPeerConnection.createOffer() 来创建一个提议 (offer).
4. 呼叫者调用 RTCPeerConnection.setLocalDescription() (en-US) 将提议 (Offer) 设置为本地描述 (即，连接的本地描述).
5. setLocalDescription() 之后，呼叫者请求 STUN 服务创建 ice 候选 (ice candidates)
6. 呼叫者通过信令服务器将提议 (offer) 传递至 本次呼叫的预期的接受者。
7. 接受者收到了提议 (offer) 并调用 RTCPeerConnection.setRemoteDescription() 将其记录为远程描述 (也就是连接的另一端的描述).
8. 接受者做一些可能需要的步骤结束本次呼叫：捕获本地媒体，然后通过RTCPeerConnection.addTrack()添加到连接中。
9. 接受者通过 RTCPeerConnection.createAnswer() (en-US) 创建一个应答。
10. 接受者调用 RTCPeerConnection.setLocalDescription() (en-US) 将应答 (answer) 设置为本地描述。此时，接受者已经获知连接双方的配置了。
11. 接受者通过信令服务器将应答传递到呼叫者。
12. 呼叫者接受到应答。
13. 呼叫者调用 RTCPeerConnection.setRemoteDescription() 将应答设定为远程描述。如此，呼叫者已经获知连接双方的配置了。

## 通信过程

### 媒体采集
### 媒体协商
### ICE连接
## 信令服务器
信令服务器就是webRTC之间传递消息的服务器，实现连接两端，主要作用就是各种转发。
- 让通信双方彼此交换网络信息
  - 最常见的是交换通信双方的IP地址和端口 - ICE Candidate
  - 两个WebRTC之间会尽可能选择P2P进行传输，同一个局域网内直接通过P2P进行传输，不同局域网内需要使用P2P穿越后进行数据传输，P2P穿越成功后直接传输，失败后进行中转等 - 后续的候选人中进行解说
- 通信双方交换媒体信息
  - 媒体信息用SDP来表示，这个SDP可以简单理解为：媒体类型的编码器是什么、是否支持该媒体类型和对应的编码器、编码方式是什么等
- 实现业务层管理
  - 如用户创建房间，加入房间，退出房间等
  - 确定何时初始化、关闭和修改通话会议，也可以进行错误报告
<img src="./static/img-signal-server.awebp">

## API

## 调试工具

## 媒体对象

## 简易demo
[https://github.com/html5BigBrother/webrtc_demo](https://github.com/html5BigBrother/webrtc_demo)

## 参考
[音视频通信为什么要选择WebRTC](https://blog.avdancedu.com/b363212d/)