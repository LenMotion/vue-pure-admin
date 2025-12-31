// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

import type { RoleModel } from "@/api/system/role";

interface FormProps {
  formInline: RoleModel;
}

export type { FormProps };
