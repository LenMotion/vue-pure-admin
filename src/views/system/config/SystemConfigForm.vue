<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useSystemConfig } from "./utils/hook";
import { usePublicHooks } from "../hooks";
import { transformI18n } from "@/plugins/i18n";

import InfoFilled from "~icons/ep/info-filled";
import Upload from "~icons/ep/upload";
import View from "~icons/ep/view";
import Hide from "~icons/ep/hide";

defineOptions({
  name: "SystemConfigForm"
});

const props = defineProps<{
  refresh?: boolean;
}>();

const {
  systemConfigForm,
  formRef,
  loading,
  systemConfigLoading,
  saveSystemConfig,
  getSystemConfig,
  menuTreeData
} = useSystemConfig();

const { switchStyle } = usePublicHooks();

// 处理LOGO上传
function handleLogoUpload(file: any) {
  // TODO: 实现LOGO上传逻辑
  const reader = new FileReader();
  reader.onload = e => {
    systemConfigForm.SYSTEM_LOGO = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
}

// 显示/隐藏密码
const showPassword = ref(false);

// 组件挂载时加载数据
onMounted(() => {
  getSystemConfig();
});

// 监听 refresh prop 变化，触发数据刷新
watch(
  () => props.refresh,
  newVal => {
    if (newVal !== undefined) {
      getSystemConfig();
    }
  }
);

// 表单验证规则
const formRules = {
  SYSTEM_LOGO: [
    { required: true, message: "请上传系统LOGO", trigger: "change" }
  ],
  SYSTEM_NAME: [{ required: true, message: "请输入系统名称", trigger: "blur" }],
  SYSTEM_TITLE: [
    { required: true, message: "请输入系统标题", trigger: "blur" }
  ],
  SYSTEM_DESCRIPTION: [
    { required: true, message: "请输入系统描述", trigger: "blur" }
  ],
  SITE_COPYRIGHT: [
    { required: true, message: "请输入页脚信息", trigger: "blur" }
  ],
  LOGIN_CAPTCHA_SWITCH: [
    { required: true, message: "请选择验证码开关", trigger: "change" }
  ],
  MAX_DEPT_LEVEL: [
    { required: true, message: "请输入最大部门层级", trigger: "blur" },
    { pattern: /^(0|[1-9]\d*)$/, message: "不能小于0", trigger: "blur" }
  ],
  ACCOUNT_LOCK_COUNT: [
    { required: true, message: "请输入密码错误次数", trigger: "blur" },
    { pattern: /^(0|[1-9]\d*)$/, message: "不能小于0", trigger: "blur" }
  ],
  ACCOUNT_LOCK_TIME: [
    { required: true, message: "请输入锁定时长", trigger: "blur" },
    { pattern: /^(0|[1-9]\d*)$/, message: "不能小于0", trigger: "blur" }
  ],
  USER_DEFAULT_PASSWORD: [
    { required: true, message: "请输入用户默认密码", trigger: "blur" }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="systemConfigForm"
    label-width="180px"
    :loading="systemConfigLoading"
    :rules="formRules"
  >
    <el-row :gutter="30">
      <!-- 系统LOGO - 全宽 -->
      <el-col :span="24">
        <el-form-item label="系统LOGO" prop="SYSTEM_LOGO" required>
          <el-upload
            class="logo-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleLogoUpload"
            accept="image/*"
          >
            <div class="upload-box">
              <el-icon v-if="!systemConfigForm.SYSTEM_LOGO" class="upload-icon">
                <Upload />
              </el-icon>
              <img
                v-else
                :src="systemConfigForm.SYSTEM_LOGO"
                class="logo-preview"
              />
              <div class="upload-text">上传</div>
            </div>
          </el-upload>
        </el-form-item>
      </el-col>

      <!-- 系统名称 -->
      <el-col :span="12">
        <el-form-item label="系统名称" prop="SYSTEM_NAME" required>
          <el-input
            v-model="systemConfigForm.SYSTEM_NAME"
            placeholder="请输入系统名称"
            clearable
          />
        </el-form-item>
      </el-col>

      <!-- 系统标题 -->
      <el-col :span="12">
        <el-form-item label="系统标题" prop="SYSTEM_TITLE" required>
          <el-input
            v-model="systemConfigForm.SYSTEM_TITLE"
            placeholder="请输入系统标题"
            clearable
          />
        </el-form-item>
      </el-col>

      <!-- 系统描述 -->
      <el-col :span="24">
        <el-form-item label="系统描述" prop="SYSTEM_DESCRIPTION" required>
          <el-input
            v-model="systemConfigForm.SYSTEM_DESCRIPTION"
            type="textarea"
            :rows="3"
            placeholder="请输入系统描述"
            clearable
          />
        </el-form-item>
      </el-col>

      <!-- 页脚信息 -->
      <el-col :span="24">
        <el-form-item label="页脚信息" prop="SITE_COPYRIGHT" required>
          <el-input
            v-model="systemConfigForm.SITE_COPYRIGHT"
            placeholder="请输入页脚信息"
            clearable
          />
        </el-form-item>
      </el-col>

      <!-- 验证码开关 -->
      <el-col :span="6">
        <el-form-item label="验证码开关" prop="LOGIN_CAPTCHA_SWITCH" required>
          <el-switch
            v-model="systemConfigForm.LOGIN_CAPTCHA_SWITCH"
            active-value="true"
            inactive-value="false"
            inline-prompt
            active-text="开启"
            inactive-text="关闭"
            :style="switchStyle"
          />
        </el-form-item>
      </el-col>

      <!-- 最大部门层级 -->
      <el-col :span="6">
        <el-form-item prop="MAX_DEPT_LEVEL" required>
          <template #label>
            <span class="inline-flex items-center">
              <span>最大部门层级</span>
              <el-tooltip content="小于等于0表示不限制" placement="top">
                <el-icon class="ml-1 cursor-pointer">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="systemConfigForm.MAX_DEPT_LEVEL"
            :min="0"
            placeholder="请输入最大部门层级"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <!-- 密码错误次数 -->
      <el-col :span="6">
        <el-form-item prop="ACCOUNT_LOCK_COUNT" required>
          <template #label>
            <span class="inline-flex items-center">
              <span>密码错误次数</span>
              <el-tooltip
                content="密码连续输入错误次数，为0不做处理"
                placement="top"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="systemConfigForm.ACCOUNT_LOCK_COUNT"
            :min="0"
            placeholder="请输入密码错误次数"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <!-- 锁定时长(分钟) -->
      <el-col :span="6">
        <el-form-item prop="ACCOUNT_LOCK_TIME" required>
          <template #label>
            <span class="inline-flex items-center">
              <span>锁定时长(分钟)</span>
              <el-tooltip
                content="密码连续输入错误次数，账号锁定时间，为0不做处理"
                placement="top"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="systemConfigForm.ACCOUNT_LOCK_TIME"
            :min="0"
            placeholder="请输入锁定时长"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <!-- 默认菜单 -->
      <el-col :span="12">
        <el-form-item prop="DEFAULT_MENU">
          <template #label>
            <span class="inline-flex items-center">
              <span>默认菜单</span>
              <el-tooltip
                content="不管用户有没有这个菜单，只要有账号都会赋予配置的这些菜单！比如：首页、个人中心等"
                placement="top"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-tree-select
            v-model="systemConfigForm.DEFAULT_MENU"
            :data="menuTreeData"
            :props="{
              label: 'title',
              value: 'id',
              children: 'children'
            }"
            multiple
            check-strictly
            show-checkbox
            placeholder="请选择默认菜单"
            style="width: 100%"
            clearable
            render-after-expand
          >
            <template #default="{ data }">
              <span>{{ transformI18n(data.title) }}</span>
            </template>
          </el-tree-select>
        </el-form-item>
      </el-col>

      <!-- 用户默认密码 -->
      <el-col :span="12">
        <el-form-item
          label="用户默认密码"
          prop="USER_DEFAULT_PASSWORD"
          required
        >
          <el-input
            v-model="systemConfigForm.USER_DEFAULT_PASSWORD"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入用户默认密码"
            clearable
          >
            <template #suffix>
              <el-icon
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>

      <!-- 提交按钮 -->
      <el-col :span="24">
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="saveSystemConfig"
          >
            提交
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
.logo-uploader {
  :deep(.el-upload) {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 148px;
  height: 148px;
  background: var(--el-fill-color-lighter);

  .upload-icon {
    margin-bottom: 8px;
    font-size: 28px;
    color: var(--el-text-color-placeholder);
  }

  .logo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-text {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

// 确保 label 中的图标和文字垂直居中
:deep(.el-form-item__label) {
  .inline-flex {
    display: inline-flex;
    align-items: center;
  }
}
</style>
