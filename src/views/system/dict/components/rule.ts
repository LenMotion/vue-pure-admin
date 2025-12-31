import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  dictKey: [{ required: true, message: "字典Key为必填项", trigger: "blur" }],
  dictLabel: [{ required: true, message: "字典标签为必填项", trigger: "blur" }],
  dictValue: [{ required: true, message: "字典键值为必填项", trigger: "blur" }],
  dictSort: [{ required: true, message: "字典排序为必填项", trigger: "blur" }]
});
