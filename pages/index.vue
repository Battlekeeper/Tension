<script setup lang="ts">
import { io } from "socket.io-client";
const router = useRouter();
var socket;
socket = io('ws://localhost:3001')
socket.on('connect', ()=>{
    console.log("connected")
})
</script>

<template>

</template>