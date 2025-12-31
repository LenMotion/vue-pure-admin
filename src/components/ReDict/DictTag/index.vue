<template>
  <el-tag
    v-if="dictLabel"
    :type="tagType"
    :effect="effect"
    :size="size"
    :class="listClass"
  >
    {{ dictLabel }}
  </el-tag>
  <span v-else>{{ value }}</span>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue";
import { useDictStoreHook } from "@/store/modules/dict";

interface Props {
  /** 字典Key */
  dictKey: string;
  /** 字典值 */
  value: string | number;
  /** 标签类型 */
  type?: "" | "success" | "info" | "warning" | "danger";
  /** 标签效果 */
  effect?: "dark" | "light" | "plain";
  /** 标签尺寸 */
  size?: "large" | "default" | "small";
  /** 自定义样式类（从字典数据的listClass获取） */
  useListClass?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "",
  effect: "plain",
  size: "default",
  useListClass: false
});

const dictStore = useDictStoreHook();
const dictLabel = ref<string>("");
const listClass = ref<string>("");

// 计算标签类型
const tagType = computed(() => {
  if (props.type) {
    return props.type;
  }
  // 如果使用字典的listClass，尝试从listClass中提取类型
  if (listClass.value) {
    const classMap: Record<string, string> = {
      primary: "primary",
      success: "success",
      info: "info",
      warning: "warning",
      danger: "danger"
    };
    return classMap[listClass.value] || "";
  }
  return "";
});

// 获取字典标签
const getDictLabel = async () => {
  if (!props.dictKey || props.value === undefined || props.value === null) {
    dictLabel.value = String(props.value || "");
    return;
  }

  // 确保字典数据已加载
  await dictStore.fetchDictData(props.dictKey);

  // 获取字典数据
  const dictList = dictStore.getDictDataByKey(props.dictKey);
  const dictItem = dictList.find(
    item => String(item.dictValue) === String(props.value)
  );

  if (dictItem) {
    dictLabel.value = dictItem.dictLabel;
    if (props.useListClass && dictItem.listClass) {
      listClass.value = dictItem.listClass;
    }
  } else {
    dictLabel.value = String(props.value);
  }
};

// 监听字典Key和值的变化
watch(
  () => [props.dictKey, props.value],
  () => {
    getDictLabel();
  },
  { immediate: true }
);

onMounted(() => {
  getDictLabel();
});
</script>
