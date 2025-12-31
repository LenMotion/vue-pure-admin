<template>
  <el-select
    v-model="selectValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :multiple="multiple"
    :filterable="filterable"
    :size="size"
    :style="style"
    :class="className"
    v-bind="$attrs"
    @change="handleChange"
  >
    <el-option
      v-for="item in dictOptions"
      :key="String(item.value)"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue";
import { useDictStoreHook } from "@/store/modules/dict";

interface Props {
  /** 字典Key */
  dictKey: string;
  /** 绑定值 */
  modelValue?: string | number | Array<string | number>;
  /** 占位符 */
  placeholder?: string;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  filterable?: boolean;
  /** 尺寸 */
  size?: "large" | "default" | "small";
  /** 自定义样式 */
  style?: string | Record<string, any>;
  /** 自定义类名 */
  className?: string;
}

interface Emits {
  (
    e: "update:modelValue",
    value: string | number | Array<string | number>
  ): void;
  (e: "change", value: string | number | Array<string | number>): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "请选择",
  clearable: true,
  disabled: false,
  multiple: false,
  filterable: false,
  size: "default",
  style: undefined,
  className: undefined
});

const emit = defineEmits<Emits>();

const dictStore = useDictStoreHook();
const dictOptions = ref<Array<{ label: string; value: string | number }>>([]);

// 计算绑定值
const selectValue = computed({
  get: () => props.modelValue,
  set: val => {
    emit("update:modelValue", val);
  }
});

// 获取字典选项
const getDictOptions = async () => {
  if (!props.dictKey) {
    dictOptions.value = [];
    return;
  }

  // 确保字典数据已加载
  await dictStore.fetchDictData(props.dictKey);

  // 获取字典选项
  dictOptions.value = dictStore.getDictOptions(props.dictKey);
};

// 处理值变化
const handleChange = (value: string | number | Array<string | number>) => {
  emit("change", value);
};

// 监听字典Key的变化
watch(
  () => props.dictKey,
  () => {
    getDictOptions();
  },
  { immediate: false }
);

onMounted(() => {
  getDictOptions();
});
</script>
