<script setup lang="ts">
import { watch } from "vue";
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify"
});

interface Props {
  code?: string;
}

interface Emits {
  (e: "update:code", code: string): void;
  (e: "update:uuid", uuid: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  code: ""
});

const emit = defineEmits<Emits>();

const { imgCode, captchaUuid, captchaImg, setImgCode, getImgCode } =
  useImageVerify();

watch(
  () => props.code,
  newValue => {
    setImgCode(newValue);
  }
);
watch(imgCode, newValue => {
  emit("update:code", newValue);
});
watch(captchaUuid, newValue => {
  emit("update:uuid", newValue);
});

defineExpose({ getImgCode, captchaUuid });
</script>

<template>
  <img
    v-if="captchaImg"
    ref="imgRef"
    :src="'data:image/jpeg;base64,' + captchaImg"
    alt="验证码"
    class="cursor-pointer h-[40px]"
    @click="getImgCode"
  />
  <div
    v-else
    class="cursor-pointer h-[40px] w-[120px] flex items-center justify-center bg-gray-100"
    @click="getImgCode"
  >
    点击加载
  </div>
</template>
