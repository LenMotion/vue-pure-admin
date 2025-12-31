<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./rule";
import { DictDataFormProps } from "./types";

const props = withDefaults(defineProps<DictDataFormProps>(), {
  formInline: () => ({
    dictKey: "",
    dictLabel: "",
    dictValue: "",
    dictSort: 0,
    listClass: "",
    status: "0",
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="字典Key" prop="dictKey">
      <el-input
        v-model="newFormInline.dictKey"
        clearable
        placeholder="请输入字典Key"
        disabled
      />
    </el-form-item>

    <el-form-item label="字典标签" prop="dictLabel">
      <el-input
        v-model="newFormInline.dictLabel"
        clearable
        placeholder="请输入字典标签"
      />
    </el-form-item>

    <el-form-item label="字典键值" prop="dictValue">
      <el-input
        v-model="newFormInline.dictValue"
        clearable
        placeholder="请输入字典键值"
      />
    </el-form-item>

    <el-form-item label="字典排序" prop="dictSort">
      <el-input-number
        v-model="newFormInline.dictSort"
        :min="0"
        :max="9999"
        controls-position="right"
        class="w-full!"
        placeholder="请输入字典排序"
      />
    </el-form-item>

    <el-form-item label="表格字典样式" prop="listClass">
      <el-select
        v-model="newFormInline.listClass"
        placeholder="请选择表格字典样式"
        clearable
      >
        <el-option label="默认" value="" />
        <el-option label="主要" value="primary" />
        <el-option label="成功" value="success" />
        <el-option label="信息" value="info" />
        <el-option label="警告" value="warning" />
        <el-option label="危险" value="danger" />
      </el-select>
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
