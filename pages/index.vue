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


var socket = io('ws://localhost:3001')
socket.on('connect', async ()=>{
    socket.emit("auth", token.value, async (response:boolean) => {
        if (!response){
            window.location.href = "/login"
            return
        }
        loading.value = false
    })
})

function getUser(userid:string) {
    return new Promise((resolve, reject) => {
        socket.emit("getUser", userid, (user:TUser)=> {
            resolve(user)
            }
        );
    });
}

watch(loading, async () => {
    if (!loading.value){
        
    }
})

</script>

<template>
    <testComponent v-if="!loading" :loading=loading :socket=socket></testComponent>
</template>