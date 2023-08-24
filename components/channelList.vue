<script setup lang="ts">
import TChannel from 'Backend/Models/TChannel';
import TServer from 'Backend/Models/TServer';
import TUser from 'Backend/Models/TUser';
import { AutoEncryptionLoggerLevel } from 'mongodb';
import { server } from 'process';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import PrimaryButton from "../components/assets/buttons/primary.vue"
import SecondaryButton from "../components/assets/buttons/secondary.vue"
import WarningButton from "../components/assets/buttons/warning.vue"



const props = defineProps(["loading","socket","currentUser", "currentServer"])
const emits = defineEmits(["channelSelect"])
var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket
const channels:Ref<Array<TChannel>> = ref<Array<TChannel>>([])
const currentChannel = ref<TChannel>()
const serverSettingsModal = ref(false)
const userSettingsModal = ref(false)

const channelsToDelete: Ref<Array<TChannel>> = ref([])
const channelsToRename: Ref<Array<TChannel>> = ref([])
const serverRename = ref()
const channelsToAdd:Ref<Array<string>> = ref([])
const chnlToadd = ref()
const newDisplayName = ref(props.currentUser.displayName)

async function loaded(){
    if (!props.loading && props.currentServer != undefined)
    {
        //@ts-ignore
        channels.value = await getServerChannels(socket, props.currentServer)
        if (currentChannel.value)
        {
            if (channels.value.find(x => x._id == currentChannel.value?._id)){
                currentChannel.value = channels.value.find(x => x._id == currentChannel.value?._id)
            } else {
                currentChannel.value = channels.value[0]
            }
        } else {
            currentChannel.value = channels.value[0]
        }
        
        emits('channelSelect', currentChannel.value)
        serverRename.value = props.currentServer.name
        channelsToDelete.value = []
        channelsToRename.value = []
        channelsToAdd.value = []
    }
}
function channelClicked(channel:TChannel){
    if (channel.isVoice)
    {
        socket.emit('roomVoiceListen', channel._id.toString())
    }
    else
    {
        currentChannel.value = channel; 
        emits('channelSelect', channel)
    }
}
function channelDrop(event:any)
{
    console.log("drop")
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    const sourceElement = document.getElementById(sourceId);
    const targetElement = event.target;

    // Reorder the elements by swapping their positions
    if (sourceElement !== targetElement) {
      const parent = targetElement.parentNode;
      const targetIndex = [...parent.children].indexOf(targetElement);
      const sourceIndex = [...parent.children].indexOf(sourceElement);

      parent.insertBefore(sourceElement, targetIndex > sourceIndex ? targetElement.nextSibling : targetElement);
    }
}

function channelRename(event:any, chnl:TChannel){
    channelsToRename.value = channelsToRename.value.filter(x => x._id != chnl._id)
    var temp = JSON.parse(JSON.stringify(chnl)) as TChannel
    temp.name = event.target.value
    channelsToRename.value.push(temp)
}

async function applyChanges(){
    for (let index = 0; index < channelsToDelete.value.length; index++) {
        const chnl = channelsToDelete.value[index];
        //@ts-ignore
        deleteServerChannel(socket, props.currentServer, chnl)
    }
    channelsToDelete.value = []

    for (let index = 0; index < channelsToRename.value.length; index++) {
        const chnl = channelsToRename.value[index];
        //@ts-ignore
        renameServerChannel(socket, chnl)
    }
    channelsToRename.value = []

    for (let index = 0; index < channelsToAdd.value.length; index++) {
        const chnl = channelsToAdd.value[index];
        //@ts-ignore
        addServerChannel(socket, props.currentServer, chnl)
    }
    channelsToAdd.value = []
    if (serverRename.value != props.currentServer.name)
    {
        //@ts-ignore
        setServerName(socket, props.currentServer, serverRename.value)
    }

    serverSettingsModal.value = false

}

function updateUserSettings(){
    userSettingsModal.value = false
    //@ts-ignore
    setUserDisplayName(socket, newDisplayName.value)
}

async function leaveServer() {
    //@ts-ignore
    leaveUserServer(socket, props.currentServer)
    serverSettingsModal.value = false
}
loaded()
watch(props, async ()=>{
    loaded()
})
</script>

<template>
    <div v-if="currentServer != undefined" class="w-[240px] min-w-[240px] flex flex-col gap-2 justify-between">
        <div class="flex flex-col gap-2">
            <div class="cursor-pointer mb-5 w-full h-[44px] flex flex-col justify-center bg-accent rounded-2xl rounded-t-none">
                <h1 @click="serverSettingsModal = true" class="font-bold text-gray-300 text-center select-none">{{props.currentServer.name}}</h1>
            </div>
            <div class="flex flex-col gap-2 overflow-x-scroll">
                <div draggable="false" v-if="!loading && currentServer != undefined" v-for="channel in channels">
                    <div @click="channelClicked(channel)" class="flex justify-center items-center w-full h-[34px]">
                        <div :class="{'bg-accent': currentChannel == channel}" class="flex items-center gap-4 w-full h-full rounded-md px-2 cursor-pointer">
                            <svg width="24" height="24" viewBox="0 0 24 24" class="icon-2W8DHg" aria-hidden="true" role="img"><path fill="#d1d5db" fill-rule="evenodd" clip-rule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path></svg>
                            <h1 class="text-gray-300 font-semibold select-none">{{channel.name}}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div @click="userSettingsModal = true" class="cursor-pointer mt-5 w-full h-[44px] flex flex-col justify-center bg-accent rounded-2xl rounded-b-none">
            <div class="flex gap-2 items-center m-2">
                <div class="flex bg-accent rounded-full w-[35px] h-[35px] justify-center items-center border-2 border-gray-300">
                    <p class="text-gray-300">{{props.currentUser.displayName[0]}}</p>
                </div>
                <p class="text-center text-gray-300 w-fit h-fit">{{props.currentUser.displayName}}</p>
            </div>
        </div>
    </div>
    <div v-else class="w-[240px] min-w-[240px] flex flex-col gap-2">
        <div class="flex-end">{{props.currentUser.name}}</div>
    </div>
    <Modal v-if="serverSettingsModal" @close="serverSettingsModal = false; channelsToDelete = []; channelsToRename = [];">
        <div class="flex rounded-md bg-accent p-4 gap-2 h-[400px] w-full">
            <div class="flex flex-col gap-2 justify-between">
                <div class="flex flex-col gap-2">
                    <p class="text-gray-300 font-semibold">Edit Server Channels</p>
                    <div class="flex flex-col gap-2 overflow-scroll">
                        <div class="flex justify-center items-center" v-for="chnl in channels">
                            <input :disabled="channelsToDelete.includes(chnl)" :value="channelsToRename.find(x => x._id == chnl._id)?.name || chnl.name" @keyup="channelRename($event, chnl)" class="border-2" :class="{'border-red-500': channelsToDelete.includes(chnl)}">
                            <svg @click="channelsToDelete = channelsToDelete.filter(x=> x._id != chnl._id); channelsToDelete.push(chnl)" xmlns="http://www.w3.org/2000/svg" class="pt-1 cursor-pointer" viewBox="0 0 32 40" x="0px" y="0px" width="30" height="30">
                                <g>
                                    <path fill="#ef4444" d="M25,5H21V4a2,2,0,0,0-2-2H13a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V9a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM19,5H13V4h6ZM7,27a3,3,0,0,0,3,3H22a3,3,0,0,0,3-3V13H7Zm11-9a1,1,0,0,1,2,0v7a1,1,0,0,1-2,0Zm-6,0a1,1,0,0,1,2,0v7a1,1,0,0,1-2,0Z" />
                                </g>
                            </svg>
                        </div>
                        <div class="flex justify-center items-center" v-for="chnl in channelsToAdd">
                            <input disabled="true" :value="chnl" class="border-2">
                            <svg @click="channelsToAdd = channelsToAdd.filter(x=> x != chnl);" xmlns="http://www.w3.org/2000/svg" class="pt-1 cursor-pointer" viewBox="0 0 32 40" x="0px" y="0px" width="30" height="30">
                                <g>
                                    <path fill="#ef4444" d="M25,5H21V4a2,2,0,0,0-2-2H13a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V9a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM19,5H13V4h6ZM7,27a3,3,0,0,0,3,3H22a3,3,0,0,0,3-3V13H7Zm11-9a1,1,0,0,1,2,0v7a1,1,0,0,1-2,0Zm-6,0a1,1,0,0,1,2,0v7a1,1,0,0,1-2,0Z" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                <WarningButton @click="leaveServer()" :wfull="true">Leave Server</WarningButton>
            </div>
            <div class="flex flex-col gap-2 ">
                <p class="text-gray-300 font-semibold">Edit Server Name</p>
                <input v-model="serverRename">
                <p class="text-gray-300 font-semibold">Server Id:</p>
                <p class="text-gray-300 font-semibold">{{currentServer._id}}</p>
            </div>
            <div class="flex flex-col gap-2 justify-between">
                <div class="flex flex-col gap-2">
                    <p class="text-gray-300 font-semibold">Add Server Channel</p>
                    <input v-model="chnlToadd" placeholder="Enter Channel Name">
                    <PrimaryButton @click="channelsToAdd = channelsToAdd.filter(x => x != chnlToadd) ;channelsToAdd.push(chnlToadd);channelsToAdd = channelsToAdd.filter(x => (x != '' && x != undefined)); chnlToadd = undefined">Add Channel</PrimaryButton>
                </div>
                <div class="flex flex-col gap-2">
                    <SecondaryButton @click="serverSettingsModal = false; channelsToDelete = []; channelsToRename = []; channelsToAdd = [];" :wfull=true>Cancel Changes</SecondaryButton>
                    <PrimaryButton @click="applyChanges()">Apply Changes</PrimaryButton>
                </div>
            </div>
        </div>
    </Modal>
    <Modal v-if="userSettingsModal" @close="userSettingsModal = false">
        <div class="flex flex-col rounded-md bg-accent p-4 gap-2 h-[400px] w-full justify-between">
            <div class="flex flex-col">
                <p class="text-gray-300 font-semibold">Change Display Name</p>
                <input v-model="newDisplayName">
            </div>
            <div class="flex flex-col gap-2">
                <SecondaryButton @click="userSettingsModal = false; newDisplayName = currentUser.displayName" :wfull=true>Cancel Changes</SecondaryButton>
                <PrimaryButton @click="updateUserSettings()">Apply Changes</PrimaryButton>
            </div>
        </div>
    </Modal>
</template>