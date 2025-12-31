<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSystemConfig } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SystemConfigForm from "./SystemConfigForm.vue";

import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "SystemConfig"
});

const activeTab = ref("system");
const tableRef = ref();
const systemConfigFormRefresh = ref(false);
const {
  configListForm,
  configListFormRef,
  configDataList,
  configListLoading,
  columns,
  pagination,
  onSearch,
  resetConfigListForm,
  handleSizeChange,
  handleCurrentChange,
  getConfigList
} = useSystemConfig();

function onFullscreen() {
  tableRef.value?.setAdaptive();
}

// 处理标签页切换
function handleTabChange(tabName: string) {
  if (tabName === "system") {
    // 切换到系统设置标签页，触发 SystemConfigForm 刷新
    systemConfigFormRefresh.value = !systemConfigFormRefresh.value;
  } else if (tabName === "config") {
    // 切换到其他设置标签页，调用获取配置列表API
    getConfigList();
  }
}
</script>

<template>
  <el-card shadow="never">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 第一个标签页：系统设置 -->
      <el-tab-pane label="系统设置" name="system">
        <SystemConfigForm :refresh="systemConfigFormRefresh" />
      </el-tab-pane>

      <!-- 第二个标签页：其他设置（配置列表） -->
      <el-tab-pane label="其他设置" name="config">
        <el-form
          ref="configListFormRef"
          :inline="true"
          :model="configListForm"
          class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
        >
          <el-form-item label="配置key：" prop="configKey">
            <el-input
              v-model="configListForm.configKey"
              placeholder="请输入"
              clearable
              class="w-[180px]!"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="useRenderIcon('ri/search-line')"
              :loading="configListLoading"
              @click="onSearch"
            >
              查询
            </el-button>
            <el-button
              :icon="useRenderIcon(Refresh)"
              @click="resetConfigListForm"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <PureTableBar
          title="配置管理"
          :columns="columns"
          :tableRef="tableRef?.getTableRef()"
          @refresh="onSearch"
          @fullscreen="onFullscreen"
        >
          <template #buttons>
            <el-button
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="() => {}"
            >
              新增配置
            </el-button>
          </template>
          <template v-slot="{ size, dynamicColumns }">
            <pure-table
              ref="tableRef"
              align-whole="center"
              showOverflowTooltip
              table-layout="auto"
              :loading="configListLoading"
              :size="size"
              :data="configDataList"
              :columns="dynamicColumns"
              :pagination="{ ...pagination, size }"
              :header-cell-style="{
                background: 'var(--el-fill-color-light)',
                color: 'var(--el-text-color-primary)'
              }"
              @page-size-change="handleSizeChange"
              @page-current-change="handleCurrentChange"
            />
          </template>
        </PureTableBar>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

:deep(.el-tabs__header) {
  margin-top: 10px;
}

:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  font-size: 16px;
  color: var(--el-text-color-primary);
}

:deep(.el-tabs__nav-next.is-disabled),
:deep(.el-tabs__nav-prev.is-disabled) {
  opacity: 0.5;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
