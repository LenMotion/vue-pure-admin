import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  dictType: [{ required: true, message: "字典类型为必填项", trigger: "blur" }],
  dictName: [{ required: true, message: "字典名称为必填项", trigger: "blur" }],
  dictKey: [{ required: true, message: "字典Key为必填项", trigger: "blur" }]
});
