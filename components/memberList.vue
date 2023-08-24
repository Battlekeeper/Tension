<script setup lang="ts">
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const props = defineProps(["loading","socket","currentUser", "currentServer", "softload"])

var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket
const serverMembers:Ref<Array<TUser>> = ref([])

async function loaded(){
    if (!props.loading && !props.softload)
    {
        serverMembers.value = await getServerMembersArray(props.socket, props.currentServer)
    }
}
loaded()
watch(props, async ()=>{
    loaded()
})
</script>

<template>
    <div class="w-[240px] min-w-[240px]">
        <div v-if="!loading && currentServer != undefined" class="mb-5 w-full h-[44px] flex flex-col justify-center bg-accent rounded-2xl rounded-t-none">
            <h1 class="font-bold text-gray-300 text-center select-none">Server Members</h1>
        </div>
        <div class="flex flex-col justify-center gap-2">
            <div v-for="member in serverMembers" class="flex gap-2 items-center">
                <div class="flex bg-accent rounded-full w-[40px] h-[40px] justify-center items-center">
                    <p class="text-gray-300">{{member.displayName[0]}}</p>
                </div>
                <p class="text-center text-gray-300 w-fit h-fit">{{member.displayName}}</p>
            </div>
        </div>
    </div>
</template>