<script setup lang="ts">
import { response } from "express";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
//@ts-ignore
import Cookie from "js-cookie"
import TUser from "Backend/Models/TUser";
import testComponent from "../components/testComponent.vue"

const router = useRouter();
const token = ref(Cookie.get("token"))
const loading = ref(true)


var socket = io('ws://localhost:3001') as unknown as Socket<DefaultEventsMap, DefaultEventsMap>
socket.on('connect', async ()=>{
    socket.emit("auth", token.value, async (response:boolean) => {
        if (!response){
            window.location.href = "/login"
            return
        }
        loading.value = false
    })
})

watch(loading, async () => {
    if (!loading.value){
        getUser(socket, "64dbd32fdcdd7f4f9b44ee49")
    }
})
</script>

<template>
    <testComponent v-if="!loading" :loading=loading :socket=socket></testComponent>
</template>