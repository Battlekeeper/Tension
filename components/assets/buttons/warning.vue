<script setup lang="ts">
    const props = defineProps(["wfull"])
</script>

<template>
    <div class="p-2 rounded-lg bg-btn-warning cursor-pointer select-none" :class="{'w-full': wfull, 'w-min': !wfull}">
        <p class="whitespace-nowrap font-semibold select-none flex justify-center items-center">
            <slot></slot>
        </p>
    </div>
</template>