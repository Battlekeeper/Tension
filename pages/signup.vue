<script setup lang="ts">
    import primaryButton from "../components/assets/buttons/primary.vue"

    var username = ref()
    var displayName = ref()
    var password = ref()
    var passwordConfirm = ref()
    var errorMessage = ref()


    async function signup(){
        if (username.value == undefined || username.value.length < 8){
            errorMessage.value = "Username must be at least 8 characters"
            return
        }
        if (password.value == undefined || password.value.length < 8){
            errorMessage.value = "Password must be at least 8 characters"
            return
        }
        if (password.value != passwordConfirm.value){
            errorMessage.value = "Passwords do not match"
            return
        }
        var response = await fetch("https://tensionapi.battlekeeper.com/user/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"username": username.value, "password": password.value, "displayName": displayName.value}),
            credentials: "include"
        })
        if (response.status == 200){
            window.location.href = "/"
        }
        if (response.status == 406){
            errorMessage.value = "A user with that username already exists"
        }
    }
</script>

<template>
    <div class="flex flex-col gap-24 justify-center items-center" style="height: 100svh; width: 100svw">
        <h1 class="text-center text-white font-bold tracking-[50px] text-5xl ml-[50px] whitespace-nowrap">-TENSION-</h1>
        <div class="flex flex-col gap-3 w-80">
            <p class="text-center text-white">{{errorMessage}}</p>
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="username" type="text" placeholder="Username">
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="displayName" type="text" placeholder="Display Name">
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="password" type="password" placeholder="Password">
            <input class="w-full h-10 bg-accent text-white outline-white outline-1 p-2" v-model="passwordConfirm" type="password" placeholder="Confirm Password">
            <primaryButton @click="signup">
                <p class="text-white">Sign Up</p>
            </primaryButton>
            <RouterLink to="/login">
                <p class="text-right font-semibold text-white cursor-pointer">
                    Login
                </p>
            </RouterLink>
        </div>
    </div>
</template>