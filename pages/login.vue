<script setup lang="ts">
    import primaryButton from "../components/assets/buttons/primary.vue"

    var username = ref()
    var password = ref()
    var errorMessage = ref()

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
        if (response.status == 404){
            username.value = undefined
            password.value = undefined
            errorMessage.value = "Username or Password is incorrect"
        }
    }
</script>

<template>
    <div class="flex flex-col gap-24 justify-center items-center" style="height: 100svh; width: 100svw">
        <h1 class="text-center text-white font-bold tracking-[50px] text-5xl ml-[50px] whitespace-nowrap">-TENSION-</h1>
        <div class="flex flex-col gap-3 w-80">
            <p class="text-center text-white">{{errorMessage}}</p>
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="username" type="text" placeholder="Username">
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="password" type="password" placeholder="Password">
            <primaryButton @click="login">
                <p class="text-white">Login</p>
            </primaryButton>
            <RouterLink to="/signup">
                <p class="text-right font-semibold text-white cursor-pointer">
                    Sign Up
                </p>
            </RouterLink>
        </div>
    </div>
</template>