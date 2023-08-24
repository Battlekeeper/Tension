<script setup lang="ts">
import TServer from 'Backend/Models/TServer';
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const props = defineProps(["loading","socket","currentUser", "currentServer"])
const emits = defineEmits(["serverSelect"])

var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket
const servers:Ref<Array<TServer>> = ref<Array<TServer>>([])


async function loaded(){
    if (!props.loading)
    {
        //@ts-ignore
        servers.value = await getUserServers(socket, props.currentUser)
    }
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
    </div>
</template>