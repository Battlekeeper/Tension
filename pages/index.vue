<script setup lang="ts">
import { response } from "express";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
//@ts-ignore
import Cookie from "js-cookie"
import TUser from "Backend/Models/TUser";
import TServer from "Backend/Models/TServer";
import memberList from "../components/memberList.vue"
import channelList from "../components/channelList.vue"
import serverList from "../components/serverList.vue"
import messageArea from "../components/messageArea.vue";
import primaryButton from "../components/assets/buttons/primary.vue"
import TChannel from "Backend/Models/TChannel";
import { mergeProps } from "nuxt/dist/app/compat/capi";


const router = useRouter();
const token = ref(Cookie.get("token"))
const currentUser:Ref<TUser> = ref(undefined as unknown as TUser)
const currentServer:Ref<TServer> = ref(undefined as unknown as TServer)
const currentChannel:Ref<TChannel> = ref(undefined as unknown as TChannel)


const loading = ref(true)
const softload = ref(true)

var socket = io('ws://localhost:3001') as unknown as Socket<DefaultEventsMap, DefaultEventsMap>
socket.on('connect', async ()=>{
    socket.emit("auth", token.value, async (response:boolean, user:TUser) => {
        if (!response){
            window.location.href = "/login"
            return
        }
        currentUser.value = user
        loading.value = false
        softload.value = false
    })
    socket.on("userUpdate", (user:TUser) => {
        loading.value = true
        if (!user.servers.find(x => x == currentServer.value._id.toString())){
            //@ts-ignore
            currentServer.value = undefined
            //@ts-ignore
            currentChannel.value = undefined
        }
        currentUser.value = user
        nextTick(()=>{
            loading.value = false
        })
    })
})

watch(loading, async () => {
    if (!loading.value){
        getUser(socket, "64dbd32fdcdd7f4f9b44ee49")
    }
})

watch(currentServer, ()=>{
    if (!currentServer.value){
        return
    }
    //@ts-ignore
    socket.off("serverUpdate");
    socket.emit("registerServerUpdate", currentServer.value._id.toString())
    socket.on("serverUpdate", async ()=>{
        softload.value = true
        var channels = await getServerChannels(socket, currentServer.value)
        if (channels.find(chnl => chnl._id == currentChannel.value?._id)){
            //@ts-ignore
            currentChannel.value = channels.find(chnl => chnl._id == currentChannel.value?._id)
        }
        currentServer.value = await getServer(socket, currentServer.value._id.toString())
        nextTick(()=>{
            softload.value = false
        })
    })
})
</script>

<template>
    <div v-if="!loading" class="flex" style="height: 100svh; width: 100svw;">
        <serverList :loading=loading :socket=socket :currentUser=currentUser :currentServer=currentServer :currentChannel=currentChannel @serverSelect="(server) => currentServer = server"></serverList>
        <channelList :loading=loading :socket=socket :currentUser=currentUser :currentServer=currentServer :currentChannel=currentChannel @channelSelect="(channel) => currentChannel = channel"></channelList>
        <messageArea :loading=loading :socket=socket :currentUser=currentUser :currentServer=currentServer :currentChannel=currentChannel></MessageArea>
        <memberList :loading=loading :softload=softload :socket=socket :currentUser=currentUser :currentServer=currentServer :currentChannel=currentChannel></memberList>
    </div>
</template>