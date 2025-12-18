import { ref, onMounted } from "vue";
import { getCaptcha } from "@/api/system/auth";
import { message } from "@/utils/message";

/**
 * 获取图形验证码
 */
export const useImageVerify = () => {
  const imgRef = ref<HTMLImageElement>();
  const imgCode = ref("");
  const captchaUuid = ref("");
  const captchaImg = ref("");

  function setImgCode(code: string) {
    imgCode.value = code;
  }

  async function getImgCode() {
    try {
      const res = await getCaptcha();
      console.log(res);
      if (res?.code === 200 && res?.result) {
        captchaUuid.value = res.result.uuid;
        captchaImg.value = res.result.img;
        // 清空验证码输入
        imgCode.value = "";
      } else {
        message(res?.msg || "获取验证码失败", { type: "error" });
      }
    } catch (error) {
      console.error(error);
      message("获取验证码失败", { type: "error" });
    }
  }

  onMounted(() => {
    getImgCode();
  });

  return {
    imgRef,
    imgCode,
    captchaUuid,
    captchaImg,
    setImgCode,
    getImgCode
  };
};
