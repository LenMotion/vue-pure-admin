import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import {
  getRoleListApi,
  updateRoleStatusApi,
  roleMenuIdListAPi,
  type RoleModel,
  saveOrUpdateRoleApi,
  delRoleApi,
  saveRoleMenuApi
} from "@/api/system/role";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";
import { getRouteTreeApi } from "@/api/system/route";

export function useRole(treeRef: Ref) {
  const form = reactive({
    roleName: "",
    roleKey: "",
    status: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90,
      index: (index: number) =>
        (pagination.currentPage - 1) * pagination.pageSize + index + 1
    },
    {
      label: "角色名称",
      prop: "roleName"
    },
    {
      label: "角色标识",
      prop: "roleKey"
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value="0"
          inactive-value="1"
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "序号",
      prop: "roleSort",
      minWidth: 100
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "h-[20px]!",
  //     "reset-margin",
  //     "text-gray-500!",
  //     "dark:text-white!",
  //     "dark:hover:text-primary!"
  //   ];
  // });

  function onChange({ row, index }) {
    console.log("row", row);
    // 保存旧状态，因为 switch 点击后 row.status 已经是新值了
    const oldStatus = row.status === "0" ? "1" : "0";
    const newStatus = row.status;
    const action = newStatus === "0" ? "启用" : "停用";

    ElMessageBox.confirm(
      `确认要<strong>${action}</strong><strong style='color:var(--el-color-primary)'>${
        row.roleName
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        await updateRoleStatusApi({ id: row.id, status: newStatus });
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          message(`已${action}${row.roleName}`, {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        // 取消操作，恢复原状态
        row.status = oldStatus;
      });
  }

  function handleDelete(row) {
    delRoleApi(row.id).then(res => {
      if (res.code === 200) {
        message(`您删除了角色名称为${row.roleName}的这条数据`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    const { result } = await getRoleListApi(toRaw(form));
    dataList.value = result.items;
    pagination.total = result.total;
    pagination.pageSize = result.pageSize;
    pagination.currentPage = result.pageNum;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: RoleModel) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          roleName: row?.roleName ?? "",
          roleKey: row?.roleKey ?? "",
          dataScope: row?.dataScope ?? "",
          roleSort: row?.roleSort ?? 99,
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as RoleModel;
        function chores() {
          message(`您${title}了角色名称为${curData.roleName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            saveOrUpdateRoleApi(curData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          }
        });
      }
    });
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { result } = await roleMenuIdListAPi(id);
      treeRef.value.setCheckedKeys(result.menuIds);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  function handleSave() {
    const { id, roleName } = curRow.value;
    // 根据用户 id 调用实际项目中菜单权限修改接口
    saveRoleMenuApi({
      id,
      menuIds: treeRef.value.getCheckedKeys(),
      halfMenuIds: treeRef.value.getHalfCheckedKeys()
    }).then(res => {
      if (res.code === 200) {
        message(`角色名称为${roleName}的菜单权限修改成功`, {
          type: "success"
        });
      }
    });
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  /** 递归提取树形结构中所有节点的指定字段值 */
  function getTreeKeyList(tree: any[], key: string): any[] {
    const result: any[] = [];
    function traverse(nodes: any[]) {
      if (!nodes || !Array.isArray(nodes)) return;
      for (const node of nodes) {
        if (node[key] !== undefined) {
          result.push(node[key]);
        }
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    }
    traverse(tree);
    return result;
  }

  onMounted(async () => {
    onSearch();
    const { result } = await getRouteTreeApi();
    treeIds.value = getTreeKeyList(result, "id");
    treeData.value = result;
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    filterMethod,
    transformI18n,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
