<script setup lang="ts">
import TUser from 'Backend/Models/TUser';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const props = defineProps(["loading","socket"])
var socket:Socket<DefaultEventsMap, DefaultEventsMap> = props.socket

function getUser(userid:string) {
    return new Promise((resolve, reject) => {
        socket.emit("getUser", userid, (user:TUser)=> {
            resolve(user)
            }
        );
    });
}
async function loaded(){
    if (!props.loading)
    {
        var user = await getUser("64dbd32fdcdd7f4f9b44ee49")
        console.log(user)
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