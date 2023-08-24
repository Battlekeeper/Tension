<script setup lang="ts">
import TMessage from 'Backend/Models/TMessage';
import TServer from 'Backend/Models/TServer';
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { isThisTypeNode } from 'typescript';

const props = defineProps(["loading","socket","currentUser", "currentChannel", "currentServer"])
var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket
const message = ref<string>("")
const messageBox = ref()
const showPlaceholder = ref(true)
const currentMessageIndex = ref(30)
const messages:Ref = ref([])
const messageContainer = ref()
const pauseScroll:Ref = ref(false)

function checkScrollHeight(event:any) {
    if (messageContainer.value.scrollTop + messageContainer.value.clientHeight >= messageContainer.value.scrollHeight){
        pauseScroll.value = false
    } else {
        pauseScroll.value = true
    }
}

async function loaded(){
    if (!props.loading && props.currentChannel != undefined)
    {
        //@ts-ignore
        var messagesRaw = await getChannelMessages(socket, props.currentChannel, 0, 30)
        messagesRaw = messagesRaw.reverse()
        messages.value = []

        for (let index = 0; index < messagesRaw.length; index++) {
            var message = messagesRaw[index];
            var obj:any = {} 
            //@ts-ignore
            obj.user = await getUser(socket, message.authorId)
            obj.message = message
            messages.value.unshift(obj)
        }

        socket.off("reciveMessage");
        socket.emit("roomMessageListen", props.currentChannel._id.toString())
        socket.on("reciveMessage", async (message:TMessage) => {
            var obj:any = {} 
            //@ts-ignore
            obj.user = await getUser(socket, message.authorId)
            obj.message = message
            messages.value.unshift(obj)  
        })
    }
}
loaded()
watch(props, async ()=>{
    loaded()
})

onUpdated(()=>{
    if(!pauseScroll.value && messageContainer.value != undefined){
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
})

function keypress(event:any) {
    if (event.key == "Enter" && !event.shiftKey)
    {
        if (message.value == ""){
            event.preventDefault()
            return
        }
        //@ts-ignore
        sendMessage(socket, props.currentChannel,message.value)
        if (messageContainer.value != undefined)
        {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight
        }
        
        messageBox.value.innerText = ""
        showPlaceholder.value = true
    } else {
        message.value = messageBox.value.innerText
        if (message.value.length != 0)
        {
            showPlaceholder.value = false
        } else {
            showPlaceholder.value = true
        }
    }
}
</script>
<style>
.custom-scroll::-webkit-scrollbar {
    width: 8px;
    background-color: none;
  }
  
  .custom-scroll::-webkit-scrollbar-track {
    background: #4F518C;
    border-radius: 5px;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: #907AD6;
    border-radius: 10px;
  }
</style>

<template>
    <div v-if="currentServer != undefined" class="flex w-full flex-col p-4 pb-8 gap-4">
        <div ref="messageContainer" @scroll="checkScrollHeight($event)" class="flex flex-col-reverse grow overflow-y-scroll custom-scroll">
            <div v-for="message in messages" class="flex flex-col">
                <div class="flex gap-3 items-center">
                    <div class="flex bg-accent rounded-full w-[40px] h-[40px] justify-center items-center">
                        <h1 class="text-gray-300">{{message.user.displayName[0]}}</h1>
                    </div>
                    <h1 class="text-gray-300 font-bold">{{message.user.displayName}}</h1>
                    <h1 class="text-gray-500">{{new Date(message.message.timestamp).toLocaleString()}}</h1>
                </div>
                <div class="ml-[52px]">
                    <p class="text-white whitespace-pre-wrap bg-none">
                        {{message.message.content}}
                    </p>
                </div>
            </div>
        </div>
        <div class="flex w-full min-h-[44px] bg-accent rounded-lg text-white px-4 break-all">
            <div ref="messageBox" @keyup="keypress($event)" style="max-height: 50svh; overflow-y: scroll;" spellcheck="true" autocorrect="off" contenteditable="true" class="z-10 py-2 grow outline-none bg-transparent leading text-xl"></div>
            <div v-if="showPlaceholder" style="max-height: 50svh;" class="absolute py-2 grow outline-none bg-transparent leading text-xl font-thin">Enter Message Here</div>
        </div>
    </div>
    <div v-else class="flex flex-col w-full items-center justify-center">
        <div class="flex flex-col items-center justify-center gap-4">
            <p class="text-gray-300 font-bold">Welcome to</p>
            <h1 class="text-center text-white font-bold tracking-[25px] lg:tracking-[38px] ml-[50px] whitespace-nowrap">-TENSION-</h1>
        </div>
    </div>
</template>