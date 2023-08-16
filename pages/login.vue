<script setup lang="ts">
    var username = ref()
    var password = ref()

    async function login(){
        var response = await fetch("http://localhost:3001/user/authenticate", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"username": username.value, "password": password.value}),
            credentials: "include"
        })
        if (response.status == 200){
            window.location.href = "/"
        }
    }
</script>

<template>
    <input v-model="username" placeholder="username">
    <input v-model="password" placeholder="password">
    <button @click="login">Login</button>
</template>