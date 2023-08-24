<script setup lang="ts">

const emits = defineEmits(["close"])
const background = ref()
function close(event:any){
    if (event.target == background.value){
        emits('close')
    }
}
</script>

<template>
    <div ref="background" @click="close($event)" class="absolute flex justify-center items-center z-10" style="height: 100svh; width: 100svw; backdrop-filter: blur(5px);">
        <div class="z-20">
            <slot>
            </slot>
        </div>
    </div>
</template>