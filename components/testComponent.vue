<script setup lang="ts">
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const props = defineProps(["loading","socket"])
var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket

async function loaded(){
    if (!props.loading)
    {
        
    }
}



loaded()
watch(props, async ()=>{
    loaded()
})
</script>

<template>
    <h1 class=" text-red-500">Hello</h1>
</template>