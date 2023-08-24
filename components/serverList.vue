<script setup lang="ts">
import TServer from 'Backend/Models/TServer';
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import PrimaryButton from '../components/assets/buttons/primary.vue'
import SecondaryButton from '../components/assets/buttons/secondary.vue'

const props = defineProps(["loading","socket","currentUser", "currentServer"])
const emits = defineEmits(["serverSelect"])

var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket
const servers:Ref<Array<TServer>> = ref<Array<TServer>>([])
const joinServerMenu = ref(false)
const joinServerId = ref()
const newServerName = ref()

async function loaded(){
    if (!props.loading)
    {
        //@ts-ignore
        servers.value = await getUserServers(socket, props.currentUser)
    }
}
function joinServer()
{
    joinServerMenu.value = false
    //@ts-ignore
    joinUserServer(socket, joinServerId.value)
    joinServerId.value = undefined
}

function createServer()
{
    joinServerMenu.value = false
    //@ts-ignore
    createUserServer(socket, newServerName.value)
    newServerName.value = undefined

}

loaded()
watch(props, async ()=>{
    //loaded()
})
</script>

<template>
    <div class="w-[72px] min-w-[72px] flex flex-col gap-2 p-2">
        <div v-if="currentServer == undefined" class="flex border-2 border-gray-300 justify-center items-center rounded-full bg-accent w-[56px] h-[56px] cursor-pointer">
            <img src="/images/tension.png">
        </div>
        <div v-else @click="$emit('serverSelect', undefined)" class="flex justify-center items-center rounded-full bg-accent w-[56px] h-[56px] cursor-pointer">
            <img src="/images/tension.png">
        </div>
        <div v-for="server in servers">
            <div v-if="server != currentServer" @click="$emit('serverSelect', server)" class="flex justify-center items-center rounded-full bg-accent w-[56px] h-[56px] cursor-pointer">
                <h1 class="select-none text-gray-300 font-bold text-center">{{server.name[0]}}</h1>
            </div>
            <div v-else class="flex border-2 border-gray-300 justify-center items-center rounded-full bg-accent w-[56px] h-[56px] cursor-pointer">
                <h1 class="select-none text-gray-300 font-bold text-center">{{server.name[0]}}</h1>
            </div>
        </div>
        <div @click="joinServerMenu = true" class="flex justify-center items-center rounded-full bg-accent w-[56px] h-[56px] cursor-pointer">
            <h1 class="select-none text-gray-300 text-5xl font-bold text-center w-full h-full">+</h1>
        </div>
    </div>
    <modal v-if="joinServerMenu" @close="joinServerMenu = false">
        <div class="flex rounded-md bg-accent p-4 gap-24 h-fit w-fit">
            <div class="flex flex-col gap-2">
                <input v-model="joinServerId" placeholder="Enter Server Id">
                <PrimaryButton @click="joinServer">Join Server</PrimaryButton>
            </div>
            <div class="flex flex-col gap-2">
                <input v-model="newServerName" placeholder="Enter Server Name">
                <SecondaryButton @click="createServer" :wfull="true">Create Server</SecondaryButton>
            </div>
        </div>
    </modal>
</template>